package sqlstore

import (
	"github.com/grafana/grafana/pkg/bus"
	m "github.com/grafana/grafana/pkg/models-thingspin"
)

func init() {
	bus.AddHandler("sql", GetFmsSetting)
}

func GetFmsSetting(cmd *m.GetFmsSettingQuery) error {
	return nil
}
