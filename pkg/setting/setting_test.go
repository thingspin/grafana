package setting

import (
	"os"
	"path"
	"path/filepath"
	"runtime"
	"testing"

	"gopkg.in/ini.v1"

	. "github.com/smartystreets/goconvey/convey"
)

const (
	windows = "windows"
)

func TestLoadingSettings(t *testing.T) {

	Convey("Testing loading settings from ini file", t, func() {
		skipStaticRootValidation = true

		Convey("Given the default ini files", func() {
			cfg := NewCfg()
			err := cfg.Load(&CommandLineArgs{HomePath: "../../"})
			So(err, ShouldBeNil)

			So(AdminUser, ShouldEqual, "admin")
			So(cfg.RendererCallbackUrl, ShouldEqual, "http://localhost:3000/")
		})

		Convey("Should be able to override via environment variables", func() {
			os.Setenv("GF_SECURITY_ADMIN_USER", "superduper")

			cfg := NewCfg()
			cfg.Load(&CommandLineArgs{HomePath: "../../"})

			So(AdminUser, ShouldEqual, "superduper")
			So(cfg.DataPath, ShouldEqual, filepath.Join(HomePath, "data"))
			So(cfg.LogsPath, ShouldEqual, filepath.Join(cfg.DataPath, "log"))
		})

		Convey("Should replace password when defined in environment", func() {
			os.Setenv("GF_SECURITY_ADMIN_PASSWORD", "supersecret")

			cfg := NewCfg()
			cfg.Load(&CommandLineArgs{HomePath: "../../"})

			So(appliedEnvOverrides, ShouldContain, "GF_SECURITY_ADMIN_PASSWORD=*********")
		})

		Convey("Should return an error when url is invalid", func() {
			os.Setenv("GF_DATABASE_URL", "postgres.%31://grafana:secret@postgres:5432/grafana")

			cfg := NewCfg()
			err := cfg.Load(&CommandLineArgs{HomePath: "../../"})

			So(err, ShouldNotBeNil)
		})

		Convey("Should replace password in URL when url environment is defined", func() {
			os.Setenv("GF_DATABASE_URL", "mysql://user:secret@localhost:3306/database")

			cfg := NewCfg()
			cfg.Load(&CommandLineArgs{HomePath: "../../"})

			So(appliedEnvOverrides, ShouldContain, "GF_DATABASE_URL=mysql://user:-redacted-@localhost:3306/database")
		})

		Convey("Should get property map from command line args array", func() {
			props := getCommandLineProperties([]string{"cfg:test=value", "cfg:map.test=1"})

			So(len(props), ShouldEqual, 2)
			So(props["test"], ShouldEqual, "value")
			So(props["map.test"], ShouldEqual, "1")
		})

		Convey("Should be able to override via command line", func() {
			if runtime.GOOS == windows {
				cfg := NewCfg()
				cfg.Load(&CommandLineArgs{
					HomePath: "../../",
					Args:     []string{`cfg:paths.data=c:\tmp\data`, `cfg:paths.logs=c:\tmp\logs`},
				})
				So(cfg.DataPath, ShouldEqual, `c:\tmp\data`)
				So(cfg.LogsPath, ShouldEqual, `c:\tmp\logs`)
			} else {
				cfg := NewCfg()
				cfg.Load(&CommandLineArgs{
					HomePath: "../../",
					Args:     []string{"cfg:paths.data=/tmp/data", "cfg:paths.logs=/tmp/logs"},
				})

				So(cfg.DataPath, ShouldEqual, "/tmp/data")
				So(cfg.LogsPath, ShouldEqual, "/tmp/logs")
			}
		})

		Convey("Should be able to override defaults via command line", func() {
			cfg := NewCfg()
			cfg.Load(&CommandLineArgs{
				HomePath: "../../",
				Args: []string{
					"cfg:default.server.domain=test2",
				},
				Config: filepath.Join(HomePath, "pkg/setting/testdata/override.ini"),
			})

			So(Domain, ShouldEqual, "test2")
		})

		Convey("Defaults can be overridden in specified config file", func() {
			if runtime.GOOS == windows {
				cfg := NewCfg()
				cfg.Load(&CommandLineArgs{
					HomePath: "../../",
					Config:   filepath.Join(HomePath, "pkg/setting/testdata/override_windows.ini"),
					Args:     []string{`cfg:default.paths.data=c:\tmp\data`},
				})

				So(cfg.DataPath, ShouldEqual, `c:\tmp\override`)
			} else {
				cfg := NewCfg()
				cfg.Load(&CommandLineArgs{
					HomePath: "../../",
					Config:   filepath.Join(HomePath, "pkg/setting/testdata/override.ini"),
					Args:     []string{"cfg:default.paths.data=/tmp/data"},
				})

				So(cfg.DataPath, ShouldEqual, "/tmp/override")
			}
		})

		Convey("Command line overrides specified config file", func() {
			if runtime.GOOS == windows {
				cfg := NewCfg()
				cfg.Load(&CommandLineArgs{
					HomePath: "../../",
					Config:   filepath.Join(HomePath, "pkg/setting/testdata/override_windows.ini"),
					Args:     []string{`cfg:paths.data=c:\tmp\data`},
				})

				So(cfg.DataPath, ShouldEqual, `c:\tmp\data`)
			} else {
				cfg := NewCfg()
				cfg.Load(&CommandLineArgs{
					HomePath: "../../",
					Config:   filepath.Join(HomePath, "pkg/setting/testdata/override.ini"),
					Args:     []string{"cfg:paths.data=/tmp/data"},
				})

				So(cfg.DataPath, ShouldEqual, "/tmp/data")
			}
		})

		Convey("Can use environment variables in config values", func() {
			if runtime.GOOS == windows {
				os.Setenv("GF_DATA_PATH", `c:\tmp\env_override`)
				cfg := NewCfg()
				cfg.Load(&CommandLineArgs{
					HomePath: "../../",
					Args:     []string{"cfg:paths.data=${GF_DATA_PATH}"},
				})

				So(cfg.DataPath, ShouldEqual, `c:\tmp\env_override`)
			} else {
				os.Setenv("GF_DATA_PATH", "/tmp/env_override")
				cfg := NewCfg()
				cfg.Load(&CommandLineArgs{
					HomePath: "../../",
					Args:     []string{"cfg:paths.data=${GF_DATA_PATH}"},
				})

				So(cfg.DataPath, ShouldEqual, "/tmp/env_override")
			}
		})

		Convey("instance_name default to hostname even if hostname env is empty", func() {
			cfg := NewCfg()
			cfg.Load(&CommandLineArgs{
				HomePath: "../../",
			})

			hostname, _ := os.Hostname()
			So(InstanceName, ShouldEqual, hostname)
		})

		Convey("Reading callback_url should add trailing slash", func() {
			cfg := NewCfg()
			cfg.Load(&CommandLineArgs{
				HomePath: "../../",
				Args:     []string{"cfg:rendering.callback_url=http://myserver/renderer"},
			})

			So(cfg.RendererCallbackUrl, ShouldEqual, "http://myserver/renderer/")
		})
	})

	Convey("Test reading string values from .ini file", t, func() {

		iniFile, err := ini.Load(path.Join(HomePath, "pkg/setting/testdata/invalid.ini"))
		So(err, ShouldBeNil)

		Convey("If key is found - should return value from ini file", func() {
			value, err := valueAsString(iniFile.Section("server"), "alt_url", "")
			So(err, ShouldBeNil)
			So(value, ShouldEqual, "https://grafana.com/")
		})

		Convey("If key is not found - should return default value", func() {
			value, err := valueAsString(iniFile.Section("server"), "extra_url", "default_url_val")
			So(err, ShouldBeNil)
			So(value, ShouldEqual, "default_url_val")
		})

		Convey("In case of panic - should return user-friendly error", func() {
			value, err := valueAsString(iniFile.Section("server"), "root_url", "")
			So(err.Error(), ShouldEqual, "Invalid value for key 'root_url' in configuration file")
			So(value, ShouldEqual, "")
		})

	})
}
