package sqlstore

import (
	"fmt"

	"github.com/grafana/grafana/pkg/bus"
	m "github.com/grafana/grafana/pkg/models-thingspin"
)

func init() {
	bus.AddHandler("sql", GetFmsMenuByOrgId)
	bus.AddHandler("sql", GetFmsDefaultMenu)
}

func GetFmsMenuByOrgId(cmd *m.GetFmsMenuByOrgIdQuery) error {
	var res []*m.FmsMenu

	err := x.Table(m.TsFmsMenuTableName).Where("org_id = ?", cmd.OrgId).Find(&res)

	cmd.Result = res[0]

	return err
}

func GetFmsDefaultMenu(cmd *m.GetFmsDefaultMenuQuery) error {
	var res m.FmsMenu

	_, err := x.Table(m.TsFmsMenuTableName).Where("org_id = ?", 1).Get(&res)

	fmt.Printf("%+V", res)

	cmd.Result = res

	return err
}
