package sqlstore

import (
	"github.com/grafana/grafana/pkg/bus"
	m "github.com/grafana/grafana/pkg/models-thingspin"
)

func init() {
	bus.AddHandler("sql", GetFmsMenuByOrgId)
	bus.AddHandler("sql", GetFmsDefaultMenu)
	bus.AddHandler("sql", DeleteFmsMenuByOrgId)
	bus.AddHandler("sql", AddFmsMenu)
	bus.AddHandler("sql", UpdateFmsMenu)
}

func GetFmsMenuByOrgId(cmd *m.GetFmsMenuByOrgIdQuery) error {
	var res []*m.FmsMenu

	err := x.Table(m.TsFmsMenuTbl).Where("org_id = ?", cmd.OrgId).Find(&res)

	if len(res) == 0 {
		cmd2 := m.GetFmsDefaultMenuQuery{}
		err = GetFmsDefaultMenu(&cmd2)
		cmd.Result = cmd2.Result
	} else {
		cmd.Result = res[0]
	}

	return err
}

func GetFmsDefaultMenu(cmd *m.GetFmsDefaultMenuQuery) error {
	var res []*m.FmsMenu
	err := x.Table(m.TsFmsMenuTbl).Where("org_id = ?", 0).Find(&res)

	cmd.Result = res[0]

	return err
}

func DeleteFmsMenuByOrgId(cmd *m.DeleteFmsMenuByOrgIdQuery) error {
	result, err := x.Exec(`DELETE FROM '?' WHERE org_id = ?`,
		m.TsFmsMenuTbl, cmd.OrgId)
	cmd.Result = result

	return err
}

func AddFmsMenu(cmd *m.AddFmsMenuCommand) error {
	result, err := x.Exec(`INSERT INTO '?' ('org_id', 'name', 'menu') VALUES (?, '?', '?')`,
		m.TsFmsMenuTbl, cmd.OrgId, cmd.Name, cmd.Menu)
	cmd.Result = result

	return err
}

func UpdateFmsMenu(cmd *m.UpdateFmsMenuCommand) error {
	result, err := x.Exec(`UPDATE '?' SET name = '?', menu = '?' WHERE org_id = ?`,
		m.TsFmsMenuTbl, cmd.Name, cmd.Menu, cmd.OrgId)

	cmd.Result = result

	return err
}
