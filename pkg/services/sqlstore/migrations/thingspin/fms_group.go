package thingspin

import (
	. "github.com/grafana/grafana/pkg/services/sqlstore/migrator"
)

func addFmsGroupMigrations(mg *Migrator) {
	fmsSettings := Table{
		Name: "TS_FMS_GROUP",
		Columns: []*Column{
			{Name: "ID", Type: DB_BigInt, IsPrimaryKey: true, IsAutoIncrement: true},
			{Name: "NAME", Type: DB_NVarchar, Length: 50, Nullable: false},
			{Name: "MAIL", Type: DB_NVarchar, Length: 100, Nullable: false},
			{Name: "CREATED_DATE", Type: DB_DateTime, Nullable: false},
			{Name: "MODIFIED_DATE", Type: DB_DateTime, Nullable: false},
		},
	}

	// create table
	mg.AddMigration("[thingspin] FMS 그룹 테이블 생성", NewAddTableMigration(fmsSettings))
}
