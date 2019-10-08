package annotations

import "github.com/grafana/grafana/pkg/components/simplejson"

type TsItemQuery struct {
	ItemQuery

	NewState string `json:"newState"`
	Confirm  string `json:"confirm"`
}

type TsItemDTO struct {
	Id          int64            `json:"id"`
	AlertId     int64            `json:"alertId"`
	AlertName   string           `json:"alertName"`
	DashboardId int64            `json:"dashboardId"`
	PanelId     int64            `json:"panelId"`
	UserId      int64            `json:"userId"`
	NewState    string           `json:"newState"`
	PrevState   string           `json:"prevState"`
	Created     int64            `json:"created"`
	Updated     int64            `json:"updated"`
	Time        int64            `json:"time"`
	TimeEnd     int64            `json:"timeEnd"`
	Text        string           `json:"text"`
	Tags        []string         `json:"tags"`
	Login       string           `json:"login"`
	Email       string           `json:"email"`
	AvatarUrl   string           `json:"avatarUrl"`
	Data        *simplejson.Json `json:"data"`

	// thingpsin add code ----
	Confirm     bool   `json:"confirm"`
	ConfirmDate int64  `json:"confirmDate"`
	Slug        string `json:"slug"`
	Uid         string `json:"uid"`
}

type TsRepository interface {
	Repository

	TsFind(query *TsItemQuery) ([]*TsItemDTO, error)
	FindStateCount(query *TsItemQuery) (num int64, err error)
}

func GetTsRepository() TsRepository {
	return repositoryInstance.(TsRepository)
}
