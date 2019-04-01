package thingspin

import (
	. "github.com/grafana/grafana/pkg/services/sqlstore/migrator"
)

func addFmsExtLinkMigrations(mg *Migrator) {
	query := `
		CREATE TABLE IF NOT EXISTS 'TS_FMS_EXT_LINK' (
			"id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
			"uid" integer references user(id),
			"url" text,
			"params" json,
			"CREATED_DATE" datetime default (datetime('now', 'localtime')),
			"UPDATED_DATE" datetime default (datetime('now', 'localtime'))
		)
	`

	// create table
	mg.AddMigration("[thingspin] FMS 외부 링크 테이블 생성", NewRawSqlMigration(query))
}
