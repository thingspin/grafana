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

func getTsSite(c *gfm.ReqContext) Response {
	connId := c.ParamsInt(":siteId")
	q := m.GetTsSiteQuery{
		Id: connId,
	}
	if err := bus.Dispatch(&q); err != nil {
		return Error(500, "ThingSPIN Store Error", err)
	}
	return JSON(200, q.Result)
}

func getSampleTsSite(c *gfm.ReqContext) Response {
	result := []m.TsSiteField {
		{
			Id: 1,
			Name: "Seoul Factory",
			Description: "서울 공장",
			Location_lat: 37.5599782,
			Location_lon: 126.9795979,
		},
		{
			Id: 2,
			Name: "Busan Factory",
			Description: "부산 공장",
			Location_lat: 35.1485845,
			Location_lon: 128.9981016,
		},
		{
			Id: 3,
			Name: "Daegu Factory",
			Description: "대구 공장",
			Location_lat: 35.8693295,
			Location_lon: 128.5387992,
		},
	}
	return JSON(200, result)	
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
	result := m.GetAllTsSiteQuery{}
	if err := bus.Dispatch(&result); err != nil {
		return Error(500, "ThingSPIN Server Error", err)
	}
	return JSON(200, result.Result)
}

func updateTsSite(c *gfm.ReqContext, req m.UpdateTsSiteQuery) Response {
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
	result := m.GetAllTsSiteQuery{}
	if err := bus.Dispatch(&result); err != nil {
		return Error(500, "ThingSPIN Server Error", err)
	}
	return JSON(200, result.Result)
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
	result := m.GetAllTsSiteQuery{}
	if err := bus.Dispatch(&result); err != nil {
		return Error(500, "ThingSPIN Server Error", err)
	}
	return JSON(200, result.Result)
}