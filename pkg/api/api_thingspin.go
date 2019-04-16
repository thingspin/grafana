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

		tsRoute.Group("/org", func(tsMenuRoute routing.RouteRegister) {
			tsMenuRoute.Get("/default/:orgId", Wrap(GetTsDefaultMenuByDefaultOrgId))
			tsMenuRoute.Post("/new/:orgId", bind(tsm.AddFmsDefaultMenuCommand{}),Wrap(AddDefaultMenuByDefaultOrgId))
		})

		// left sidebar menu rest api's
		tsRoute.Group("/menu", func(tsMenuRoute routing.RouteRegister) {
			tsMenuRoute.Get("/default", Wrap(GetTsDefaultMenu))
			tsMenuRoute.Get("/:orgId", Wrap(GetTsMenuByOrgId))
			tsMenuRoute.Post("/:orgId", bind(tsm.AddFmsMenuCommand{}), Wrap(AddTsNewMenuByOrgId))
			tsMenuRoute.Put("/:orgId", bind(tsm.UpdateFmsMenuOrderCommand{}), Wrap(EditTsMenuByOrgId))
			tsMenuRoute.Put("/", bind(tsm.UpdateFmsMenuInfoCommand{}), Wrap(EditTsMenuInfo))

			//tsMenuRoute.Put("/:orgId", bind(tsm.UpdateFmsMenuCommand{}), Wrap(EditTsMenu8yOrgId))
			//tsMenuRoute.Delete("/:orgId", Wrap(DeleteTsMenuByOrgId))
			tsMenuRoute.Delete("/:orgId/:id", bind(tsm.DeleteFmsMenuByIdQuery{}), Wrap(DeleteTsMenuById))
			tsMenuRoute.Put("/hide/:id/:hide", bind(tsm.UpdateFmsMenuHideStateCommand{}), Wrap(UpdateFmsMenuHideState))
			tsMenuRoute.Get("/pin", bind(tsm.GetFmsMenuPinCommand{}), Wrap(GetFmsMenuPin))
			tsMenuRoute.Post("/pin/:menuId/:pin", bind(tsm.UpdateFmsMenuPinSateCommand{}), Wrap(UpdateFmsMenuPinSate))
		})

		// 연결 관리 기본 동작 API
		tsRoute.Group("/connect", func(tsFnRoute routing.RouteRegister) {
			tsFnRoute.Get("/", Wrap(getAllTsConnect))
			tsFnRoute.Post("/:target", bind(tsm.TsConnectReq{}), Wrap(addTsConnect))

			tsFnRoute.Get("/:connId", Wrap(getTsConnect))
			tsFnRoute.Put("/:connId", bind(tsm.TsConnectReq{}), Wrap(updateTsConnect))
			tsFnRoute.Patch("/:connId", Wrap(activeTsConnect))
			tsFnRoute.Delete("/:connId", Wrap(deleteTsConnect))
			tsFnRoute.Patch("/:connId/enable", bind(tsm.EnableTsConnectReq{}), Wrap(enableTsConnect))
		})

		tsRoute.Group("/type", func(tsTypeRoute routing.RouteRegister) {
			tsTypeRoute.Get("/connect", Wrap(getTsConnectType))
		})
	})

	r.Group("/api/:ver", func(tsSysAPIRoute routing.RouteRegister) {
		tsSysAPIRoute.Group("/sys", func(tsSysRoute routing.RouteRegister) {
			tsSysRoute.Post("/control/:control/:user", bind(tsm.SystemRestartCommand{}), Wrap(SystemRestartReq))
		})
	})
}
