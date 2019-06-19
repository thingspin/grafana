package sqlstore

import (
	// "errors"
	"fmt"
	"time"

	"github.com/grafana/grafana/pkg/bus"
	m "github.com/grafana/grafana/pkg/models-thingspin"
)

func init() {
	bus.AddHandler("thingspin-sql", GetTsFacilityTagList)
	bus.AddHandler("thingspin-sql", AddTsFacilityTag)
	bus.AddHandler("thingspin-sql", UpdateTsFacilityTag)
	bus.AddHandler("thingspin-sql", UpdateTsFacilityTagName)
	bus.AddHandler("thingspin-sql", DelelteTsFacilityTag)
}

type InsertTsFacilityTag struct {
	Id           int    `xorm:"'id' pk autoincr"`
	Site_Id       int    `xorm:"'site_id'"`
	Facility_Id   int    `xorm:"'facility_id'"`
	Datasource_Id int    `xorm:"'datasource_id'"`
	Table_name   string `xorm:"'table_name'"`
	Column_name  string `xorm:"'column_name'"`
	Column_type  string `xorm:"'column_type'"`
	Name         string `xorm:"'name'"`
}

type UpdateTsFacilityTagStruct struct {
	Id           int    `xorm:"'id' pk autoincr"`
	Site_Id       int    `xorm:"'site_id'"`
	Facility_Id   int    `xorm:"'facility_id'"`
	Datasource_Id int    `xorm:"'datasource_id'"`
	Table_name   string `xorm:"'table_name'"`
	Column_name  string `xorm:"'column_name'"`
	Column_type  string `xorm:"'column_type'"`
	Name         string `xorm:"'name'"`
	Updated      time.Time `xorm:"'updated'"`
}

type UpdateTsFacilityTagNameStruct struct {
	Id           int    `xorm:"'id' pk autoincr"`
	Site_Id       int    `xorm:"'site_id'"`
	Facility_Id   int    `xorm:"'facility_id'"`
	Name         string `xorm:"'name'"`
	Updated      time.Time `xorm:"'updated'"`
}

func GetTsFacilityTagList(cmd *m.GetAllTsFacilityTagQuery) error {
	var res []m.TsFacilityTagField
	err := x.Table(m.TsFmsTagsTbl).Where("site_id = ? and facility_id = ?", cmd.SiteId, cmd.FacilityId).Find(&res)
	cmd.Result = res

	return err
}

func AddTsFacilityTag(cmd *m.AddTsFacilityTagQuery) error {
	q := &InsertTsFacilityTag{
		Site_Id:        cmd.SiteId,
		Facility_Id:    cmd.FacilityId,
		Datasource_Id:  cmd.DatasourceId,
		Table_name:    cmd.Table_name,
		Column_name:   cmd.Column_name,
		Column_type:   cmd.Column_type,
		Name:          cmd.Name,
	}
	_, err := x.Table(m.TsFmsTagsTbl).Insert(q)
	cmd.Result = q.Id

	return err
}

func UpdateTsFacilityTag(cmd *m.UpdateTsFacilityTagQuery) error {
	q := &UpdateTsFacilityTagStruct{
		Id:            cmd.Id,
		Site_Id:        cmd.SiteId,
		Facility_Id:    cmd.FacilityId,
		Datasource_Id:  cmd.DatasourceId,
		Table_name:    cmd.Table_name,
		Column_name:   cmd.Column_name,
		Column_type:   cmd.Column_type,
		Name:          cmd.Name,
		Updated:       time.Now(),
	}
	_, err := x.Table(m.TsFmsTagsTbl).Where("id = ?", cmd.Id).AllCols().Update(q)
	cmd.Result = q.Id

	return err
}

func UpdateTsFacilityTagName(cmd *m.UpdateTsFacilityTagNameStructQuery) error {
	q := &UpdateTsFacilityTagNameStruct{
		Id:            cmd.Id,
		Site_Id:        cmd.SiteId,
		Facility_Id:    cmd.FacilityId,
		Name:          cmd.Name,
		Updated:       time.Now(),
	}
	_, err := x.Table(m.TsFmsTagsTbl).Where("id = ?", cmd.Id).AllCols().Update(q)
	cmd.Result = q.Id

	return err
}

func DelelteTsFacilityTag(cmd *m.DeleteTsFacilityTagQuery) error {
	sqlQuery := fmt.Sprintf(`DELETE FROM '%s' WHERE id=%d`,
		m.TsFmsTagsTbl, cmd.Id)
	result, err := x.Exec(sqlQuery)
	cmd.Result = result

	return err
}