package setting

import (
	"fmt"
	"os"
	"path"

	"github.com/grafana/grafana/pkg/util"
	ini "gopkg.in/ini.v1"
)

var (
	Thingspin  ThingspinSettings
	TsRaw      *ini.File
	TsInitPath = "conf/defaults_thingspin.ini"
)

type ThingspinSettings struct {
	Enabled           bool
	NodeRedHost       string
	NodeRedModuleList []string
}

func (cfg *Cfg) loadTsIniFile() error {
	// load config defaults
	defaultTsConfigFile := path.Join(HomePath, TsInitPath)
	configFiles = append(configFiles, defaultTsConfigFile)

	// check if config file exists
	if _, err := os.Stat(defaultTsConfigFile); os.IsNotExist(err) {
		fmt.Println("Grafana-server Init Failed: Could not find config defaults, make sure homepath command line parameter is set or working directory is homepath")
		os.Exit(1)
	}

	// load defaults
	parsedFile, err := ini.Load(defaultTsConfigFile)
	if err != nil {
		fmt.Println(fmt.Sprintf("Failed to parse defaults_thingspin.ini, %v", err))
		os.Exit(1)
		return err
	}

	TsRaw = parsedFile

	return nil
}

func (cfg *Cfg) readThingspinSettings() {
	cfg.loadTsIniFile()

	sec := TsRaw.Section("thingspin")
	Thingspin.Enabled = sec.Key("enabled").MustBool(true)

	nrSec := TsRaw.Section("node-red")
	Thingspin.NodeRedHost = nrSec.Key("host").String()

	for _, module := range util.SplitString(nrSec.Key("modules").String()) {
		Thingspin.NodeRedModuleList = append(Thingspin.NodeRedModuleList, module)
	}

	cfg.Thingspin = Thingspin
}
