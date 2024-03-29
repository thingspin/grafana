package sqlstore

import (
	"strings"

	//"database/sql"
	"github.com/grafana/grafana/pkg/bus"
	m "github.com/grafana/grafana/pkg/models-thingspin"
)

func init() {
	bus.AddHandler("sql", GetFmsConnect)
	bus.AddHandler("sql", GetAllTsConnectName)
}

func GetAllTsConnectName(cmd *m.GetAllTsConnectNameQuery) error {
	var res []m.TsConnectName
	err := x.Table(m.TsFmsConnectTbl).Find(&res)

	cmd.Result = res

	return err
}

func GetFmsConnect(cmd *m.GetFmsConnectCommand) error {
	var res []*m.FmsConnectQueryResult
	selectStr := []string{
		//m.TsFmsMenuTbl + ".id",
		m.TsFmsConnectTbl + ".id",
		m.TsFmsConnectTbl + ".type",
		m.TsFmsConnectTbl + ".name",
	}
	err := x.Table(m.TsFmsConnectTbl).
		Select(strings.Join(selectStr, ", ")).
		Desc("type").
		Find(&res)
		
	if err == nil {
		cmd.Result = res
	}

	return err
}