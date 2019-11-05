package api

import (
	"encoding/json"

	"github.com/grafana/grafana/pkg/bus"
	gfm "github.com/grafana/grafana/pkg/models"
	m "github.com/grafana/grafana/pkg/models-thingspin"
	"github.com/grafana/grafana/pkg/thingspin"
)

func GetFmsDatastreams(c *gfm.ReqContext) Response {
	q := m.GetFmsDatastreamsQuery{}
	if err := bus.Dispatch(&q); err != nil {
		return Error(404, "not found", err)
	}
	return JSON(200, q.Result)
}

func addFlowNode(c *gfm.ReqContext) Response {
	target := c.Params(":target")
	jsonStr, err := c.Req.Body().Bytes()
	if err != nil {
		return Error(500, "server Error", err)
	}

	var common interface{}
	err = json.Unmarshal(jsonStr, &common)
	if err != nil {
		return Error(500, "server Error", err)
	}

	result, err := thingspin.AddFlowNode(target, common)
	if err != nil {
		return Error(500, "Server Error", err)
	}

	return JSON(result.StatusCode, result.Body)
}
