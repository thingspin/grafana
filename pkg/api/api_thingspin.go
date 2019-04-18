package api

import (
	"github.com/go-macaron/binding"
	"github.com/grafana/grafana/pkg/api/routing"
	"github.com/grafana/grafana/pkg/middleware"
	tsm "github.com/grafana/grafana/pkg/models-thingspin"
)

// thingspin용 REST API 정의 함수
func (hs *HTTPServer) registerThingspinRoutes() {
	reqSignedIn := middleware.ReqSignedIn
	r := hs.RouteRegister
	bind := binding.Bind

	// register thingspin rest api
	r.Group("/thingspin", func(tsRoute routing.RouteRegister) {
		tsRoute.Get("/", hs.Index)
		// FMS Front-end Routing Enable
		tsRoute.Any("/manage/*", reqSignedIn, hs.Index)

		// left sidebar menu rest api's
		tsRoute.Group("/menu", func(tsMenuRoute routing.RouteRegister) {
			tsMenuRoute.Get("/default", Wrap(GetTsDefaultMenu))
			tsMenuRoute.Get("/:orgId", Wrap(GetTsMenuByOrgId))
			tsMenuRoute.Post("/:orgId", bind(tsm.AddFmsMenuCommand{}), Wrap(AddTsNewMenuByOrgId))
			tsMenuRoute.Put("/:orgId", bind(tsm.UpdateFmsMenuCommand{}), Wrap(EditTsMenu8yOrgId))
			tsMenuRoute.Delete("/:orgId", Wrap(DeleteTsMenuByOrgId))
			tsMenuRoute.Get("/pin", bind(tsm.GetFmsMenuPinCommand{}), Wrap(GetFmsMenuPin))
			tsMenuRoute.Post("/pin/:menuId/:pin", bind(tsm.UpdateFmsMenuPinSateCommand{}), Wrap(UpdateFmsMenuPinSate))
		})

		tsRoute.Group("/connect", func(tsFnRoute routing.RouteRegister) {
			tsFnRoute.Get("/", Wrap(getAllTsConnect))
			tsFnRoute.Post("/:target", bind(tsm.TsConnectReq{}), Wrap(addTsConnect))

			tsFnRoute.Get("/:connId", Wrap(getTsConnect))
			tsFnRoute.Put("/:connId", bind(tsm.TsConnectReq{}), Wrap(updateTsConnect))
			tsFnRoute.Patch("/:connId", Wrap(activeTsConnect))
			tsFnRoute.Delete("/:connId", Wrap(deleteTsConnect))
		})
	})
}
