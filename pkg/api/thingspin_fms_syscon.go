package api

import (
	m "github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/util"
)

func SystemRestartReq(c *m.ReqContext) Response {

	return JSON(200, util.DynMap{
		"message": "잠시 후 서버가 재시작 합니다. (** NOT IMPLEMENTED YET **)",
		"id":      "restart",
		"user":    1,
	})
}
