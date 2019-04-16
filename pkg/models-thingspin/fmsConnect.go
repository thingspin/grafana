package tsmodels

import (
	"database/sql"
	"time"
)

type TsConnectField struct {
	Id      int                    `json:"id"`
	FlowId  string                 `json:"flow_id"`
	Type    string                 `json:"type"`
	Params  map[string]interface{} `json:"params"`
	Active  bool                   `json:"active"`
	Created time.Time              `json:"created"`
	Updated time.Time              `json:"updated"`
}

type GetAllTsConnectQuery struct {
	Result []TsConnectField
}

type GetTsConnectQuery struct {
	Id     int
	Result TsConnectField
}

type AddTsConnectQuery struct {
	Params string
	Type   string
	Result sql.Result
}

type UpdateTsConnectFlowQuery struct {
	Id     int
	FlowId string
	Params string
	Result sql.Result
}

type UpdateActiveTsConnectQuery struct {
	Id     int
	Active bool
	FlowId string
	Result sql.Result
}

type DeleteTsConnectQuery struct {
	Id     int
	Result sql.Result
}
