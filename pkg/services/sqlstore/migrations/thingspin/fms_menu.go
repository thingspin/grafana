package thingspin

import (
	. "github.com/grafana/grafana/pkg/services/sqlstore/migrator"
)

func addFmsMenuMigrations(mg *Migrator) {
	query := `
		CREATE TABLE IF NOT EXISTS 'TS_FMS_GROUP_MENU' (
			"ORG_ID" integer references org(id),
			"NAME" varchar(20),
			"MENU" json,
			"CREATED_DATE" datetime default (datetime('now', 'localtime')),
			"UPDATED_DATE" datetime default (datetime('now', 'localtime')),
			PRIMARY KEY("ORG_ID")
		)
	`

	// create table
	mg.AddMigration("[thingspin] FMS 그룹 메뉴 테이블 생성", NewRawSqlMigration(query))
}
