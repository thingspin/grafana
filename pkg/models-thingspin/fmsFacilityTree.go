package tsmodels

import "database/sql"

type TsFacilityTreeField struct {
	SiteId     int    `xorm:"'site_id'"`
	FacilityId int    `xorm:"'facility_id'"`
	TagId      int    `xorm:"'tag_id'"`
	Path       string `xorm:"'path'"`
	Order      int    `xorm:"'order'"`
}

type GetAllTsFacilityTreeQuery struct {
	Result []TsFacilityTreeField
}

type GetTsFacilityTreeLastPathQuery struct {
	Result []TsFacilityTreeField
}

type GetTsFacilityTreeFacilityItemQuery struct {
	SiteId int
	FacilityId int
	Result []TsFacilityTreeField
}

type GetTsFacilityTreeTagItemQuery struct {
	SiteId int
	TagId int
	Result []TsFacilityTreeField
}

type AddTsFacilityTreeQuery struct {
	SiteId     int    `xorm:"'site_id'"`
	FacilityId int    `xorm:"'facility_id'"`
	TagId      int    `xorm:"'tag_id'"`
	Path       string `xorm:"'path'"`
	Order      int    `xorm:"'order'"`
	Result     int
}

type UpdateTsFacilityTreeQuery struct {
	SiteId     int    `xorm:"'site_id'"`
	FacilityId int    `xorm:"'facility_id'"`
	TagId      int    `xorm:"'tag_id'"`
	Path       string `xorm:"'path'"`
	Order      int    `xorm:"'order'"`
}

type DeleteTsFacilityTreeQuery struct {
	SiteId     int
	FacilityId int
	Result     sql.Result
}
