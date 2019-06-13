package thingspin

import (
	"fmt"

	m "github.com/grafana/grafana/pkg/models-thingspin"
	. "github.com/grafana/grafana/pkg/services/sqlstore/migrator"
)

func addFmsFacilityTreeMigrations(mg *Migrator) {
	query := fmt.Sprintf(`
		CREATE TABLE IF NOT EXISTS '%s' (
			'site_id' integer references %s(id),
			'facility_id' integer references %s(id),
			'tag_id' integer references %s(id),
			'path' text,
			'order' integer,
			"created" datetime default (datetime('now', 'localtime')),
			"updated" datetime default (datetime('now', 'localtime'))
		)`, m.TsFmsFacilityTreeTbl,
		m.TsFmsSiteTbl,
		m.TsFmsFacilityTbl,
		m.TsFmsTagsTbl)

	// create table
	mg.AddMigration("[thingspin] FMS 설비 트리 테이블 생성", NewRawSqlMigration(query))
}
