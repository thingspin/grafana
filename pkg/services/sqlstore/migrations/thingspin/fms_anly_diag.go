package thingspin

import (
	"fmt"

	m "github.com/grafana/grafana/pkg/models-thingspin"
	. "github.com/grafana/grafana/pkg/services/sqlstore/migrator"
)

func addFmsAnlyDiagMigrations(mg *Migrator) {
	query := fmt.Sprintf(`
	CREATE TABLE IF NOT EXISTS '%s' (
		'id' integer PRIMARY KEY AUTOINCREMENT,
		'tid' integer references %s(id),
		'from' datetime,
		'to' datetime,
		'active' bool,
		'state' varchar(30) references %s(id),
		'created' datetime default (datetime('now', 'localtime')),
		'updated' datetime default (datetime('now', 'localtime'))
	)`, m.TsFmsAnlyDiagTbl,
		m.TsFmsTagTbl,
		m.TsFmsAnlyStateTbl)

	// create table
	mg.AddMigration("[thingspin] FMS 예지 진단 분석 테이블 생성", NewRawSqlMigration(query))
}
