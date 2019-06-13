package sqlstore

import (
	// "errors"
	"fmt"
	// "time"

	"github.com/grafana/grafana/pkg/bus"
	m "github.com/grafana/grafana/pkg/models-thingspin"
)

func init() {
	bus.AddHandler("thingspin-sql", GetTsTagList)
	bus.AddHandler("thingspin-sql", AddTsTagTree)
	bus.AddHandler("thingspin-sql", UpdateTsTag)
	bus.AddHandler("thingspin-sql", DelelteTsTag)
}

func GetTsTagList(cmd *m.GetAllTsTagQuery) error {
	var res []m.TsTagField
	fmt.Println("GetTsTagList")

	err := x.Table(m.TsFmsTagsTbl).Find(&res)
	cmd.Result = res
	fmt.Println(res)
	return err
	// return cmd
}

func AddTsTagTree(cmd *m.AddTsTagQuery) error {
	_, err := x.Table(m.TsFmsTagsTbl).Insert(cmd)

	return err
	// return cmd
}

func UpdateTsTag(cmd *m.UpdateTsTagQuery) error {
	_, err := x.Table(m.TsFmsTagsTbl).Where("id = ?", cmd.Id).AllCols().Update(cmd)
	
	return err
}

func DelelteTsTag(cmd *m.DeleteTsTagQuery) error {
	sqlQuery := fmt.Sprintf(`DELETE FROM '%s' WHERE id=%d`,
		m.TsFmsTagsTbl, cmd.Id)
	result, err := x.Exec(sqlQuery)

	cmd.Result = result

	return err
}