package microsvcs

import (
	"encoding/json"
	"io"
	"net"
	"net/http"
	"net/url"
	"strings"

	"github.com/gorilla/websocket"
	"github.com/grafana/grafana/pkg/log"
	m "github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/util"
)

var (
	DefaultUpgrader = &websocket.Upgrader{
		ReadBufferSize:  512,
		WriteBufferSize: 512,
		CheckOrigin:     func(r *http.Request) bool { return true },
	}

	DefaultDialer = websocket.DefaultDialer
)

type WebsocketProxy struct {
	log      log.Logger
	Backend  func(*http.Request) *url.URL
	Upgrader *websocket.Upgrader
	Dialer   *websocket.Dialer
}

type templateData struct {
	JsonData       map[string]interface{}
	SecureJsonData map[string]string
}

// NewProxy returns a new Websocket reverse proxy that rewrites the
// URL's to the scheme, host and base path provider in target.
func NewWebsocketProxy(target *url.URL) *WebsocketProxy {
	backend := func(r *http.Request) *url.URL {
		u := *target
		u.Fragment = r.URL.Fragment
		u.Path = r.URL.Path
		u.RawQuery = r.URL.RawQuery
		return &u
	}
	return &WebsocketProxy{
		Backend: backend,
		log:     log.New("thingspin.websocketProxy"),
	}
}

func getWsRequestHeader(req *http.Request) http.Header {
	newReqestHeader := http.Header{}
	if origin := req.Header.Get("Origin"); origin != "" {
		newReqestHeader.Add("Origin", origin)
	}
	for _, prot := range req.Header[http.CanonicalHeaderKey("Sec-WebSocket-Protocol")] {
		newReqestHeader.Add("Sec-WebSocket-Protocol", prot)
	}
	for _, cookie := range req.Header[http.CanonicalHeaderKey("Cookie")] {
		newReqestHeader.Add("Cookie", cookie)
	}

	if clientIP, _, err := net.SplitHostPort(req.RemoteAddr); err == nil {
		if prior, ok := req.Header["X-Forwarded-For"]; ok {
			clientIP = strings.Join(prior, ", ") + ", " + clientIP
		}
		newReqestHeader.Set("X-Forwarded-For", clientIP)
	}
	newReqestHeader.Set("X-Forwarded-Proto", "http")
	if req.TLS != nil {
		newReqestHeader.Set("X-Forwarded-Proto", "https")
	}

	return newReqestHeader
}

func getWsUpgradeHeader(resp *http.Response) http.Header {
	upgradeHeader := http.Header{}
	if hdr := resp.Header.Get("Sec-Websocket-Protocol"); hdr != "" {
		upgradeHeader.Set("Sec-Websocket-Protocol", hdr)
	}
	if hdr := resp.Header.Get("Set-Cookie"); hdr != "" {
		upgradeHeader.Set("Set-Cookie", hdr)
	}
	return upgradeHeader
}

// ServeHTTP implements the http.Handler that proxies WebSocket connections.
func (w *WebsocketProxy) ServeHTTP(rw http.ResponseWriter, req *http.Request) {
	if w.Backend == nil {
		w.log.Error("websocketproxy: backend function is not defined")
		http.Error(rw, "internal server error (code: 1)", http.StatusInternalServerError)
		return
	}

	backendURL := w.Backend(req)
	if backendURL == nil {
		w.log.Error("websocketproxy: backend URL is nil")
		http.Error(rw, "internal server error (code: 2)", http.StatusInternalServerError)
		return
	}

	dialer := w.Dialer
	if w.Dialer == nil {
		dialer = DefaultDialer
	}

	// set Websocket Request Header
	requestHeader := getWsRequestHeader(req)

	connBackend, resp, err := dialer.Dial(backendURL.String(), requestHeader)
	if err != nil {
		w.log.Error("websocketproxy: couldn't dial to remote backend.", "backend", connBackend, "reason", err)
		return
	}
	defer connBackend.Close()

	upgrader := w.Upgrader
	if w.Upgrader == nil {
		upgrader = DefaultUpgrader
	}

	upgradeHeader := getWsUpgradeHeader(resp)

	connPub, err := upgrader.Upgrade(rw, req, upgradeHeader)
	if err != nil {
		w.log.Error("websocketproxy: couldn't upgrade %s\n", err)
		return
	}
	defer connPub.Close()

	errc := make(chan error, 2)
	cp := func(dst io.Writer, src io.Reader) {
		_, err := io.Copy(dst, src)
		errc <- err
	}
	go cp(connBackend.UnderlyingConn(), connPub.UnderlyingConn())
	go cp(connPub.UnderlyingConn(), connBackend.UnderlyingConn())
	<-errc
}

func CreateWebsocketProxy(c *m.ReqContext, proxyPath string, Url string) (*WebsocketProxy, *http.Request) {

	targetUrl, _ := url.Parse(Url)

	req := c.Req.Request

	req.URL.Scheme = targetUrl.Scheme
	req.URL.Host = targetUrl.Host
	req.Host = targetUrl.Host

	req.URL.Path = util.JoinURLFragments(targetUrl.Path, proxyPath)

	req.Header.Del("Cookie")
	req.Header.Del("Set-Cookie")

	req.Header.Del("X-Forwarded-Host")
	req.Header.Del("X-Forwarded-Port")
	req.Header.Del("X-Forwarded-Proto")

	if req.RemoteAddr != "" {
		remoteAddr, _, err := net.SplitHostPort(req.RemoteAddr)
		if err != nil {
			remoteAddr = req.RemoteAddr
		}
		if req.Header.Get("X-Forwarded-For") != "" {
			req.Header.Set("X-Forwarded-For", req.Header.Get("X-Forwarded-For")+", "+remoteAddr)
		} else {
			req.Header.Set("X-Forwarded-For", remoteAddr)
		}
	}

	ctxJson, err := json.Marshal(c.SignedInUser)
	if err != nil {
		c.JsonApiErr(500, "failed to marshal context to json.", err)
		return nil, nil
	}

	req.Header.Add("X-ThingSPIN-Context", string(ctxJson))

	proxy := NewWebsocketProxy(req.URL)

	return proxy, req
}
