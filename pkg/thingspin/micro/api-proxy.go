package microsvcs

import (
	"compress/gzip"
	"crypto/tls"
	"io/ioutil"
	"net"
	"net/http"
	"net/http/httputil"
	"net/url"
	urlparser "net/url"
	"regexp"
	"strconv"
	"strings"
	"time"

	api "github.com/grafana/grafana/pkg/api"
	"github.com/grafana/grafana/pkg/infra/log"
	"github.com/grafana/grafana/pkg/middleware"
	m "github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/util"
	macaron "gopkg.in/macaron.v1"
)

type HTTPServerExt struct {
	log log.Logger
	*api.HTTPServer
	servers []server
}

func (hs *HTTPServerExt) initAPIServerRoutes(r *macaron.Macaron) {
	for _, server := range hs.servers {
		if !server.Enable {
			continue
		}

		hs.log.Info("API Server Proxy Add", "API", server.API, "Proxy", server.URL)

		url := util.JoinURLFragments("/", server.API)
		handlers := make([]macaron.Handler, 0)
		handlers = append(handlers, middleware.Auth(&middleware.AuthOptions{
			ReqSignedIn: false,
		}))

		if server.ReqRole != "" {
			if server.ReqRole == m.ROLE_ADMIN {
				handlers = append(handlers, middleware.RoleAuth(m.ROLE_ADMIN))
			} else if server.ReqRole == m.ROLE_EDITOR {
				handlers = append(handlers, middleware.RoleAuth(m.ROLE_EDITOR, m.ROLE_ADMIN))
			}
		}
		handlers = append(handlers, hs.APIServerRoute(server, url))

		r.Any(url, handlers...)
		r.Any(url+"/", handlers...)
		r.Any(url+"/*", handlers...)
	}
}

func (hs *HTTPServerExt) APIServerRoute(server server, url string) macaron.Handler {
	return func(c *m.ReqContext) {
		remotePath := c.Params("*")
		target := server.URL

		u, _ := urlparser.Parse(target)
		if u.Scheme == "ws" || u.Scheme == "wss" {
			proxy, req := CreateWebsocketProxy(c, remotePath, target)
			proxy.ServeHTTP(c.Resp, req)
		} else {
			proxy := hs.apiServerProxy(server.API, remotePath, target, server.AttachURL)
			proxy.ServeHTTP(c.Resp, c.Req.Request)
			c.Resp.Header().Del("Set-Cookie")
		}
	}
}

//==================================================================================================================================================
func (hs *HTTPServerExt) apiServerProxy(api string, remotePath string, host string, visual bool) *httputil.ReverseProxy {
	remote, _ := url.Parse(host)
	apiRoot := util.JoinURLFragments("/", api)

	director := func(req *http.Request) {
		req.URL.Scheme = remote.Scheme
		req.URL.Host = remote.Host
		req.Host = remote.Host

		if !isExistRoute(req.RequestURI) {
			proxyPrefix := strings.Replace(req.URL.Path, remotePath, "", -1)
			targetURI := strings.Replace(req.RequestURI, proxyPrefix, "", -1)
			req.RequestURI = targetURI
			req.URL.Path = util.JoinURLFragments(remote.Path, remotePath)
		} else {
			req.URL.Path = util.JoinURLFragments(remote.Path, req.URL.Path)
		}

		req.Header.Del("Cookie")
		req.Header.Del("Set-Cookie")
	}
	return &httputil.ReverseProxy{
		Director: director,
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
			Proxy:           http.ProxyFromEnvironment,
			Dial: (&net.Dialer{
				Timeout:   30 * time.Second,
				KeepAlive: 30 * time.Second,
			}).Dial,
			TLSHandshakeTimeout: 10 * time.Second,
		},
		ModifyResponse: func(resp *http.Response) error {

			if !visual {
				return nil
			}

			respCode := resp.StatusCode / 100

			if respCode == 2 {
				contentsType := resp.Header.Get("Content-Type")
				contentsEncode := resp.Header.Get("Content-Encoding")

				req := resp.Request
				uri := req.RequestURI
				path := req.URL.Path

				hs.log.Debug("respCode: ", "respCode", respCode)
				hs.log.Debug("Contents UrI: " + uri)
				hs.log.Debug("Contents Type: " + contentsType)
				hs.log.Debug("Contents Encode: " + contentsEncode)

				if companionBeParse(contentsType, path) {
					var s string

					switch contentsEncode {
					case "gzip":
						reader, err := gzip.NewReader(resp.Body)
						if err != nil {
							return err
						}
						defer reader.Close()

						b, err := ioutil.ReadAll(reader)
						if err != nil {
							return err
						}

						s = string(b)

					default:
						reader := resp.Body
						b, err := ioutil.ReadAll(reader)
						if err != nil {
							return err
						}

						s = string(b)
					}

					re := regexp.MustCompile(`(&#x2F;)`)
					s = re.ReplaceAllString(s, `/`)

					re = regexp.MustCompile(`href="(/?[a-z]+/[a-z]+\S+)"`)
					rp := util.JoinURLFragments(apiRoot, `$1`)
					s = re.ReplaceAllString(s, `href="`+rp+`"`)

					re = regexp.MustCompile(`src="(/?[a-z]+/[a-z]+\S+)"`)
					rp = util.JoinURLFragments(apiRoot, `$1`)
					s = re.ReplaceAllString(s, `src="`+rp+`"`)

					body := ioutil.NopCloser(strings.NewReader(s))

					resp.Body = body
					resp.ContentLength = int64(len(s))

					resp.Header.Del("Content-Encoding")
					resp.Header.Add("Accept-Ranges", "bytes")
					resp.Header.Set("Content-Length", strconv.Itoa(len(s)))
				}
			}

			return nil
		},
	}
}

//===================================================================================================================================
func companionIsTextType(a string) bool {

	list := []string{
		"text",
		"html",
		"script",
		"style",
		"javascript",
		"css",
		"js",
	}

	for _, b := range list {
		if strings.Contains(a, b) {
			return true
		}
	}
	return false
}

func companionBeParse(t string, f string) bool {
	if !companionIsTextType(t) {
		return false
	}

	html := []string{
		"text",
		"html",
		"css",
		"js",
	}

	for _, h := range html {
		if strings.Contains(t, h) {
			return true
		}
	}

	white := []string{
		"kibana",
		"bundle",
		"thingspin",
	}

	for _, w := range white {
		if strings.Contains(f, w) {
			return true
		}
	}

	return false
}

func isExistRoute(p string) bool {
	white := []string{
		"/sockjs/",
		"/cfs/",
		"/bundles/",
		"/plugins/kibana/",
		"/plugins/timelion/",
		"/es_admin/",
		"/elasticsearch/",
		"view/",
		"vendor/",
		"comms/",
	}

	for _, w := range white {
		if strings.HasPrefix(p, w) {
			return true
		}
	}
	return false
}
