package api

import (
	"github.com/grafana/grafana/pkg/bus"
	gfm "github.com/grafana/grafana/pkg/models"
	m "github.com/grafana/grafana/pkg/models-thingspin"
)

func getAllTsSite(c *gfm.ReqContext) Response {
	q := m.GetAllTsSiteQuery{}
	if err := bus.Dispatch(&q); err != nil {
		return Error(500, "ThingSPIN Server Error", err)
	}
	return JSON(200, q.Result)
}

func addTsSite(c *gfm.ReqContext, req m.AddTsSiteQuery) Response {	
	q := m.AddTsSiteQuery{
		Name:   req.Name,
		Desc:   req.Desc,
		Lat:    req.Lat,
		Lon:    req.Lon,
	}
	// save db
	if err := bus.Dispatch(&q); err != nil {
		return Error(500, "ThingSPIN Store Error", err)
	}
	return JSON(200, q.Result)
}

func UpdateTsSite(c *gfm.ReqContext, req m.UpdateTsSiteQuery) Response {
	q := m.UpdateTsSiteQuery{
		Id:        req.Id,
		Name:      req.Name,
		Desc:      req.Desc,
		Lat:       req.Lat,
		Lon:       req.Lon,
	}
	if err := bus.Dispatch(&q); err != nil {
		return Error(500, "ThingSPIN Store Error", err)
	}

	return JSON(200, q.Result)
}

func deleteTsSite(c *gfm.ReqContext) Response {
	connId := c.ParamsInt(":siteId")

	// remove Connect Table Row
	q := m.DeleteTsSiteQuery{
		Id: connId,
	}
	if err := bus.Dispatch(&q); err != nil {
		return Error(500, "ThingSPIN Store Error", err)
	}

	return JSON(200, q.Result)
}