package thingspin

import (
	"fmt"

	m "github.com/grafana/grafana/pkg/models-thingspin"
	. "github.com/grafana/grafana/pkg/services/sqlstore/migrator"
)

func addFmsAnlyCodeMigrations(mg *Migrator) {
	query := fmt.Sprintf(`
		CREATE TABLE IF NOT EXISTS '%s' (
			"id" varchar(30) PRIMARY KEY,
			"name" varchar(30),
			"created" datetime default (datetime('now', 'localtime'))
		)`, m.TsFmsAnlyStateTbl)

	// create table
	mg.AddMigration("[thingspin] FMS 분석 상태 테이블 생성", NewRawSqlMigration(query))

	anlyState := fmt.Sprintf(`INSERT INTO '%s' ('id', 'name') VALUES
		('%s', '%s'), ('%s', '%s'), ('%s', '%s'), ('%s', '%s'), ('%s', '%s')`, m.TsFmsAnlyStateTbl,
		"ANLY_READY", "분석 준비",
		"ANLY_STARTED", "분석 중",
		"ANLY_SUCCESS", "분석 완료",
		"ANLY_STOPPED", "분석 중지",
		"ANLY_ERR", "분석 오류")
	mg.AddMigration("[thingspin] FMS 분석 상태 추가", NewRawSqlMigration(anlyState))
}
