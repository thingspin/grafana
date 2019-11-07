package api

import (
	"bytes"
	"crypto/tls"
	"encoding/json"
	"time"

	"net"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"os/exec"
	"strconv"
	"strings"

	m "github.com/grafana/grafana/pkg/models"
	tsm "github.com/grafana/grafana/pkg/models-thingspin"
	"github.com/grafana/grafana/pkg/setting"
	"github.com/grafana/grafana/pkg/util"
	"github.com/senseyeio/roger"
	t "github.com/tink-ab/tempfile"
)

// GET /thingspin/analytics/script/R
func GetR(c *m.ReqContext, reqDto tsm.AnalyticsSource) Response {
	var script = reqDto.Script
	u, err := url.Parse(setting.Analytics.R)
	if err != nil {
		return JSON(500, err.Error())
	}

	host, p, err := net.SplitHostPort(u.Host)
	if err != nil {
		return JSON(500, err.Error())
	}

	port, err := strconv.ParseInt(p, 10, 64)
	if err != nil {
		return JSON(500, err.Error())
	}

	rClient, err := roger.NewRClient(host, port)
	if err != nil {
		return JSON(500, err.Error())
	}

	rResult, err := rClient.Eval(script)
	if err != nil {
		return JSON(500, err.Error())
	}

	result := map[string]interface{}{
		"rResult": rResult,
	}

	return JSON(200, result)
}

// POST /thingspin/analytics/script/python
func GetPython(c *m.ReqContext, reqDto tsm.AnalyticsSource) Response {
	var script = reqDto.Script

	content := []byte(script)
	tmpfile, err := t.TempFile(setting.Analytics.DataPath+"/"+setting.Analytics.Services, "analytics_", ".py")
	if err != nil {
		return JSON(500, err.Error())
	}

	defer os.Remove(tmpfile.Name())

	if _, err := tmpfile.Write(content); err != nil {
		return JSON(500, err.Error())
	}
	if err := tmpfile.Close(); err != nil {
		return JSON(500, err.Error())
	}

	cmd := exec.Command("python", tmpfile.Name())

	var stderr bytes.Buffer
	cmd.Stderr = &stderr
	out, err := cmd.Output()

	pythonResult := map[string]interface{}{
		"html":   false,
		"result": "",
	}

	if err != nil {
		pythonResult["result"] = stderr.String()
		return JSON(500, pythonResult)
	}

	var result map[string]interface{}
	err = json.Unmarshal(out, &result)

	if err != nil {
		pythonResult["result"] = string(out)
		pythonResult["html"] = true
	} else {
		pythonResult["result"] = result
	}
	return JSON(200, pythonResult)
}

func TsRevProxyReq(c *m.ReqContext) {
	remotePath := c.Params("*")
	host := setting.Analytics.Jupyter

	remote, _ := url.Parse(host)

	director := func(req *http.Request) {
		req.URL.Scheme = remote.Scheme
		req.URL.Host = remote.Host

		proxyPrefix := strings.Replace(req.URL.Path, remotePath, "", -1)
		targetURI := strings.Replace(req.RequestURI, proxyPrefix, "", -1)
		req.RequestURI = targetURI
		req.URL.Path = util.JoinURLFragments(remote.Path, remotePath)

		req.Header.Del("Cookie")
		req.Header.Del("Set-Cookie")
	}

	proxy := &httputil.ReverseProxy{
		Director: director,
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
			Proxy:           http.ProxyFromEnvironment,
			Dial: (&net.Dialer{
				Timeout:   20 * time.Second,
				KeepAlive: 60 * time.Second,
			}).Dial,
			TLSHandshakeTimeout: 4 * time.Second,
		},
		ModifyResponse: func(resp *http.Response) error {
			return nil
		},
	}

	proxy.ServeHTTP(c.Resp, c.Req.Request)
}
