package api

import (
	"github.com/grafana/grafana/pkg/api/dtos"
	"github.com/grafana/grafana/pkg/bus"
	m "github.com/grafana/grafana/pkg/models"
	tsm "github.com/grafana/grafana/pkg/models-thingspin"
	"github.com/grafana/grafana/pkg/setting"
)

func setTsIndexViewData(c *m.ReqContext) (*dtos.TsIndexViewData, error) {
	orgId := c.OrgId

	q := &tsm.GetFmsMenuByOrgIdQuery{
		OrgId: orgId,
	}

	if err := bus.Dispatch(q); err != nil {
		return nil, err
	}

	return &dtos.TsIndexViewData{
		IsFms: setting.Thingspin.Enabled,
		Menu:  q.Result.Menu,
	}, nil
}
