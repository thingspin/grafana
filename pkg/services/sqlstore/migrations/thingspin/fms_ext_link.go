package thingspin

import (
	"fmt"

	tsm "github.com/grafana/grafana/pkg/models-thingspin"
	. "github.com/grafana/grafana/pkg/services/sqlstore/migrator"
)

func addFmsExtLinkMigrations(mg *Migrator) {
	query := fmt.Sprintf(`
		CREATE TABLE IF NOT EXISTS '%s' (
			"id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
			"uid" integer references user(id),
			"url" text,
			"params" json,
			"CREATED_DATE" datetime default (datetime('now', 'localtime')),
			"UPDATED_DATE" datetime default (datetime('now', 'localtime'))
		)
	`, tsm.TsFmsExtLinkTbl)

	// create table
	mg.AddMigration("[thingspin] FMS 외부 링크 테이블 생성", NewRawSqlMigration(query))
}
