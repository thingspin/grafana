package tsmodels

import "database/sql"

type TsFacilityField struct {
	Id           int     `json:"id"`
	SiteId       int     `json:"siteid"`
	Name         string  `json:"name"`
	Description  string  `json:"desc"`
	Location_lat float32 `json:"lat"`
	Location_lon float32 `json:"lon"`
	Image_path   string  `json:"imgpath"`
}

type GetAllTsFacilityQuery struct {
	Result []TsFacilityField
}

type AddTsFacilityQuery struct {
	SiteId  int     `xorm:"'siteid'"`
	Name    string  `xorm:"'name'"`
	Desc    string  `xorm:"'desc'"`
	Lat     float32 `xorm:"'lat'"`
	Lon     float32 `xorm:"'lon'"`
	ImgPath string  `xorm:"'img_path'"`
	Result  int64
}

type UpdateTsFacilityQuery struct {
	Id      int     `xorm:"'id'"`
	Name    string  `xorm:"'name'"`
	Desc    string  `xorm:"'desc'"`
	Lat     float32 `xorm:"'lat'"`
	Lon     float32 `xorm:"'lon'"`
	ImgPath string  `xorm:"'img_path'"`
	Result  int
}

type DeleteTsFacilityQuery struct {
	Id     int
	Result sql.Result
}
