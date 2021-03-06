package sqlstore

import (
	"fmt"
	"strings"

	"github.com/grafana/grafana/pkg/bus"
	m "github.com/grafana/grafana/pkg/models-thingspin"
)

func init() {
	bus.AddHandler("thingspin-sql", GetAllTsConnectHistory)
	bus.AddHandler("thingspin-sql", AddTsConnectHistory)
	bus.AddHandler("thingspin-sql", DelelteTsConnectHistory)
	bus.AddHandler("thingspin-sql", GetTotalTsConnectHistory)
}

type InsertTsConnectHistory struct {
	Id           int64  `xorm:"'id' pk autoincr"`
	ConnectId    int    `xorm:"'connect_id'"`
	Event        string `xorm:"'event'"`
	Description  string `xorm:"'description'"`
}

func GetTotalTsConnectHistory(cmd *m.GetTotalTsConnectHistoryQuery) error {
	var res []m.TsConnectTotalHistoryField

	selectStr := []string{
		m.TsFmsConnectTbl + ".name",
		m.TsFmsConnectTbl + ".type",
		m.TsFmsConnectHistoryTbl + ".created",
		m.TsFmsConnectHistoryTbl + ".event",
		m.TsFmsConnectHistoryTbl + ".description",
	}
	err := x.Table(m.TsFmsConnectHistoryTbl).
		Select(strings.Join(selectStr, ", ")).
		Join("LEFT", m.TsFmsConnectTbl, m.TsFmsConnectTbl+".id = "+m.TsFmsConnectHistoryTbl+".connect_id").
		Desc(m.TsFmsConnectHistoryTbl + ".created").Find(&res)
	cmd.Result = res

	return err
}

func GetAllTsConnectHistory(cmd *m.GetAllTsConnectHistoryQuery) error {
	var res []m.TsConnectHistoryField

	err := x.Table(m.TsFmsConnectHistoryTbl).Where(`connect_id=?`, cmd.ConnectId).Desc("created").Find(&res)
	cmd.Result = res

	return err
}

func AddTsConnectHistory(cmd *m.AddTsConnectHistoryQuery) error {
	q := &InsertTsConnectHistory{
		ConnectId:    cmd.ConnectId,
		Event:        cmd.Event,
		Description:  cmd.Description,
	}

	_, err := x.Table(m.TsFmsConnectHistoryTbl).Insert(q)
	cmd.Result = q.Id

	return err
}

func DelelteTsConnectHistory(cmd *m.DeleteTsConnectHistoryQuery) error {
	sqlQuery := fmt.Sprintf(`DELETE FROM '%s' WHERE connect_id='%d'`,
		m.TsFmsConnectHistoryTbl, cmd.ConnectId)
	result, err := x.Exec(sqlQuery)

	cmd.Result = result

	return err
}