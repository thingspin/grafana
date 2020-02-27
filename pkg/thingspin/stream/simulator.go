package stream

import (
	"math/rand"
	"time"

	m "github.com/grafana/grafana/pkg/models-thingspin"
)

func runSimulator() {
	if streamService == nil {
		return
	}

	go func() {
		streamService.log.Info("Run Thingspin Alarm Simulator")

		for {
			t := time.Duration(rand.Int31n(3)+1) * time.Second
			time.Sleep(t)

			streamData := generateStreamData()
			streamService.HttpServer.TsSendStream(&streamData)
		}
	}()
}

func generateStreamData() (streamData m.TsStreamPacket) {
	// generate simulator data
	var alarmType string
	typeRandom := rand.Intn(2)
	if typeRandom == 1 {
		alarmType = "warn"
	} else {
		alarmType = "err"
	}

	streamData = m.TsStreamPacket{
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
	return
}
