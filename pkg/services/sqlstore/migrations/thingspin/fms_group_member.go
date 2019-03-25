package thingspin

import (
	. "github.com/grafana/grafana/pkg/services/sqlstore/migrator"
)

func addFmsGroupMemberMigrations(mg *Migrator) {
	query := `
		CREATE TABLE IF NOT EXISTS 'extention_org_user_TS_FMS' (
			"ORG_USER_ID" integer references org_user(id),
			"CREATED_DATE" datetime default (datetime('now', 'localtime')),
			"UPDATED_DATE" datetime default (datetime('now', 'localtime')),
			PRIMARY KEY("ORG_USER_ID")
		)
	`

	// create table
	mg.AddMigration("[thingspin] FMS 그룹 멤버 테이블 생성", NewRawSqlMigration(query))
}
