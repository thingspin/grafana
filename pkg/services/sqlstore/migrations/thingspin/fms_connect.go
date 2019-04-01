package thingspin

import (
	"fmt"

	m "github.com/grafana/grafana/pkg/models-thingspin"
	. "github.com/grafana/grafana/pkg/services/sqlstore/migrator"
)

func addFmsConnectMigrations(mg *Migrator) {
	query := fmt.Sprintf(`
	CREATE TABLE IF NOT EXISTS '%s' (
		'id' integer PRIMARY KEY AUTOINCREMENT,
		'state' varchar(30) references %s(id),
		'type' varchar(30) references %s(id),
		'server' json,
		'active' bool,
		'created' datetime default (datetime('now', 'localtime')),
		'updated' datetime default (datetime('now', 'localtime'))
	)
	`, m.TsFmsConnectTbl,
		m.TsFmsConnectStateTbl,
		m.TsFmsConnectTypeTbl)

	// create table
	mg.AddMigration("[thingspin] FMS 연결 테이블 생성", NewRawSqlMigration(query))
}
