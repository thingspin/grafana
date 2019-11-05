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
	reqEditorRole := middleware.ReqEditorRole
	//quota := middleware.Quota(hs.QuotaService)
	// register thingspin rest api
	r.Group("/thingspin", func(tsRoute routing.RouteRegister) {
		tsRoute.Get("/alert-notifiers", reqEditorRole, Wrap(GetTsAlertNotifiers))

		tsRoute.Get("/user/password/send-reset-email", hs.ResetView)
		tsRoute.Get("/user/password/reset", hs.ResetView)
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

			// 부모 tree에 신규 하위(child) 노드 추가 api
			tsMenuRoute.Post("/:orgId/:parentId", bind(tsm.AddFmsMenuByParentIdCmd{}), Wrap(AddTsChildMenuByParentId))
			tsMenuRoute.Get("/:orgId/name/:name", Wrap(FindMenuByName))
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
			tsFnRoute.Patch("/:connId/publish", Wrap(toggleMqttPublishTsConnect))
			tsFnRoute.Get("/:connId/history", Wrap(getTsConnectHistory))
			tsFnRoute.Get("/history", Wrap(getTsConnectTotalHistory))
		})

		// 사이트 관리 동작 API
		tsRoute.Group("/sites", func(tsFnRoute routing.RouteRegister) {
			tsFnRoute.Get("/", Wrap(getAllTsSite))
			tsFnRoute.Get("/:siteId", Wrap(getTsSite))
			tsFnRoute.Get("/sample", Wrap(getSampleTsSite))
			tsFnRoute.Post("/", bind(tsm.AddTsSiteQuery{}), Wrap(addTsSite))
			tsFnRoute.Put("/", bind(tsm.UpdateTsSiteQuery{}), Wrap(updateTsSite))
			tsFnRoute.Delete("/:siteId", Wrap(deleteTsSite))

			tsFnRoute.Group("/:siteId/facilities", func(tsFacilitesRoute routing.RouteRegister) {
				tsFacilitesRoute.Get("/", Wrap(getAllTsFacility))
				tsFacilitesRoute.Get("/:facilityId", Wrap(getTsFacility))
				tsFacilitesRoute.Post("/:facilityId", bind(tsm.AddTsFacilityTreePathOneQuery{}), Wrap(addTsFacilityTreePath))
				tsFacilitesRoute.Post("/", bind(tsm.AddTsFacilityQuery{}), Wrap(addTsFacility))
				tsFacilitesRoute.Put("/", bind(tsm.UpdateTsFacilityQuery{}), Wrap(updateTsFacility))
				tsFacilitesRoute.Delete("/:facilityId", Wrap(deleteTsFacility))

				tsFacilitesRoute.Group("/tree", func(tsFacilitytree routing.RouteRegister) {
					tsFacilitytree.Get("/", Wrap(getAllTsFacilityTree))
					tsFacilitytree.Get("/sample", Wrap(getSampleTsFacilityTree))
					tsFacilitytree.Post("/", bind(tsm.AddTsFacilityTreePathQuery{}), Wrap(addTsFacilityTree))
					tsFacilitytree.Put("/", bind(tsm.UpdateTsFacilityTreePathQuery{}), Wrap(updateTsFacilityTree))
					tsFacilitytree.Delete("/", bind(tsm.DeleteTsFacilityTreePathQuery{}), Wrap(deleteTsFacilityTree))
				})

				tsFacilitesRoute.Group("/:facilityId/tag", func(tsFacilityTag routing.RouteRegister) {
					tsFacilityTag.Get("/", Wrap(getAllTsFacilityTag))
					tsFacilityTag.Put("/:tagId", bind(tsm.UpdateTsFacilityTagNameQuery{}), Wrap(updateTsFacilityTagName))
					tsFacilityTag.Delete("/:tagId", Wrap(deleteTsFacilityTag))
				})
			})
		})

		// 물리적 태그 트리
		tsRoute.Group("/tag", func(tsTypeRoute routing.RouteRegister) {
			tsTypeRoute.Get("/", Wrap(getAllTsTag))
		})

		tsRoute.Group("/tagdefine", func(tsTypeRoute routing.RouteRegister) {
			tsTypeRoute.Get("/", Wrap(getAllTsConnectInfo))
			tsTypeRoute.Get("/graph", Wrap(getAllTsConnectName))
			tsTypeRoute.Get("/graph/:id", Wrap(getTsPtag))
		})

		tsRoute.Group("/type", func(tsTypeRoute routing.RouteRegister) {
			tsTypeRoute.Get("/connect", Wrap(getTsConnectType))
		})

		// Alarm
		tsRoute.Group(`/annotations`, func(tsAnnoRoute routing.RouteRegister) {
			tsAnnoRoute.Get("/", Wrap(GetTsAnnotations))
			tsAnnoRoute.Get("/count/newState", Wrap(GetAnnotaionStateCount))
			tsAnnoRoute.Put("/confirm", bind(tsm.UpdateTsAnnotationConfirmCmd{}), Wrap(updateTsAnnotationConfirm))
		})

		// Grafana 데이터소스 REST API 커스텀마이징
		tsRoute.Group(`/datasources`, func(tsDsRoute routing.RouteRegister) {
			tsDsRoute.Get("/:id", Wrap(GetTsDataSourceById))

			tsDsRoute.Get("/id/:name", Wrap(GetTsDataSourceIdByName))
			tsDsRoute.Get("/name/:name", Wrap(GetTsDataSourceByName))

			tsDsRoute.Any("/proxy/:id/*", reqSignedIn, hs.ProxyTsDataSourceRequest)
			tsDsRoute.Any("/proxy/:id", reqSignedIn, hs.ProxyTsDataSourceRequest)
		})

		// Edge AI API
		tsRoute.Group("/edge-ai", func(edgeAiRoute routing.RouteRegister) {
			edgeAiRoute.Get("/", Wrap(EAIM.EdgeAiGetAll))
			edgeAiRoute.Post("/", binding.MultipartForm(tsm.EdgeAiSaveReq{}), Wrap(EAIM.EdgeAiSave))

			edgeAiRoute.Get("/:cid", Wrap(EAIM.EdgeAiGet))
			edgeAiRoute.Put("/:cid", binding.MultipartForm(tsm.EdgeAiSaveReq{}), Wrap(EAIM.EdgeAiEdit))
			edgeAiRoute.Delete("/:cid", Wrap(EAIM.EdgeAiDelete))
			edgeAiRoute.Post("/:cid/start", Wrap(EAIM.EdgeAiStart))
			edgeAiRoute.Post("/:cid/stop", Wrap(EAIM.EdgeAiStop))
			edgeAiRoute.Get("/:cid/check", Wrap(EAIM.EdgeAiCheck))
			edgeAiRoute.Get("/:cid/model/:fileName", EAIM.EdgeAiDownloadModel)
			edgeAiRoute.Get("/:cid/algorithm/:fileName", EAIM.EdgeAiDownloadAl)
			edgeAiRoute.Put("/:cid/model/:fileName", binding.MultipartForm(tsm.EdgeAiUploadReq{}), Wrap(EAIM.EdgeAiUploadModel))
			edgeAiRoute.Put("/:cid/algorithm/:fileName", binding.MultipartForm(tsm.EdgeAiUploadReq{}), Wrap(EAIM.EdgeAiUploadAl))
			edgeAiRoute.Get("/:cid/log", Wrap(EAIM.EdgeAiGetLog))
			edgeAiRoute.Get("/:cid/log/:num", Wrap(EAIM.EdgeAiGetLogs))
		})
	})

	r.Group("/api/:ver", func(tsSysAPIRoute routing.RouteRegister) {
		tsSysAPIRoute.Group("/sys", func(tsSysRoute routing.RouteRegister) {
			tsSysRoute.Post("/control/:control/:user", bind(tsm.SystemRestartCommand{}), Wrap(SystemRestartReq))
		})
	})
}
