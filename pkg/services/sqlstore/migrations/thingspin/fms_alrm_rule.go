package thingspin

import (
	"fmt"

	m "github.com/grafana/grafana/pkg/models-thingspin"
	. "github.com/grafana/grafana/pkg/services/sqlstore/migrator"
)

func addFmsAlrmRuleMigrations(mg *Migrator) {
	query := fmt.Sprintf(`
	CREATE TABLE IF NOT EXISTS '%s' (
		'id' integer PRIMARY KEY AUTOINCREMENT,
		'rule' json,
		'created' datetime default (datetime('now', 'localtime')),
		'updated' datetime default (datetime('now', 'localtime'))
	)`, m.TsFmsAlrmRuleTbl)

	// create table
	mg.AddMigration("[thingspin] FMS 알람 룰 테이블 생성", NewRawSqlMigration(query))
}
