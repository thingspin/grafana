package api

import (
	m "github.com/grafana/grafana/pkg/models"
	tsm "github.com/grafana/grafana/pkg/models-thingspin"
	"github.com/grafana/grafana/pkg/services/annotations"
)

func GetAnnotaionStateCount(c *m.ReqContext) Response {
	query := &annotations.TsItemQuery{
		ItemQuery: annotations.ItemQuery{
			From:        c.QueryInt64("from"),
			To:          c.QueryInt64("to"),
			OrgId:       c.OrgId,
			UserId:      c.QueryInt64("userId"),
			AlertId:     c.QueryInt64("alertId"),
			DashboardId: c.QueryInt64("dashboardId"),
			PanelId:     c.QueryInt64("panelId"),
			Limit:       c.QueryInt64("limit"),
			Tags:        c.QueryStrings("tags"),
			Type:        c.Query("type"),
			MatchAny:    c.QueryBool("matchAny"),
		},
		NewState: c.Query("newState"),
	}

	repo := annotations.GetTsRepository()

	num, err := repo.FindStateCount(query)
	if err != nil {
		return Error(500, "Failed to get annotations", err)
	}

	return JSON(200, num)

}

func GetTsAnnotations(c *m.ReqContext) Response {
	query := &annotations.TsItemQuery{
		ItemQuery: annotations.ItemQuery{
			From:        c.QueryInt64("from"),
			To:          c.QueryInt64("to"),
			OrgId:       c.OrgId,
			UserId:      c.QueryInt64("userId"),
			AlertId:     c.QueryInt64("alertId"),
			DashboardId: c.QueryInt64("dashboardId"),
			PanelId:     c.QueryInt64("panelId"),
			Limit:       c.QueryInt64("limit"),
			Tags:        c.QueryStrings("tags"),
			Type:        c.Query("type"),
			MatchAny:    c.QueryBool("matchAny"),
		},
		NewState: c.Query("newState"),
		Confirm:  c.Query("confirm"),
	}

	repo := annotations.GetTsRepository()

	items, err := repo.TsFind(query)
	if err != nil {
		return Error(500, "Failed to get annotations", err)
	}

	return JSON(200, items)
}

func updateTsAnnotationConfirm(c *m.ReqContext, req tsm.UpdateTsAnnotationConfirmCmd) Response {
	repo := annotations.GetTsRepository()

	result, err := repo.UpdateConfirm(req)
	if err != nil {
		return Error(500, "Failed to annotations", err)
	}
	return JSON(200, result)
}
