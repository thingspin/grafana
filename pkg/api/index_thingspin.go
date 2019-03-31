package api

import (
	"github.com/grafana/grafana/pkg/api/dtos"
	"github.com/grafana/grafana/pkg/bus"
	m "github.com/grafana/grafana/pkg/models"
	tsm "github.com/grafana/grafana/pkg/models-thingspin"
	"github.com/grafana/grafana/pkg/setting"
)

func setTsIndexViewData(c *m.ReqContext) (*dtos.TsIndexViewData, error) {
	viewData := &dtos.TsIndexViewData{
		IsFms: setting.Thingspin.Enabled,
	}

	orgId := c.OrgId
	if orgId != 0 {
		q := &tsm.GetFmsMenuByOrgIdQuery{
			OrgId: orgId,
		}

		if err := bus.Dispatch(q); err != nil {
			return nil, err
		}
		viewData.Menu = q.Result.Menu
	}

	return viewData, nil
}
