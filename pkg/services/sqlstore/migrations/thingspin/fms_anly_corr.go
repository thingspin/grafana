package thingspin

import (
	"fmt"

	m "github.com/grafana/grafana/pkg/models-thingspin"
	. "github.com/grafana/grafana/pkg/services/sqlstore/migrator"
)

func addFmsAnlyCorrMigrations(mg *Migrator) {
	query := fmt.Sprintf(`
	CREATE TABLE IF NOT EXISTS '%s' (
		'id' integer PRIMARY KEY AUTOINCREMENT,
		'active' bool,
		'state' varchar(30) references %s(id),
		'created' datetime default (datetime('now', 'localtime')),
		'updated' datetime default (datetime('now', 'localtime'))
	)`, m.TsFmsAnlyCorrTbl,
		m.TsFmsAnlyStateTbl)

	// create table
	mg.AddMigration("[thingspin] FMS 상관 관계 분석 테이블 생성", NewRawSqlMigration(query))
}
