package microsvcs

import (
	"context"
	"io/ioutil"
	"path"

	"encoding/json"

	api "github.com/grafana/grafana/pkg/api"
	"github.com/grafana/grafana/pkg/log"
	m "github.com/grafana/grafana/pkg/models"
	plugins "github.com/grafana/grafana/pkg/plugins"
	"github.com/grafana/grafana/pkg/registry"
	"github.com/grafana/grafana/pkg/setting"
	macaron "gopkg.in/macaron.v1"
)

type server struct {
	Name    string                         `json:"name"`
	API     string                         `json:"api"`
	Enable  bool                           `json:"enable"`
	URL     string                         `json:"url"`
	Run     bool                           `json:"run,omitempty"`
	Shell   string                         `json:"path,omitempty"`
	Cmd     string                         `json:"cmd,omitempty"`
	ReqRole m.RoleType                     `json:"role,omitempty"`
	Headers []plugins.AppPluginRouteHeader `json:"headers,omitempty"`
}

type services struct {
	Project string   `json:"project,omitempty"`
	Creator string   `json:"creator,omitempty"`
	Version string   `json:"version,omitempty"`
	Ignore  bool     `json:"ignore,omitempty"`
	Servers []server `json:"servers,omitempty"`
}

type MicroService struct {
	log        log.Logger
	Cfg        *setting.Cfg    `inject:""`
	HttpServer *api.HTTPServer `inject:""`
}

func init() {
	registry.RegisterService(&MicroService{})
}

func (s *MicroService) Init() error {
	s.log = log.New("microsvcs")
	return nil
}

func (s *MicroService) Run(ctx context.Context) error {

	jsonPath := path.Join(s.Cfg.ProvisioningPath, "api-servers.json")
	s.log.Debug("Micro Service", "API Server Setting from", jsonPath)

	file, err := ioutil.ReadFile(jsonPath)
	if err != nil {
		return err
	}

	var data services
	err = json.Unmarshal(file, &data)
	if err != nil {
		return err
	}

	s.log.Info("Micro Service", "API Server", data.Project, "Verion", data.Version)

	if data.Ignore {
		s.log.Debug("Micro Service", "API Server", "Ignored.")
		return nil
	}

	s.log.Debug("Micro Service", "API Server List", data.Servers)

	for _, item := range data.Servers {
		s.log.Info("Micro Service", "API Server", item.Name, "URL", item.URL, "API", item.API)
	}

	h := &HTTPServerExt{s.log, s.HttpServer}
	m := macaron.New()
	h.initAPIServerRoutes(m, data.Servers)

	<-ctx.Done()
	s.log.Error("Micro Service", "API Server sutting down", "END")
	return ctx.Err()
}
