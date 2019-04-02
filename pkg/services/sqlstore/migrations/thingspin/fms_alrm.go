package thingspin

import (
	"fmt"

	m "github.com/grafana/grafana/pkg/models-thingspin"
	. "github.com/grafana/grafana/pkg/services/sqlstore/migrator"
)

func addFmsAlrmMigrations(mg *Migrator) {
	query := fmt.Sprintf(`
	CREATE TABLE IF NOT EXISTS '%s' (
		'id' integer PRIMARY KEY AUTOINCREMENT,
		'tid' integer references %s(id),
		'type' varchar(30) references %s(id),
		'code' varchar(30) references %s(id),
		'msg' text,
		'accept' bool,
		'created' datetime default (datetime('now', 'localtime')),
		'updated' datetime default (datetime('now', 'localtime'))
	)`, m.TsFmsAlrmTbl,
		m.TsFmsTagTbl,
		m.TsFmsAlrmTypeTbl,
		m.TsFmsAlrmCodeTbl)

	// create table
	mg.AddMigration("[thingspin] FMS 알람 테이블 생성", NewRawSqlMigration(query))
}
