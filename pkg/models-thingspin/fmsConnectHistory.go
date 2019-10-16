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

type TsConnectTotalHistoryField struct {
	Name            string           `json:"name"`
	Type            string           `json:"type"`
	Event           string           `json:"event"`
	Description     string           `json:"description"`
	Created         time.Time        `json:"created"`
}

type GetAllTsConnectHistoryQuery struct {
	ConnectId       int
	Result []TsConnectHistoryField
}

type GetTotalTsConnectHistoryQuery struct {
	Result []TsConnectTotalHistoryField
}

type AddTsConnectHistoryQuery struct {
	ConnectId   int     `xorm:"'connect_id'"`
	Event       string  `xorm:"'event'"`
	Description string  `xorm:"'description'"`
	Result      int64
}

type DeleteTsConnectHistoryQuery struct {
	ConnectId   int
	Result sql.Result
}