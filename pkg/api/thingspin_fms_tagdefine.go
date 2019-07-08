package api

import (
	gfm "github.com/grafana/grafana/pkg/models"

	"fmt"
	m "github.com/grafana/grafana/pkg/models-thingspin"
	"github.com/grafana/grafana/pkg/bus"
	"strconv"
	c "github.com/influxdata/influxdb1-client/v2"
	"github.com/grafana/grafana/pkg/setting"
	//m "github.com/grafana/grafana/pkg/models-thingspin"
	//"reflect"
)

func getAllTsConnectInfo(c *gfm.ReqContext) Response {
	// Get all measurements from FMS_connect
	cmd := m.GetFmsConnectCommand{}
	if err := bus.Dispatch(&cmd); err != nil {
		return Error(500, "[thingspin] Tagdefine get command failed", err)
	}
	
	result := getAllTsTagInfo(cmd.Result)
	return JSON(200, result)
}

func getAllTsTagInfo(conInfo []*m.FmsConnectQueryResult) m.GetFmsTagDefineQuery {
	var influxHost = "http://" + setting.Thingspin.Influx.Host + ":" + strconv.Itoa(setting.Thingspin.Influx.Port)

	cli, err := c.NewHTTPClient(c.HTTPConfig{
		Addr: influxHost,
	})
	if err != nil {
		fmt.Println("Error creating InfluxDB Client: ", err.Error())
	}
	defer cli.Close()
	
	var tagList = []m.TsFacilityTreeItem{}

	// measurements
	lev1Map := make(map[string]m.TsFacilityTreeItem)
	lev2Map := make(map[string]m.TsFacilityTreeItem)

	// Level1 with Level2
	for _, ms := range conInfo {
		if _, ok := lev1Map[ms.Type]; ok {
			//do something here
			lv1 := lev1Map[ms.Type]
			lv1.Children = append(lv1.Children, m.TsFacilityTreeItem{
				FacilityName : ms.Name,
			})
			lev1Map[ms.Type] = lv1
		} else {
			measurements := []m.TsFacilityTreeItem{}
			measurements = append(measurements, m.TsFacilityTreeItem{
				FacilityName : ms.Name,
			})
			lev1Map[ms.Type] = m.TsFacilityTreeItem{
				Label : ms.Type,
				Children : measurements,
			}
		}
		
	}
	order := 0
	// level2 with level3
	for _, ms := range conInfo {
		msName := ms.Type + "_" + strconv.Itoa(ms.Id)
		q := c.NewQuery("SHOW FIELD KEYS ON thingspin from " + msName, "thingspin", "")
		if response, err := cli.Query(q); err == nil && response.Error() == nil {
			if len(response.Results) > 0 {
				result := response.Results[0]
				if  len(result.Series) > 0 {
					serie := result.Series[0]
					values := serie.Values

					for _, v := range values {
						// tag name
						fmt.Println(v)
						order = order + 1
						if _, ok := lev2Map[ms.Name]; ok {
					
							lv2 := lev2Map[ms.Name]
							lv2.Children = append(lv2.Children, m.TsFacilityTreeItem {
								TagTableName : msName,
								TagColumnName : v[0].(string),
								TagColumnType : v[1].(string),
								TagName : v[0].(string),
								FacilityTreeOrder : order,
								Children : []m.TsFacilityTreeItem{},
							})
		
							lev2Map[ms.Name] = lv2
		
						} else {
							tags := []m.TsFacilityTreeItem{}
							tags = append(tags,  m.TsFacilityTreeItem {
								TagTableName : msName,
								TagColumnName : v[0].(string),
								TagColumnType : v[1].(string),
								TagName : v[0].(string),
								FacilityTreeOrder : order,
								Children : []m.TsFacilityTreeItem{},
							})
		
							lev2Map[ms.Name] = m.TsFacilityTreeItem{
								FacilityName : ms.Name,
								Children : tags,
							}
						}
					}	
				}
			}			
		}
	}

	for _, lv1 := range lev1Map {
		for _i, lv2 := range lv1.Children{
			if _, ok := lev2Map[lv2.FacilityName]; ok {
				lv1.Children[_i].Children = lev2Map[lv2.FacilityName].Children
				//lv2.Children = lev2Map[lv2.FacilityName].Children
				//fmt.Println("=-=")
				//fmt.Println(lv2.Children)
			}
			
		}
	}

	for _, node := range lev1Map {
		tagList = append(tagList, node)
	}

	return m.GetFmsTagDefineQuery{
		Result : tagList,
	}
}
