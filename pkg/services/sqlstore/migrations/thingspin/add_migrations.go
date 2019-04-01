package thingspin

import (
	. "github.com/grafana/grafana/pkg/services/sqlstore/migrator"
)

func AddThingspinMigrations(mg *Migrator) {
	// FMS System management
	addFmsSettingsMigrations(mg)

	// FMS User Management
	addFmsGroupMigrations(mg)
	addFmsGroupMemberMigrations(mg)
	addFmsUserMigrations(mg)
	addFmsMenuMigrations(mg)

	// FMS Contents Management
	addFmsExtLinkMigrations(mg)

	// FMS Data source Management
	addFmsConnectTypeMigrations(mg)
	addFmsConnectStateMigrations(mg)
	addFmsConnectMigrations(mg)
	addFmsFieldTypeMigrations(mg)

	// FMS Alarm Management

	// FMS Equipment Management

	// FMS Analysis Management

	// FMS Visualization Management
}
