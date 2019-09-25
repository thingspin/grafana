package tsmodels

type TsStreamPacket struct {
	Stream string      `json:"stream"`
	Data   interface{} `json:"data"`
}

type TsSendStreamMessageCommand struct {
	TsStreamPacket
}

type TsSendAlarmMessageCommand struct {
	EvalContext interface{}
}
