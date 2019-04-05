package thingspin

import (
	"fmt"

	m "github.com/grafana/grafana/pkg/models-thingspin"
	. "github.com/grafana/grafana/pkg/services/sqlstore/migrator"
)

func addFmsMenuPinMigrations(mg *Migrator) {
	query := fmt.Sprintf(`
		CREATE TABLE IF NOT EXISTS '%s' (
			'uid' integer references %s(id) on delete cascade NOT NULL,
			'mid' integer references %s(id) on delete cascade NOT NULL,
			"created" datetime default (datetime('now', 'localtime')),
			"updated" datetime default (datetime('now', 'localtime')),
			PRIMARY KEY(uid, mid)
		)`, m.TsFmsMenuPinTbl,
		m.GfUserTbl,
		m.TsFmsMenuTbl)

	// create table
	mg.AddMigration("[thingspin] FMS 메뉴 핀 테이블 생성", NewRawSqlMigration(query))
}
