package thingspin

import (
	"bytes"
	"io/ioutil"
	"net/http"
	"path"
	"text/template"

	m "github.com/grafana/grafana/pkg/models-thingspin"
	"github.com/grafana/grafana/pkg/setting"
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

func AddFlowNode(target string, info interface{}) (m.AddFlowResp, error) {
	templateStr, err := LoadNodeRedTemplate(target, info)
	if err != nil {
		return m.AddFlowResp{}, err
	}

	byteStr := bytes.NewBufferString(templateStr)
	rsp, err := http.Post("http://localhost:1880/flow", "application/json", byteStr)
	if err != nil {
		return m.AddFlowResp{}, err
	}

	rspBody, err := ioutil.ReadAll(rsp.Body)
	if err != nil {
		return m.AddFlowResp{}, err
	}

	return m.AddFlowResp{
		StatusCode: rsp.StatusCode,
		Body:       rspBody,
	}, nil
}
