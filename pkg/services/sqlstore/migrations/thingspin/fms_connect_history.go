package thingspin

import (
	"fmt"

	m "github.com/grafana/grafana/pkg/models-thingspin"
	. "github.com/grafana/grafana/pkg/services/sqlstore/migrator"
)

func addFmsConnectHistoryMigrations(mg *Migrator) {
	query := fmt.Sprintf(`
	CREATE TABLE IF NOT EXISTS '%s' (
		'id' integer PRIMARY KEY AUTOINCREMENT,
		'connect_id' integer references %s(id),
		'event' varchar(100),
		'description' varchar(1000),
		'created' datetime default (datetime('now', 'localtime'))
	)
	`, m.TsFmsConnectHistoryTbl, m.TsFmsConnectTbl)

	// create table
	mg.AddMigration("[thingspin] FMS 연결 히스토리 테이블 생성", NewRawSqlMigration(query))
}
