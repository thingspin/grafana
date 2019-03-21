package api

import (
	"github.com/grafana/grafana/pkg/api/routing"
	"github.com/grafana/grafana/pkg/middleware"
)

// thingspin용 REST API 정의 함수
func (hs *HTTPServer) registerThingspinRoutes() {
	reqSignedIn := middleware.ReqSignedIn
	r := hs.RouteRegister

	r.Group("/mds", func(mdsRoute routing.RouteRegister) {
		mdsRoute.Get("/", hs.Index)
	}, reqSignedIn)
}
