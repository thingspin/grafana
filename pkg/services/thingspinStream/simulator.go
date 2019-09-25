package thingspinStream

import (
	"math/rand"
	"time"

	m "github.com/grafana/grafana/pkg/models-thingspin"
)

var streamService *ThingspinStreamService

func (stream *ThingspinStreamService) Init() error {
	streamService = stream

	if stream.isRunSimulator {
		go func() {
			stream.log.Info("Run Thingspin Alarm Simulator")

			for {
				t := time.Duration(rand.Int31n(3)+1) * time.Second
				time.Sleep(t)

				stream.sendAlarmSimulator()
			}
		}()
	}

	return nil
}

func (stream *ThingspinStreamService) sendAlarmSimulator() {
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
	stream.HttpServer.TsSendStream(&streamData)
}
