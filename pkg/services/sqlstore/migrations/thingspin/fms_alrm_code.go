package thingspin

import (
	"fmt"

	m "github.com/grafana/grafana/pkg/models-thingspin"
	. "github.com/grafana/grafana/pkg/services/sqlstore/migrator"
)

func addFmsAlrmCodeMigrations(mg *Migrator) {
	query := fmt.Sprintf(`
		CREATE TABLE IF NOT EXISTS '%s' (
			"id" varchar(30) PRIMARY KEY,
			"name" varchar(30),
			"created" datetime default (datetime('now', 'localtime'))
		)`, m.TsFmsAlrmCodeTbl)

	// create table
	mg.AddMigration("[thingspin] FMS 알람 코드 테이블 생성", NewRawSqlMigration(query))

	alrmCode := fmt.Sprintf(`INSERT INTO '%s' ('id', 'name') VALUES
		('%s', '%s'), ('%s', '%s'), ('%s', '%s')`, m.TsFmsAlrmCodeTbl,
		"GOOD", "양호",
		"WARN", "경고",
		"ERR", "심각")
	mg.AddMigration("[thingspin] FMS 알람 코드 추가", NewRawSqlMigration(alrmCode))
}
