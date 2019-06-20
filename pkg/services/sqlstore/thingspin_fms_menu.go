package sqlstore

import (
	"sort"
	"strings"

	"fmt"

	"github.com/go-xorm/xorm"
	"github.com/grafana/grafana/pkg/bus"
	m "github.com/grafana/grafana/pkg/models-thingspin"
)

func init() {
	bus.AddHandler("sql", GetFmsMenuByOrgId)
	bus.AddHandler("sql", GetFmsDefaultMenu)
	//bus.AddHandler("sql", DeleteFmsMenuByOrgId)
	bus.AddHandler("sql", DeleteFmsMenuById)
	bus.AddHandler("sql", AddFmsMenu)
	bus.AddHandler("thingspin-sql", AddFmsMenuByParentId)
	bus.AddHandler("sql", UpdateFmsMenu)
	bus.AddHandler("sql", UpdateFmsMenuPinSate)
	bus.AddHandler("sql", GetFmsMenuUsersPin)
	bus.AddHandler("sql", UpdateFmsMenuHideState)
	bus.AddHandler("sql", UpdateFmsMenuInfo)
	bus.AddHandler("sql", GetDefaultFmsMenuByDefaultOrgId)
	bus.AddHandler("sql", AddDefaultMenuByDefaultOrgId)
	bus.AddHandler("thingspin-sql", FindFmsMenuByName)
}

// Transaction
func doTransaction(callback dbTransactionFunc) error {
	var err error
	sess := &DBSession{Session: x.NewSession()}
	defer sess.Close()
	if err = sess.Begin(); err != nil {
		return err
	}
	err = callback(sess)

	if err != nil {
		sess.Rollback()
		return err
	} else if err = sess.Commit(); err != nil {
		return err
	}

	return nil
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
	// Parent first
	var node *m.FmsMenu
	for _, menu := range menuList {
		// generate node data
		node = &m.FmsMenu{
			FmsMenuQueryResult: *menu,
			Children:           []*m.FmsMenu{},
		}
		// find position
		if menu.ParentId == -1 || menu.ParentId == 0 { // == nil
			keyMap[menu.Id] = node
		}
	}
	// Child mapping
	for _, menu := range menuList {
		// find position
		if menu.ParentId > 0 { // == nil
			if _, ok := keyMap[menu.ParentId]; ok {
				//do something here
			}
			// generate node data
			node = &m.FmsMenu{
				FmsMenuQueryResult: *menu,
				Children:           []*m.FmsMenu{},
			}
			//log.Error(3, "error",menu.ParentId)
			curr := keyMap[menu.ParentId]
			curr.Children = append(curr.Children, node)
		}
	}

	for _, node := range keyMap {
		rootNode = append(rootNode, node)
	}
	return rootNode
}

/*
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
		if menu.ParentId == -1 || menu.ParentId == 0 { // == nil
			rootNode = append(rootNode, node)
		} else {
			curr := keyMap[menu.ParentId]
			curr.Children = append(curr.Children, node)
		}

		keyMap[menu.Id] = node
	}

	return rootNode
}
*/
func GetDefaultFmsMenuByDefaultOrgId(cmd *m.GetDefaultFmsMenuByDefaultOrgIdQuery) error {
	var res []*m.FmsMenuQueryResult
	selectStr := []string{
		//m.TsFmsMenuTbl + ".id",
		m.TsFmsMenuBaseTbl + ".id",
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
		m.TsFmsMenuBaseTbl + ".placeBottom",
		m.TsFmsMenuBaseTbl + ".canDelete",
		m.TsFmsMenuBaseTbl + ".divider",
		// dashboard
		m.TsFmsMenuBaseTbl + ".dashboard_id",
		m.TsFmsMenuBaseTbl + ".dashboard_uid",
	}
	err := x.Table(m.TsFmsMenuTbl).
		Select(strings.Join(selectStr, ", ")).
		Join("INNER", m.TsFmsMenuBaseTbl, m.TsFmsMenuTbl+".mbid = "+m.TsFmsMenuBaseTbl+".id").
		Where(m.TsFmsMenuTbl+".org_id = ?", cmd.OrgId).
		And(m.TsFmsMenuBaseTbl+".canDelete = ?", 0).
		Find(&res)

	if err == nil {
		result := convertFmsMenuTree(res)
		sortFmsMenuTree(result)
		cmd.Result = result
	}

	return err
}

func getFmsMenuByOrgId(orgId int64) ([]*m.FmsMenu, error) {
	var res []*m.FmsMenuQueryResult
	selectStr := []string{
		//m.TsFmsMenuTbl + ".id",
		m.TsFmsMenuBaseTbl + ".id",
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
		m.TsFmsMenuBaseTbl + ".placeBottom",
		m.TsFmsMenuBaseTbl + ".canDelete",
		m.TsFmsMenuBaseTbl + ".divider",
		// dashboard
		m.TsFmsMenuBaseTbl + ".dashboard_id",
		m.TsFmsMenuBaseTbl + ".dashboard_uid",
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
	_, err := x.Exec(`DELETE FROM '?' WHERE org_id = ?`,
		m.TsFmsMenuTbl, cmd.OrgId)
	//cmd.Result = result
	return err
}

func DeleteFmsMenuById(cmd *m.DeleteFmsMenuByIdQuery) error {
	_, err := x.Transaction(func(xsess *xorm.Session) (interface{}, error) {
		var data m.FmsMenuBaseTblField
		_, err := x.Table(m.TsFmsMenuBaseTbl).Where("id = ?", cmd.Id).Get(&data)
		if err != nil {
			return nil, err
		}

		if data.DashboardId != 0 {
			_, err = x.Exec(`PRAGMA foreign_keys = ON;DELETE FROM dashboard WHERE id = ?;PRAGMA foreign_keys = OFF;`, data.DashboardId)
		} else {
			_, err = x.Exec(`PRAGMA foreign_keys = ON;DELETE FROM `+m.TsFmsMenuBaseTbl+` WHERE id = ?;PRAGMA foreign_keys = OFF;`, cmd.Id)
		}

		if err != nil {
			return nil, err
		}

		// Reordering
		// L2로 이동할 때 자식이 있었는지 검사
		for _, menu := range cmd.Menu {
			_, err = x.Exec(`UPDATE `+m.TsFmsMenuTbl+` SET "order" = ? WHERE org_id = ? AND mbid = ?`,
				menu.Order, cmd.OrgId, menu.Id)
			if err != nil {
				return nil, err
			}
		}
		return nil, nil
	})

	return err
}

func AddDefaultMenuByDefaultOrgId(cmd *m.AddFmsDefaultMenuCommand) error {
	err := doTransaction(func(sess *DBSession) error {
		for pi, menu := range cmd.DefaultMenu {

			sqlCommands := []string{
				`SELECT MAX(id) FROM ` + m.TsFmsMenuTbl,
				`INSERT INTO ` + m.TsFmsMenuTbl + ` ('id', 'org_id', 'parent_id', 'name', 'mbid', 'order') VALUES (?,?,?,?,?,?)`,
			}
			var id int
			has, err := sess.SQL(sqlCommands[0]).Get(&id)
			if err != nil {
				return err
			}
			if !has {
				id = 100
			} else {
				subId := id % 100
				id = id - subId + 100
			}
			_, err = sess.Exec(sqlCommands[1], id, cmd.OrgId, menu.ParentId, menu.Text, menu.Id, pi)
			//cmd.Result = result
			if err != nil {
				return err
			}

			for ci, cmenu := range menu.Children {
				_, err = sess.Exec(sqlCommands[1], id+ci+1, cmd.OrgId, cmenu.ParentId, cmenu.Text, cmenu.Id, ci)
				//cmd.Result = result
				if err != nil {
					return err
				}

			}

		}

		return nil
	})

	return err
}

func AddFmsMenu(cmd *m.AddFmsMenuCommand) error {
	err := doTransaction(func(sess *DBSession) error {
		sqlCommands := []string{
			`SELECT MAX(id) FROM ` + m.TsFmsMenuBaseTbl,
			`INSERT INTO ` + m.TsFmsMenuBaseTbl + ` ('id', 'text', 'icon', 'img_path', 'url', 'hideFromMenu', 
				'hideFromTabs', 'placeBottom', 'divider', 'canDelete', 'dashboard_id', 'dashboard_uid') VALUES (?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			`INSERT INTO ` + m.TsFmsMenuTbl + ` ('org_id', 'parent_id','name','mbid','order') VALUES (?,?,?,?,?)`,
		}
		var id int
		has, err := sess.SQL(sqlCommands[0]).Get(&id)
		if err != nil {
			return err
		}
		if !has {
			id = 100
		} else {
			id = id + 100
		}

		_, err = sess.Exec(sqlCommands[1], id, cmd.Name, cmd.Icon, "NULL", cmd.Url, false, false, false, false, true, cmd.DashboardId, cmd.DashboardUid)
		//cmd.Result = result
		if err != nil {
			return err
		}
		_, err = sess.Exec(sqlCommands[2], cmd.OrgId, -1, cmd.Name, id, cmd.Order)
		//cmd.Result = result
		if err != nil {
			return err
		}
		// Return new node
		res := m.FmsMenuQueryResult{
			Id:           id,
			Permission:   "",
			ParentId:     -1,
			Name:         "",
			ReqParams:    nil,
			Order:        cmd.Order,
			Text:         cmd.Name,
			Icon:         cmd.Icon,
			Img_path:     "",
			Subtitle:     "",
			Url:          cmd.Url,
			Target:       "",
			HideFromMenu: false,
			HideFromTabs: false,
			PlaceBottom:  false,
			Divider:      false,
			CanDelete:    true,
		}
		node := m.FmsMenu{
			FmsMenuQueryResult: res,
			Children:           []*m.FmsMenu{},
		}
		cmd.Result = node
		return nil
	})

	return err
}

func AddFmsMenuByParentId(cmd *m.AddFmsMenuByParentIdCmd) error {
	var err error

	result, err := x.Transaction(func(xsess *xorm.Session) (interface{}, error) {
		// generate menubase id
		var menuBaseData m.FmsMenuBaseTblField
		if _, err = xsess.Table(m.TsFmsMenuBaseTbl).Desc("id").Cols("id").Get(&menuBaseData); err != nil {
			return nil, err
		}
		baseId := menuBaseData.Id + 1

		// insert menubase table
		if _, err = xsess.Table(m.TsFmsMenuBaseTbl).Insert(m.FmsMenuBaseTblField{
			Id:           baseId,
			Text:         cmd.Name,
			Icon:         cmd.Icon,
			Url:          cmd.Url,
			CanDelete:    true,
			DashboardId:  cmd.DashboardId,
			DashboardUid: cmd.DashboardUid,
		}); err != nil {
			return nil, err
		}

		// generate menu last order
		var order int64
		if order, err = xsess.Table(m.TsFmsMenuTbl).Where("parent_id = ?", cmd.ParentId).Count(); err != nil {
			return nil, err
		}

		// insert menu table
		_, err = xsess.Table(m.TsFmsMenuTbl).Insert(m.FmsMenuTblField{
			Mbid:     baseId,
			Name:     cmd.Name,
			ParentId: cmd.ParentId,
			OrgId:    cmd.OrgId,
			Order:    order,
		})

		return baseId, err
	})

	cmd.Result = result

	return err
}

/*
func UpdateFmsMenu(cmd *m.UpdateFmsMenuCommand) error {
	result, err := x.Exec(`UPDATE '?' SET name = '?', menu = '?' WHERE org_id = ?`,
		m.TsFmsMenuTbl, cmd.Name, cmd.Menu, cmd.OrgId)

	cmd.Result = result

	return err
}
*/

func UpdateFmsMenu(cmd *m.UpdateFmsMenuOrderCommand) error {
	//var err error
	//var has bool
	//var result sql.Result

	err := doTransaction(func(sess *DBSession) error {
		for _, pmenu := range cmd.Pmenu {
			_, err := x.Exec(`UPDATE `+m.TsFmsMenuTbl+` SET parent_id = ?, "order" = ? WHERE org_id = ? AND mbid = ?`,
				pmenu.ParentId, pmenu.Order, cmd.OrgId, pmenu.Id)
			if err != nil {
				return err
			}
		}
		// L2로 이동할 때 자식이 있었는지 검사
		for _, cmenu := range cmd.Cmenu {
			has, err := x.Table(m.TsFmsMenuTbl).
				Where(`parent_id IN ( SELECT mbid FROM `+m.TsFmsMenuTbl+` WHERE parent_id = -1 and mbid = ?)`, cmenu.Id).Exist()
			if err != nil {
				return err
			}
			if has {
				return fmt.Errorf("This menu has childs, can't move to L2")
			}
			_, err = x.Exec(`UPDATE `+m.TsFmsMenuTbl+` SET parent_id = ?, "order" = ? WHERE org_id = ? AND mbid = ?`,
				cmenu.ParentId, cmenu.Order, cmd.OrgId, cmenu.Id)
			if err != nil {
				return err
			}
		}
		return nil
	})
	//log.Error(3, "error",err)
	//cmd.Result = result
	return err
}
func UpdateFmsMenuInfo(cmd *m.UpdateFmsMenuInfoCommand) error {
	_, err := x.Exec(`UPDATE `+m.TsFmsMenuBaseTbl+` SET icon = ?, text = ?, url = ? WHERE id = ?`,
		cmd.Menu.FmsMenuQueryResult.Icon, cmd.Menu.FmsMenuQueryResult.Text, cmd.Menu.FmsMenuQueryResult.Url, cmd.Menu.FmsMenuQueryResult.Id)
	return err
}
func UpdateFmsMenuPinSate(cmd *m.UpdateFmsMenuPinSateCommand) error {
	if cmd.Pin == false {
		_, err := x.Exec(`DELETE FROM`+` `+m.TsFmsMenuPinTbl+` `+`WHERE uid = ? AND mid = ?`, cmd.UserID, cmd.ID)
		return err
	}

	has, err := x.Table(m.TsFmsMenuPinTbl).Where("uid = ? AND mid = ?", cmd.UserID, cmd.ID).Exist()

	if !has {
		_, err = x.Exec(`INSERT INTO `+` `+m.TsFmsMenuPinTbl+` `+` ('uid', 'mid') VALUES (?, ?)`, cmd.UserID, cmd.ID)
	}

	return err
}

func GetFmsMenuUsersPin(cmd *m.GetFmsMenuPinCommand) error {

	err := x.Table(m.TsFmsMenuPinTbl).Where("uid = ?", cmd.UserID).Cols("mid").Find(&cmd.MenuIDs)

	return err
}

func UpdateFmsMenuHideState(cmd *m.UpdateFmsMenuHideStateCommand) error {
	_, err := x.Exec(`UPDATE `+m.TsFmsMenuBaseTbl+` SET hideFromMenu = ? WHERE id = ?`, cmd.HideFromMenu, cmd.Id)
	return err
}

func FindFmsMenuByName(cmd *m.FindFmsMenuByNameCmd) error {
	var tableData []m.FmsMenuTblField

	err := x.Table(m.TsFmsMenuTbl).Where("org_id = ?", cmd.OrgId).And("name = ?", cmd.Name).Find(&tableData)

	cmd.Result = tableData

	return err
}
