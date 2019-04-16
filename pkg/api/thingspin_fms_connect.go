package api

import (
	"encoding/json"
	"errors"

	"github.com/grafana/grafana/pkg/thingspin"

	"github.com/grafana/grafana/pkg/bus"
	gfm "github.com/grafana/grafana/pkg/models"
	m "github.com/grafana/grafana/pkg/models-thingspin"
)

func str2Json(jsonBytes []byte) (map[string]interface{}, error) {
	var obj map[string]interface{}

	err := json.Unmarshal(jsonBytes, &obj)
	if err != nil {
		return nil, err
	}

	return obj, nil
}

func getAllTsConnect(c *gfm.ReqContext) Response {
	q := m.GetAllTsConnectQuery{}
	if err := bus.Dispatch(&q); err != nil {
		return Error(500, "ThingSPIN Server Error", err)
	}
	return JSON(200, q.Result)
}

func getTsConnectInfo(id int) (*m.TsConnectField, error) {
	conn := m.GetTsConnectQuery{
		Id: id,
	}

	if err := bus.Dispatch(&conn); err != nil {
		return nil, err
	}

	if len(conn.Result) != 1 {
		return nil, errors.New("Duplicate Result")
	}

	return &conn.Result[0], nil
}

func getTsConnect(c *gfm.ReqContext) Response {
	id := c.ParamsInt(":connId")

	result, err := getTsConnectInfo(id)
	if err != nil {
		return Error(500, "ThingSPIN Server Error", err)
	}

	return JSON(200, result)
}

func activeNodeRedFlow(info m.TsConnectField) (*m.NodeRedResponse, error) {
	if info.Active == true {
		// not exist node-red flow
		return thingspin.AddFlowNode(info.Type, info.Params)
	}
	// already added node-red flow
	return thingspin.RemoveFlowNode(info.FlowId)
}

func addTsConnect(c *gfm.ReqContext) Response {
	target := c.Params(":target")
	jsonStr, err := c.Req.Body().String()
	if err != nil {
		return Error(500, "ThingSPIN server Error", err)
	}

	q := m.AddTsConnectQuery{
		Params: jsonStr,
		Type:   target,
	}
	if err := bus.Dispatch(&q); err != nil {
		return Error(500, "ThingSPIN Server Error", err)
	}

	return JSON(200, q.Result)
}

func updateTsConnect(c *gfm.ReqContext) Response {
	connId := c.ParamsInt(":connId")
	jsonBytes, err := c.Req.Body().Bytes()
	if err != nil {
		return Error(500, "ThingSPIN server Error", err)
	}

	// 이전 flow 정보 가져오기
	info, err := getTsConnectInfo(connId)
	if err != nil {
		return Error(500, "ThingSPIN Server Error", err)
	}

	// 새로운 params으로 변경
	params, err := str2Json(jsonBytes)
	if err != nil {
		return Error(500, "ThingSPIN Server Error", err)
	}
	info.Params = params

	// 기존에 동작 중인 Connect에 업데이트를 할 경우
	if info.Active == true {
		// Node-red에 적용된 Flow 업데이트
		nodeResp, err := thingspin.UpdateFlowNode(info.FlowId, info.Type, info.Params)
		if err != nil {
			return Error(500, "ThingSPIN Server Error", err)
		}

		// get updated flowId
		body := nodeResp.Body.([]byte)
		var common map[string]interface{}
		err = json.Unmarshal(body, &common)
		if err != nil {
			return Error(500, "ThingSPIN Server Error", err)
		}
		newFlowId := common["id"].(string)
		info.FlowId = newFlowId
	}

	q := m.UpdateTsConnectFlowQuery{
		Id:     connId,
		FlowId: info.FlowId,
		Params: string(jsonBytes),
	}
	if err := bus.Dispatch(&q); err != nil {
		return Error(500, "ThingSPIN Server Error", err)
	}

	return JSON(200, q.Result)
}

func activeTsConnect(c *gfm.ReqContext) Response {
	connId := c.ParamsInt(":connId")

	// 이전 flow 정보 가져오기
	info, err := getTsConnectInfo(connId)
	if err != nil {
		return Error(500, "ThingSPIN Server Error", err)
	}

	// toggle Active
	info.Active = !info.Active

	nodeResp, err := activeNodeRedFlow(*info)
	if err != nil {
		return Error(500, "ThingSPIN Server Error", err)
	}

	// get updated flowId
	body := nodeResp.Body.([]byte)
	var common map[string]interface{}
	err = json.Unmarshal(body, &common)
	if err != nil {
		return Error(500, "ThingSPIN Server Error", err)
	}
	newFlowId := common["id"].(string)
	info.FlowId = newFlowId

	q := m.UpdateActiveTsConnectQuery{
		Active: true,
		FlowId: info.FlowId,
		Id:     connId,
	}

	if err := bus.Dispatch(&q); err != nil {
		return Error(500, "ThingSPIN Server Error", err)
	}

	return JSON(200, q.Result)
}

func deleteTsConnect(c *gfm.ReqContext) Response {
	connId := c.ParamsInt(":connId")
	q := m.DeleteTsConnectQuery{
		Id: connId,
	}

	info, err := getTsConnectInfo(connId)
	if err != nil {
		return Error(500, "ThingSPIN Server Error", err)
	}

	if info.Active == true {
		return JSON(403, "Connect is Running")
	}

	if err := bus.Dispatch(&q); err != nil {
		return Error(500, "ThingSPIN Server Error", err)
	}

	return JSON(200, q.Result)
}
