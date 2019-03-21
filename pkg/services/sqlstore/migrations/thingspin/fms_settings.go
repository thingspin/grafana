package thingspin

import (
	. "github.com/grafana/grafana/pkg/services/sqlstore/migrator"
)

func addFmsSettingsMigrations(mg *Migrator) {
	fmsSettings := Table{
		Name: "TS_FMS_SYSTEM_SETTINGS",
		Columns: []*Column{
			{Name: "LOGO_PATH", Type: DB_NVarchar, Length: 255, Nullable: false},
			{Name: "LOGO_BG_PATH", Type: DB_NVarchar, Length: 255, Nullable: false},
			{Name: "COMPANY", Type: DB_NVarchar, Length: 50, Nullable: false},
			{Name: "FAVICON", Type: DB_NVarchar, Length: 255, Nullable: false},
			{Name: "updated", Type: DB_DateTime, Nullable: false},
		},
	}

	// create table
	mg.AddMigration("[thingspin] create fms system setting table", NewAddTableMigration(fmsSettings))
}
