package alerting

import (
	"github.com/grafana/grafana/pkg/bus"

	"github.com/grafana/grafana/pkg/models"
	tsm "github.com/grafana/grafana/pkg/models-thingspin"
)

// redefine handle method
func (handler *defaultResultHandler) tsHandle(evalContext *EvalContext) (err error) {
	err = handler.handle(evalContext)

	// thingspin add code
	if evalContext.shouldUpdateAlertState() {
		tsCmd := tsm.TsSendAlarmMessageCommand{
			EvalContext: evalContext,
		}

		if evalContext.Rule.State == models.AlertStateAlerting || // 심각
			evalContext.Rule.State == models.AlertStatePending { // 경고
			if err = bus.Dispatch(&tsCmd); err != nil {
				return
			}
		}

	}

	return
}
