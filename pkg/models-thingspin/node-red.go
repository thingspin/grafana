package tsmodels

type NodeRedResponse struct {
	StatusCode int
	Body       string
}

type OpcUaFlowData struct {
	FlowId            string
	EndpointUrl       string
	AddressSpaceItems string
	Interval          float32
}
