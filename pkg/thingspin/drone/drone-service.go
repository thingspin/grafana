package drone

import (
	"context"
	"encoding/json"
	"io/ioutil"
	"os"
	"path"
	"path/filepath"

	"github.com/go-macaron/binding"
	. "github.com/grafana/grafana/pkg/api"
	"github.com/grafana/grafana/pkg/api/routing"
	httpstatic "github.com/grafana/grafana/pkg/api/static"
	"github.com/grafana/grafana/pkg/infra/log"
	"github.com/grafana/grafana/pkg/middleware"
	"github.com/grafana/grafana/pkg/registry"
	"github.com/grafana/grafana/pkg/setting"
	macaron "gopkg.in/macaron.v1"
)

type config struct {
}

type services struct {
	Project          string   `json:"project,omitempty"`
	Creator          string   `json:"creator,omitempty"`
	Version          string   `json:"version,omitempty"`
	Ignore           bool     `json:"ignore,omitempty"`
	RepogitoryFolder string   `json:"repogitoryFolder,omitempty"`
	BaseFolder       string   `json:"baseFolder,omitempty"`
	Pix4dBase        string   `json:"pix4dBase,omitempty"`
	Config           []config `json:"configs,omitempty"`
}

type DroneService struct {
	log        log.Logger
	root       string
	services   services
	repo       ProjectRepositoryInterface
	Cfg        *setting.Cfg `inject:""`
	HttpServer *HTTPServer  `inject:""`
}

func init() {
	root, err := os.Getwd()
	if err != nil {
		panic("error getting work directory: " + err.Error())
	}

	registry.RegisterService(&DroneService{
		log:  log.New("thingspin.drone-service"),
		root: root,
		repo: &ProjectRepository{},
	})
}

func (s *DroneService) Init() error {
	s.log.Debug("ThingSPIN Drone Service", "working directory", s.root)

	configPath, _ := filepath.Abs(path.Join(s.Cfg.ProvisioningPath, "thingspin-service-drone.json"))
	s.log.Debug("Configurating Drone Service", "Setting file", configPath, "Repo", s.services.RepogitoryFolder)

	file, err := ioutil.ReadFile(configPath)
	if err != nil {
		return err
	}

	var data services
	err = json.Unmarshal(file, &data)
	if err != nil {
		return err
	}

	data.RepogitoryFolder, _ = filepath.Abs(path.Join(s.Cfg.DataPath, "drone", "repo"))
	if _, err := os.Stat(data.RepogitoryFolder); os.IsNotExist(err) {
		err = os.MkdirAll(data.RepogitoryFolder, 0755)
		if err != nil {
			s.log.Error("Configurating Drone Service", "Repogitory creation failed!")
		}
	}

	s.services = data

	s.log.Debug("Configurating Drone Service", "Project", data.Project, "Verion", data.Version)
	if data.Ignore {
		s.log.Debug("Configurating Drone Service", "Setup Ignored.")
		return nil
	}

	return nil
}

func (s *DroneService) Run(ctx context.Context) error {
	// configPath, _ := filepath.Abs(path.Join(s.Cfg.ProvisioningPath, "thingspin-service-drone.json"))
	// s.log.Info("Configurating Drone Service", "Setting file", configPath, "Repo", s.services.RepogitoryFolder)

	// file, err := ioutil.ReadFile(configPath)
	// if err != nil {
	// 	return err
	// }

	// var data services
	// err = json.Unmarshal(file, &data)
	// if err != nil {
	// 	return err
	// }

	// data.RepogitoryFolder, _ = filepath.Abs(path.Join(s.Cfg.DataPath, "drone", "repo"))
	// if _, err := os.Stat(data.RepogitoryFolder); os.IsNotExist(err) {
	// 	err = os.MkdirAll(data.RepogitoryFolder, 0755)
	// 	if err != nil {
	// 		s.log.Error("Configurating Drone Service", "Repogitory creation failed!")
	// 	}
	// }

	// s.services = data

	// s.log.Info("Configurating Drone Service", "Project", data.Project, "Verion", data.Version)
	// if data.Ignore {
	// 	s.log.Debug("Configurating Drone Service", "Setup Ignored.")
	// 	return nil
	// }

	// err = s.initAPI(ctx, data)
	// s.log.Info("Configurating Drone Service", "API Router", "Finished.")
	// if err != nil {
	// 	return err
	// }

	err := s.initAPI(ctx, s.services)
	s.log.Info("Configurating Drone Service", "API Router", "Finished.")
	if err != nil {
		return err
	}

	<-ctx.Done()
	s.log.Error("Stopped API Servers", "reason", "context canceled")
	return ctx.Err()
}

func (s *DroneService) initAPI(ctx context.Context, data services) error {
	hs := s.HttpServer

	reqSignedIn := middleware.ReqSignedIn
	r := hs.RouteRegister
	bind := binding.Bind
	m := hs.GetMacaron()
	handlers := make([]macaron.Handler, 0)
	handlers = append(handlers, middleware.Auth(&middleware.AuthOptions{
		ReqSignedIn: true,
	}))

	headers := func(c *macaron.Context) {
		c.Resp.Header().Set("Cache-Control", "public, max-age=3600")
	}

	m.Use(httpstatic.Static(
		path.Join(data.BaseFolder, ""),
		httpstatic.StaticOptions{
			SkipLogging: true,
			Prefix:      "/pv",
			AddHeaders:  headers,
		},
	))

	r.Group("/api/drone", func(droneAPI routing.RouteRegister) {
		droneAPI.Get("/", hs.Index)
		droneAPI.Get("/projects", reqSignedIn, s.GetProjects)
		droneAPI.Get("/projects/folders", reqSignedIn, s.GetProjectFolders)
		droneAPI.Get("/projects/pix4d/folders", reqSignedIn, s.GetProject3DFolders)

		droneAPI.Group("/project", func(ep routing.RouteRegister) {
			ep.Put("", reqSignedIn, bind(ProjectBook{}), s.CreateProject)
			ep.Put("/", reqSignedIn, bind(ProjectBook{}), s.CreateProject)
			ep.Get("/:id", reqSignedIn, s.GetProjectByID)
			ep.Delete("/:id", reqSignedIn, s.DeleteProjectByID)
		})

		droneAPI.Group("/search", func(ep routing.RouteRegister) {
			ep.Get("/", reqSignedIn, s.SearchDroneAPI)
		})

		droneAPI.Group("/analytics", func(ep routing.RouteRegister) {
			ep.Get("/", reqSignedIn, s.AnalyticsDroneAPI)
		})
	})

	return nil
}
