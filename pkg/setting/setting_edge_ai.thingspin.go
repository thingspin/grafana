package setting

var (
	EdgeAi EdgeAiSettings
)

//===========================================================================================================
// A AssetSettings ...
//===========================================================================================================
type EdgeAiSettings struct {
	Enabled     bool
	EdgeAi      string `json:"ml"`
	Data        string `json:"mlData"`
	Model       string `json:"mlModel"`
	ModelData   string `json:"mlModelData"`
	ModelScript string `json:"mlModelScript"`
	ModelJudge  string `json:"mlModelJudge"`
}

func (cfg *Cfg) readEdgeAiSettings() {
	sec := TsRaw.Section("edgeai")

	EdgeAi.Enabled = sec.Key("enabled").MustBool(false)

	EdgeAi.EdgeAi = sec.Key("edgeai").MustString("thingspin/ml")

	EdgeAi.Data = sec.Key("edgeai.data").MustString("thingspin/jupyter/data")
	EdgeAi.Model = sec.Key("edgeai.model").MustString("thingspin/jupyter/model")
	EdgeAi.ModelData = sec.Key("edgeai.model.meta").MustString("thingspin/jupyter/model-meta")
	EdgeAi.ModelScript = sec.Key("edgeai.model.script").MustString("thingspin/jupyter/model-script")
	EdgeAi.ModelJudge = sec.Key("edgeai.model.judge").MustString("thingspin/jupyter/model-judge")

}
