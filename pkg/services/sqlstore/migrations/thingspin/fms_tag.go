package thingspin

import (
	"fmt"

	m "github.com/grafana/grafana/pkg/models-thingspin"
	. "github.com/grafana/grafana/pkg/services/sqlstore/migrator"
)

func addFmsTagMigrations(mg *Migrator) {
	query := fmt.Sprintf(`
		CREATE TABLE IF NOT EXISTS '%s' (
			"id" integer PRIMARY KEY,
			'fid' integer references %s(id),
			'name' varchar(45),
			"created" datetime default (datetime('now', 'localtime')),
			"updated" datetime default (datetime('now', 'localtime'))
		)`, m.TsFmsTagTbl,
		m.TsFmsFieldTbl)

	// create table
	mg.AddMigration("[thingspin] FMS Field 테이블 생성", NewRawSqlMigration(query))
}
