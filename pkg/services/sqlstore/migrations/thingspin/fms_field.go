package thingspin

import (
	"fmt"

	m "github.com/grafana/grafana/pkg/models-thingspin"
	. "github.com/grafana/grafana/pkg/services/sqlstore/migrator"
)

func addFmsFieldMigrations(mg *Migrator) {
	query := fmt.Sprintf(`
		CREATE TABLE IF NOT EXISTS '%s' (
			"id" integer PRIMARY KEY,
			'cid' integer references %s(id),
			'opt' JSON,
			'type' varchar(30) references %s(id),
			"created" datetime default (datetime('now', 'localtime')),
			"updated" datetime default (datetime('now', 'localtime'))
		)`, m.TsFmsFieldTbl,
		m.TsFmsConnectTbl,
		m.TsFmsFieldTypeTbl)

	// create table
	mg.AddMigration("[thingspin] FMS Field 테이블 생성", NewRawSqlMigration(query))
}
