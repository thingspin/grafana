package setting

var (
	Assets AssetSettings
)

//===========================================================================================================
// A AssetSettings ...
//===========================================================================================================
type AssetSettings struct {
	Enabled  bool
	Logging  bool
	Services string `json:"services"`
	Images   string `json:"images"`
}

func (cfg *Cfg) readAssetSettings() {
	sec := TsRaw.Section("assets")

	Assets.Enabled = sec.Key("enabled").MustBool(false)
	Assets.Logging = sec.Key("logging").MustBool(false)
	Assets.Images = sec.Key("images").MustString("thingspin/images")
	Assets.Services = sec.Key("services").MustString("thingspin/services")
}
