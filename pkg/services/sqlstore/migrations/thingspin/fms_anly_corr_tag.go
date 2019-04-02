package thingspin

import (
	"fmt"

	m "github.com/grafana/grafana/pkg/models-thingspin"
	. "github.com/grafana/grafana/pkg/services/sqlstore/migrator"
)

func addFmsAnlyCorrTagMigrations(mg *Migrator) {
	query := fmt.Sprintf(`
	CREATE TABLE IF NOT EXISTS '%s' (
		'tid' integer references %s(id),
		'corr_id' integer references %s(id),
		'created' datetime default (datetime('now', 'localtime')),
		'updated' datetime default (datetime('now', 'localtime')),
		PRIMARY KEY('tid', 'corr_id')
	)`, m.TsFmsAnlyCorrTagTbl,
		m.TsFmsTagTbl,
		m.TsFmsAnlyCorrTbl)

	// create table
	mg.AddMigration("[thingspin] FMS 상관 관계 분석 태그 테이블 생성", NewRawSqlMigration(query))
}
