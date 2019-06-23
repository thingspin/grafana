package sqlstore

import (
	// "errors"
	"fmt"
	// "time"

	"github.com/grafana/grafana/pkg/bus"
	m "github.com/grafana/grafana/pkg/models-thingspin"
)

func init() {
	bus.AddHandler("thingspin-sql", GetTsFacilityTreeList)
	bus.AddHandler("thingspin-sql", GetTsFacilityTreeLastPath)
	bus.AddHandler("thingspin-sql", GetTsFacilityTreeFacilityItem)
	bus.AddHandler("thingspin-sql", GetTsFacilityTreeTagItem)
	bus.AddHandler("thingspin-sql", AddTsFacilityTree)
	bus.AddHandler("thingspin-sql", UpdateTsFacilityTreeTag)
	bus.AddHandler("thingspin-sql", UpdateTsFacilityTreeFacility)
	bus.AddHandler("thingspin-sql", DelelteTsFacilityTree)
}

type InsertTsFacilityTreeQuery struct {
	Id         int    `xorm:"'id' pk autoincr"`
	SiteId     int    `xorm:"'site_id'"`
	FacilityId int    `xorm:"'facility_id'"`
	TagId      int    `xorm:"'tag_id'"`
	Path       string `xorm:"'path'"`
	Order      int    `xorm:"'order'"`
}

func GetTsFacilityTreeList(cmd *m.GetAllTsFacilityTreeQuery) error {
	var res []m.TsFacilityTreeField

	err := x.Table(m.TsFmsFacilityTreeTbl).Find(&res)
	cmd.Result = res

	return err
}

func GetTsFacilityTreeLastPath(cmd *m.GetTsFacilityTreeLastPathQuery) error {
	err := x.Table(m.TsFmsFacilityTreeTbl).
		Where(`path like "%/"`).
		OrderBy("path desc").
		Limit(1).
		Find(&cmd.Result)

	return err
}

func GetTsFacilityTreeFacilityItem(cmd *m.GetTsFacilityTreeFacilityItemQuery) error {
	var res []m.TsFacilityTreeField

	err := x.Table(m.TsFmsFacilityTreeTbl).Where("site_id = ? AND facility_id = ?", cmd.SiteId, cmd.FacilityId).Find(&res)
	cmd.Result = res

	return err	
}

func GetTsFacilityTreeTagItem(cmd *m.GetTsFacilityTreeTagItemQuery) error {
	var res []m.TsFacilityTreeField

	err := x.Table(m.TsFmsFacilityTreeTbl).Where("site_id = ? AND tag_id = ?", cmd.SiteId, cmd.TagId).Find(&res)
	cmd.Result = res

	return err	
}

func AddTsFacilityTree(cmd *m.AddTsFacilityTreeQuery) error {
	q := &InsertTsFacilityTreeQuery {
		SiteId: cmd.SiteId,
		FacilityId: cmd.FacilityId,
		TagId: cmd.TagId,
		Path: cmd.Path,
		Order: cmd.Order,
	}

	_, err := x.Table(m.TsFmsFacilityTreeTbl).Insert(q)
	cmd.Result = q.Id

	return err
}

func UpdateTsFacilityTreeTag(cmd *m.UpdateTsFacilityTreeTagQuery) error {
	_, err := x.Table(m.TsFmsFacilityTreeTbl).Where("site_id = ? AND tag_id = ?", cmd.SiteId, cmd.TagId).AllCols().Update(cmd)

	return err
}

func UpdateTsFacilityTreeFacility(cmd *m.UpdateTsFacilityTreeFacilityQuery) error {
	_, err := x.Table(m.TsFmsFacilityTreeTbl).Where("site_id = ? AND facility_id = ?", cmd.SiteId, cmd.FacilityId).AllCols().Update(cmd)

	return err
}

func DelelteTsFacilityTree(cmd *m.DeleteTsFacilityTreeQuery) error {
	sqlQueryItem := fmt.Sprintf(`DELETE FROM '%s' where path like "%d%s"`,
		m.TsFmsFacilityTreeTbl, cmd.FacilityId, "/%")
	_, err := x.Exec(sqlQueryItem)

	sqlQuery := fmt.Sprintf(`DELETE FROM '%s' WHERE site_id=%d and facility_id=%d`,
		m.TsFmsFacilityTreeTbl, cmd.SiteId, cmd.FacilityId)
	result, err := x.Exec(sqlQuery)
	cmd.Result = result

	return err
}