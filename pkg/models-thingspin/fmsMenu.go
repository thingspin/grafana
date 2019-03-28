package tsmodels

import "time"

var TsFmsMenuTableName = "TS_FMS_GROUP_MENU"

type GetFmsMenuByOrgIdQuery struct {
	OrgId  int64
	Result *FmsMenu
}

type GetFmsDefaultMenuQuery struct {
	Result FmsMenu
}

type FmsMenu struct {
	OrgId       int64                    `json:"orgId"`
	Name        string                   `json:"Name"`
	Menu        []map[string]interface{} `json:"menu"`
	CreatedDate time.Time                `json:"CreatedDate"`
	UpdatedDate time.Time                `json:"UpdatedDate"`
}
