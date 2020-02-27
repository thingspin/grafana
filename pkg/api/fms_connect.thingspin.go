package api

import (
	"encoding/json"
	"errors"
	"fmt"
	"strconv"

	"github.com/grafana/grafana/pkg/setting"
	thingspin "github.com/grafana/grafana/pkg/thingspin/node"

	"github.com/grafana/grafana/pkg/bus"
	gfm "github.com/grafana/grafana/pkg/models"
	m "github.com/grafana/grafana/pkg/models-thingspin"
)

var prevData m.AddTsConnectHistoryQuery
var prevHistory m.TsConnectHistoryReq
var historyMap map[int]m.TsConnectHistoryReq

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

	q1 := m.AddTsConnectHistoryQuery{
		ConnectId:   int(q.Result),
		Event:       "연결 생성",
		Description: "최초 연결 추가",
	}
	if err := bus.Dispatch(&q1); err != nil {
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

	var q1 m.AddTsConnectHistoryQuery

	if info.Params["RequestMsg"] != nil {
		q1.ConnectId = connId
		q1.Event = fmt.Sprint(info.Params["RequestMsg"])
		q1.Description = fmt.Sprintf("동작 상태 : %t ", info.Enable)
	} else {
		q1.ConnectId = connId
		q1.Event = "연결 내역"
		q1.Description = fmt.Sprintf("변경")
	}

	if prevData.ConnectId == q1.ConnectId {
		if prevData.Event == q1.Event {
			prevData.ConnectId = 0
			prevData.Event = ""
			prevData.Description = ""
			return JSON(200, q.Result)
		}
	}

	if err := bus.Dispatch(&q1); err != nil {
		return Error(500, "ThingSPIN Store Error", err)
	}

	prevData.ConnectId = q1.ConnectId
	prevData.Event = q1.Event
	prevData.Description = q1.Description

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

func licenseChecker(addItem *m.TsConnectField) string {
	q := m.CountActivationQuery{}

	if err := bus.Dispatch(&q); err != nil {
		fmt.Printf("%v", err)
	}

	totalCount := len(q.Result)
	licenseConnt, err := strconv.Atoi(setting.Thingspin.License.Connect)
	licenseNodeConnt, err := strconv.Atoi(setting.Thingspin.License.Nodes)
	if err != nil {
		fmt.Printf("License Data Covert Error")
	}

	nodeCount := 0
	for _, item := range q.Result {
		if _, ok := item.Params["PtagList"]; ok {
			if len(item.Params["PtagList"].([]interface{})) > 0 {
				nodeCount += len(item.Params["PtagList"].([]interface{}))
			}
		}
	}

	if _, ok := addItem.Params["PtagList"]; ok {
		if len(addItem.Params["PtagList"].([]interface{})) > 0 {
			nodeCount += len(addItem.Params["PtagList"].([]interface{}))
		}
	}

	if licenseConnt == totalCount {
		return "총 구동할 수 있는 연결을 다 이용하셨습니다."
	} else {
		if licenseNodeConnt < nodeCount {
			return "총 추가할 수 있는 수집노드를 다 이용하셨습니다."
		} else {
			return ""
		}
	}
}

func enableTsConnect(c *gfm.ReqContext, req m.EnableTsConnectReq) Response {
	connId := c.ParamsInt(":connId")

	// 이전 flow 정보 가져오기
	info, err := getTsConnectInfo(connId)
	if err != nil {
		return Error(500, "ThingSPIN Store Error", err)
	}
	if req.Enable == true {
		licenseMsg := licenseChecker(info)
		if len(licenseMsg) > 0 {
			return Error(500, licenseMsg, errors.New(""))
		}
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
	if info.Enable == true {
		q1 := m.AddTsConnectHistoryQuery{
			ConnectId:   connId,
			Event:       "연결 동작",
			Description: fmt.Sprintf("시작"),
		}
		if err := bus.Dispatch(&q1); err != nil {
			return Error(500, "ThingSPIN Store Error", err)
		}

	} else {
		if historyMap != nil {
			prevHistory := historyMap[prevHistory.Id]
			if len(prevHistory.Connect) > 0 {
				prevHistory.Connect = ""
			}
			if len(prevHistory.MQTT) > 0 {
				prevHistory.MQTT = ""
			}
			if len(prevHistory.Db) > 0 {
				prevHistory.Db = ""
			}
			historyMap[prevHistory.Id] = prevHistory
		}

		q1 := m.AddTsConnectHistoryQuery{
			ConnectId:   connId,
			Event:       "연결 동작",
			Description: fmt.Sprintf("정지"),
		}
		if err := bus.Dispatch(&q1); err != nil {
			return Error(500, "ThingSPIN Store Error", err)
		}

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

	if info.Publish == true {
		q1 := m.AddTsConnectHistoryQuery{
			ConnectId:   connId,
			Event:       "연결 발행",
			Description: fmt.Sprintf("시작"),
		}
		if err := bus.Dispatch(&q1); err != nil {
			return Error(500, "ThingSPIN Store Error", err)
		}
	} else {
		q1 := m.AddTsConnectHistoryQuery{
			ConnectId:   connId,
			Event:       "연결 발행",
			Description: fmt.Sprintf("정지"),
		}
		if err := bus.Dispatch(&q1); err != nil {
			return Error(500, "ThingSPIN Store Error", err)
		}
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

	q1 := m.DeleteTsConnectHistoryQuery{
		ConnectId: info.Id,
	}

	bus.Dispatch(&q1)

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

func getTsConnectHistory(c *gfm.ReqContext) Response {
	connId := c.ParamsInt(":connId")

	q1 := m.GetAllTsConnectHistoryQuery{
		ConnectId: connId,
	}

	if err := bus.Dispatch(&q1); err != nil {
		return Error(500, "ThingSPIN Store Error", err)
	}

	return JSON(200, q1.Result)
}

func getTsConnectTotalHistory(c *gfm.ReqContext) Response {
	q1 := m.GetTotalTsConnectHistoryQuery{}

	if err := bus.Dispatch(&q1); err != nil {
		return Error(500, "ThingSPIN Store Error", err)
	}

	return JSON(200, q1.Result)
}

func postTsConnectHistory(c *gfm.ReqContext, req m.TsConnectHistoryReq) Response {
	if historyMap == nil {
		historyMap = make(map[int]m.TsConnectHistoryReq)
	}

	fmt.Printf("%v", req)

	prevHistory := historyMap[req.Id]

	if len(req.Connect) > 0 {
		if prevHistory.Connect != req.Connect {
			q1 := m.AddTsConnectHistoryQuery{
				ConnectId:   req.Id,
				Event:       "서버 상태",
				Description: fmt.Sprintf(req.Connect),
			}
			if err := bus.Dispatch(&q1); err != nil {
				return Error(500, "ThingSPIN Store Error", err)
			}
			prevHistory.Connect = req.Connect
		}
	}
	if len(req.MQTT) > 0 {
		if prevHistory.MQTT != req.MQTT {
			q1 := m.AddTsConnectHistoryQuery{
				ConnectId:   req.Id,
				Event:       "발행 상태",
				Description: fmt.Sprintf(req.MQTT),
			}
			if err := bus.Dispatch(&q1); err != nil {
				return Error(500, "ThingSPIN Store Error", err)
			}
			prevHistory.MQTT = req.MQTT
		}
	}
	if len(req.Db) > 0 {
		if prevHistory.Db != req.Db {
			q1 := m.AddTsConnectHistoryQuery{
				ConnectId:   req.Id,
				Event:       "데이터 상태",
				Description: fmt.Sprintf(req.Db),
			}
			if err := bus.Dispatch(&q1); err != nil {
				return Error(500, "ThingSPIN Store Error", err)
			}
			prevHistory.Db = req.Db
		}
	}
	prevHistory.Id = req.Id
	historyMap[req.Id] = prevHistory

	return JSON(200, "OK")
}
