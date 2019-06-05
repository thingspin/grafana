package thingspin

import (
	"fmt"

	m "github.com/grafana/grafana/pkg/models-thingspin"
	. "github.com/grafana/grafana/pkg/services/sqlstore/migrator"
)

func addFmsSiteMigrations(mg *Migrator) {
	query := fmt.Sprintf(`
	CREATE TABLE IF NOT EXISTS '%s' (
		'id' integer PRIMARY KEY AUTOINCREMENT,
		'name' text,
		'description' text,
		'location_lat' real,
		'location_lon' real, 
		'created' datetime default (datetime('now', 'localtime')),
		'updated' datetime default (datetime('now', 'localtime'))
	)`, m.TsFmsSiteTbl)

	// create table
	mg.AddMigration("[thingspin] FMS 사이트 테이블 생성", NewRawSqlMigration(query))
}
