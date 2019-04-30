package microsvcs

import (
	"context"
	"encoding/json"
	"io/ioutil"
	"os"
	"os/exec"
	"path"
	"path/filepath"

	api "github.com/grafana/grafana/pkg/api"
	"github.com/grafana/grafana/pkg/log"
	m "github.com/grafana/grafana/pkg/models"
	plugins "github.com/grafana/grafana/pkg/plugins"
	"github.com/grafana/grafana/pkg/registry"
	"github.com/grafana/grafana/pkg/setting"
)

type server struct {
	Name      string                         `json:"name"`
	API       string                         `json:"api"`
	Enable    bool                           `json:"enable"`
	URL       string                         `json:"url"`
	Run       bool                           `json:"run,omitempty"`
	AttachURL bool                           `json:"attachURL,omitempty"`
	Shell     string                         `json:"shell,omitempty"`
	Pwd       string                         `json:"pwd,omitempty"`
	Cmd       string                         `json:"cmd,omitempty"`
	Params    string                         `json:"params,omitempty"`
	Options   string                         `json:"options,omitempty"`
	ReqRole   m.RoleType                     `json:"role,omitempty"`
	Headers   []plugins.AppPluginRouteHeader `json:"headers,omitempty"`
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
	root       string
	Cfg        *setting.Cfg    `inject:""`
	HttpServer *api.HTTPServer `inject:""`
}

func init() {
	root, err := os.Getwd()
	if err != nil {
		panic("error getting work directory: " + err.Error())
	}

	registry.RegisterService(&MicroService{
		log:  log.New("thingspin.api-server"),
		root: root,
	})
}

func (s *MicroService) Init() error {
	//s.log = log.New("api.server")
	s.log.Debug("API Server", "working directory", s.root)
	return nil
}

func (s *MicroService) Run(ctx context.Context) error {

	jsonPath := path.Join(s.Cfg.ProvisioningPath, "api-servers.json")
	s.log.Debug("Configurating API Server", "Setting file", jsonPath)

	file, err := ioutil.ReadFile(jsonPath)
	if err != nil {
		return err
	}

	var data services
	err = json.Unmarshal(file, &data)
	if err != nil {
		return err
	}

	s.log.Info("Configurating API Server", "Project", data.Project, "Verion", data.Version)

	if data.Ignore {
		s.log.Debug("Configurating API Server", "Setup Ignored.")
		return nil
	}

	for _, item := range data.Servers {
		if !item.Enable {
			continue
		}

		if !item.Run {
			continue
		}

		s.log.Info("API Server Invoke", "Name", item.Name, "URL", item.URL, "API", item.API)

		if !filepath.IsAbs(item.Pwd) {
			item.Pwd = filepath.Join(s.root, item.Pwd)
		}

		path := filepath.Join(item.Pwd, item.Cmd)
		params := item.Params
		options := item.Options
		cmd := exec.Command(item.Shell, path, params, options)
		cmd.Dir = filepath.Join(item.Pwd, "")
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr

		s.log.Debug("API Server: file-path : " + path)
		s.log.Debug("API Server: shell : " + item.Shell)
		s.log.Debug("API Server: Dir : " + cmd.Dir)

		go func(s server, log log.Logger) error {
			err := cmd.Start()
			if err != nil {
				log.Error("API Server start failed", "Server", s.Name, "Error", err)
				return err
			}

			err = cmd.Wait()
			log.Info("Closed API Server", "Server", s.Name)

			return nil
		}(item, s.log)
	}

	h := &HTTPServerExt{s.log, s.HttpServer, data.Servers}
	m := s.HttpServer.GetMacaron()

	h.initAPIServerRoutes(m)

	<-ctx.Done()
	s.log.Error("Stopped API Servers", "reason", "context canceled")
	return ctx.Err()
}
