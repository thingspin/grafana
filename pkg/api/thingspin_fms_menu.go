package api

import (
	"github.com/grafana/grafana/pkg/bus"
	gfm "github.com/grafana/grafana/pkg/models"
	m "github.com/grafana/grafana/pkg/models-thingspin"
)

func GetTsMenuByOrgId(c *gfm.ReqContext) Response {
	orgId := c.ParamsInt64(":orgId")
	q := m.GetFmsMenuByOrgIdQuery{
		OrgId: orgId,
	}

	if err := bus.Dispatch(&q); err != nil {
		return Error(500, "Search failed", err)
	}

	return JSON(200, q.Result)
}

func GetTsDefaultMenu(c *gfm.ReqContext) Response {
	q := m.GetFmsDefaultMenuQuery{}

	if err := bus.Dispatch(&q); err != nil {
		return Error(500, "Search failed", err)
	}

	return JSON(200, q.Result)
}

func AddTsNewMenuByOrgId(c *gfm.ReqContext, cmd m.AddFmsMenuCommand) Response {
	orgId := c.ParamsInt64(":orgId")
	cmd.OrgId = orgId

	if err := bus.Dispatch(&cmd); err != nil {
		return Error(500, "[thingspin] Menu add command failed", err)
	}

	return JSON(200, cmd.Result)
}

func DeleteTsMenuByOrgId(c *gfm.ReqContext) Response {
	orgId := c.ParamsInt64(":orgId")
	q := m.DeleteFmsMenuByOrgIdQuery{
		OrgId: orgId,
	}

	if err := bus.Dispatch(&q); err != nil {
		return Error(500, "[thingspin] Menu delete command failed", err)
	}

	return JSON(200, q.Result)
}

func EditTsMenu8yOrgId(c *gfm.ReqContext, cmd m.UpdateFmsMenuCommand) Response {
	orgId := c.ParamsInt64(":orgId")
	cmd.OrgId = orgId

	if err := bus.Dispatch(&cmd); err != nil {
		return Error(500, "[thingspin] Menu update command failed", err)
	}

	return JSON(200, cmd.Result)
}
