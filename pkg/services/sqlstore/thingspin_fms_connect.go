package sqlstore

import (
	"errors"
	"fmt"
	"time"

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
	bus.AddHandler("thingspin-sql", UpdatePublishTsConnect)
}

type InsertTsConnect struct {
	Id        int64  `xorm:"'id' pk autoincr"`
	Name      string `xorm:"'name'"`
	FlowId    string `xorm:"'flow_id'"`
	Params    string `xorm:"'params'"`
	Intervals int64  `xorm:"'intervals'"`
	Type      string `xorm:"'type'"`
}

type UpdateTsConnect struct {
	Id        int       `xorm:"'id' pk autoincr"`
	Name      string    `xorm:"'name'"`
	FlowId    string    `xorm:"'flow_id'"`
	Params    string    `xorm:"'params'"`
	Intervals int64     `xorm:"'intervals'"`
	Enable    bool      `xorm:"'enable'"`
	Updated   time.Time `xorm:"'updated'"`
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
	q := &InsertTsConnect{
		Name:      cmd.Name,
		FlowId:    cmd.FlowId,
		Params:    cmd.Params,
		Intervals: cmd.Intervals,
		Type:      cmd.Type,
	}

	_, err := x.Table(m.TsFmsConnectTbl).Insert(q)
	cmd.Result = q.Id

	return err
}

func UpdateConnectFlow(cmd *m.UpdateTsConnectFlowQuery) error {
	q := &UpdateTsConnect{
		Id:        cmd.Id,
		Enable:    cmd.Enable,
		FlowId:    cmd.FlowId,
		Intervals: cmd.Intervals,
		Name:      cmd.Name,
		Params:    cmd.Params,
		Updated:   time.Now(),
	}
	/*
		sqlQuery := fmt.Sprintf(`UPDATE '%s'
		SET
			name='%s',
			flow_id='%s',
			params='%s',
			enable=%t,
			intervals=%d,
			updated=datetime('now','localtime')
		WHERE id=%d`,
			m.TsFmsConnectTbl, cmd.Name, cmd.FlowId, cmd.Params, cmd.Enable, cmd.Intervals, cmd.Id)
	*/
	_, err := x.Table(m.TsFmsConnectTbl).Where("id = ?", cmd.Id).AllCols().Update(q)
	cmd.Result = q.Id

	return err
}

func UpdateActiveConnect(cmd *m.UpdateActiveTsConnectQuery) error {
	_, err := x.Table(m.TsFmsConnectTbl).Where("id = ?", cmd.Id).AllCols().Omit("result").Update(cmd)
	cmd.Result = cmd.Id

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

func UpdatePublishTsConnect(cmd *m.UpdateToggleMqttPublishTsConnectQuery) (err error) {
	_, err = x.Table(m.TsFmsConnectTbl).Where("id = ?", cmd.Id).AllCols().Omit("result").Update(cmd)
	cmd.Result = cmd.Id

	return
}
