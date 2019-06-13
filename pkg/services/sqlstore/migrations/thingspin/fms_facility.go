package thingspin

import (
	"fmt"

	m "github.com/grafana/grafana/pkg/models-thingspin"
	. "github.com/grafana/grafana/pkg/services/sqlstore/migrator"
)

func addFmsFacilityMigrations(mg *Migrator) {
	query := fmt.Sprintf(`
		CREATE TABLE IF NOT EXISTS '%s' (
			"id" integer PRIMARY KEY AUTOINCREMENT,
			'site_id' integer references %s(id),
			'name' text,
			'description' text,
			'location_lat' real,
			'location_lon' real,
			'image_path' text,
			"created" datetime default (datetime('now', 'localtime')),
			"updated" datetime default (datetime('now', 'localtime'))
		)`, m.TsFmsFacilityTbl,
		m.TsFmsSiteTbl)

	// create table
	mg.AddMigration("[thingspin] FMS 설비 기본 테이블 생성", NewRawSqlMigration(query))
}
