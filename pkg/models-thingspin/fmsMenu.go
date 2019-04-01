package tsmodels

import (
	"database/sql"
	"time"
)

type FmsMenu struct {
	OrgId       int64                    `json:"orgId"`
	Name        string                   `json:"name"`
	Menu        []map[string]interface{} `json:"menu"`
	CreatedDate time.Time                `json:"createdDate"`
	UpdatedDate time.Time                `json:"updatedDate"`
}

type GetFmsMenuByOrgIdQuery struct {
	OrgId  int64
	Result *FmsMenu
}

type GetFmsDefaultMenuQuery struct {
	Result *FmsMenu
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
