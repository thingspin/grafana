package api

import (
	"github.com/go-macaron/binding"
	"github.com/grafana/grafana/pkg/api/routing"
	tsm "github.com/grafana/grafana/pkg/models-thingspin"
)

// thingspin용 REST API 정의 함수
func (hs *HTTPServer) registerThingspinRoutes() {
	// reqSignedIn := middleware.ReqSignedIn
	r := hs.RouteRegister
	bind := binding.Bind

	// register thingspin rest api
	r.Group("/thingspin", func(tsRoute routing.RouteRegister) {
		tsRoute.Get("/", hs.Index)

		// left sidebar menu rest api's
		tsRoute.Group("/menu", func(tsMenuRoute routing.RouteRegister) {
			tsMenuRoute.Get("/default", Wrap(GetTsDefaultMenu))
			tsMenuRoute.Get("/:orgId", Wrap(GetTsMenuByOrgId))
			tsMenuRoute.Post("/:orgId", bind(tsm.AddFmsMenuCommand{}), Wrap(AddTsNewMenuByOrgId))
			tsMenuRoute.Put("/:orgId", bind(tsm.UpdateFmsMenuCommand{}), Wrap(EditTsMenu8yOrgId))
			tsMenuRoute.Delete("/:orgId", Wrap(DeleteTsMenuByOrgId))
		})

		tsRoute.Group("/flow-node", func(tsDsRoute routing.RouteRegister) {
			tsDsRoute.Post("/:target", Wrap(addFlowNode))
		})

	})
}
