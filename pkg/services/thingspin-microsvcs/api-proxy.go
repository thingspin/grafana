package microsvcs

import (
	"crypto/tls"
	"net"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strings"
	"time"

	api "github.com/grafana/grafana/pkg/api"
	"github.com/grafana/grafana/pkg/log"
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
		handlers = append(handlers, APIServerRoute(server, url))

		r.Any(url, handlers...)
		r.Any(url+"/", handlers...)
		r.Any(url+"/*", handlers...)
	}
}

func APIServerRoute(server server, url string) macaron.Handler {
	return func(c *m.ReqContext) {
		remotePath := c.Params("*")
		target := server.URL

		proxy := apiServerProxy(remotePath, target)
		proxy.ServeHTTP(c.Resp, c.Req.Request)
		c.Resp.Header().Del("Set-Cookie")
	}
}

//==================================================================================================================================================
func apiServerProxy(remotePath string, host string) *httputil.ReverseProxy {
	remote, _ := url.Parse(host)
	director := func(req *http.Request) {
		req.URL.Scheme = remote.Scheme
		req.URL.Host = remote.Host
		req.Host = remote.Host

		proxyPrefix := strings.Replace(req.URL.Path, remotePath, "", -1)
		targetURI := strings.Replace(req.RequestURI, proxyPrefix, "", -1)
		req.RequestURI = targetURI
		req.URL.Path = util.JoinURLFragments(remote.Path, remotePath)

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
			if resp.StatusCode/100 == 2 {
			}

			return nil
		},
	}
}

//===================================================================================================================================
