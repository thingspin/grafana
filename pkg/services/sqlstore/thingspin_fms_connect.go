package sqlstore

import (
	"fmt"

	"github.com/grafana/grafana/pkg/bus"
	m "github.com/grafana/grafana/pkg/models-thingspin"
)

func init() {
	bus.AddHandler("thingspin-sql", GetAllTsConnect)
	bus.AddHandler("thingspin-sql", AddTsConnect)
	bus.AddHandler("thingspin-sql", UpdateConnectFlow)
	bus.AddHandler("thingspin-sql", UpdateActiveConnect)
	bus.AddHandler("thingspin-sql", DelelteTsConnect)
}

func GetAllTsConnect(cmd *m.GetAllTsConnectQuery) error {
	var res []map[string]interface{}

	err := x.Table(m.TsFmsConnectTbl).Find(&res)

	cmd.Result = res

	return err
}

func AddTsConnect(cmd *m.AddTsConnectQuery) error {
	sqlQuery := fmt.Sprintf(`INSERT INTO
	'%s'
		('type', 'params') 
	values
		('%s', '%s')`, m.TsFmsConnectTbl, cmd.Type, cmd.Params)
	result, err := x.Exec(sqlQuery)

	cmd.Result = result

	return err
}

func UpdateConnectFlow(cmd *m.UpdateTsConnectFlowQuery) error {
	sqlQuery := fmt.Sprintf(`UPDATE '%s'
	SET 
		flow_id='%s', 
		params='%s', 
		updated=now()
	WHERE id=%d`,
		m.TsFmsConnectTbl, cmd.FlowId, cmd.Params, cmd.Id)
	result, err := x.Exec(sqlQuery)

	cmd.Result = result

	return err
}

func UpdateActiveConnect(cmd *m.UpdateActiveTsConnectQuery) error {
	sqlQuery := fmt.Sprintf(`UPDATE '%s'
	SET 
		active=%t,
		flow_id='%s', 
		updated=now()
	WHERE id=%d`,
		m.TsFmsConnectTbl, cmd.Active, cmd.FlowId, cmd.Id)
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
