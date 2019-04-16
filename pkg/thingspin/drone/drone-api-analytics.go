package drone

import (
	. "github.com/grafana/grafana/pkg/models"
	. "github.com/grafana/grafana/pkg/util"
)

func (s *DroneService) AnalyticsDroneAPI(c *ReqContext) {
	c.JSON(200, DynMap{
		"api":   "AnalyticsDroneAPI",
		"state": "under-develop",
		"base":  s.services.BaseFolder,
	})
}
