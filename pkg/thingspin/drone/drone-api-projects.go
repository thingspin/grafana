package drone

import (
	"encoding/json"
	"io/ioutil"
	"os"
	"path"
	"path/filepath"
	"time"

	u "github.com/unknwon/com"
	. "github.com/grafana/grafana/pkg/models"
	. "github.com/grafana/grafana/pkg/util"
)

type ProjectFolderInfo struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	Path string `json:"path"`
}

type ProjectBook struct {
	ID      string `json:"id,omitempty"`
	Name    string `json:"name"`
	Site    string `json:"site,omitempty"`
	Pilot   string `json:"pilot,omitempty"`
	Comment string `json:"comment,omitempty"`

	FolderId string `json:"folderID,omitempty"`

	OrgId  int64 `json:"orgId,omitempty"`
	UserId int64 `json:"userId,omitempty"`

	Longitude float64 `json:"lon,omitempty"`
	Latitude  float64 `json:"lat,omitempty"`

	Begin time.Time `json:"begin,omitempty"`
	End   time.Time `json:"end,omitempty"`

	Created time.Time `json:"created,omitempty"`
	Updated time.Time `json:"updated,omitempty"`
}

type ProjectRepositoryInterface interface {
	Save(item *ProjectBook, base string) error
	Update(item *ProjectBook) error
	Find(query *ProjectFolderInfo) ([]*ProjectFolderInfo, error)
	Delete(params *ProjectBook) error
}

type ProjectRepository struct {
}

//==================================================================================
// Project Repository
//==================================================================================
func (s *ProjectRepository) Save(pro *ProjectBook, base string) error {
	data, err := json.MarshalIndent(pro, "", " ")
	if err != nil {
		return err
	}

	fn := "flight-" + pro.ID + ".json"
	path := path.Join(base, fn)

	err = u.WriteFile(path, data)

	return err
}

func (s *ProjectRepository) Update(pro *ProjectBook) error {
	return nil
}

func (s *ProjectRepository) Find(pro *ProjectFolderInfo) ([]*ProjectFolderInfo, error) {
	return nil, nil
}

func (s *ProjectRepository) Delete(pro *ProjectBook) error {
	return nil
}

//==================================================================================
// Project API
//==================================================================================
func (s *DroneService) GetProjects(c *ReqContext) {
	projects := map[string]ProjectBook{}

	base := s.services.RepogitoryFolder
	files, err := ioutil.ReadDir(base)
	if err != nil {
		c.JSON(200, DynMap{
			"state": "error",
			"desc":  "Repogitory scan failed!",
			"error": err,
			"repo":  base,
		})
		return
	}

	for _, f := range files {
		if f.IsDir() {
			continue
		}

		path, err := filepath.Abs(path.Join(base, f.Name()))
		if err != nil {
			continue
		}

		data := ProjectBook{}
		file, _ := ioutil.ReadFile(path)
		err = json.Unmarshal([]byte(file), &data)
		if err != nil {
			continue
		}

		projects[data.ID] = data
	}

	c.JSON(200, projects)
}

func (s *DroneService) CreateProject(c *ReqContext, book ProjectBook) {
	book.ID = GenerateShortUID()

	if book.Created.IsZero() {
		book.Created = time.Now()
		book.Updated = time.Now()
	}
	if book.Updated.IsZero() {
		book.Updated = time.Now()
	}

	if book.Begin.IsZero() {
		book.Begin = time.Now()
		book.End = time.Now()
	}
	if book.End.IsZero() {
		book.End = time.Now()
	}

	base := s.services.RepogitoryFolder

	err := s.repo.Save(&book, base)
	if err != nil {
		c.JSON(400, DynMap{
			"state": "Project creation failed!",
			"error": err,
		})
		return
	} else {
		c.JSON(200, book)
		return
	}
}

func (s *DroneService) GetProjectFolders(c *ReqContext) {
	folders := map[string]ProjectFolderInfo{}
	pix4d := map[string]ProjectFolderInfo{}

	base := s.services.BaseFolder
	files, err := ioutil.ReadDir(base)
	if err != nil {
		return
	}

	for _, f := range files {
		if f.IsDir() {
			if f.Name() == "repo" {
				continue
			}
			path, err := filepath.Abs(path.Join(base, f.Name()))
			if err != nil {
				continue
			}
			p := ProjectFolderInfo{
				ID:   GenerateShortUID(),
				Name: f.Name(),
				Path: path,
			}

			folders[f.Name()] = p
		}
	}

	base, err = filepath.Abs(s.services.Pix4dBase)
	files, err = ioutil.ReadDir(base)
	if err != nil {
		return
	}

	for _, f := range files {
		if f.IsDir() {
			path, err := filepath.Abs(path.Join(base, f.Name()))
			if err != nil {
				continue
			}
			p := ProjectFolderInfo{
				ID:   GenerateShortUID(),
				Name: f.Name(),
				Path: path,
			}

			pix4d[f.Name()] = p
		}
	}

	c.JSON(200, DynMap{
		"store": folders,
		"pix4d": pix4d,
	})
}

func (s *DroneService) GetProject3DFolders(c *ReqContext) {
	folders := map[string]ProjectFolderInfo{}

	base, err := filepath.Abs(s.services.Pix4dBase)
	files, err := ioutil.ReadDir(base)
	if err != nil {
		return
	}

	for _, f := range files {
		if f.IsDir() {
			path, err := filepath.Abs(path.Join(base, f.Name()))
			if err != nil {
				continue
			}
			p := ProjectFolderInfo{
				ID:   GenerateShortUID(),
				Name: f.Name(),
				Path: path,
			}

			folders[p.ID] = p
		}
	}

	c.JSON(200, folders)
}

func (s *DroneService) GetFilesystemFolders(c *ReqContext) {

	folderFoundOnDisk := map[string]os.FileInfo{}

	err := filepath.Walk(s.services.BaseFolder, createWalkFn(folderFoundOnDisk))
	if err != nil {
		c.JSON(200, DynMap{
			"api":   "GetFilesystemFolders",
			"state": "cannot handle",
			"base":  s.services.BaseFolder,
			"error": err,
		})
		return
	}

	c.JSON(200, folderFoundOnDisk)
}

func (s *DroneService) GetProjectByID(c *ReqContext) {
	id := c.Params(":id")

	s.log.Info("search " + id)

	base := s.services.RepogitoryFolder
	fn := "flight-" + id + ".json"
	path, _ := filepath.Abs(path.Join(base, fn))

	data := ProjectBook{}
	file, _ := ioutil.ReadFile(path)
	_ = json.Unmarshal([]byte(file), &data)

	c.JSON(200, data)
}

func (s *DroneService) DeleteProjectByID(c *ReqContext) {
	id := c.Params(":id")

	base := s.services.RepogitoryFolder
	fn := "flight-" + id + ".json"
	path, _ := filepath.Abs(path.Join(base, fn))

	err := os.Remove(path)

	if err != nil {
		c.JSON(200, DynMap{
			"state": "error",
			"id":    id,
			"desc":  "Cannot delete project: [" + id + "]",
			"error": err,
		})
		return
	}

	c.JSON(200, DynMap{
		"state": "ok",
		"id":    id,
		"desc":  "project [" + id + "] removed from repogitory.",
	})
}

func createWalkFn(filesOnDisk map[string]os.FileInfo) filepath.WalkFunc {
	return func(path string, fileInfo os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		isValid, err := validateWalkablePath(fileInfo)
		if !isValid {
			return nil
		}

		filesOnDisk[path] = fileInfo
		return nil
	}
}

func validateWalkablePath(fileInfo os.FileInfo) (bool, error) {
	if fileInfo.IsDir() {
		return true, nil
	}

	return false, nil
}
