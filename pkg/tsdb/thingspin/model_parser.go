package thingspin

import (
	"fmt"
	"strconv"
	"time"

	"github.com/grafana/grafana/pkg/components/simplejson"
	"github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/tsdb"
	"github.com/grafana/grafana/pkg/tsdb/influxdb"
)

// costomized tsdb.influxdb(model_parser.go) InfluxQueryParser struct
type ThingspinQueryParser struct {
}

// costomized tsdb.influxdb(model_parser.go) Parse method
func (qp *ThingspinQueryParser) Parse(model *simplejson.Json, dsInfo *models.DataSource) (query *influxdb.Query, err error) {
	var (
		measurement    string
		groupBys       []*influxdb.QueryPart
		selects        []*influxdb.Select
		parsedInterval time.Duration
		tags           []*influxdb.Tag
	)

	if groupBys, err = qp.parseGroupBy(model); err != nil {
		return nil, err
	}

	if selects, measurement, err = qp.parseSelects(model); err != nil {
		return nil, err
	}

	if parsedInterval, err = tsdb.GetIntervalFrom(dsInfo, model, time.Millisecond*1); err != nil {
		return nil, err
	}

	query = &influxdb.Query{
		Measurement:  measurement,
		Policy:       "default",
		ResultFormat: "time_series",
		GroupBy:      groupBys,
		Tags:         tags,
		Selects:      selects,
		RawQuery:     "",
		Interval:     parsedInterval,
		Alias:        "$col",
		UseRawQuery:  false,
		Tz:           "",
	}

	return query, nil
}

// costomized tsdb.influxdb(model_parser.go) parseGroupBy method
func (qp *ThingspinQueryParser) parseGroupBy(model *simplejson.Json) (result []*influxdb.QueryPart, err error) {
	var (
		groupJson *simplejson.Json
		queryPart *influxdb.QueryPart
		jsonStr   string = `{
			"type": "time",
			"params": ["$__interval"]	
		}`
	)

	if groupJson, err = simplejson.NewJson([]byte(jsonStr)); err != nil {
		return nil, err
	}

	if queryPart, err = qp.parseQueryPart(groupJson); err != nil {
		return nil, err
	}

	result = append(result, queryPart)

	return result, nil
}

// costomized tsdb.influxdb(model_parser.go) parseSelects method
func (qp *ThingspinQueryParser) parseSelects(model *simplejson.Json) (result []*influxdb.Select, measurement string, err error) {
	var (
		selectJson   *simplejson.Json
		convJson     *simplejson.Json
		jsonTemplate string = `[
			{ "type": "field", "params": ["%s"] },
			{ "type": "mean",  "params": [] },
			{ "type": "alias", "params": ["%s"] }
		]`
	)
	for _, selectObj := range model.Get("tagNodes").MustArray() {
		selectJson = simplejson.NewFromAny(selectObj)
		measurement = selectJson.Get("tag_table_name").MustString("")
		columnName := selectJson.Get("tag_column_name").MustString("")
		aliasName := selectJson.Get("tag_name").MustString("")

		if convJson, err = simplejson.NewJson([]byte(fmt.Sprintf(jsonTemplate, columnName, aliasName))); err != nil {
			return nil, "", err
		}

		var (
			parts     influxdb.Select
			part      *simplejson.Json
			queryPart *influxdb.QueryPart
		)
		for _, partObj := range convJson.MustArray() {
			part = simplejson.NewFromAny(partObj)

			if queryPart, err = qp.parseQueryPart(part); err != nil {
				return nil, "", err
			}

			parts = append(parts, *queryPart)
		}

		result = append(result, &parts)
	}

	return result, measurement, nil
}

// copied to tsdb.influxdb(model_parser.go) parseQueryPart method
func (*ThingspinQueryParser) parseQueryPart(model *simplejson.Json) (qp *influxdb.QueryPart, err error) {
	typ, err := model.Get("type").String()
	if err != nil {
		return nil, err
	}

	var (
		params      []string
		stringParam string
		intParam    int
	)
	for _, paramObj := range model.Get("params").MustArray() {
		param := simplejson.NewFromAny(paramObj)

		// if param == string
		if stringParam, err = param.String(); err == nil {
			params = append(params, stringParam)
			continue
		}

		// if param == integer
		if intParam, err = param.Int(); err == nil {
			params = append(params, strconv.Itoa(intParam))
			continue
		}

		// otherwise
		return nil, err
	}

	if qp, err = influxdb.NewQueryPart(typ, params); err != nil {
		return nil, err
	}

	return qp, nil
}
