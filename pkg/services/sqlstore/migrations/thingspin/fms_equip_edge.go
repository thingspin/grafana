package thingspin

import (
	"fmt"

	m "github.com/grafana/grafana/pkg/models-thingspin"
	. "github.com/grafana/grafana/pkg/services/sqlstore/migrator"
)

func addFmsEquipEdgeMigrations(mg *Migrator) {
	query := fmt.Sprintf(`
	CREATE TABLE IF NOT EXISTS '%s' (
		'tid' integer references %s(id),
		'eid' integer references %s(id),
		'created' datetime default (datetime('now', 'localtime')),
		'updated' datetime default (datetime('now', 'localtime')),
		PRIMARY KEY('tid', 'eid')
	)`, m.TsFmsEquipEdgeTbl,
		m.TsFmsTagTbl,
		m.TsFmsEquipTbl)

	// create table
	mg.AddMigration("[thingspin] FMS 설비 종단 테이블 생성", NewRawSqlMigration(query))
}
