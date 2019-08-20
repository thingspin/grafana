package api

import (
	gfm "github.com/grafana/grafana/pkg/models"
	//"encoding/json"
	//"fmt"
	m "github.com/grafana/grafana/pkg/models-thingspin"
	"github.com/grafana/grafana/pkg/bus"
	"strconv"
	influx "github.com/influxdata/influxdb1-client/v2"
	"github.com/grafana/grafana/pkg/setting"
	"sort"
	//m "github.com/grafana/grafana/pkg/models-thingspin"
	//"reflect"
)

// For graph
func getTsPtag(c *gfm.ReqContext) Response {
	uid := 1
	connId := c.ParamsInt(":id")

	var influxHost = "http://" + setting.Thingspin.Influx.Host + ":" + strconv.Itoa(setting.Thingspin.Influx.Port)

	cli, err := influx.NewHTTPClient(influx.HTTPConfig{
		Addr: influxHost,
	})
	if err != nil {
		return Error(500, "ThingSPIN Store Error", err)
	}
	defer cli.Close()
	
	var tagList = []m.TsFacilityTreeItem{}
	lev2Map := make(map[string]m.TsFacilityTreeItem)

	conn := m.GetTsConnectQuery{
		Id: connId,
	}

	if err := bus.Dispatch(&conn); err != nil {
		return Error(500, "ThingSPIN Store Error", err)
	}

	for _, ptag := range conn.Result.Params["PtagList"].([]interface{}) {
		ptagMap := ptag.(map[string]interface{})
		msname := conn.Result.Type + "_" + strconv.Itoa(conn.Result.Id)
		if _, ok := lev2Map[conn.Result.Name]; ok {
			// 이미 존재하는 것은 추가하지 않는다.
			lv2 := lev2Map[conn.Result.Name]
			
			lv2.Children = append(lv2.Children, m.TsFacilityTreeItem {
				IsPtag : true,
				IsValid : true,
				TagId: 1,
				TagTableName : msname,
				TagColumnName : ptagMap["name"].(string),
				TagColumnType : ptagMap["type"].(string),
				TagName : ptagMap["name"].(string),
				FacilityTreeOrder : len(lv2.Children) + 1,
				Value: strconv.Itoa(uid),
				Label : ptagMap["name"].(string),
				Children : []m.TsFacilityTreeItem{},
			})
			uid = uid + 1
			lev2Map[conn.Result.Name] = lv2
			
		} else {
			tags := []m.TsFacilityTreeItem{}
			tags = append(tags,  m.TsFacilityTreeItem {
				IsPtag : true,
				IsValid : true,
				TagId: 1,
				TagTableName : msname,
				TagColumnName : ptagMap["name"].(string),
				TagColumnType : ptagMap["type"].(string),
				TagName : ptagMap["name"].(string),
				FacilityTreeOrder : 1,
				Value: strconv.Itoa(uid),
				Label : ptagMap["name"].(string),
				Children : []m.TsFacilityTreeItem{},
			})
			uid = uid + 1
			lev2Map[conn.Result.Name] = m.TsFacilityTreeItem{
				IsPtag : true,
				IsValid : true,
				FacilityName : conn.Result.Name,
				Children : tags,
				Value: strconv.Itoa(uid),
				Label : conn.Result.Name,
				TagId: 0,
			}
			uid = uid + 1
		}
	}

	msName := conn.Result.Type + "_" + strconv.Itoa(conn.Result.Id)
	q := influx.NewQuery("SHOW FIELD KEYS ON thingspin from " + msName, "thingspin", "")
	if response, err := cli.Query(q); err == nil && response.Error() == nil {
		if len(response.Results) > 0 {
			result := response.Results[0]
			if  len(result.Series) > 0 {
				serie := result.Series[0]
				values := serie.Values
				for _, v := range values {
					if _, ok := lev2Map[conn.Result.Name]; ok {
						lv2 := lev2Map[conn.Result.Name]
						hasCheck := false
						for _, lv2Ch := range lv2.Children {
							if lv2Ch.TagColumnName == v[0].(string) {
								hasCheck = true
								break
							}
						}
						// 히스토리 태그
						if !hasCheck {
							lv2.Children = append(lv2.Children, m.TsFacilityTreeItem {
								IsPtag : true,
								IsValid : false,
								TagId: 1,
								TagTableName : msName,
								TagColumnName : v[0].(string),
								TagColumnType : v[1].(string),
								TagName : v[0].(string),
								Value: strconv.Itoa(uid),
								FacilityTreeOrder : len(lv2.Children) + 1,
								Children : []m.TsFacilityTreeItem{},
							})
							uid = uid + 1
						}
						lev2Map[conn.Result.Name] = lv2
	
					}
				}	
			}
		}	
	}		

	for _, node := range lev2Map {
		tagList = append(tagList, node)
	}

	return JSON(200, tagList)
}

func getAllTsConnectName(c *gfm.ReqContext) Response {
	q := m.GetAllTsConnectNameQuery{}

	if err := bus.Dispatch(&q); err != nil {
		return Error(500, "ThingSPIN Store Error", err)
	}

	return JSON(200, q.Result)
}


// For tree
func getAllTsConnectInfo(c *gfm.ReqContext) Response {
	// Get all measurements from FMS_connect
	cmd := m.GetFmsConnectCommand{}
	if err := bus.Dispatch(&cmd); err != nil {
		return Error(500, "[thingspin] Tagdefine get command failed", err)
	}
	
	err, result := getAllTsTagInfo(cmd.Result)
	if err != nil {
		return Error(500, "[thingspin] Tagdefine get command failed", err)
	}
	return JSON(200, result)
}

func getAllTsTagInfo(conInfo []*m.FmsConnectQueryResult) (error, *m.GetFmsTagDefineQuery) {
	var influxHost = "http://" + setting.Thingspin.Influx.Host + ":" + strconv.Itoa(setting.Thingspin.Influx.Port)

	cli, err := influx.NewHTTPClient(influx.HTTPConfig{
		Addr: influxHost,
	})
	if err != nil {
		return err, nil
	}
	defer cli.Close()
	
	var tagList = []m.TsFacilityTreeItem{}

	// measurements
	// lev1Map := make(map[string]m.TsFacilityTreeItem)
	lev2Map := make(map[string]m.TsFacilityTreeItem)

	// Level1 with Level2
	// for _, ms := range conInfo {
	// 	if _, ok := lev1Map[ms.Type]; ok {
	// 		//do something here
	// 		lv1 := lev1Map[ms.Type]
	// 		lv1.Children = append(lv1.Children, m.TsFacilityTreeItem{
	// 			FacilityName : ms.Name,
	// 		})
	// 		lev1Map[ms.Type] = lv1
	// 	} else {
	// 		measurements := []m.TsFacilityTreeItem{}
	// 		measurements = append(measurements, m.TsFacilityTreeItem{
	// 			FacilityName : ms.Name,
	// 		})
	// 		lev1Map[ms.Type] = m.TsFacilityTreeItem{
	// 			Label : ms.Type,
	// 			Children : measurements,
	// 		}
	// 	}
	// }

	// Query Ptaglist from Connect table
	q := m.GetAllTsConnectQuery{}
	if err := bus.Dispatch(&q); err != nil {
		return err, nil
	}
	
	forder := 0
	//fmt.Println(q.Result)
	for _, cnode := range q.Result {
		//fmt.Println("=======================")
		//fmt.Println(cnode.Params)
		if val, ok := cnode.Params["PtagList"]; ok {
			for _, ptag := range val.([]interface{}) {
				ptagMap := ptag.(map[string]interface{})
				//fmt.Println(ptagMap["name"])
				msname := cnode.Type + "_" + strconv.Itoa(cnode.Id)
				if _, ok := lev2Map[cnode.Name]; ok {
					// 이미 존재하는 것은 추가하지 않는다.
					lv2 := lev2Map[cnode.Name]
					
					lv2.Children = append(lv2.Children, m.TsFacilityTreeItem {
						IsPtag : true,
						IsValid : true,
						TagTableName : msname,
						TagColumnName : ptagMap["name"].(string),
						TagColumnType : ptagMap["type"].(string),
						TagName : ptagMap["name"].(string),
						FacilityTreeOrder : len(lv2.Children) + 1,
						Children : []m.TsFacilityTreeItem{},
					})

					lev2Map[cnode.Name] = lv2
					
				} else {
					forder = forder + 1
					tags := []m.TsFacilityTreeItem{}
					tags = append(tags,  m.TsFacilityTreeItem {
						IsPtag : true,
						IsValid : true,
						TagTableName : msname,
						TagColumnName : ptagMap["name"].(string),
						TagColumnType : ptagMap["type"].(string),
						TagName : ptagMap["name"].(string),
						FacilityTreeOrder : 1,
						Children : []m.TsFacilityTreeItem{},
					})

					lev2Map[cnode.Name] = m.TsFacilityTreeItem{
						IsPtag : true,
						FacilityName : cnode.Name,
						Children : tags,
						Label : cnode.Type,
						FacilityTreeOrder : forder,
					}
				}
			}
		}
	}

	// level2 with level3 from influxDB to get the historical data
	for _, ms := range conInfo {
		msName := ms.Type + "_" + strconv.Itoa(ms.Id)
		q := influx.NewQuery("SHOW FIELD KEYS ON thingspin from " + msName, "thingspin", "")
		if response, err := cli.Query(q); err == nil && response.Error() == nil {
			if len(response.Results) > 0 {
				result := response.Results[0]
				if  len(result.Series) > 0 {
					serie := result.Series[0]
					values := serie.Values
					for _, v := range values {
						if _, ok := lev2Map[ms.Name]; ok {
							lv2 := lev2Map[ms.Name]
							hasCheck := false
							for _, lv2Ch := range lv2.Children {
								if lv2Ch.TagColumnName == v[0].(string) {
									hasCheck = true
									break
								}
							}
							// 히스토리 태그
							if !hasCheck {
								lv2.Children = append(lv2.Children, m.TsFacilityTreeItem {
									IsPtag : true,
									IsValid : false,
									TagTableName : msName,
									TagColumnName : v[0].(string),
									TagColumnType : v[1].(string),
									TagName : v[0].(string),
									FacilityTreeOrder : len(lv2.Children) + 1,
									Children : []m.TsFacilityTreeItem{},
								})
							}
							lev2Map[ms.Name] = lv2
		
						}
					}	
				}
			}			
		}else {
			return err, nil
		}
	}

	

	for _, node := range lev2Map {
		tagList = append(tagList, node)
	}

	sort.Slice(tagList, func(i, j int) bool {
        return tagList[i].FacilityTreeOrder < tagList[j].FacilityTreeOrder
    })

	return nil, &m.GetFmsTagDefineQuery{
		Result : tagList,
	}
}
