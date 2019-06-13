package api

import (
	// "fmt"
	"github.com/grafana/grafana/pkg/bus"
	gfm "github.com/grafana/grafana/pkg/models"
	m "github.com/grafana/grafana/pkg/models-thingspin"
)

func getAllTsFacilitySample(target string) ([]m.TsFacilityField){
	switch target {
		case "1":
			result := []m.TsFacilityField {
				{
					Id: 1,
					SiteId: 1,
					Name: "호퍼A",
					Description: "분말 저장 장치",
					Location_lat: 37.5599782,
					Location_lon: 126.9795979,
					Image_path: "/public/img/facility-hopper-A.jpg",
				},
				{
					Id: 2,
					SiteId: 1,
					Name: "호퍼B",
					Description: "분말 저장 장치",
					Location_lat: 37.5599782,
					Location_lon: 126.9795979,
					Image_path: "/public/img/facility-hopper-B.jpg",
				},
				{
					Id: 3,
					SiteId: 1,
					Name: "호퍼C",
					Description: "분말 저장 장치",
					Location_lat: 37.5599782,
					Location_lon: 126.9795979,
					Image_path: "/public/img/facility-hopper-C.jpg",
				},
				{
					Id: 4,
					SiteId: 1,
					Name: "호퍼D",
					Description: "분말 저장 장치",
					Location_lat: 37.5599782,
					Location_lon: 126.9795979,
					Image_path: "/public/img/facility-hopper-D.jpg",
				},				
			}
			return result
		case "2":
			result := []m.TsFacilityField {
				{
					Id: 10,
					SiteId: 2,
					Name: "수분사-1",
					Description: "철을 녹인 상태에서 물을 압으로 분말로 만드는 과정",
					Location_lat: 35.1485845,
					Location_lon: 128.9981016,
					Image_path: "/public/img/facility_waterpress-1.jpg",
				},
				{
					Id: 11,
					SiteId: 2,
					Name: "수분사-2",
					Description: "철을 녹인 상태에서 물을 압으로 분말로 만드는 과정",
					Location_lat: 35.1485845,
					Location_lon: 128.9981016,
					Image_path: "/public/img/facility_waterpress-2.jpg",
				},
			}
			return result
		case "3":
			result := []m.TsFacilityField {
				{
					Id: 20,
					SiteId: 3,
					Name: "내면처리기",
					Description: "실린더에 내면을 철분말과 압을 이용해서 내면을 청소하는 기계",
					Location_lat: 35.8693295,
					Location_lon: 128.5387992,
					Image_path: "/public/img/facility-inside.jpg",
				},
				{
					Id: 21,
					SiteId: 3,
					Name: "진공처리기",
					Description: "실린더에 내부를 진공 상태로 만드는 기계",
					Location_lat: 35.8693295,
					Location_lon: 128.5387992,
					Image_path: "/public/img/facility-vacuum.jpg",
				},
				{
					Id: 22,
					SiteId: 3,
					Name: "소분작업기",
					Description: "TC액체와 드라이아이스를 이용해서 실린더에 온도를 낮춰서 소분을 처리할 수 있도록 도와주는 장치",
					Location_lat: 35.8693295,
					Location_lon: 128.5387992,
					Image_path: "/public/img/facility-minute.jpg",
				},
			}
			return result
	}
	result := []m.TsFacilityField{}
	return result
}

func getAllTsFacility(c *gfm.ReqContext) Response {
	/*
	q := m.GetAllTsFacilityQuery{}
	if err := bus.Dispatch(&q); err != nil {
		return Error(500, "ThingSPIN Server Error", err)
	}
	*/
	target := c.Params(":siteId")
	return JSON(200, getAllTsFacilitySample(target))
}

func addTsFacility(c *gfm.ReqContext, req m.AddTsFacilityQuery) Response {	
	q := m.AddTsFacilityQuery{
		SiteId: req.SiteId,
		Name:   req.Name,
		Desc:   req.Desc,
		Lat:    req.Lat,
		Lon:    req.Lon,
		ImgPath:   req.ImgPath,
	}
	// save db
	if err := bus.Dispatch(&q); err != nil {
		return Error(500, "ThingSPIN Store Error", err)
	}
	return JSON(200, q.Result)
}

func updateTsFacility(c *gfm.ReqContext, req m.UpdateTsFacilityQuery) Response {
	q := m.UpdateTsFacilityQuery{
		Id:        req.Id,
		Name:      req.Name,
		Desc:      req.Desc,
		Lat:       req.Lat,
		Lon:       req.Lon,
		ImgPath:   req.ImgPath,
	}
	if err := bus.Dispatch(&q); err != nil {
		return Error(500, "ThingSPIN Store Error", err)
	}

	return JSON(200, q.Result)
}

func deleteTsFacility(c *gfm.ReqContext) Response {
	connId := c.ParamsInt(":facilityId")

	// remove Connect Table Row
	q := m.DeleteTsFacilityQuery{
		Id: connId,
	}
	if err := bus.Dispatch(&q); err != nil {
		return Error(500, "ThingSPIN Store Error", err)
	}

	return JSON(200, q.Result)
}


func getAllTsFacilityTreeSample(target string) ([]m.TsFacilityTreeItem){
	hopper_a_control_1 := m.TsFacilityTreeItem {
		SiteId: 1,
		Label: "ns=5;s=Counter1",
		Value: "1/1",
		FacilityId: 1,
		FacilityName: "호퍼A",
		FacilityDesc: "분말 저장 장치",
		FacilityLat: 37.5599782,
		FacilityLon: 126.9795979,
		FacilityPath: "/public/img/facility-hopper-A.jpg",
		TagId: 1,
		TagDatasource: 1,
		TagTableName: "opcua_1",
		TagColumnName: "ns=5;s=Counter1",
		TagColumnType: "float",
		TagName: "",
		FacilityTreePath: "1/1",
		FacilityTreeOrder: 1,
		FacilityTreeId: 11,
		Children: []m.TsFacilityTreeItem{},					
	}
	hopper_a_control_2 := m.TsFacilityTreeItem {
		SiteId: 1,
		Label: "ns=5;s=Counter2",
		Value: "1/2",
		FacilityId: 1,
		FacilityName: "호퍼A",
		FacilityDesc: "분말 저장 장치",
		FacilityLat: 37.5599782,
		FacilityLon: 126.9795979,
		FacilityPath: "/public/img/facility-hopper-A.jpg",
		TagId: 2,
		TagDatasource: 1,
		TagTableName: "opcua_1",
		TagColumnName: "ns=5;s=Counter2",
		TagColumnType: "float",
		TagName: "",
		FacilityTreePath: "1/2",
		FacilityTreeOrder: 2,
		FacilityTreeId: 12,
		Children: []m.TsFacilityTreeItem{},					
	}
	hopper_a_control_3 := m.TsFacilityTreeItem {
		SiteId: 1,
		Label: "분말 조절 장치-3",
		Value: "1/3",
		FacilityId: 1,
		FacilityName: "호퍼A",
		FacilityDesc: "분말 저장 장치",
		FacilityLat: 37.5599782,
		FacilityLon: 126.9795979,
		FacilityPath: "/public/img/facility-hopper-A.jpg",
		TagId: 3,
		TagDatasource: 1,
		TagTableName: "opcua_1",
		TagColumnName: "ns=5;s=Counter3",
		TagColumnType: "float",
		TagName: "분말 조절 장치-3",
		FacilityTreePath: "1/3",
		FacilityTreeOrder: 3,
		FacilityTreeId: 13,
		Children: []m.TsFacilityTreeItem{},					
	}

	hopper_a := m.TsFacilityTreeItem {
		SiteId: 1,
		Label: "호퍼A",
		Value: "1/",
		FacilityId: 1,
		FacilityName: "호퍼A",
		FacilityDesc: "분말 저장 장치",
		FacilityLat: 37.5599782,
		FacilityLon: 126.9795979,
		FacilityPath: "/public/img/facility-hopper-A.jpg",
		TagId: 0,
		TagDatasource: 0,
		TagTableName: "",
		TagColumnName: "",
		TagColumnType: "",
		TagName: "",
		FacilityTreePath: "1/",
		FacilityTreeOrder: 1,
		FacilityTreeId: 1,
		Children: []m.TsFacilityTreeItem{ hopper_a_control_1,hopper_a_control_2,hopper_a_control_3 },
	}

	hopper_b_rail_1 := m.TsFacilityTreeItem {
		SiteId: 1,
		Label: "속도",
		Value: "2/1/1",
		FacilityId: 3,
		FacilityName: "Rail",
		FacilityDesc: "호퍼B로 유입되는 철분말의 레일 장비",
		FacilityLat: 37.5599782,
		FacilityLon: 126.9795979,
		FacilityPath: "/public/img/facility-hopper-B-Rail.jpg",
		TagId: 3,
		TagDatasource: 1,
		TagTableName: "mqtt_1",
		TagColumnName: "speed",
		TagColumnType: "float",
		TagName: "속도",
		FacilityTreePath: "2/1/1",
		FacilityTreeOrder: 1,
		FacilityTreeId: 14,
		Children: []m.TsFacilityTreeItem{},					
	}
	hopper_b_rail_2 := m.TsFacilityTreeItem {
		SiteId: 1,
		Label: "전력",
		Value: "2/1/2",
		FacilityId: 3,
		FacilityName: "Rail",
		FacilityDesc: "호퍼B로 유입되는 철분말의 레일 장비",
		FacilityLat: 37.5599782,
		FacilityLon: 126.9795979,
		FacilityPath: "/public/img/facility-hopper-B-Rail.jpg",
		TagId: 3,
		TagDatasource: 1,
		TagTableName: "mqtt_1",
		TagColumnName: "power",
		TagColumnType: "float",
		TagName: "전력",
		FacilityTreePath: "2/1/2",
		FacilityTreeOrder: 2,
		FacilityTreeId: 15,
		Children: []m.TsFacilityTreeItem{},					
	}
	hopper_b_rail_3 := m.TsFacilityTreeItem {
		SiteId: 1,
		Label: "전압",
		Value: "2/1/3",
		FacilityId: 3,
		FacilityName: "Rail",
		FacilityDesc: "호퍼B로 유입되는 철분말의 레일 장비",
		FacilityLat: 37.5599782,
		FacilityLon: 126.9795979,
		FacilityPath: "/public/img/facility-hopper-B-Rail.jpg",
		TagId: 3,
		TagDatasource: 1,
		TagTableName: "mqtt_1",
		TagColumnName: "volte",
		TagColumnType: "float",
		TagName: "전압",
		FacilityTreePath: "2/1/3",
		FacilityTreeOrder: 3,
		FacilityTreeId: 16,
		Children: []m.TsFacilityTreeItem{},					
	}	

	hopper_b_rail := m.TsFacilityTreeItem {
		SiteId: 1,
		Label: "Rail",
		Value: "2/1",
		FacilityId: 3,
		FacilityName: "Rail",
		FacilityDesc: "호퍼B로 유입되는 철분말의 레일 장비",
		FacilityLat: 37.5599782,
		FacilityLon: 126.9795979,
		FacilityPath: "/public/img/facility-hopper-B-Rail.jpg",
		TagId: 0,
		TagDatasource: 0,
		TagTableName: "",
		TagColumnName: "",
		TagColumnType: "",
		TagName: "",
		FacilityTreePath: "2/1",
		FacilityTreeOrder: 1,
		FacilityTreeId: 3,
		Children: []m.TsFacilityTreeItem{hopper_b_rail_1,hopper_b_rail_2,hopper_b_rail_3},
	}

	hopper_b := m.TsFacilityTreeItem {
		SiteId: 1,
		Label: "호퍼B",
		Value: "2/",
		FacilityId: 2,
		FacilityName: "호퍼B",
		FacilityDesc: "분말 저장 장치",
		FacilityLat: 37.5599782,
		FacilityLon: 126.9795979,
		FacilityPath: "/public/img/facility-hopper-B.jpg",
		TagId: 0,
		TagDatasource: 0,
		TagTableName: "",
		TagColumnName: "",
		TagColumnType: "",
		TagName: "",
		FacilityTreePath: "2/",
		FacilityTreeOrder: 2,
		FacilityTreeId: 2,
		Children: []m.TsFacilityTreeItem{hopper_b_rail},
	}
	switch target {
		case "1":
			result := []m.TsFacilityTreeItem {hopper_a,hopper_b}
			return result
	}
	result := []m.TsFacilityTreeItem {}
	return result
}

func getAllTsFacilityTree(c *gfm.ReqContext) Response {
	// q := m.GetAllTsTagQuery{}
	// if err := bus.Dispatch(&q); err != nil {
	// 	fmt.Println(err);
	// 	return Error(500, "ThingSPIN Server Error", err)
	// }
	target := c.Params(":siteId")
	return JSON(200, getAllTsFacilityTreeSample(target))
}

func addTsFacilityTree(c *gfm.ReqContext, req m.AddTsFacilityTreeQuery) Response {
	return JSON(200, "addTsFacilityTree")
}

func updateTsFacilityTree(c *gfm.ReqContext, req m.UpdateTsSiteQuery) Response {
	return JSON(200, "updateTsFacilityTree")
}

func deleteTsFacilityTree(c *gfm.ReqContext) Response {
	return JSON(200, "updateTsFacilityTree")
}