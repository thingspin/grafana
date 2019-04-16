package thingspin

import (
	"encoding/json"
	"io/ioutil"
	"path"

	"github.com/grafana/grafana/pkg/infra/log"
	m "github.com/grafana/grafana/pkg/models-thingspin"
	"github.com/grafana/grafana/pkg/setting"
)

type InitialMenus struct {
	Project string      `json:"project,omitempty"`
	Creator string      `json:"creator,omitempty"`
	Version string      `json:"version,omitempty"`
	Ignore  bool        `json:"ignore,omitempty"`
	Menus   []m.FmsMenu `json:"menus"`
}

type FmsMenuProvision struct {
	log log.Logger
}

func (s *FmsMenuProvision) GetInitalMenus() ([]m.FmsMenu, error) {
	s.log.Info("Initializin ThingSPIN Menu")

	jsonPath := path.Join(setting.HomePath, "conf", "provisioning", "thingspin-menus.json")
	s.log.Info("Initializin ThingSPIN Menu", "Menu data file", jsonPath)

	file, err := ioutil.ReadFile(jsonPath)
	if err != nil {
		return nil, err
	}

	var data InitialMenus
	err = json.Unmarshal(file, &data)
	if err != nil {
		return nil, err
	}
	s.log.Info("Configurating Initial Menu", "Project", data.Project, "Verion", data.Version)

	for idx, menu := range data.Menus {
		menu.ParentId = -1
		menu.Id = (idx + 1) * 100
		menu.Name = menu.Text
		menu.Order = idx
		//s.log.Info("Configurating Initial Menu", "Level", 1, "IDX", menu.Id, "Name", menu.Name, "Text", menu.Text)

		for i, child := range menu.Children {
			child.ParentId = menu.Id
			child.Id = menu.Id + i + 1
			child.Name = child.Text
			child.Order = i
			//s.log.Info("Configurating API Server", "Level", 2, "IDX", child.Id, "Name", child.Name, "Text", child.Text)
			menu.Children[i] = child
		}

		data.Menus[idx] = menu
	}

	// for _, menu := range data.Menus {
	// 	s.log.Info("Configurating Initial Menu", "Level", 1, "IDX", menu.Id, "Name", menu.Name, "Text", menu.Text)

	// 	for _, child := range menu.Children {
	// 		s.log.Info("Configurating API Server", "Level", 2, "IDX", child.Id, "Name", child.Name, "Text", child.Text)
	// 	}
	// }

	return data.Menus, nil
}
