package thingspin

import (
	"fmt"

	m "github.com/grafana/grafana/pkg/models-thingspin"
	. "github.com/grafana/grafana/pkg/services/sqlstore/migrator"
)

func addFmsConnectStateMigrations(mg *Migrator) {
	query := fmt.Sprintf(`
		CREATE TABLE IF NOT EXISTS '%s' (
			"id" varchar(30) PRIMARY KEY,
			"name" varchar(30),
			"created" datetime default (datetime('now', 'localtime'))
		)
	`, m.TsFmsConnectStateTbl)

	// create table
	mg.AddMigration("[thingspin] FMS 연결 상태 테이블 생성", NewRawSqlMigration(query))

	addState := fmt.Sprintf(`INSERT INTO '%s' ('id', 'name') VALUES 
		('%s', '%s'), ('%s', '%s'), ('%s', '%s')`, m.TsFmsConnectStateTbl,
		"CONNECT", "CONNECT",
		"DISCONNECT", "DISCONNECT",
		"UNKNOWN", "UNKNOWN")
	mg.AddMigration("[thingspin] FMS 연결 상태 추가", NewRawSqlMigration(addState))
}
