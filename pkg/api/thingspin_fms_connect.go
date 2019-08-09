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

	return &conn.Result, nil
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
		return thingspin.AddFlowNode(info.Type, info)
	}
	// already added node-red flow
	return thingspin.RemoveFlowNode(info.FlowId)
}

func addTsConnect(c *gfm.ReqContext, req m.TsConnectReq) Response {
	target := c.Params(":target")
	newFlowId := req.Params["FlowId"].(string)

	// add node-red flow
	nodeResp, err := thingspin.AddFlowNode(target, req)
	if err != nil {
		return Error(500, "ThingSPIN Connect Error", err)
	}

	// check Reponse Status
	if nodeResp.StatusCode != 200 {
		err = errors.New(string(nodeResp.Body.([]byte)))
		return Error(nodeResp.StatusCode, "ThingSPIN Connect Error", err)
	} else {
		var common map[string]interface{}
		err = json.Unmarshal(nodeResp.Body.([]byte), &common)
		if err != nil {
			return Error(500, "ThingSPIN Parsing Error", err)
		}
		newFlowId = common["id"].(string)
	}

	paramsStr, _ := json.Marshal(req.Params)

	q := m.AddTsConnectQuery{
		Name:      req.Name,
		FlowId:    newFlowId,
		Intervals: req.Intervals,
		Params:    string(paramsStr),
		Type:      target,
	}

	// save db
	if err := bus.Dispatch(&q); err != nil {
		return Error(500, "ThingSPIN Store Error", err)
	}

	return JSON(200, q.Result)
}

func updateTsConnect(c *gfm.ReqContext, req m.TsConnectReq) Response {
	connId := c.ParamsInt(":connId")

	// 이전 flow 정보 가져오기
	info, err := getTsConnectInfo(connId)
	if err != nil {
		return Error(500, "ThingSPIN Store Error", err)
	}

	// 새로운 params으로 변경
	info.Params = req.Params
	info.Intervals = req.Intervals

	// 기존에 동작 중인 Connect에 업데이트를 할 경우
	if info.Active == true {
		// Node-red에 적용된 Flow 업데이트
		nodeResp, err := thingspin.UpdateFlowNode(info.FlowId, info.Type, info)
		if err != nil {
			return Error(500, "ThingSPIN Connect Error", err)
		}

		// get updated flowId
		body := nodeResp.Body.([]byte)
		var common map[string]interface{}
		err = json.Unmarshal(body, &common)
		if err != nil {
			return Error(500, "ThingSPIN Parsing Error", err)
		}
		info.FlowId = common["id"].(string)
	}

	paramsStr, _ := json.Marshal(req.Params)
	q := m.UpdateTsConnectFlowQuery{
		Id:        connId,
		Name:      req.Name,
		FlowId:    info.FlowId,
		Enable:    info.Enable,
		Intervals: info.Intervals,
		Params:    string(paramsStr),
	}
	if err := bus.Dispatch(&q); err != nil {
		return Error(500, "ThingSPIN Store Error", err)
	}

	return JSON(200, q.Result)
}

func activeTsConnect(c *gfm.ReqContext) Response {
	connId := c.ParamsInt(":connId")

	// 이전 flow 정보 가져오기
	info, err := getTsConnectInfo(connId)
	if err != nil {
		return Error(500, "ThingSPIN Store Error", err)
	}

	// toggle Active
	info.Active = !info.Active

	nodeResp, err := activeNodeRedFlow(*info)
	if err != nil {
		return Error(500, "ThingSPIN Connect Error", err)
	}

	if nodeResp.StatusCode == 200 { // success
		body := nodeResp.Body.([]byte)
		var common map[string]interface{}
		err = json.Unmarshal(body, &common)
		if err != nil {
			return Error(500, "ThingSPIN Connect Error", err)
		}
		info.FlowId = common["id"].(string)
	} else if nodeResp.StatusCode == 204 { //no contents
		info.FlowId = ""
	}
	// get updated flowId

	q := m.UpdateActiveTsConnectQuery{
		Active: info.Active,
		Enable: info.Enable,
		FlowId: info.FlowId,
		Params: info.Params,
		Id:     connId,
	}

	if err := bus.Dispatch(&q); err != nil {
		return Error(500, "ThingSPIN Store Error", err)
	}

	return JSON(200, q.Result)
}

func enableTsConnect(c *gfm.ReqContext, req m.EnableTsConnectReq) Response {
	connId := c.ParamsInt(":connId")

	// 이전 flow 정보 가져오기
	info, err := getTsConnectInfo(connId)
	if err != nil {
		return Error(500, "ThingSPIN Store Error", err)
	}

	info.Enable = req.Enable
	// info.Params["FlowId"] = req.FlowId

	if info.Active == true {
		nodeResp, err := thingspin.UpdateFlowNode(info.FlowId, info.Type, info)
		if err != nil {
			return Error(500, "ThingSPIN Connect Error", err)
		}

		// get updated flowId
		body := nodeResp.Body.([]byte)
		var common map[string]interface{}
		err = json.Unmarshal(body, &common)
		if err != nil {
			return Error(500, "ThingSPIN Parsing Error", err)
		}
		info.FlowId = common["id"].(string)
	}

	q := m.UpdateActiveTsConnectQuery{
		Active: info.Active,
		Enable: info.Enable,
		FlowId: info.FlowId,
		Params: info.Params,
		Id:     connId,
	}

	if err := bus.Dispatch(&q); err != nil {
		return Error(500, "ThingSPIN Store Error", err)
	}

	return JSON(200, info.Id)
}

func toggleMqttPublishTsConnect(c *gfm.ReqContext) Response {
	connId := c.ParamsInt(":connId")

	// 이전 flow 정보 가져오기
	info, err := getTsConnectInfo(connId)
	if err != nil {
		return Error(500, "ThingSPIN Store Error", err)
	}

	// toggle MQTT Publish state
	info.Publish = !info.Publish

	if info.Active {
		nodeResp, err := thingspin.UpdateFlowNode(info.FlowId, info.Type, info)
		if err != nil {
			return Error(500, "ThingSPIN Connect Error", err)
		}

		// get updated flowId
		body := nodeResp.Body.([]byte)
		var common map[string]interface{}
		err = json.Unmarshal(body, &common)
		if err != nil {
			return Error(500, "ThingSPIN Parsing Error", err)
		}
		info.FlowId = common["id"].(string)
	}

	q := m.UpdateToggleMqttPublishTsConnectQuery{
		Publish: info.Publish,
		Enable:  info.Enable,
		FlowId:  info.FlowId,
		Params:  info.Params,
		Id:      connId,
	}

	if err := bus.Dispatch(&q); err != nil {
		return Error(500, "ThingSPIN Store Error", err)
	}

	return JSON(200, info.Id)
}

func deleteTsConnect(c *gfm.ReqContext) Response {
	connId := c.ParamsInt(":connId")

	// 이전 flow 정보 가져오기
	info, err := getTsConnectInfo(connId)
	if err != nil {
		return Error(500, "ThingSPIN Store Error", err)
	}

	// Remove Flow Node
	nodeResp, err := thingspin.RemoveFlowNode(info.FlowId)
	if err != nil {
		return Error(500, "ThingSPIN Connect Error", err)
	}

	// Check Response Code
	if nodeResp.StatusCode != 204 && nodeResp.StatusCode != 404 {
		err = errors.New(string(nodeResp.Body.([]byte)))
		return Error(nodeResp.StatusCode, "ThingSPIN Connect Error", err)
	}

	// remove Connect Table Row
	q := m.DeleteTsConnectQuery{
		Id: connId,
	}
	if err := bus.Dispatch(&q); err != nil {
		return Error(500, "ThingSPIN Store Error", err)
	}

	return JSON(200, q.Result)
}

func getTsConnectType(c *gfm.ReqContext) Response {
	q := m.GetAllTsConnectTypeQuery{}

	if err := bus.Dispatch(&q); err != nil {
		return Error(500, "ThingSPIN Store Error", err)
	}

	return JSON(200, q.Result)
}
