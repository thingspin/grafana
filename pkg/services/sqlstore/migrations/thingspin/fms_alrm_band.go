package thingspin

import (
	"fmt"

	m "github.com/grafana/grafana/pkg/models-thingspin"
	. "github.com/grafana/grafana/pkg/services/sqlstore/migrator"
)

func addFmsAlrmBandMigrations(mg *Migrator) {
	query := fmt.Sprintf(`
	CREATE TABLE IF NOT EXISTS '%s' (
		'tid' integer references %s(id),
		'code' varchar(30) references %s(id),
		'min' float,
		'max' float,
		'created' datetime default (datetime('now', 'localtime')),
		'updated' datetime default (datetime('now', 'localtime')),
		PRIMARY KEY('tid')
	)`, m.TsFmsAlrmBandTbl,
		m.TsFmsTagTbl,
		m.TsFmsAlrmCodeTbl)

	// create table
	mg.AddMigration("[thingspin] FMS 알람 밴드 테이블 생성", NewRawSqlMigration(query))
}
