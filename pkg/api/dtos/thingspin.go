package dtos

import (
	tsm "github.com/grafana/grafana/pkg/models-thingspin"
)

type TsIndexViewData struct {
	IsFms bool
	Menu  []*tsm.FmsMenu
}
