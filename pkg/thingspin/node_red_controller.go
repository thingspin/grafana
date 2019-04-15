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
	NodeRedHost = `http://localhost:1880`
	ContentType = "application/json"
)

func convJsonStr(value interface{}) string {
	fmt.Println(value)
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
