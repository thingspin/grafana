package tsmodels

import (
	"database/sql"
	"time"
)

type TsConnectReq struct {
	Name      string                 `json:"name"`
	Params    map[string]interface{} `json:"params"`
	Enable    bool                   `json:"enable,omitempty"`
	Intervals int64                  `json:"intervals,omitempty"`
}

type TsConnectField struct {
	Id        int                    `json:"id"`
	Name      string                 `json:"name"`
	FlowId    string                 `json:"flow_id"`
	Type      string                 `json:"type"`
	Params    map[string]interface{} `json:"params"`
	Active    bool                   `json:"active"`
	Enable    bool                   `json:"enable"`
	Intervals int64                  `json:"intervals"`
	Created   time.Time              `json:"created"`
	Updated   time.Time              `json:"updated"`
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
	Name      string `xorm:"'name'"`
	FlowId    string `xorm:"'flow_id'"`
	Params    string `xorm:"'params'"`
	Intervals int64  `xorm:"'intervals'"`
	Type      string `xorm:"'type'"`
	Result    int64
}

type UpdateTsConnectFlowQuery struct {
	Id        int
	Name      string
	FlowId    string
	Enable    bool
	Intervals int64
	Params    string
	Result    sql.Result
}

type UpdateActiveTsConnectQuery struct {
	Id     int
	Active bool
	Enable bool
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
