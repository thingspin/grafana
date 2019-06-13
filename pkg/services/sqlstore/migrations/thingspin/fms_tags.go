package thingspin

import (
	"fmt"

	m "github.com/grafana/grafana/pkg/models-thingspin"
	. "github.com/grafana/grafana/pkg/services/sqlstore/migrator"
)

func addFmsTagsMigrations(mg *Migrator) {
	query := fmt.Sprintf(`
		CREATE TABLE IF NOT EXISTS '%s' (
			"id" integer PRIMARY KEY AUTOINCREMENT,
			'site_id' integer references %s(id),
			'facility_id' integer references %s(id),
			'datasource_id' integer,
			'table_name' text,
			'column_name' text,
			'column_type' text,
			'name' text,
			"created" datetime default (datetime('now', 'localtime')),
			"updated" datetime default (datetime('now', 'localtime'))
		)`, m.TsFmsTagsTbl,
		m.TsFmsSiteTbl, 
		m.TsFmsFacilityTbl)

	// create table
	mg.AddMigration("[thingspin] FMS 태그 테이블 생성", NewRawSqlMigration(query))
}
