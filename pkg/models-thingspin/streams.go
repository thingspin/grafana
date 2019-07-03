package tsmodels

type TsStreamPacket struct {
	Stream string    `json:"stream"`
	Data interface{} `json:"data"`
}