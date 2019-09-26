package tsmodels

import "database/sql"

type TsSiteField struct {
	Id           int     `json:"id"`
	Name         string  `json:"name"`
	Description  string  `json:"desc"`
	Location_lat float32 `json:"lat"`
	Location_lon float32 `json:"lon"`
}

type GetAllTsSiteQuery struct {
	Result []TsSiteField
}

type GetTsSiteQuery struct {
	Id     int
	Result TsSiteField
}

type AddTsSiteQuery struct {
	Name   string  `xorm:"'name'"`
	Desc   string  `xorm:"'desc'"`
	Lat    float32 `xorm:"'lat'"`
	Lon    float32 `xorm:"'lon'"`
	Result int64
}

type UpdateTsSiteQuery struct {
	Id     int     `xorm:"'id'"`
	Name   string  `xorm:"'name'"`
	Desc   string  `xorm:"'desc'"`
	Lat    float32 `xorm:"'lat'"`
	Lon    float32 `xorm:"'lon'"`
	Result int
}

type DeleteTsSiteQuery struct {
	Id     int
	Result sql.Result
}