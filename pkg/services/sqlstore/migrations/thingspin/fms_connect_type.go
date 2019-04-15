package thingspin

import (
	"fmt"

	m "github.com/grafana/grafana/pkg/models-thingspin"
	. "github.com/grafana/grafana/pkg/services/sqlstore/migrator"
)

func addFmsConnectTypeMigrations(mg *Migrator) {
	query := fmt.Sprintf(`
		CREATE TABLE IF NOT EXISTS '%s' (
			"id" varchar(30) PRIMARY KEY,
			"name" varchar(30),
			"created" datetime default (datetime('now', 'localtime'))
		)
	`, m.TsFmsConnectTypeTbl)

	// create table
	mg.AddMigration("[thingspin] FMS 연결 종류 테이블 생성", NewRawSqlMigration(query))

	opcType := fmt.Sprintf(`INSERT INTO '%s' ('id', 'name') VALUES
		('%s', '%s'),
		('%s', '%s'),
		('%s', '%s')`, m.TsFmsConnectTypeTbl,
		"OPCUA", "OPC/UA",
		"MODBUS", "Modbus",
		"MYSQL", "my-sql")
	mg.AddMigration("[thingspin] FMS OPC/UA 연결 추가", NewRawSqlMigration(opcType))
}
