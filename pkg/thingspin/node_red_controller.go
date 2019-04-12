package thingspin

import (
	"bytes"
	"errors"
	"io/ioutil"
	"net/http"
	"net/url"
	"path"
	"text/template"

	m "github.com/grafana/grafana/pkg/models-thingspin"
	"github.com/grafana/grafana/pkg/setting"
)

const (
	NodeRedHost = `http://localhost:1880`
	ContentType = "application/json"
)

func template2Str(str string, info interface{}) (string, error) {
	// convert Template file
	tmpl, err := template.New("stream").Parse(str)
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
	templateFile := path.Join(setting.HomePath, "conf/node-red", filename+".json")
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
	u, err := url.Parse(NodeRedHost)
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

	u, err := url.Parse(NodeRedHost)
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
		Body:       string(rspBody),
	}, nil
}
