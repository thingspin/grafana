package setting

var (
	Thingspin ThingspinSettings
)

type ThingspinSettings struct {
	Enabled bool
}

func (cfg *Cfg) readThingspinSettings() {
	sec := cfg.Raw.Section("thingspin")
	Thingspin.Enabled = sec.Key("enabled").MustBool(true)

	cfg.Thingspin = Thingspin
}
