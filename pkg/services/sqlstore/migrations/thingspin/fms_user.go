package thingspin

import (
	. "github.com/grafana/grafana/pkg/services/sqlstore/migrator"
)

func addFmsUserMigrations(mg *Migrator) {
	query := `
		CREATE TABLE IF NOT EXISTS 'extention_user_TS_FMS' (
			"UID" integer references user(id),
			"CREATED_DATE" datetime default (datetime('now', 'localtime')),
			"UPDATED_DATE" datetime default (datetime('now', 'localtime')),
			PRIMARY KEY("UID")
		)
	`

	// create table
	mg.AddMigration("[thingspin] FMS 사용자 테이블 생성", NewRawSqlMigration(query))
}
