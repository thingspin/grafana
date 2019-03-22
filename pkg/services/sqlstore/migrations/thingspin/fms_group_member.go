package thingspin

import (
	. "github.com/grafana/grafana/pkg/services/sqlstore/migrator"
)

func addFmsGroupMemberMigrations(mg *Migrator) {
	query := `
		CREATE TABLE IF NOT EXISTS TS_FMS_GROUP_MEMBER (
			"UID" integer references user(id),
			"GID" integer references TS_FMS_GROUP(ID),
			"CREATED_DATE" datetime default (datetime('now', 'localtime')),
			PRIMARY KEY("GID", "UID")
		)
	`

	// create table
	mg.AddMigration("[thingspin] FMS 그룹 멤버 테이블 생성", NewRawSqlMigration(query))
}
