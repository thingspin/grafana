package alerting

import (
	"github.com/grafana/grafana/pkg/bus"

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

		if err = bus.Dispatch(&tsCmd); err != nil {
			return
		}
	}

	return
}
