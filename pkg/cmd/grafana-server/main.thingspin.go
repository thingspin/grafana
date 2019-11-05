package main

import (
	"github.com/grafana/grafana/pkg/api"
)

func TsStop() (err error) {
	// save Edge AI Manager config
	return api.EAIM.StoreAllConf()
}
