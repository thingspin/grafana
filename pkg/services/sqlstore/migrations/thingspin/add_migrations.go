package thingspin

import (
	. "github.com/grafana/grafana/pkg/services/sqlstore/migrator"
)

func AddThingspinMigrations(mg *Migrator) {
	// FMS System management
	addFmsSettingsMigrations(mg)

	// FMS Contents Management
	addFmsExtLinkMigrations(mg)

	// FMS User Management
	addFmsGroupMigrations(mg)
	addFmsGroupMemberMigrations(mg)
	addFmsUserMigrations(mg)
	addFmsMenuBaseMigrations(mg)
	addFmsMenuMigrations(mg)
	addFmsMenuPinMigrations(mg)

	// FMS Data source Management
	addFmsConnectTypeMigrations(mg)
	addFmsConnectStateMigrations(mg)
	addFmsConnectMigrations(mg)
	addFmsFieldTypeMigrations(mg)
	addFmsFieldMigrations(mg)
	addFmsTagMigrations(mg)

	// FMS Alarm Management
	addFmsAlrmCodeMigrations(mg)
	addFmsAlrmTypeMigrations(mg)
	addFmsAlrmRuleMigrations(mg)
	addFmsAlrmBandMigrations(mg)
	addFmsAlrmMigrations(mg)

	// FMS Equipment Management
	addFmsEquipMigrations(mg)
	addFmsEquipEdgeMigrations(mg)
	addFmsSiteMigrations(mg)

	// FMS Analysis Management
	addFmsAnlyCodeMigrations(mg)
	addFmsAnlyCorrMigrations(mg)
	addFmsAnlyCorrTagMigrations(mg)
	addFmsAnlyPredMigrations(mg)
	addFmsAnlyDiagMigrations(mg)

	// FMS Visualization Management
	addFmsDigitalTwinMigrations(mg)
}
