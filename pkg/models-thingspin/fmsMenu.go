package tsmodels

import (
	"database/sql"
)

type FmsMenuQueryResult struct {
	Id           int                      `json:"id"`
	Permission   string                   `json:"permission"`
	ParentId     int                      `json:"parent_id"`
	Name         string                   `json:"name"`
	ReqParams    []map[string]interface{} `json:"req_params"`
	Order        int                      `json:"order"`
	Text         string                   `json:"text"`
	Icon         string                   `json:"icon"`
	Img_path     string                   `json:"img_path"`
	Subtitle     string                   `json:"subtitle"`
	Url          string                   `json:"url"`
	Target       string                   `json:"target"`
	HideFromMenu bool                     `json:"hideFromMenu"`
	HideFromTabs bool                     `json:"hideFromTabs"`
	Divider      bool                     `json:"divider"`
}
type FmsMenu struct {
	FmsMenuQueryResult
	Children []*FmsMenu `json:"children"`
}

type GetFmsMenuByOrgIdQuery struct {
	OrgId  int64
	Result []*FmsMenu
}

type GetFmsDefaultMenuQuery struct {
	Result []*FmsMenu
}

type DeleteFmsMenuByOrgIdQuery struct {
	OrgId  int64
	Result sql.Result
}

type AddFmsMenuCommand struct {
	OrgId  int64                    `json:"orgId"`
	Name   string                   `json:"name"`
	Menu   []map[string]interface{} `json:"menu"`
	Result sql.Result
}

type UpdateFmsMenuCommand struct {
	AddFmsMenuCommand
}
