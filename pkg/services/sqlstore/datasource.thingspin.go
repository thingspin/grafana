package sqlstore

import (
	"github.com/grafana/grafana/pkg/bus"
	"github.com/grafana/grafana/pkg/infra/metrics"

	m "github.com/grafana/grafana/pkg/models"
)

func init() {
	bus.AddHandler("thingspin-sql", GetTsDataSourceById)
	bus.AddHandler("thingspin-sql", GetTsDataSourceByName)
}

func GetTsDataSourceById(query *m.GetTsDataSourceByIdQuery) error {
	metrics.M_DB_DataSource_QueryById.Inc()

	datasource := m.DataSource{Id: query.Id}
	has, err := x.Get(&datasource)

	if err != nil {
		return err
	}

	if !has {
		return m.ErrDataSourceNotFound
	}

	query.Result = &datasource
	return err
}

func GetTsDataSourceByName(query *m.GetTsDataSourceByNameQuery) error {
	datasource := m.DataSource{Name: query.Name}
	has, err := x.Get(&datasource)

	if !has {
		return m.ErrDataSourceNotFound
	}

	query.Result = &datasource
	return err
}
