package thingspin

import (
	"fmt"

	m "github.com/grafana/grafana/pkg/models-thingspin"
	. "github.com/grafana/grafana/pkg/services/sqlstore/migrator"
)

func addFmsEquipMigrations(mg *Migrator) {
	query := fmt.Sprintf(`
	CREATE TABLE IF NOT EXISTS '%s' (
		'id' integer PRIMARY KEY AUTOINCREMENT,
		'name' varchar(45) NOT NULL,
		'node' int references %s(id),
		'created' datetime default (datetime('now', 'localtime')),
		'updated' datetime default (datetime('now', 'localtime'))
	)`, m.TsFmsEquipTbl, m.TsFmsEquipTbl)

	// create table
	mg.AddMigration("[thingspin] FMS 설비 테이블 생성", NewRawSqlMigration(query))
}
