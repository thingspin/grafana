package thingspin

import (
	"fmt"

	m "github.com/grafana/grafana/pkg/models-thingspin"
	. "github.com/grafana/grafana/pkg/services/sqlstore/migrator"
)

func addFmsSiteMigrations(mg *Migrator) {
	query := fmt.Sprintf(`
	CREATE TABLE IF NOT EXISTS '%s' (
		'id' integer PRIMARY KEY AUTOINCREMENT,
		'equip_root_id' integer references %s(id),
		'location' varchar(45),
		'description' text,
		'created' datetime default (datetime('now', 'localtime')),
		'updated' datetime default (datetime('now', 'localtime'))
	)`, m.TsFmsSiteTbl, m.TsFmsEquipTbl)

	// create table
	mg.AddMigration("[thingspin] FMS 사이트 테이블 생성", NewRawSqlMigration(query))
}
