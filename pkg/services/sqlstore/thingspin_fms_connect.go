package sqlstore

import (
	"errors"
	"fmt"

	"github.com/grafana/grafana/pkg/bus"
	m "github.com/grafana/grafana/pkg/models-thingspin"
)

func init() {
	bus.AddHandler("thingspin-sql", GetAllTsConnect)
	bus.AddHandler("thingspin-sql", GetTsConnect)
	bus.AddHandler("thingspin-sql", AddTsConnect)
	bus.AddHandler("thingspin-sql", UpdateConnectFlow)
	bus.AddHandler("thingspin-sql", UpdateActiveConnect)
	bus.AddHandler("thingspin-sql", DelelteTsConnect)
	bus.AddHandler("thingspin-sql", GetAllTsConnectType)
}

func GetAllTsConnect(cmd *m.GetAllTsConnectQuery) error {
	var res []m.TsConnectField

	err := x.Table(m.TsFmsConnectTbl).Find(&res)

	cmd.Result = res

	return err
}

func GetTsConnect(cmd *m.GetTsConnectQuery) error {
	var res []m.TsConnectField

	err := x.Table(m.TsFmsConnectTbl).Where(`id=?`, cmd.Id).Find(&res)

	length := len(res)
	if length == 0 {
		return errors.New("Connect is not found")
	} else if length != 1 {
		return errors.New("Duplicate Id")
	}

	cmd.Result = res[0]

	return err
}

func AddTsConnect(cmd *m.AddTsConnectQuery) error {
	sqlQuery := fmt.Sprintf(`INSERT INTO
	'%s'
		('flow_id', 'name', 'type', 'params', 'active', 'intervals') 
	values
		('%s', '%s', '%s', '%s', true, %d)`, m.TsFmsConnectTbl, cmd.FlowId, cmd.Name, cmd.Type, cmd.Params, cmd.Intervals)
	result, err := x.Exec(sqlQuery)

	cmd.Result = result

	return err
}

func UpdateConnectFlow(cmd *m.UpdateTsConnectFlowQuery) error {
	sqlQuery := fmt.Sprintf(`UPDATE '%s'
	SET 
		name='%s', 
		flow_id='%s', 
		params='%s', 
		enable=%t,
		updated=datetime('now','localtime')
	WHERE id=%d`,
		m.TsFmsConnectTbl, cmd.Name, cmd.FlowId, cmd.Params, cmd.Enable, cmd.Id)
	result, err := x.Exec(sqlQuery)

	cmd.Result = result

	return err
}

func UpdateActiveConnect(cmd *m.UpdateActiveTsConnectQuery) error {
	sqlQuery := fmt.Sprintf(`UPDATE '%s'
	SET 
		active=%t,
		enable=%t
		flow_id='%s', 
		updated=datetime('now','localtime')
	WHERE id=%d`,
		m.TsFmsConnectTbl, cmd.Active, cmd.Enable, cmd.FlowId, cmd.Id)
	result, err := x.Exec(sqlQuery)

	cmd.Result = result

	return err
}

func DelelteTsConnect(cmd *m.DeleteTsConnectQuery) error {
	sqlQuery := fmt.Sprintf(`DELETE FROM '%s' WHERE id=%d`,
		m.TsFmsConnectTbl, cmd.Id)
	result, err := x.Exec(sqlQuery)

	cmd.Result = result

	return err
}

func GetAllTsConnectType(cmd *m.GetAllTsConnectTypeQuery) error {
	var res []m.TsConnectType
	err := x.Table(m.TsFmsConnectTypeTbl).Find(&res)

	cmd.Result = res

	return err
}
