package setting

var (
	Analytics AnalyticsSettings
)

//===========================================================================================================
// A AnalyticsSettings ...
//===========================================================================================================
type AnalyticsSettings struct {
	Enabled  bool
	DataPath string
	R        string `json:"R.server.url"`
	Jupyter  string `json:"jupyter"`
	Services string `json:"services"`
}

func (cfg *Cfg) readAnalyticsSettings() {
	sec := TsRaw.Section("analytics")

	Analytics.DataPath = cfg.DataPath
	Analytics.Enabled = sec.Key("enabled").MustBool(false)

	Analytics.R = sec.Key("R.server.url").MustString("")
	Analytics.Jupyter = sec.Key("jupyter").MustString("")
	Analytics.Services = sec.Key("services").MustString("thingspin/services")
}
