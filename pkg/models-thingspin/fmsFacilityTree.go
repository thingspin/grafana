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

type AddTsFacilityTreeQuery struct {
	SiteId     int    `xorm:"'site_id'"`
	FacilityId int    `xorm:"'facility_id'"`
	TagId      int    `xorm:"'tag_id'"`
	Path       string `xorm:"'path'"`
	Order      int    `xorm:"'order'"`
}

type UpdateTsFacilityTreeQuery struct {
	SiteId     int    `xorm:"'site_id'"`
	FacilityId int    `xorm:"'facility_id'"`
	TagId      int    `xorm:"'tag_id'"`
	Path       string `xorm:"'path'"`
	Order      int    `xorm:"'order'"`
}

type DeleteTsFacilityTreeQuery struct {
	Id     int
	Result sql.Result
}

type TsFacilityTreeItem struct {
	SiteId            int                  `json:"site_id"`
	Label             string               `json:"label"`
	Value             string               `json:"value"`
	FacilityId        int                  `json:"facility_id"`
	FacilityName      string               `json:"facility_name"`
	FacilityDesc      string               `json:"facility_desc"`
	FacilityLat       float32              `json:"facility_lat"`
	FacilityLon       float32              `json:"facility_lon"`
	FacilityPath      string               `json:"facility_path"`
	TagId             int                  `json:"tag_id"`
	TagDatasource     int                  `json:"tag_datasource"`
	TagTableName      string               `json:"tag_table_name"`
	TagColumnName     string               `json:"tag_column_name"`
	TagColumnType     string               `json:"tag_column_type"`
	TagName           string               `json:"tag_name"`
	FacilityTreePath  string               `json:"facility_tree_path"`
	FacilityTreeOrder int                  `json:"facility_tree_order"`
	FacilityTreeId    int                  `json:"facility_tree_id"`
	Children          []TsFacilityTreeItem `json:"children"`
}
