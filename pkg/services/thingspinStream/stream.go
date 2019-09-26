package thingspinStream

import (
	"github.com/grafana/grafana/pkg/api"
	"github.com/grafana/grafana/pkg/infra/log"
	"github.com/grafana/grafana/pkg/registry"
)

var streamService *ThingspinStreamService

type ThingspinStreamService struct {
	log            log.Logger
	isRunSimulator bool
	HttpServer     *api.HTTPServer `inject:""`
}

func init() {
	busInit()

	registry.RegisterService(&ThingspinStreamService{
		isRunSimulator: false,
		log:            log.New("thingspin.stream"),
	})
}

func (stream *ThingspinStreamService) Init() error {
	streamService = stream

	if stream.isRunSimulator {
		runSimulator()
	}

	return nil
}
