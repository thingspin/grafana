package sqlstore

import (
	"errors"
	"fmt"
	"time"

	"github.com/grafana/grafana/pkg/bus"
	m "github.com/grafana/grafana/pkg/models-thingspin"
)

func init() {
	bus.AddHandler("thingspin-sql", GetTsAllSite)
	bus.AddHandler("thingspin-sql", GetTsSite)
	bus.AddHandler("thingspin-sql", AddTsSite)
	bus.AddHandler("thingspin-sql", UpdateTsSite)
	bus.AddHandler("thingspin-sql", DelelteTsSite)
}

type InsertTsSite struct {
	Id            int64  `xorm:"'id' pk autoincr"`
	Name          string `xorm:"'name'"`
	Description   string `xorm:"'description'"`
	Location_lat  float32 `xorm:"'location_lat'`
	Location_lon  float32 `xorm:"'location_lon'`
}

type UpdateTsSiteStruct struct {
	Id            int    `xorm:"'id' pk autoincr"`
	Name          string `xorm:"'name'"`
	Description   string `xorm:"'description'"`
	Location_lat  float32 `xorm:"'location_lat'`
	Location_lon  float32 `xorm:"'location_lon'`
	Updated       time.Time `xorm:"'updated'"`
}

func GetTsAllSite(cmd *m.GetAllTsSiteQuery) error {
	var res []m.TsSiteField

	err := x.Table(m.TsFmsSiteTbl).Find(&res)
	cmd.Result = res

	return err
}

func GetTsSite(cmd *m.GetTsSiteQuery) error {
	var res []m.TsSiteField

	err := x.Table(m.TsFmsSiteTbl).Where("id=?", cmd.Id).Find(&res)
	length := len(res)
	if length == 0 {
		return errors.New("Connect is not found")
	}

	cmd.Result = res[0]

	return err
}

func AddTsSite(cmd *m.AddTsSiteQuery) error {
	q := &InsertTsSite{
		Name:          cmd.Name,
		Description:   cmd.Desc,
		Location_lat:  cmd.Lat,
		Location_lon:  cmd.Lon,
	}

	_, err := x.Table(m.TsFmsSiteTbl).Insert(q)
	cmd.Result = q.Id

	return err
}

func UpdateTsSite(cmd *m.UpdateTsSiteQuery) error {
	q := &UpdateTsSiteStruct{
		Id:            cmd.Id,
		Name:          cmd.Name,
		Description:   cmd.Desc,
		Location_lat:  cmd.Lat,
		Location_lon:  cmd.Lon,
		Updated:       time.Now(),
	}
	_, err := x.Table(m.TsFmsSiteTbl).Where("id = ?", cmd.Id).AllCols().Update(q)
	cmd.Result = q.Id

	return err
}

func DelelteTsSite(cmd *m.DeleteTsSiteQuery) error {
	sqlQuery := fmt.Sprintf(`DELETE FROM '%s' WHERE id=%d`,
		m.TsFmsSiteTbl, cmd.Id)
	result, err := x.Exec(sqlQuery)

	cmd.Result = result

	return err
}