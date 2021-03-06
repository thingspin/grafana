package thingspin

import (
	"fmt"
	"strconv"
	"strings"

	"github.com/grafana/grafana/pkg/infra/log"
	m "github.com/grafana/grafana/pkg/models-thingspin"
	. "github.com/grafana/grafana/pkg/services/sqlstore/migrator"
)

func getQueryData(id int, text string, icon string, img_path string, url string, target string,
	hideFromMenu bool,
	hideFromTabs bool,
	placeBottom bool,
	divider bool,
	canDelete bool) string {
	return fmt.Sprintf(`(%d, '%s', '%s', '%s', '%s', '%s', %s, %s, %s, %s, %s)`, id, text, icon, img_path, url, target,
		strconv.FormatBool(hideFromMenu),
		strconv.FormatBool(hideFromTabs),
		strconv.FormatBool(placeBottom),
		strconv.FormatBool(divider),
		strconv.FormatBool(canDelete))
}

func addFmsMenuBaseMigrations(mg *Migrator) {
	query := fmt.Sprintf(`
	CREATE TABLE IF NOT EXISTS '%s' (
		'id' integer PRIMARY KEY,
		'text' text NOT NULL,
		'icon' text,
		'img_path' text,
		'subtitle' text,
		'ext_link_id' int references %s(id) on delete cascade,
		'url' text,
		'target' text,
		'hideFromMenu' bool default FALSE,
		'hideFromTabs' bool default FALSE,
		'placeBottom' bool default FALSE,
		'divider' bool default FALSE,
		'canDelete' bool default FALSE,
		'description' text,

		'dashboard_id' int default null references dashboard(id) on delete cascade ,
		'dashboard_uid' text default null,

		'created' datetime default (datetime('now', 'localtime')),
		'updated' datetime default (datetime('now', 'localtime'))
	)`, m.TsFmsMenuBaseTbl, m.TsFmsExtLinkTbl)

	// create table
	mg.AddMigration("[thingspin] FMS 메뉴 정보 테이블 생성", NewRawSqlMigration(query))

	defaultData := fmt.Sprintf(`INSERT INTO '%s' ('id', 'text', 'icon', 'img_path', 'url', 'target', 'hideFromMenu', 'hideFromTabs', 'placeBottom', 'divider', 'canDelete') VALUES `,
		m.TsFmsMenuBaseTbl)

	var queries []string

	initData := &FmsMenuProvision{log: log.New("thingspin.provision")}
	menus, err := initData.GetInitalMenus()

	if err != nil {
		queries = append(queries, getQueryData(1, "Create", "fa fa-fw fa-plus", "NULL", "/dashboard/new", "NULL", false, false, false, false, true))
		queries = append(queries, getQueryData(2, "Dashboard", "gicon gicon-dashboard-new", "NULL", "/dashboard/new", "NULL", false, false, false, false, true))
		queries = append(queries, getQueryData(3, "Folder", "gicon gicon-dashboard-new", "NULL", "/dashboards/folder/new", "NULL", false, false, false, false, true))
		queries = append(queries, getQueryData(4, "Import", "gicon gicon-dashboard-import", "NULL", "/dashboard/import", "NULL", false, false, false, false, true))

		queries = append(queries, getQueryData(5, "Dashboards", "gicon gicon-dashboard", "NULL", "/", "NULL", false, false, false, false, true))
		queries = append(queries, getQueryData(6, "Home", "gicon gicon-home", "NULL", "/", "NULL", false, true, false, false, true))
		queries = append(queries, getQueryData(7, "Divider", "NULL", "NULL", "NULL", "NULL", false, true, false, true, true))
		queries = append(queries, getQueryData(8, "Manage", "gicon gicon-manage", "NULL", "/dashboards", "NULL", false, false, false, false, true))
		queries = append(queries, getQueryData(9, "Playlists", "gicon gicon-playlists", "NULL", "/playlists", "NULL", false, false, false, false, true))
		queries = append(queries, getQueryData(10, "Snapshots", "gicon gicon-snapshots", "NULL", "/dashboard/snapshots", "NULL", false, false, false, false, true))

		queries = append(queries, getQueryData(11, "Explore", "gicon gicon-explore", "NULL", "/explore", "NULL", false, false, false, false, true))

		queries = append(queries, getQueryData(12, "admin", "NULL", "/avatar/46d229b033af06a191ff2267bca9ae56", "/profile", "NULL", true, false, false, false, true))
		queries = append(queries, getQueryData(13, "Preferences", "gicon gicon-preferences", "NULL", "/profile", "NULL", false, false, false, false, true))
		queries = append(queries, getQueryData(14, "Change Password", "fa fa-fw fa-lock", "NULL", "/profile/password", "NULL", true, false, false, false, true))
		queries = append(queries, getQueryData(15, "Sign out", "fa fa-fw fa-sign-out", "NULL", "/logout", "_self", false, false, false, false, true))

		queries = append(queries, getQueryData(16, "Alerting", "gicon gicon-alert", "NULL", "/alerting/list", "NULL", false, false, false, false, true))
		queries = append(queries, getQueryData(17, "Alert Rules", "gicon gicon-alert-rules", "NULL", "/alerting/list", "NULL", false, false, false, false, true))
		queries = append(queries, getQueryData(18, "Notification channels", "gicon gicon-alert-notification-channel", "NULL", "/alerting/notifications", "NULL", false, false, false, false, true))

		queries = append(queries, getQueryData(19, "Configuration", "gicon gicon-cog", "NULL", "/datasources", "NULL", false, false, false, false, true))
		queries = append(queries, getQueryData(20, "Data Sources", "gicon gicon-datasources", "NULL", "/datasources", "NULL", false, false, false, false, true))
		queries = append(queries, getQueryData(21, "Users", "gicon gicon-user", "NULL", "/org/users", "NULL", false, false, false, false, true))
		queries = append(queries, getQueryData(22, "Teams", "gicon gicon-team", "NULL", "/org/teams", "NULL", false, false, false, false, true))
		queries = append(queries, getQueryData(23, "Plugins", "gicon gicon-plugins", "NULL", "/plugins", "NULL", false, false, false, false, true))
		queries = append(queries, getQueryData(24, "Preferences", "gicon gicon-preferences", "NULL", "/org", "NULL", false, false, false, false, true))
		queries = append(queries, getQueryData(25, "API Keys", "gicon gicon-apikeys", "NULL", "/org/apikeys", "NULL", false, false, false, false, true))

		queries = append(queries, getQueryData(26, "Server Admin", "gicon gicon-shield", "NULL", "/admin/users", "NULL", false, true, false, false, true))
		queries = append(queries, getQueryData(27, "Users", "gicon gicon-user", "NULL", "/admin/users", "NULL", false, false, false, false, true))
		queries = append(queries, getQueryData(28, "Orgs", "gicon gicon-org", "NULL", "/admin/orgs", "NULL", false, false, false, false, true))
		queries = append(queries, getQueryData(29, "Settings", "gicon gicon-preferences", "NULL", "/admin/settings", "NULL", false, false, false, false, true))
		queries = append(queries, getQueryData(30, "Stats", "fa fa-fw fa-bar-chart", "NULL", "/admin/stats", "NULL", false, false, false, false, true))
		queries = append(queries, getQueryData(31, "메뉴관리", "fa fa-fw fa-bar-chart", "NULL", "/thingspin-page/system-management/menu-management", "NULL", false, false, false, false, true))

		queries = append(queries, getQueryData(32, "Help", "gicon gicon-question", "NULL", "#", "NULL", true, false, false, false, true))
		queries = append(queries, getQueryData(33, "Keyboard shortcuts", "fa fa-fw fa-keyboard-o", "NULL", "/shortcuts", "_self", false, false, false, false, true))
		queries = append(queries, getQueryData(34, "Community site", "fa fa-fw fa-comment", "NULL", "http://community.grafana.com", "_blank", false, false, false, false, true))
		queries = append(queries, getQueryData(35, "Documentation", "fa fa-fw fa-file", "NULL", "http://docs.grafana.org", "_blank", false, false, false, false, true))
	} else {
		for _, menu := range menus {
			queries = append(queries, getQueryData(menu.Id, menu.Name, menu.Icon, menu.Img_path, menu.Url, menu.Target, menu.HideFromMenu, menu.HideFromTabs, menu.PlaceBottom, menu.Divider, menu.CanDelete))
			for _, child := range menu.Children {
				queries = append(queries, getQueryData(child.Id, child.Name, child.Icon, child.Img_path, child.Url, child.Target, child.HideFromMenu, child.HideFromTabs, menu.PlaceBottom, child.Divider, child.CanDelete))
			}
		}
	}

	defaultData = defaultData + strings.Join(queries, ", ")
	mg.AddMigration("[thingspin] FMS 메뉴 링크 추가", NewRawSqlMigration(defaultData))
}
