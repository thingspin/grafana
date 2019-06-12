package api

import (
	"github.com/grafana/grafana/pkg/api/dtos"
	"github.com/grafana/grafana/pkg/bus"

	m "github.com/grafana/grafana/pkg/models"
)

// customize function GetDataSourceById
// Get /thingspin/datasources/:id
func GetTsDataSourceById(c *m.ReqContext) Response {
	query := m.GetTsDataSourceByIdQuery{
		Id: c.ParamsInt64(":id"),
	}

	if err := bus.Dispatch(&query); err != nil {
		if err == m.ErrDataSourceNotFound {
			return Error(404, "[thingspin] Data source not found", nil)
		}
		return Error(500, "[thingspin] Failed to query datasources", err)
	}

	ds := query.Result
	dtos := convertModelToDtos(ds)

	return JSON(200, &dtos)
}

// customize function GetDataSourceByName
// Get /thingspin/datasources/name/:name
func GetTsDataSourceByName(c *m.ReqContext) Response {
	query := m.GetTsDataSourceByNameQuery{Name: c.Params(":name")}

	if err := bus.Dispatch(&query); err != nil {
		if err == m.ErrDataSourceNotFound {
			return Error(404, "[thingspin] Data source not found", nil)
		}
		return Error(500, "[thingspin] Failed to query datasources", err)
	}

	dtos := convertModelToDtos(query.Result)
	dtos.ReadOnly = true
	return JSON(200, &dtos)
}

// customize function GetDataSourceIdByName
// Get /thingspin/datasources/id/:name
func GetTsDataSourceIdByName(c *m.ReqContext) Response {
	query := m.GetTsDataSourceByNameQuery{Name: c.Params(":name")}

	if err := bus.Dispatch(&query); err != nil {
		if err == m.ErrDataSourceNotFound {
			return Error(404, "[thingspin] Data source not found", nil)
		}
		return Error(500, "[thingspin] Failed to query datasources", err)
	}

	ds := query.Result
	dtos := dtos.AnyId{
		Id: ds.Id,
	}

	return JSON(200, &dtos)
}
