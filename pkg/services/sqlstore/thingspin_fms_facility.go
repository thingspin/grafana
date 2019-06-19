package sqlstore

import (
	// "errors"
	"fmt"
	"time"

	"github.com/grafana/grafana/pkg/bus"
	m "github.com/grafana/grafana/pkg/models-thingspin"
)

func init() {
	bus.AddHandler("thingspin-sql", GetTsFacilityList)
	bus.AddHandler("thingspin-sql", GetTsFacilityItem)
	bus.AddHandler("thingspin-sql", AddTsFacility)
	bus.AddHandler("thingspin-sql", UpdateTsFacility)
	bus.AddHandler("thingspin-sql", DelelteTsFacility)
}

type InsertTsFacilityStruct struct {
	Site_id       int    `xorm:"'site_id'`
	Id            int    `xorm:"'id' pk autoincr"`
	Name          string `xorm:"'name'"`
	Description   string `xorm:"'description'"`
	Location_lat  float32 `xorm:"'location_lat'`
	Location_lon  float32 `xorm:"'location_lon'`
	Image_path    string `xorm:"'image_path'"`
}

type UpdateTsFacilityStruct struct {
	Id            int    `xorm:"'id' pk autoincr"`
	Name          string `xorm:"'name'"`
	Description   string `xorm:"'description'"`
	Location_lat  float32 `xorm:"'location_lat'`
	Location_lon  float32 `xorm:"'location_lon'`
	Image_path    string `xorm:"'image_path'"`
	Updated       time.Time `xorm:"'updated'"`
}


func GetTsFacilityList(cmd *m.GetAllTsFacilityQuery) error {
	var res []m.TsFacilityField
	err := x.Table(m.TsFmsFacilityTbl).Where("site_id = ?", cmd.SiteId).Find(&res)
	cmd.Result = res

	return err
}

func GetTsFacilityItem(cmd *m.GetTsFacilityItemQuery) error {
	var res []m.TsFacilityField
	err := x.Table(m.TsFmsFacilityTbl).Where("site_id = ? and id = ?", cmd.SiteId, cmd.FacilityId).Find(&res)
	cmd.Result = res

	return err
}

func AddTsFacility(cmd *m.AddTsFacilityQuery) error {
	q := &InsertTsFacilityStruct{
		Site_id:       cmd.SiteId,
		Name:          cmd.Name,
		Description:   cmd.Desc,
		Location_lat:  cmd.Lat,
		Location_lon:  cmd.Lon,
		Image_path:    cmd.ImgPath,
	}

	_, err := x.Table(m.TsFmsFacilityTbl).Insert(q)
	cmd.Result = q.Id

	return err
}

func UpdateTsFacility(cmd *m.UpdateTsFacilityQuery) error {
	q := &UpdateTsFacilityStruct{
		Id:            cmd.Id,
		Name:          cmd.Name,
		Description:   cmd.Desc,
		Location_lat:  cmd.Lat,
		Location_lon:  cmd.Lon,
		Image_path:    cmd.ImgPath,
		Updated:       time.Now(),
	}
	_, err := x.Table(m.TsFmsFacilityTbl).Where("id = ?", cmd.Id).AllCols().Update(q)
	cmd.Result = q.Id

	return err
}

func DelelteTsFacility(cmd *m.DeleteTsFacilityQuery) error {
	sqlQuery := fmt.Sprintf(`DELETE FROM '%s' WHERE id=%d`,
		m.TsFmsFacilityTbl, cmd.Id)
	result, err := x.Exec(sqlQuery)

	cmd.Result = result

	return err
}