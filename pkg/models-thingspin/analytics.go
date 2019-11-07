package tsmodels

type AnalyticsSource struct {
	SignalNames []string    `json:"signalNames"`
	Signals     [][]float64 `json:"signals"`
	Script      string      `json:"script"`
}
