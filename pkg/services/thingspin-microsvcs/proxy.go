package microsvcs

import (
	"crypto/tls"
	"net"
	"net/http"
	"time"

	api "github.com/grafana/grafana/pkg/api"
	"github.com/grafana/grafana/pkg/api/pluginproxy"
	"github.com/grafana/grafana/pkg/log"
	"github.com/grafana/grafana/pkg/middleware"
	m "github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/plugins"
	"github.com/grafana/grafana/pkg/setting"
	"github.com/grafana/grafana/pkg/util"
	macaron "gopkg.in/macaron.v1"
)

type HTTPServerExt struct {
	log log.Logger
	*api.HTTPServer
}

var apiProxyTransport *http.Transport

func (hs *HTTPServerExt) initAPIServerRoutes(r *macaron.Macaron, servers []server) {

	hs.log.Info("Micro Service", "API Server", "Setup Proxy", "API", "...")

	apiProxyTransport = &http.Transport{
		TLSClientConfig: &tls.Config{
			InsecureSkipVerify: setting.PluginAppsSkipVerifyTLS,
			Renegotiation:      tls.RenegotiateFreelyAsClient,
		},
		Proxy: http.ProxyFromEnvironment,
		Dial: (&net.Dialer{
			Timeout:   30 * time.Second,
			KeepAlive: 30 * time.Second,
			DualStack: true,
		}).Dial,
		TLSHandshakeTimeout: 10 * time.Second,
	}

	for _, server := range servers {
		url := util.JoinURLFragments("/api/", server.API)
		handlers := make([]macaron.Handler, 0)
		handlers = append(handlers, middleware.Auth(&middleware.AuthOptions{
			ReqSignedIn: true,
		}))

		if server.ReqRole != "" {
			if server.ReqRole == m.ROLE_ADMIN {
				handlers = append(handlers, middleware.RoleAuth(m.ROLE_ADMIN))
			} else if server.ReqRole == m.ROLE_EDITOR {
				handlers = append(handlers, middleware.RoleAuth(m.ROLE_EDITOR, m.ROLE_ADMIN))
			}
		}
		handlers = append(handlers, APIServerRoute(server, url, hs))
		r.Route(url, "*", handlers...)
		log.Info("Micro Service: Adding proxy route %s", url)
	}
}

func APIServerRoute(s server, url string, hs *HTTPServerExt) macaron.Handler {
	appID := s.Name
	route := &plugins.AppPluginRoute{
		Path:    url,
		Method:  "*",
		ReqRole: s.ReqRole,
		Url:     s.URL,
		Headers: s.Headers,
	}

	return func(c *m.ReqContext) {
		path := c.Params("*")

		proxy := pluginproxy.NewApiPluginProxy(c, path, route, appID, hs.Cfg)
		proxy.Transport = apiProxyTransport
		proxy.ServeHTTP(c.Resp, c.Req.Request)
	}
}
