package tsmodels

import (
	"database/sql"
	"time"
)

type TsConnectReq struct {
	Name   string                 `json:"name"`
	Params map[string]interface{} `json:"params"`
}

type TsConnectField struct {
	Id      int                    `json:"id"`
	Name    string                 `json:"name"`
	FlowId  string                 `json:"flow_id"`
	Type    string                 `json:"type"`
	Params  map[string]interface{} `json:"params"`
	Active  bool                   `json:"active"`
	Created time.Time              `json:"created"`
	Updated time.Time              `json:"updated"`
}

type TsConnectType struct {
	Id      string    `json:"id"`
	Name    string    `json:"name"`
	Created time.Time `json:"created"`
}

type GetAllTsConnectQuery struct {
	Result []TsConnectField
}

type GetTsConnectQuery struct {
	Id     int
	Result TsConnectField
}

type AddTsConnectQuery struct {
	Name   string
	Params string
	Type   string
	Result sql.Result
}

type UpdateTsConnectFlowQuery struct {
	Id     int
	Name   string
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

type GetAllTsConnectTypeQuery struct {
	Result []TsConnectType
}
