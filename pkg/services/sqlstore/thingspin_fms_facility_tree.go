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
	bus.AddHandler("thingspin-sql", AddTsFacilityTree)
	bus.AddHandler("thingspin-sql", UpdateTsFacilityTree)
	bus.AddHandler("thingspin-sql", DelelteTsFacilityTree)
}

func GetTsFacilityTreeList(cmd *m.GetAllTsFacilityTreeQuery) error {
	var res []m.TsFacilityTreeField

	err := x.Table(m.TsFmsFacilityTreeTbl).Find(&res)
	cmd.Result = res

	return err
}

func AddTsFacilityTree(cmd *m.AddTsFacilityTreeQuery) error {
	_, err := x.Table(m.TsFmsFacilityTreeTbl).Insert(cmd)

	return err
}

func UpdateTsFacilityTree(cmd *m.UpdateTsFacilityTreeQuery) error {
	_, err := x.Table(m.TsFmsFacilityTreeTbl).Where("siteid = ? AND (facilityid = ? OR tagid = ?)", cmd.SiteId, cmd.FacilityId, cmd.TagId).AllCols().Update(cmd)

	return err
}

func DelelteTsFacilityTree(cmd *m.DeleteTsFacilityQuery) error {
	sqlQuery := fmt.Sprintf(`DELETE FROM '%s' WHERE id=%d`,
		m.TsFmsFacilityTreeTbl, cmd.Id)
	result, err := x.Exec(sqlQuery)
	cmd.Result = result

	return err
}