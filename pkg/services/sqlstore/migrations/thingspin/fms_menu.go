package thingspin

import (
	"fmt"

	m "github.com/grafana/grafana/pkg/models-thingspin"
	. "github.com/grafana/grafana/pkg/services/sqlstore/migrator"
)

func addFmsMenuMigrations(mg *Migrator) {
	query := fmt.Sprintf(`CREATE TABLE IF NOT EXISTS '%s' (
		"org_id" integer references org(id),
		"name" varchar(20),
		"menu" json,
		"CREATED_DATE" datetime default (datetime('now', 'localtime')),
		"UPDATED_DATE" datetime default (datetime('now', 'localtime')),
		PRIMARY KEY("org_id")
	)`, m.TsFmsMenuTableName)

	// create table
	mg.AddMigration("[thingspin] FMS 그룹 메뉴 테이블 생성", NewRawSqlMigration(query))

	defaultData := fmt.Sprintf(`INSERT INTO '%s' ('org_id', 'name', 'menu') VALUES (%d, '%s', '%s')`,
		m.TsFmsMenuTableName, 1, `default`, `[{
			"id": "create",
			"text": "Create",
			"icon": "fa fa-fw fa-plus",
			"url": "/dashboard/new",
			"children": [{
					"text": "Dashboard",
					"icon": "gicon gicon-dashboard-new",
					"url": "/dashboard/new"
				}, {
					"id": "folder",
					"text": "Folder",
					"subTitle": "Create a new folder to organize your dashboards",
					"icon": "gicon gicon-folder-new",
					"url": "/dashboards/folder/new"
				}, {
					"id": "import",
					"text": "Import",
					"subTitle": "Import dashboard from file or Grafana.com",
					"icon": "gicon gicon-dashboard-import",
					"url": "/dashboard/import"
				}
			]
		}, {
			"id": "dashboards",
			"text": "Dashboards",
			"subTitle": "Manage dashboards & folders",
			"icon": "gicon gicon-dashboard",
			"url": "/",
			"children": [{
					"id": "home",
					"text": "Home",
					"icon": "gicon gicon-home",
					"url": "/",
					"hideFromTabs": true
				}, {
					"id": "divider",
					"text": "Divider",
					"divider": true,
					"hideFromTabs": true
				}, {
					"id": "manage-dashboards",
					"text": "Manage",
					"icon": "gicon gicon-manage",
					"url": "/dashboards"
				}, {
					"id": "playlists",
					"text": "Playlists",
					"icon": "gicon gicon-playlists",
					"url": "/playlists"
				}, {
					"id": "snapshots",
					"text": "Snapshots",
					"icon": "gicon gicon-snapshots",
					"url": "/dashboard/snapshots"
				}
			]
		}, {
			"id": "explore",
			"text": "Explore",
			"subTitle": "Explore your data",
			"icon": "gicon gicon-explore",
			"url": "/explore"
		}, {
			"id": "profile",
			"text": "admin",
			"img": "/avatar/46d229b033af06a191ff2267bca9ae56",
			"url": "/profile",
			"hideFromMenu": true,
			"children": [{
					"id": "profile-settings",
					"text": "Preferences",
					"icon": "gicon gicon-preferences",
					"url": "/profile",
					"active": true
				}, {
					"id": "change-password",
					"text": "Change Password",
					"icon": "fa fa-fw fa-lock",
					"url": "/profile/password",
					"hideFromMenu": true,
					"active": false
				}, {
					"id": "sign-out",
					"text": "Sign out",
					"icon": "fa fa-fw fa-sign-out",
					"url": "/logout",
					"target": "_self",
					"active": false
				}
			]
		}, {
			"id": "alerting",
			"text": "Alerting",
			"subTitle": "Alert rules & notifications",
			"icon": "gicon gicon-alert",
			"url": "/alerting/list",
			"children": [{
					"id": "alert-list",
					"text": "Alert Rules",
					"icon": "gicon gicon-alert-rules",
					"url": "/alerting/list"
				}, {
					"id": "channels",
					"text": "Notification channels",
					"icon": "gicon gicon-alert-notification-channel",
					"url": "/alerting/notifications"
				}
			]
		}, {
			"id": "cfg",
			"text": "Configuration",
			"subTitle": "Organization: Main Org.",
			"icon": "gicon gicon-cog",
			"url": "/datasources",
			"children": [{
					"id": "datasources",
					"text": "Data Sources",
					"description": "Add and configure data sources",
					"icon": "gicon gicon-datasources",
					"url": "/datasources"
				}, {
					"id": "users",
					"text": "Users",
					"description": "Manage org members",
					"icon": "gicon gicon-user",
					"url": "/org/users"
				}, {
					"id": "teams",
					"text": "Teams",
					"description": "Manage org groups",
					"icon": "gicon gicon-team",
					"url": "/org/teams"
				}, {
					"id": "plugins",
					"text": "Plugins",
					"description": "View and configure plugins",
					"icon": "gicon gicon-plugins",
					"url": "/plugins"
				}, {
					"id": "org-settings",
					"text": "Preferences",
					"description": "Organization preferences",
					"icon": "gicon gicon-preferences",
					"url": "/org"
				}, {
					"id": "apikeys",
					"text": "API Keys",
					"description": "Create & manage API keys",
					"icon": "gicon gicon-apikeys",
					"url": "/org/apikeys"
				}
			]
		}, {
			"id": "admin",
			"text": "Server Admin",
			"subTitle": "Manage all users & orgs",
			"icon": "gicon gicon-shield",
			"url": "/admin/users",
			"hideFromTabs": true,
			"children": [{
					"id": "global-users",
					"text": "Users",
					"icon": "gicon gicon-user",
					"url": "/admin/users",
					"active": false
				}, {
					"id": "global-orgs",
					"text": "Orgs",
					"icon": "gicon gicon-org",
					"url": "/admin/orgs",
					"active": true
				}, {
					"id": "server-settings",
					"text": "Settings",
					"icon": "gicon gicon-preferences",
					"url": "/admin/settings",
					"active": false
				}, {
					"id": "server-stats",
					"text": "Stats",
					"icon": "fa fa-fw fa-bar-chart",
					"url": "/admin/stats",
					"active": false
				}
			]
		}, {
			"id": "help",
			"text": "Help",
			"subTitle": "ThingSPIN Enterprise v6.1.0-pre (6fadc5e16)",
			"icon": "gicon gicon-question",
			"url": "#",
			"hideFromMenu": true,
			"children": [{
					"text": "Keyboard shortcuts",
					"icon": "fa fa-fw fa-keyboard-o",
					"url": "/shortcuts",
					"target": "_self"
				}, {
					"text": "Community site",
					"icon": "fa fa-fw fa-comment",
					"url": "http://community.grafana.com",
					"target": "_blank"
				}, {
					"text": "Documentation",
					"icon": "fa fa-fw fa-file",
					"url": "http://docs.grafana.org",
					"target": "_blank"
				}
			]
		}
	]`)

	mg.AddMigration("[thingspin] FMS 기본 그룹 메뉴 추가", NewRawSqlMigration(defaultData))
}
