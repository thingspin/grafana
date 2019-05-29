package plugins

import (
	"net/url"
	"path"
	"strings"

	"github.com/grafana/grafana/pkg/setting"
	"github.com/grafana/grafana/pkg/util"
)

type FrontendPluginBase struct {
	PluginBase
}

func (fp *FrontendPluginBase) initFrontendPlugin() {
	if isExternalPlugin(fp.PluginDir) {
		StaticRoutes = append(StaticRoutes, &PluginStaticRoute{
			Directory: fp.PluginDir,
			PluginId:  fp.Id,
		})
	}

	fp.handleModuleDefaults()

	fp.Info.Logos.Small = getPluginLogoUrl(fp.Type, fp.Info.Logos.Small, fp.BaseUrl)
	fp.Info.Logos.Large = getPluginLogoUrl(fp.Type, fp.Info.Logos.Large, fp.BaseUrl)

	for i := 0; i < len(fp.Info.Screenshots); i++ {
		fp.Info.Screenshots[i].Path = evalRelativePluginUrlPath(fp.Info.Screenshots[i].Path, fp.BaseUrl)
	}
}

func getPluginLogoUrl(pluginType, path, baseUrl string) string {
	if path == "" {
		return "public/img/icn-" + pluginType + ".svg"
	}

	return evalRelativePluginUrlPath(path, baseUrl)
}

func (fp *FrontendPluginBase) setPathsBasedOnApp(app *AppPlugin) {
	appSubPath := strings.Replace(strings.Replace(fp.PluginDir, app.PluginDir, "", 1), "\\", "/", -1)
	fp.IncludedInAppId = app.Id
	fp.BaseUrl = app.BaseUrl

	if isExternalPlugin(app.PluginDir) {
		fp.Module = util.JoinURLFragments("plugins/"+app.Id, appSubPath) + "/module"
	} else if isThingspinPlugin(app.PluginDir) { // ThingSPIN add code ------
		fp.Module = util.JoinURLFragments("app-thingspin-fms/plugins/app/"+app.Id, appSubPath) + "/module"
		// ThingSPIN add code ------
	} else {
		fp.Module = util.JoinURLFragments("app/plugins/app/"+app.Id, appSubPath) + "/module"
	}
}

func (fp *FrontendPluginBase) handleModuleDefaults() {

	if isExternalPlugin(fp.PluginDir) {
		fp.Module = path.Join("plugins", fp.Id, "module")
		fp.BaseUrl = path.Join("public/plugins", fp.Id)
		return
	}

	// ThingSPIN add code ------
	if isThingspinPlugin(fp.PluginDir) {
		fp.IsCorePlugin = true
		fp.Module = path.Join("app-thingspin-fms/plugins", fp.Type, fp.Id, "module")
		fp.BaseUrl = path.Join("public/app-thingspin-fms/plugins", fp.Type, fp.Id)
		return
	}
	// ThingSPIN add code ------

	fp.IsCorePlugin = true
	fp.Module = path.Join("app/plugins", fp.Type, fp.Id, "module")
	fp.BaseUrl = path.Join("public/app/plugins", fp.Type, fp.Id)
}

// ThingSPIN add code ------
func isThingspinPlugin(pluginDir string) bool {
	return strings.Contains(pluginDir, setting.StaticRootPath+"/app-thingspin-fms")
}

// ThingSPIN add code ------

func isExternalPlugin(pluginDir string) bool {
	return !strings.Contains(pluginDir, setting.StaticRootPath)
}

func evalRelativePluginUrlPath(pathStr string, baseUrl string) string {
	if pathStr == "" {
		return ""
	}

	u, _ := url.Parse(pathStr)
	if u.IsAbs() {
		return pathStr
	}
	return path.Join(baseUrl, pathStr)
}
