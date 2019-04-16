package thingspin

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"path"
	"strconv"
	"text/template"
	// "log"

	m "github.com/grafana/grafana/pkg/models-thingspin"
	"github.com/grafana/grafana/pkg/setting"
)

const (
	ContentType = "application/json"
)

func convJsonStr(value interface{}) string {
	switch v := value.(type) {
	case string:
		return v
	case int:
		return strconv.Itoa(v)
	default:
		bytes, err := json.Marshal(value)
		if err != nil {
			return ""
		}
		return string(bytes)

	}
}

func template2Str(str string, info interface{}) (string, error) {
	// convert Template file
	tmpl, err := template.
		New("data connect").
		Funcs(template.FuncMap{
			"convJsonStr": convJsonStr,
		}).
		Parse(str)
	if err != nil {
		return "", err
	}

	var tpl bytes.Buffer
	err = tmpl.Execute(&tpl, info)
	if err != nil {
		return "", err
	}

	return tpl.String(), nil
}

func LoadNodeRedTemplate(filename string, info interface{}) (string, error) {
	// read file
	templateFile := path.Join(setting.HomePath, "conf/node-red", filename+".template.json")
	dat, err := ioutil.ReadFile(templateFile)
	if err != nil {
		return "", err
	}

	str := string(dat)
	if info == nil {
		return str, nil
	}

	return template2Str(str, info)
}

func getNodeRedSettings() (*http.Response, error) {
	u, err := url.Parse(setting.Thingspin.NodeRedHost)
	if err != nil {
		return nil, err
	}

	u.Path = path.Join(u.Path, "settings")
	resp, err := http.Get(u.String())
	if err != nil {
		return nil, err
	}

	return resp, nil
}

func CheckNodeRedRunning() (bool, error) {
	resp, err := getNodeRedSettings()
	if err != nil {
		return false, err
	}

	if resp.StatusCode == 200 {
		return true, nil
	}

	rspBody, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return false, err
	}

	return false, errors.New(string(rspBody))
}

func AddFlowNode(target string, info interface{}) (*m.NodeRedResponse, error) {
	templateStr, err := LoadNodeRedTemplate(target, info)
	if err != nil {
		return nil, err
	}

	u, err := url.Parse(setting.Thingspin.NodeRedHost)
	if err != nil {
		return nil, err
	}
	u.Path = path.Join(u.Path, "flow")
	byteStr := bytes.NewBufferString(templateStr)

	rsp, err := http.Post(u.String(), ContentType, byteStr)
	if err != nil {
		return nil, err
	}

	rspBody, err := ioutil.ReadAll(rsp.Body)
	if err != nil {
		return nil, err
	}

	return &m.NodeRedResponse{
		StatusCode: rsp.StatusCode,
		Body:       rspBody,
	}, nil
}

func RemoveFlowNode(flow_id string) (*m.NodeRedResponse, error) {
	u, err := url.Parse(setting.Thingspin.NodeRedHost)
	if err != nil {
		return nil, err
	}
	u.Path = path.Join(u.Path, "flow", flow_id)

	req, err := http.NewRequest(http.MethodDelete, u.String(), nil)
	if err != nil {
		return nil, err
	}

	cli := &http.Client{}
	resp, err := cli.Do(req)
	if err != nil {
		return nil, err
	}

	rspBody, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	return &m.NodeRedResponse{
		StatusCode: resp.StatusCode,
		Body:       rspBody,
	}, nil
}

func UpdateFlowNode(flow_id string, target string, info interface{}) (*m.NodeRedResponse, error) {
	templateStr, err := LoadNodeRedTemplate(target, info)
	if err != nil {
		return nil, err
	}

	u, err := url.Parse(setting.Thingspin.NodeRedHost)
	if err != nil {
		return nil, err
	}
	u.Path = path.Join(u.Path, "flow", flow_id)
	byteStr := bytes.NewBufferString(templateStr)

	req, err := http.NewRequest(http.MethodPut, u.String(), byteStr)
	if err != nil {
		return nil, err
	}

	cli := &http.Client{}
	resp, err := cli.Do(req)
	if err != nil {
		return nil, err
	}

	respBody, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	return &m.NodeRedResponse{
		StatusCode: resp.StatusCode,
		Body:       respBody,
	}, nil
}

func GetNodeRedModules() (*m.NodeRedResponse, error) {
	u, err := url.Parse(setting.Thingspin.NodeRedHost)
	if err != nil {
		return nil, err
	}
	u.Path = path.Join(u.Path, "nodes")

	rsp, err := http.Get(u.String())
	if err != nil {
		return nil, err
	}

	rspBody, err := ioutil.ReadAll(rsp.Body)
	if err != nil {
		return nil, err
	}

	return &m.NodeRedResponse{
		StatusCode: rsp.StatusCode,
		Body:       string(rspBody),
	}, nil

}

func InstallNodeRedModule(moduleName string) (*m.NodeRedResponse, error) {
	u, err := url.Parse(setting.Thingspin.NodeRedHost)
	if err != nil {
		return nil, err
	}
	u.Path = path.Join(u.Path, "nodes")

	str := fmt.Sprintf(`{ "module": "%s" }`, moduleName)
	payload := bytes.NewBufferString(str)

	rsp, err := http.Post(u.String(), ContentType, payload)
	if err != nil {
		return nil, err
	}

	rspBody, err := ioutil.ReadAll(rsp.Body)
	if err != nil {
		return nil, err
	}

	return &m.NodeRedResponse{
		StatusCode: rsp.StatusCode,
		Body:       string(rspBody),
	}, nil
}
