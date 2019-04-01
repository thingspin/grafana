package thingspin

import (
	"fmt"

	m "github.com/grafana/grafana/pkg/models-thingspin"
	. "github.com/grafana/grafana/pkg/services/sqlstore/migrator"
)

func addFmsFieldTypeMigrations(mg *Migrator) {
	query := fmt.Sprintf(`
		CREATE TABLE IF NOT EXISTS '%s' (
			"id" varchar(30) PRIMARY KEY,
			"name" varchar(30),
			"created" datetime default (datetime('now', 'localtime'))
		)
	`, m.TsFmsFieldTypeTbl)

	// create table
	mg.AddMigration("[thingspin] FMS Field 종류 테이블 생성", NewRawSqlMigration(query))

	fieldTypeData := fmt.Sprintf(`INSERT INTO '%s' ('id', 'name') VALUES
		('%s', '%s'), 
		('%s', '%s'), 
		('%s', '%s'), 
		('%s', '%s')`,
		m.TsFmsFieldTypeTbl,
		"AUTO", "auto",
		"INTEGER", "integer",
		"FLOAT", "float",
		"STRING", "stirng")
	mg.AddMigration("[thingspin] FMS Field 종류 추가", NewRawSqlMigration(fieldTypeData))
}
