package thingspin

import (
	. "github.com/grafana/grafana/pkg/services/sqlstore/migrator"
)

func AddThingspinMigrations(mg *Migrator) {
	addFmsSettingsMigrations(mg)
}
