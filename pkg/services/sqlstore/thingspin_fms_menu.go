package sqlstore

import (
	"sort"
	"strings"

	"database/sql"
	"fmt"

	"github.com/grafana/grafana/pkg/bus"
	m "github.com/grafana/grafana/pkg/models-thingspin"
)

func init() {
	bus.AddHandler("sql", GetFmsMenuByOrgId)
	bus.AddHandler("sql", GetFmsDefaultMenu)
	//bus.AddHandler("sql", DeleteFmsMenuByOrgId)
	bus.AddHandler("sql", DeleteFmsMenuById)
	bus.AddHandler("sql", AddFmsMenu)
	bus.AddHandler("sql", UpdateFmsMenu)
	bus.AddHandler("sql", UpdateFmsMenuPinSate)
	bus.AddHandler("sql", GetFmsMenuUsersPin)
	bus.AddHandler("sql", UpdateFmsMenuHideState)
	bus.AddHandler("sql", UpdateFmsMenuInfo)
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

func DeleteFmsMenuById(cmd *m.DeleteFmsMenuByIdQuery) error {
	//result, err := x.Exec(`PRAGMA foreign_keys = ON`)
	result, err := x.Exec(`PRAGMA foreign_keys = ON;DELETE FROM `+m.TsFmsMenuBaseTbl+` WHERE id = ?;PRAGMA foreign_keys = OFF;`, cmd.Id)
	cmd.Result = result
	return err
}

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

func AddFmsMenu(cmd *m.AddFmsMenuCommand) error {
	err := doTransaction(func(sess *DBSession) error {
		deletes := []string{
			`INSERT INTO `+m.TsFmsMenuBaseTbl+` ('id', 'text', 'icon', 'img_path', 'url', 'target', 'hideFromMenu', 
				'hideFromTabs', 'placeBottom', 'divider', 'canDelete') VALUES (?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			`INSERT INTO `+m.TsFmsMenuTbl+` ('org_id', 'parent_id','name','mbid','order') VALUES (?,?,?,?,?)`,
		}
	
		result, err := sess.Exec(deletes[0], cmd.Id, cmd.Name, cmd.Icon, "NULL", cmd.Url, "NULL", false, false, false, false, true)
		cmd.Result = result
		if err != nil {
			return err
		}
		result, err = sess.Exec(deletes[1], cmd.OrgId, -1, cmd.Name, cmd.Id, cmd.Order)
		cmd.Result = result
		if err != nil {
			return err
		}
		return nil
	})

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
	var err error
	var has bool
	var result sql.Result
	// L2로 이동할 때 자식이 있는지 검사
	if cmd.Menu.FmsMenuQueryResult.ParentId != -1 {
		has, err = x.Table(m.TsFmsMenuTbl).
			Where(`parent_id IN ( SELECT mbid FROM `+m.TsFmsMenuTbl+` WHERE parent_id = -1 and mbid = ?)`, cmd.Menu.FmsMenuQueryResult.Id).Exist()
		//log.Error(3, "error",cmd.Menu.FmsMenuQueryResult.Order,cmd.Menu.FmsMenuQueryResult.ParentId,cmd.Menu.FmsMenuQueryResult.Text,cmd.OrgId,cmd.Menu.FmsMenuQueryResult.Id)
		if err != nil {
			return err
		}
		if has {
			return fmt.Errorf("This menu has childs, can't move to L2")
		}

	}

	result, err = x.Exec(`UPDATE `+m.TsFmsMenuTbl+` SET parent_id = ?, "order" = ? WHERE org_id = ? AND mbid = ?`,
		cmd.Menu.FmsMenuQueryResult.ParentId, cmd.Menu.FmsMenuQueryResult.Order, cmd.OrgId, cmd.Menu.FmsMenuQueryResult.Id)

	//log.Error(3, "error",err)
	cmd.Result = result

	return err
}
func UpdateFmsMenuInfo(cmd *m.UpdateFmsMenuInfoCommand) error {
	fmt.Println(cmd.Menu.FmsMenuQueryResult.Id)
	fmt.Println(cmd.Menu.FmsMenuQueryResult.Text)
	fmt.Println(cmd.Menu.FmsMenuQueryResult.Url)
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