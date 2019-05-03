package tsmodels

import (
	"database/sql"
)

type FmsMenuQueryResult struct {
	Id           int                      `xorm:"int notnull 'id'" json:"id"`
	Permission   string                   `xorm:"text 'permission'" json:"permission"`
	ParentId     int                      `xorm:"int notnull 'parent_id'" json:"parent_id"`
	Name         string                   `xorm:"text 'name'" json:"name"`
	ReqParams    []map[string]interface{} `xorm:"jsonb 'req_params'" json:"req_params"`
	Order        int                      `xorm:"int notnull 'order'" json:"order"`
	Text         string                   `xorm:"text notnull 'text'" json:"text"`
	Icon         string                   `xorm:"text notnull 'icon'" json:"icon"`
	Img_path     string                   `xorm:"text 'img_path'" json:"img_path"`
	Subtitle     string                   `xorm:"text 'subtitle'" json:"subtitle"`
	Url          string                   `xorm:"text notnull 'url'" json:"url"`
	Target       string                   `xorm:"text 'target'" json:"target"`
	HideFromMenu bool                     `xorm:"bool notnull 'hideFromMenu'" json:"hideFromMenu"`
	HideFromTabs bool                     `xorm:"bool notnull 'hideFromTabs'" json:"hideFromTabs"`
	PlaceBottom  bool                     `xorm:"bool notnull 'placeBottom'" json:"placeBottom"`
	Divider      bool                     `xorm:"bool notnull 'divider'" json:"divider"`
	CanDelete    bool                     `xorm:"bool notnull 'canDelete'" json:"canDelete"`
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

// Delete menu
type DeleteFmsMenuByIdQuery struct {
	Id     int64
	//Result sql.Result
}

// Add menu
type AddFmsMenuCommand struct {
	OrgId  int64                    `json:"orgId"`
	Id     int                      `json:"id"`
	Order  int                      `json:"order"`
	Icon   string                   `json:"icon"`
	Name   string                   `json:"text"`
	Url    string                   `json:"url"`
	//Result sql.Result
}

// Update menu
type UpdateFmsMenuCommand struct {
	AddFmsMenuCommand
}

// Update menu ordering
type UpdateFmsMenuOrderCommand struct {
	OrgId  int64   `json:"orgId"`
	Menu   FmsMenu `json:"menu"`
	//Result sql.Result
}

// Update menu Info
type UpdateFmsMenuInfoCommand struct {
	Menu   FmsMenu `json:"menu"`
}

// Update menu hide
type UpdateFmsMenuHideStateCommand struct {
	Id           int      `xorm:"int notnull 'id'" json:"id"`
	HideFromMenu bool     `xorm:"bool notnull 'hideFromMenu'" json:"hideFromMenu"`
}

type UpdateFmsMenuPinSateCommand struct {
	UserID int64 `xorm:"int notnull 'uid'" json:"uid"`
	ID     int   `xorm:"int notnull 'id'" json:"id"`
	Pin    bool  `xorm:"bool notnull 'pin'" json:"pin"`
}

type GetFmsMenuPinCommand struct {
	UserID  int64 `xorm:"int notnull 'uid'" json:"uid"`
	MenuIDs []int
}