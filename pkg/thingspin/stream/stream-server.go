package stream

import (
	"context"

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

	registry.RegisterService(&ThingspinStreamService{
		isRunSimulator: false,
		log:            log.New("thingspin.stream"),
	})
}

func (stream *ThingspinStreamService) Init() error {
	return nil
}

func (stream *ThingspinStreamService) Run(ctx context.Context) error {
	streamService = stream

	busInit()

	if stream.isRunSimulator {
		runSimulator()
	}

	<-ctx.Done()
	return nil
}
