package dtos

import (
	tsmodels "github.com/grafana/grafana/pkg/models-thingspin"
)

type TsIndexViewData struct {
	IsFms bool
	Menu  []*tsmodels.FmsMenu
}
