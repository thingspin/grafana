package tsmodels

import (
	"database/sql"
	"time"
)

type TsConnectHistoryField struct {
	Id              int              `json:"id"`
	Event           string           `json:"event"`
	Description     string           `json:"description"`	
	Created         time.Time        `json:"created"`
}

type GetAllTsConnectHistoryQuery struct {
	Result []TsConnectHistoryField
}

type AddTsConnectHistoryQuery struct {
	FlowId      string `xorm:"'flow_id'"`
	Event       string `xorm:"'event'"`
	Description string  `xorm:"'description'"`
	Result      int64
}

type DeleteTsConnectHistoryQuery struct {
	FlowId     string
	Result sql.Result
}