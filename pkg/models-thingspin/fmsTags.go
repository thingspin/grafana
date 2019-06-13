package tsmodels

import "database/sql"

type TsTagField struct {
	Id           int    `xorm:"'id'"`
	SiteId       int    `xorm:"'site_id'"`
	FacilityId   int    `xorm:"'facility_id'"`
	DatasourceId int    `xorm:"'datasource_id'"`
	TableName    string `xorm:"'table_name'"`
	ColumnName   string `xorm:"'column_name'"`
	ColumnType   string `xorm:"'column_type'"`
	Name         string `xorm:"'name'"`
}

type GetAllTsTagQuery struct {
	Result []TsTagField
}

type AddTsTagQuery struct {
	SiteId       int    `xorm:"'site_id'"`
	FacilityId   int    `xorm:"'facility_id'"`
	DatasourceId int    `xorm:"'datasource_id'"`
	TableName    string `xorm:"'table_name'"`
	ColumnName   string `xorm:"'column_name'"`
	ColumnType   string `xorm:"'column_type'"`
	Name         string `xorm:"'name'"`
}

type UpdateTsTagQuery struct {
	Id           int    `xorm:"'id'"`
	SiteId       int    `xorm:"'site_id'"`
	FacilityId   int    `xorm:"'facility_id'"`
	DatasourceId int    `xorm:"'datasource_id'"`
	TableName    string `xorm:"'table_name'"`
	ColumnName   string `xorm:"'column_name'"`
	ColumnType   string `xorm:"'column_type'"`
	Name         string `xorm:"'name'"`
}

type DeleteTsTagQuery struct {
	Id     int
	Result sql.Result
}
