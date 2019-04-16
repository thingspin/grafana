package drone

import (
	. "github.com/grafana/grafana/pkg/models"
	. "github.com/grafana/grafana/pkg/util"
)

func (s *DroneService) SearchDroneAPI(c *ReqContext) {
	c.JSON(200, DynMap{
		"api":   "SearchDroneAPI",
		"state": "under-develop",
		"base":  s.services.BaseFolder,
	})
}
