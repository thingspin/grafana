package node

import (
	"context"
	"encoding/json"

	"github.com/grafana/grafana/pkg/bus"
	"github.com/grafana/grafana/pkg/infra/log"
	m "github.com/grafana/grafana/pkg/models-thingspin"
	"github.com/grafana/grafana/pkg/registry"
	//nr "github.com/grafana/grafana/pkg/thingspin/node"
)

// interfaces //

type ThingspinNodeRedService struct {
	log     log.Logger
	flowIds []string
}

// init //

func init() {
	registry.RegisterService(&ThingspinNodeRedService{
		log: log.New("thingspin.node-red.manager"),
	})
}

// Public function & methods //

func (mgr *ThingspinNodeRedService) Init() (err error) {
	// get Flows in node-red server

	// flows, err := getNrTabFlows()
	// if err != nil {
	// 	mgr.log.Error("ThingSPIN Node ervice", "message", "Connect to NodeRED: Failed!")
	// 	return
	// }
	// mgr.flowIds = flows

	// // apply not created connection flow
	// updatedConns, err := mgr.applyFlow(flows)
	// if err != nil {
	// 	return
	// }

	// // update connection table in thingspin(sqlite3) database
	// for _, conn := range updatedConns {
	// 	if err = bus.Dispatch(&conn); err != nil {
	// 		return
	// 	}
	// }

	return
}

func (s *ThingspinNodeRedService) Run(ctx context.Context) error {

	flows, err := getNrTabFlows()
	if err != nil {
		s.log.Error("ThingSPIN Node ervice", "message", "Connect to NodeRED: Failed!")
		return err
	}
	s.flowIds = flows

	// apply not created connection flow
	updatedConns, err := s.applyFlow(flows)
	if err != nil {
		return err
	}

	// update connection table in thingspin(sqlite3) database
	for _, conn := range updatedConns {
		if err = bus.Dispatch(&conn); err != nil {
			return err
		}
	}

	<-ctx.Done()
	return nil
}

func (mgr *ThingspinNodeRedService) ExistFlow(conn m.TsConnectField) bool {
	for _, flowId := range mgr.flowIds {
		if conn.FlowId == flowId {
			return true
		}
	}
	return false
}

// Private function & methods //

func (mgr *ThingspinNodeRedService) applyFlow(flows []string) (result []m.TsConnectField, err error) {
	// get all connetion information in sqlite(main db) database
	conns, err := getConnects()
	if err != nil {
		return
	}

	for _, conn := range conns {
		// check exist flow
		if !mgr.ExistFlow(conn) {
			// add flow in node-red server
			mgr.log.Info("node-red", "apply-node", conn.Name)
			resp, err := AddFlowNode(conn.Type, &conn)
			if err != nil {
				break
			}

			// response parse
			var response map[string]interface{}
			if err = json.Unmarshal(resp.Body.([]byte), &response); err != nil {
				break
			}

			// update flow id
			mgr.log.Info("node-red", "new Flow", response)
			conn.FlowId = response["id"].(string)

			result = append(result, conn)
		}
	}

	return
}

func getConnects() (result []m.TsConnectField, err error) {
	q := m.GetAllTsConnectQuery{}
	if err = bus.Dispatch(&q); err != nil {
		return
	}

	return q.Result, nil
}

func getNrTabFlows() (result []string, err error) {
	// get Flows in node-red server
	flows, err := GetFlows()
	if err != nil {
		return
	}

	var flowsObj []map[string]interface{}
	if err = json.Unmarshal(flows.Body.([]byte), &flowsObj); err != nil {
		return
	}

	tabs := getTabs(flowsObj)
	for _, tab := range tabs {
		result = append(result, tab["id"].(string))
	}
	return
}

func getTabs(flows []map[string]interface{}) (result []map[string]interface{}) {
	for _, flow := range flows {
		if flow["type"] == "tab" {
			result = append(result, flow)
		}
	}
	return
}
