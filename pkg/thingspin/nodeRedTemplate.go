package thingspin

import (
	"bytes"
	"io/ioutil"
	"path"
	"text/template"

	"github.com/grafana/grafana/pkg/setting"
)

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
