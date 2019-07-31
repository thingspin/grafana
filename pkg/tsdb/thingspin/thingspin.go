package thingspin

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"path"

	"github.com/grafana/grafana/pkg/infra/log"
	"github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/setting"
	"github.com/grafana/grafana/pkg/tsdb"
	"github.com/grafana/grafana/pkg/tsdb/influxdb"
	"golang.org/x/net/context/ctxhttp"
)

var glog = log.New("tsdb.thingspin")

type ThingspinExecutor struct {
	QueryParser    *ThingspinQueryParser
	ResponseParser *influxdb.ResponseParser
}

func NewThingspinExecutor(datasource *models.DataSource) (tsdb.TsdbQueryEndpoint, error) {
	return &ThingspinExecutor{
		QueryParser:    &ThingspinQueryParser{},
		ResponseParser: &influxdb.ResponseParser{},
	}, nil
}

func init() {
	tsdb.RegisterTsdbQueryEndpoint("thingspin", NewThingspinExecutor)
}

func (e *ThingspinExecutor) Query(ctx context.Context, dsInfo *models.DataSource, tsdbQuery *tsdb.TsdbQuery) (*tsdb.Response, error) {

	// get require query information in jsondata
	query, err := e.getQuery(dsInfo, tsdbQuery.Queries, tsdbQuery)
	if err != nil {
		return nil, err
	}

	// generate influxdb query
	rawQuery, err := query.Build(tsdbQuery)
	if err != nil {
		return nil, err
	}

	if setting.Env == setting.DEV {
		glog.Debug("Influxdb query", "raw query", rawQuery)
	}

	// generate influxdb http request
	req, err := e.createRequest(rawQuery)
	if err != nil {
		return nil, err
	}

	// request HTTP Client from Influxdb Server
	httpClient, err := dsInfo.GetHttpClient()
	if err != nil {
		return nil, err
	}

	// wait(?)
	resp, err := ctxhttp.Do(ctx, httpClient, req)
	if err != nil {
		return nil, err
	}

	defer resp.Body.Close()

	// check response code == 200 ~ 299
	if resp.StatusCode/100 != 2 {
		return nil, fmt.Errorf("Influxdb returned statuscode invalid status code: %v", resp.Status)
	}

	// processing response data
	var response influxdb.Response
	dec := json.NewDecoder(resp.Body)
	dec.UseNumber()
	if err = dec.Decode(&response); err != nil {
		return nil, err
	}

	if response.Err != nil {
		return nil, response.Err
	}

	return &tsdb.Response{
		Results: map[string]*tsdb.QueryResult{
			"A": e.ResponseParser.Parse(&response, query),
		},
	}, nil
}

func (e *ThingspinExecutor) getQuery(dsInfo *models.DataSource, queries []*tsdb.Query, context *tsdb.TsdbQuery) (query *influxdb.Query, err error) {
	// The model supports multiple queries, but right now this is only used from
	// alerting so we only needed to support batch executing 1 query at a time.
	if len(queries) > 0 {
		if query, err = e.QueryParser.Parse(queries[0].Model, dsInfo); err != nil {
			return nil, err
		}
		return query, nil
	}
	return nil, fmt.Errorf("query request contains no queries")
}

func (e *ThingspinExecutor) createRequest(query string) (*http.Request, error) {

	// genderate influxdb host URL
	localDbUrl := fmt.Sprintf("http://%s:%d", setting.Thingspin.Influx.Host, setting.Thingspin.Influx.Port)

	// url parser
	u, _ := url.Parse(localDbUrl) // invalid format
	u.Path = path.Join(u.Path, "query")

	req, err := func() (*http.Request, error) {
		return http.NewRequest(http.MethodGet, u.String(), nil)
	}()

	if err != nil {
		return nil, err
	}

	req.Header.Set("User-Agent", "Grafana")

	params := req.URL.Query()
	params.Set("db", setting.Thingspin.Influx.Database)
	params.Set("epoch", "s")

	params.Set("q", query)

	req.URL.RawQuery = params.Encode()

	glog.Debug("Influxdb request", "url", req.URL.String())
	return req, nil
}
