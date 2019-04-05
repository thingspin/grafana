package sqlstore

import (
	"sort"
	"strings"

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

// recursive function
func sortFmsMenuTree(menuList []*m.FmsMenu) {
	sort.Slice(menuList, func(i, j int) bool {
		//lower -> higher
		return menuList[i].Order < menuList[j].Order
	})

	for _, menu := range menuList {
		sortFmsMenuTree(menu.Children)
	}
}

func convertFmsMenuTree(menuList []*m.FmsMenuQueryResult) []*m.FmsMenu {
	keyMap := make(map[int]*m.FmsMenu)
	var rootNode []*m.FmsMenu

	var node *m.FmsMenu
	for _, menu := range menuList {
		// generate node data
		node = &m.FmsMenu{
			FmsMenuQueryResult: *menu,
			Children:           []*m.FmsMenu{},
		}

		// find position
		if menu.ParentId == 0 { // == nil
			rootNode = append(rootNode, node)
		} else {
			curr := keyMap[menu.ParentId]
			curr.Children = append(curr.Children, node)
		}

		keyMap[menu.Id] = node
	}
	return rootNode
}

func getFmsMenuByOrgId(orgId int64) ([]*m.FmsMenu, error) {
	var res []*m.FmsMenuQueryResult
	selectStr := []string{
		m.TsFmsMenuTbl + ".id",
		m.TsFmsMenuTbl + ".permission",
		m.TsFmsMenuTbl + ".parent_id",
		m.TsFmsMenuTbl + ".req_params",
		m.TsFmsMenuTbl + ".'order'",

		m.TsFmsMenuBaseTbl + ".text",
		m.TsFmsMenuBaseTbl + ".icon",
		m.TsFmsMenuBaseTbl + ".img_path",
		m.TsFmsMenuBaseTbl + ".subtitle",
		m.TsFmsMenuBaseTbl + ".url",
		m.TsFmsMenuBaseTbl + ".target",
		m.TsFmsMenuBaseTbl + ".hideFromMenu",
		m.TsFmsMenuBaseTbl + ".hideFromTabs",
		m.TsFmsMenuBaseTbl + ".divider",
	}
	err := x.Table(m.TsFmsMenuTbl).
		Select(strings.Join(selectStr, ", ")).
		Join("INNER", m.TsFmsMenuBaseTbl, m.TsFmsMenuTbl+".mbid = "+m.TsFmsMenuBaseTbl+".id").
		Where(m.TsFmsMenuTbl+".org_id = ?", orgId).
		Find(&res)

	result := convertFmsMenuTree(res)
	sortFmsMenuTree(result)

	return result, err
}

func GetFmsMenuByOrgId(cmd *m.GetFmsMenuByOrgIdQuery) error {
	res, err := getFmsMenuByOrgId(cmd.OrgId)

	if len(res) == 0 {
		cmd2 := m.GetFmsDefaultMenuQuery{}
		err = GetFmsDefaultMenu(&cmd2)
		cmd.Result = cmd2.Result
	} else {
		cmd.Result = res
	}

	return err
}

func GetFmsDefaultMenu(cmd *m.GetFmsDefaultMenuQuery) error {
	result, err := getFmsMenuByOrgId(0)

	cmd.Result = result

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
