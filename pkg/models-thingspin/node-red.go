package tsmodels

type NodeRedResponse struct {
	StatusCode int
	Body       interface{}
}

type OpcUaFlowData struct {
	FlowId            string
	EndpointUrl       string
	AddressSpaceItems string
	Interval          float32
}
type NodeRedFlowResponse struct {
	Id string `json:"id"`
}
