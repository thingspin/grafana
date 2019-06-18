package api

import (
	"strconv"

	"github.com/grafana/grafana/pkg/bus"
	gfm "github.com/grafana/grafana/pkg/models"
	m "github.com/grafana/grafana/pkg/models-thingspin"
)

func GetTsDefaultMenuByDefaultOrgId(c *gfm.ReqContext) Response {
	q := m.GetDefaultFmsMenuByDefaultOrgIdQuery{
		OrgId: c.ParamsInt64(":orgId"),
	}

	if err := bus.Dispatch(&q); err != nil {
		return Error(500, "Search failed", err)
	}

	return JSON(200, q.Result)
}

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

func AddDefaultMenuByDefaultOrgId(c *gfm.ReqContext, cmd m.AddFmsDefaultMenuCommand) Response {
	orgId := c.ParamsInt64(":orgId")
	cmd.OrgId = orgId
	if err := bus.Dispatch(&cmd); err != nil {
		return Error(500, "[thingspin] Default Menu add command failed", err)
	}

	return JSON(200, "")
}

func AddTsNewMenuByOrgId(c *gfm.ReqContext, cmd m.AddFmsMenuCommand) Response {
	orgId := c.ParamsInt64(":orgId")
	cmd.OrgId = orgId
	if err := bus.Dispatch(&cmd); err != nil {
		return Error(500, "[thingspin] Menu add command failed", err)
	}

	return JSON(200, cmd.Result)
}

func AddTsChildMenuByParentId(c *gfm.ReqContext, cmd m.AddFmsMenuByParentIdCmd) Response {
	orgId := c.ParamsInt64(":orgId")
	parentId := c.ParamsInt64(":parentId")
	cmd.OrgId = orgId
	cmd.ParentId = parentId

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

func DeleteTsMenuById(c *gfm.ReqContext, cmd m.DeleteFmsMenuByIdQuery) Response {
	cmd.OrgId = c.ParamsInt64(":orgId")
	cmd.Id = c.ParamsInt64(":id")

	if err := bus.Dispatch(&cmd); err != nil {
		return JSON(500, err.Error())
	}

	return JSON(200, "")
}

func EditTsMenu8yOrgId(c *gfm.ReqContext, cmd m.UpdateFmsMenuCommand) Response {
	orgId := c.ParamsInt64(":orgId")
	cmd.OrgId = orgId

	if err := bus.Dispatch(&cmd); err != nil {
		return Error(500, "[thingspin] Menu update command failed", err)
	}

	return JSON(200, cmd)
}

func EditTsMenuInfo(c *gfm.ReqContext, cmd m.UpdateFmsMenuInfoCommand) Response {
	if err := bus.Dispatch(&cmd); err != nil {
		return Error(500, "[thingspin] Menu update info command failed", err)
	}

	return JSON(200, "")
}

func UpdateFmsMenuHideState(c *gfm.ReqContext, cmd m.UpdateFmsMenuHideStateCommand) Response {
	cmd.Id = c.ParamsInt(":id")
	hide := c.Params(":hide")

	cmd.HideFromMenu, _ = strconv.ParseBool(hide)
	if err := bus.Dispatch(&cmd); err != nil {
		return Error(500, "[ThingSPIN] 숨김 설정에 실패하였습니다.", err)
	}

	return JSON(200, "")
}

func UpdateFmsMenuPinSate(c *gfm.ReqContext, cmd m.UpdateFmsMenuPinSateCommand) Response {
	cmd.UserID = c.UserId
	cmd.ID = c.ParamsInt(":menuId")
	pin := c.Params(":pin")

	cmd.Pin, _ = strconv.ParseBool(pin)

	if err := bus.Dispatch(&cmd); err != nil {
		return Error(500, "[ThingSPIN] 핀 설정에 실패하였습니다.", err)
	}

	return JSON(200, cmd)
}

func GetFmsMenuPin(c *gfm.ReqContext, cmd m.GetFmsMenuPinCommand) Response {
	cmd.UserID = c.UserId

	if err := bus.Dispatch(&cmd); err != nil {
		return Error(500, "[ThingSPIN] 사용자의 핀 메뉴를 가져올 수 없습니다.", err)
	}

	return JSON(200, cmd.MenuIDs)
}

func EditTsMenuByOrgId(c *gfm.ReqContext, cmd m.UpdateFmsMenuOrderCommand) Response {
	cmd.OrgId = c.ParamsInt64(":orgId")
	if err := bus.Dispatch(&cmd); err != nil {
		return Error(500, "[thingspin] Menu update command failed", err)
	}

	return JSON(200, "")
}

func FindMenuByName(c *gfm.ReqContext) Response {
	cmd := m.FindFmsMenuByNameCmd{
		OrgId: c.ParamsInt64(":orgId"),
		Name:  c.Params("name"),
	}

	if err := bus.Dispatch(&cmd); err != nil {
		return Error(500, "[ThingSPIN] 사용자의 핀 메뉴를 가져올 수 없습니다.", err)
	}

	return JSON(200, cmd.Result)
}
