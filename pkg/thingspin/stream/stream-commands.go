package stream

import (
	"time"

	"github.com/grafana/grafana/pkg/bus"
	m "github.com/grafana/grafana/pkg/models-thingspin"
	"github.com/grafana/grafana/pkg/services/alerting"
)

func busInit() {
	bus.AddHandler("thingspin-stream", sendStreamMessage)
	bus.AddHandler("thingspin-stream", sendAlarmMessage)
}

func sendStreamMessage(msg *m.TsSendStreamMessageCommand) error {
	if streamService == nil {
		return nil
	}

	streamService.HttpServer.TsSendStream(&msg.TsStreamPacket)

	return nil
}

func sendAlarmMessage(msg *m.TsSendAlarmMessageCommand) error {
	if streamService == nil {
		return nil
	}
	evalContext := msg.EvalContext.(*alerting.EvalContext)

	url, err := evalContext.GetRuleURL()
	if err != nil {
		return err
	}

	var alarmType string
	state := evalContext.Rule.State
	if state == "pending" {
		alarmType = "warn"
	} else if state == "alerting" {
		alarmType = "err"
	} else {
		alarmType = string(state)
	}

	streamService.HttpServer.TsSendStream(&m.TsStreamPacket{
		Stream: "ts-alarm",
		Data: map[string]interface{}{
			"title":       evalContext.Rule.Name,
			"subtitle":    "",
			"time":        time.Now(),
			"alarmType":   alarmType,
			"historyType": "type",

			"evalMatches":    evalContext.EvalMatches,
			"conditionEvals": evalContext.ConditionEvals,
			"ruleUrl":        url,

			"history": map[string]interface{}{},
		},
	})

	return nil
}
