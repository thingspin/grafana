package api

import (
	"net/url"

	"github.com/grafana/grafana/pkg/api/pluginproxy"
	m "github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/plugins"
	macaron "gopkg.in/macaron.v1"
)

func TsAppPluginRoute(route *plugins.AppPluginRoute, appID string, hs *HTTPServer) macaron.Handler {
	return func(c *m.ReqContext) {
		path := c.Params("*")

		u, _ := url.Parse(route.Url)
		if u.Scheme == "ws" || u.Scheme == "wss" {
			proxy, req := pluginproxy.TsNewApiPluginProxy(c, path, route, appID, hs.Cfg)
			proxy.ServeHTTP(c.Resp, req)
		} else {
			proxy := pluginproxy.NewApiPluginProxy(c, path, route, appID, hs.Cfg)
			proxy.Transport = pluginProxyTransport
			proxy.ServeHTTP(c.Resp, c.Req.Request)
		}
	}
}
