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
			tsMenuRoute.Post("/new/:orgId", bind(tsm.AddFmsDefaultMenuCommand{}), Wrap(AddDefaultMenuByDefaultOrgId))
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

		// 사이트 관리 동작 API
		tsRoute.Group("/sites", func(tsFnRoute routing.RouteRegister) {
			tsFnRoute.Get("/", Wrap(getAllTsSite))
			tsFnRoute.Post("/", bind(tsm.AddTsSiteQuery{}), Wrap(addTsSite))
			tsFnRoute.Put("/", bind(tsm.UpdateTsSiteQuery{}), Wrap(updateTsSite))
			tsFnRoute.Delete("/:siteId", Wrap(deleteTsSite))

			tsFnRoute.Group("/:siteId/facilities", func(tsFaciltesRoute routing.RouteRegister) {
				tsFaciltesRoute.Get("/", Wrap(getAllTsFacility))
				tsFaciltesRoute.Post("/", bind(tsm.AddTsFacilityQuery{}), Wrap(addTsFacility))
				tsFaciltesRoute.Put("/:facilityId", bind(tsm.UpdateTsFacilityQuery{}), Wrap(updateTsFacility))
				tsFaciltesRoute.Delete("/:facilityId", Wrap(deleteTsFacility))
	
				tsFaciltesRoute.Group("/tree", func(tsFaciltytree routing.RouteRegister) {
					tsFaciltytree.Get("/", Wrap(getAllTsFacilityTree))
					tsFaciltytree.Post("/", bind(tsm.AddTsFacilityTreeQuery{}), Wrap(addTsFacilityTree))
					tsFaciltytree.Put("/", bind(tsm.UpdateTsFacilityTreeQuery{}), Wrap(updateTsFacilityTree))
					tsFaciltytree.Delete("/", Wrap(deleteTsFacilityTree))
				})
			})
		})


		tsRoute.Group("/type", func(tsTypeRoute routing.RouteRegister) {
			tsTypeRoute.Get("/connect", Wrap(getTsConnectType))
		})

		// Grafana 데이터소스 REST API 커스텀마이징
		tsRoute.Group(`/datasources`, func(tsDsRoute routing.RouteRegister) {
			tsDsRoute.Get("/:id", Wrap(GetTsDataSourceById))

			tsDsRoute.Get("/id/:name", Wrap(GetTsDataSourceIdByName))
			tsDsRoute.Get("/name/:name", Wrap(GetTsDataSourceByName))

			tsDsRoute.Any("/proxy/:id/*", reqSignedIn, hs.ProxyTsDataSourceRequest)
			tsDsRoute.Any("/proxy/:id", reqSignedIn, hs.ProxyTsDataSourceRequest)
		})
	})

	r.Group("/api/:ver", func(tsSysAPIRoute routing.RouteRegister) {
		tsSysAPIRoute.Group("/sys", func(tsSysRoute routing.RouteRegister) {
			tsSysRoute.Post("/control/:control/:user", bind(tsm.SystemRestartCommand{}), Wrap(SystemRestartReq))
		})
	})
}
