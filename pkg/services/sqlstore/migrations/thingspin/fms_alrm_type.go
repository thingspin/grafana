package thingspin

import (
	"fmt"

	m "github.com/grafana/grafana/pkg/models-thingspin"
	. "github.com/grafana/grafana/pkg/services/sqlstore/migrator"
)

func addFmsAlrmTypeMigrations(mg *Migrator) {
	query := fmt.Sprintf(`
		CREATE TABLE IF NOT EXISTS '%s' (
			"id" varchar(30) PRIMARY KEY,
			"name" varchar(30),
			"created" datetime default (datetime('now', 'localtime'))
		)`, m.TsFmsAlrmTypeTbl)

	// create table
	mg.AddMigration("[thingspin] FMS 알람 종류 테이블 생성", NewRawSqlMigration(query))

	alrmType := fmt.Sprintf(`INSERT INTO '%s' ('id', 'name') VALUES
		('%s', '%s'), ('%s', '%s')`, m.TsFmsAlrmTypeTbl,
		"BAND", "Band",
		"RULE", "Rule")
	mg.AddMigration("[thingspin] FMS 알람 종류 추가", NewRawSqlMigration(alrmType))
}
