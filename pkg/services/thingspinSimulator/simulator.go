package thingspinSimulator

import (
	"math/rand"
	"time"

	"github.com/grafana/grafana/pkg/api"
	"github.com/grafana/grafana/pkg/infra/log"
	m "github.com/grafana/grafana/pkg/models-thingspin"
	"github.com/grafana/grafana/pkg/registry"
)

type ThingspinSimulatorService struct {
	log log.Logger

	HttpServer *api.HTTPServer `inject:""`
}

func init() {
	registry.RegisterService(&ThingspinSimulatorService{
		log: log.New("thingspin.simulator"),
	})
}

func (sim *ThingspinSimulatorService) Init() error {

	go func() {
		sim.log.Info("Run Thingspin Simulator")

		for {
			t := time.Duration(rand.Int31n(3)+1) * time.Second
			time.Sleep(t)

			sim.sendAlarmSimulator()
		}
	}()

	return nil
}

func (sim *ThingspinSimulatorService) sendAlarmSimulator() {
	// generate simulator data
	var alarmType string
	typeRandom := rand.Intn(2)
	if typeRandom == 1 {
		alarmType = "warn"
	} else {
		alarmType = "err"
	}

	streamData := m.TsStreamPacket{
		Stream: "ts-alarm",
		Data: map[string]interface{}{
			"title":       "알람 발생",
			"subtitle":    "현대제철",
			"time":        time.Now(),
			"alarmType":   alarmType,
			"historyType": "tpye",
			"history": map[string]interface{}{
				"1. 태그":   "현대제철/철분말공정",
				"2. 현재 값": rand.Int31n(50) + 50,
				"3. 설정 값": rand.Int31n(50),
			},
		},
	}

	// send data
	sim.HttpServer.TsSendStream(&streamData)
}
