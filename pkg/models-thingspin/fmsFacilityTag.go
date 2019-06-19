package tsmodels

import "database/sql"

type TsFacilityTagField struct {
	Id           int    `json:"id"`
	SiteId       int    `json:"siteid"`
	FacilityId   int    `json:"facilityid"`
	DatasourceId int    `json:"datasourceid"`
	Table_name   string `json:"table_name"`
	Column_name  string `json:"column_name"`
	Column_type  string `json:"column_type"`
	Name         string `json:"name"`
}

type GetAllTsFacilityTagQuery struct {
	SiteId     int
	FacilityId int
	Result     []TsFacilityTagField
}

type AddTsFacilityTagQuery struct {
	SiteId       int    `xorm:"'site_id'"`
	FacilityId   int    `xorm:"'facility_id'"`
	DatasourceId int    `xorm:"'datasource_id'"`
	Table_name   string `xorm:"'table_name'"`
	Column_name  string `xorm:"'column_name'"`
	Column_type  string `xorm:"'column_type'"`
	Name         string `xorm:"'name'"`
	Result       int
}

type UpdateTsFacilityTagQuery struct {
	Id           int    `xorm:"'id'"`
	SiteId       int    `xorm:"'site_id'"`
	FacilityId   int    `xorm:"'facility_id'"`
	DatasourceId int    `xorm:"'datasource_id'"`
	Table_name   string `xorm:"'table_name'"`
	Column_name  string `xorm:"'column_name'"`
	Column_type  string `xorm:"'column_type'"`
	Name         string `xorm:"'name'"`
	Result       int
}

type UpdateTsFacilityTagNameQuery struct {
	Name         string `json:"name"`
}

type UpdateTsFacilityTagNameStructQuery struct {
	Id           int    `xorm:"'id'"`
	SiteId       int    `xorm:"'site_id'"`
	FacilityId   int    `xorm:"'facility_id'"`
	Name         string `xorm:"'name'"`
	Result       int
}

type DeleteTsFacilityTagQuery struct {
	Id     int
	Result sql.Result
}
