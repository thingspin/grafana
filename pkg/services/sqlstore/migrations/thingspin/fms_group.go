package thingspin

import (
	. "github.com/grafana/grafana/pkg/services/sqlstore/migrator"
)

func addFmsGroupMigrations(mg *Migrator) {
	query := `
		CREATE TABLE IF NOT EXISTS 'extention_org_TS_FMS' (
			"ORG_ID" integer references org(id),
			"CREATED_DATE" datetime default (datetime('now', 'localtime')),
			"UPDATED_DATE" datetime default (datetime('now', 'localtime')),
			PRIMARY KEY("ORG_ID")
		)
	`

	// create table
	mg.AddMigration("[thingspin] FMS 그룹 테이블 생성", NewRawSqlMigration(query))
}
