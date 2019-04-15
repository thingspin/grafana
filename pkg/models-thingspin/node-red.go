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

type MqttFlowData struct {
	FlowId			string
	Topic			string
	MqttUrl			string
	MqttPort		string
}