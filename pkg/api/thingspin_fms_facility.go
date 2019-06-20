package api

import (
	"fmt"
	"strings"
	"strconv"
	"sort"
	// "errors"
	"github.com/grafana/grafana/pkg/bus"
	gfm "github.com/grafana/grafana/pkg/models"
	m "github.com/grafana/grafana/pkg/models-thingspin"
)

//---------------------------------------------------------------------------------------------------------------
//	Facility API
//---------------------------------------------------------------------------------------------------------------

func getAllTsFacility(c *gfm.ReqContext) Response {
	target := c.ParamsInt(":siteId")

	q := m.GetAllTsFacilityQuery{
		SiteId: target,
	}

	if err := bus.Dispatch(&q); err != nil {
		return Error(500, "ThingSPIN Server Error", err)
	}
	// return JSON(200, getAllTsFacilitySample(target))
	return JSON(200, q.Result)
}

func addTsFacilityTreeData(siteId int, facilityId int) error {
	q1 := m.GetTsFacilityTreeLastPathQuery {}
	if err := bus.Dispatch(&q1); err != nil {
		return err
	}
	var intOrder int
	if len(q1.Result) < 1 {
		intOrder = 1;
	} else {
		intOrder = q1.Result[0].Order + 1
	}

	q2 := m.AddTsFacilityTreeQuery {
		SiteId: siteId,
		FacilityId: facilityId,
		TagId: 0,
		Path: strconv.Itoa(facilityId) + "/",
		Order: intOrder,
	}
	if err := bus.Dispatch(&q2); err != nil {
		return err
	}

	return nil
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

	if err := bus.Dispatch(&q); err != nil {
		return Error(500, "ThingSPIN Store Error", err)
	}

	resultErr := addTsFacilityTreeData(req.SiteId, q.Result)
	if resultErr != nil {
		return Error(500, "ThingSPIN Store Error", resultErr)
	}

	returnList := []m.TsFacilityTreeItem{}
	siteId := c.ParamsInt(":siteId")
	facilityList := m.GetAllTsFacilityQuery{
		SiteId: siteId,
	}

	if err := bus.Dispatch(&facilityList); err != nil {
		return Error(500, "ThingSPIN Server Error", err)
	}

	for _, facility := range facilityList.Result {
		tagsList := []m.TsFacilityTreeItem{}
		tags := m.GetAllTsFacilityTagQuery{
			SiteId: siteId,
			FacilityId: facility.Id,
		}
		if err := bus.Dispatch(&tags); err != nil {
			return Error(500, "ThingSPIN Server Error", err)
		}
		for _, tag := range tags.Result {
			treeItem := m.GetTsFacilityTreeTagItemQuery {
				SiteId: siteId,
				TagId: tag.Id,
			}
			if err := bus.Dispatch(&treeItem); err != nil {
				return Error(500, "ThingSPIN Server Error", err)
			}
			tagItem := m.TsFacilityTreeItem {
				SiteId: siteId,
				Label: facility.Name,
				Value: treeItem.Result[0].Path,
				IsChecked: false,
				IsEditing: false,
				FacilityId: facility.Id,
				FacilityName: facility.Name,
				FacilityDesc: facility.Description,
				FacilityLat: facility.Location_lat,
				FacilityLon: facility.Location_lon,
				FacilityPath: facility.Image_path,
				TagId: tag.Id,
				TagDatasource: tag.DatasourceId,
				TagTableName: tag.Table_name,
				TagColumnName: tag.Column_name,
				TagColumnType: tag.Column_type,
				TagName: tag.Name,
				FacilityTreePath: treeItem.Result[0].Path,
				FacilityTreeOrder: treeItem.Result[0].Order,
				Children: []m.TsFacilityTreeItem{},
			}
			tagsList = append(tagsList, tagItem)
		}
		sort.Slice(tagsList, func(i, j int) bool {
			return tagsList[i].FacilityTreeOrder < tagsList[j].FacilityTreeOrder
		})

		treeItem := m.GetTsFacilityTreeFacilityItemQuery {
			SiteId: siteId,
			FacilityId: facility.Id,
		}
		if err := bus.Dispatch(&treeItem); err != nil {
			return Error(500, "ThingSPIN Server Error", err)
		}

		facilityItem := m.TsFacilityTreeItem {
			SiteId: siteId,
			Label: facility.Name,
			Value: treeItem.Result[0].Path,
			IsChecked: false,
			IsEditing: false,
			FacilityId: facility.Id,
			FacilityName: facility.Name,
			FacilityDesc: facility.Description,
			FacilityLat: facility.Location_lat,
			FacilityLon: facility.Location_lon,
			FacilityPath: facility.Image_path,
			TagId: 0,
			TagDatasource: 0,
			TagTableName: "",
			TagColumnName: "",
			TagColumnType: "",
			TagName: "",
			FacilityTreePath: treeItem.Result[0].Path,
			FacilityTreeOrder: treeItem.Result[0].Order,
			Children: tagsList,
		}

		if false == Find(returnList, facilityItem) {
			returnList = append(returnList, facilityItem)
		}
	}

	sort.Slice(returnList, func(i, j int) bool {
        return returnList[i].FacilityTreeOrder < returnList[j].FacilityTreeOrder
	})	

	return JSON(200, returnList)
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

func deleteTsFacilityTreeData(siteId int, facilityId int) error {
	q := m.DeleteTsFacilityTreeQuery {
		SiteId: siteId,
		FacilityId: facilityId,
	}
	if err := bus.Dispatch(&q); err != nil {
		return err
	}

	return nil
}

func deleteTsFacility(c *gfm.ReqContext) Response {
	siteId := c.ParamsInt(":siteId")
	facilityId := c.ParamsInt(":facilityId")

	// remove Connect Table Row
	q := m.DeleteTsFacilityQuery{
		Id: facilityId,
	}
	if err := bus.Dispatch(&q); err != nil {
		return Error(500, "ThingSPIN Store Error", err)
	}

	resultErr := deleteTsFacilityTreeData(siteId, facilityId)
	if resultErr != nil {
		return Error(500, "ThingSPIN Store Error", resultErr)
	}

	return JSON(200, q.Result)
}

//---------------------------------------------------------------------------------------------------------------
//	Facility TAG API
//---------------------------------------------------------------------------------------------------------------

func getAllTsFacilityTag(c *gfm.ReqContext) Response {
	siteId := c.ParamsInt(":siteId")
	facilityId := c.ParamsInt(":facilityId")

	q := m.GetAllTsFacilityTagQuery{
		SiteId: siteId,
		FacilityId: facilityId,
	}

	if err := bus.Dispatch(&q); err != nil {
		return Error(500, "ThingSPIN Server Error", err)
	}
	return JSON(200, q.Result)
}

func addTsFacilityTag(req *m.AddTsFacilityTagQuery) error {
	if err := bus.Dispatch(&req); err != nil {
		return err
	}
	return nil
}

func updateTsFacilityTag(req m.UpdateTsFacilityTagQuery) error {
	if err := bus.Dispatch(&req); err != nil {
		return err
	}
	return nil
}

func updateTsFacilityTagName(c *gfm.ReqContext, req m.UpdateTsFacilityTagNameQuery) Response {
	siteId := c.ParamsInt(":siteId")
	facilityId := c.ParamsInt(":facilityId")
	tagId := c.ParamsInt(":tagId")

	q := m.UpdateTsFacilityTagNameStructQuery {
		Id           : tagId,
		SiteId       : siteId,
		FacilityId   : facilityId,
		Name         : req.Name,
	}
	
	if err := bus.Dispatch(&q); err != nil {
		return Error(500, "ThingSPIN Server Error", err)
	}
	return JSON(200, q.Result)
}

func deleteTsFacilityTagFunc(req m.DeleteTsFacilityTagQuery) error {
	if err := bus.Dispatch(&req); err != nil {
		return err
	}
	return nil
}

func deleteTsFacilityTag(c *gfm.ReqContext) Response {
	tagId := c.ParamsInt(":tagId")

	req := m.DeleteTsFacilityTagQuery {
		Id : tagId,
	}

	if err := bus.Dispatch(&req); err != nil {
		return Error(500, "ThingSPIN Server Error", err)
	}
	return JSON(200, req.Result)
}

//---------------------------------------------------------------------------------------------------------------
//	Facility TREE API
//---------------------------------------------------------------------------------------------------------------

func Find(tree []m.TsFacilityTreeItem, item m.TsFacilityTreeItem) bool {
	slicePath := strings.Split(item.FacilityTreePath, "/")

	for _, path := range slicePath {
		for i, treeItem := range tree {
			if path + "/" == treeItem.FacilityTreePath {
				// fmt.Printf("%+v", treeItem.Children)
				treeItem.Children = append(treeItem.Children, item)
				fmt.Printf("%+v", treeItem.Children)
				tree[i] = treeItem

				sort.Slice(treeItem.Children, func(i, j int) bool {
					return treeItem.Children[i].FacilityTreeOrder < treeItem.Children[j].FacilityTreeOrder
				})

				return true
			}
		}	
	}
	return false
}

func getAllTsFacilityTree(c *gfm.ReqContext) Response {
	returnList := []m.TsFacilityTreeItem{}
	siteId := c.ParamsInt(":siteId")
	facilityList := m.GetAllTsFacilityQuery{
		SiteId: siteId,
	}

	if err := bus.Dispatch(&facilityList); err != nil {
		return Error(500, "ThingSPIN Server Error", err)
	}

	for _, facility := range facilityList.Result {
		tagsList := []m.TsFacilityTreeItem{}
		tags := m.GetAllTsFacilityTagQuery{
			SiteId: siteId,
			FacilityId: facility.Id,
		}
		if err := bus.Dispatch(&tags); err != nil {
			return Error(500, "ThingSPIN Server Error", err)
		}
		for _, tag := range tags.Result {
			treeItem := m.GetTsFacilityTreeTagItemQuery {
				SiteId: siteId,
				TagId: tag.Id,
			}
			if err := bus.Dispatch(&treeItem); err != nil {
				return Error(500, "ThingSPIN Server Error", err)
			}
			tagItem := m.TsFacilityTreeItem {
				SiteId: siteId,
				Label: facility.Name,
				Value: treeItem.Result[0].Path,
				IsChecked: false,
				IsEditing: false,
				FacilityId: facility.Id,
				FacilityName: facility.Name,
				FacilityDesc: facility.Description,
				FacilityLat: facility.Location_lat,
				FacilityLon: facility.Location_lon,
				FacilityPath: facility.Image_path,
				TagId: tag.Id,
				TagDatasource: tag.DatasourceId,
				TagTableName: tag.Table_name,
				TagColumnName: tag.Column_name,
				TagColumnType: tag.Column_type,
				TagName: tag.Name,
				FacilityTreePath: treeItem.Result[0].Path,
				FacilityTreeOrder: treeItem.Result[0].Order,
				Children: []m.TsFacilityTreeItem{},
			}
			tagsList = append(tagsList, tagItem)
		}
		sort.Slice(tagsList, func(i, j int) bool {
			return tagsList[i].FacilityTreeOrder < tagsList[j].FacilityTreeOrder
		})

		treeItem := m.GetTsFacilityTreeFacilityItemQuery {
			SiteId: siteId,
			FacilityId: facility.Id,
		}
		if err := bus.Dispatch(&treeItem); err != nil {
			return Error(500, "ThingSPIN Server Error", err)
		}

		facilityItem := m.TsFacilityTreeItem {
			SiteId: siteId,
			Label: facility.Name,
			Value: treeItem.Result[0].Path,
			IsChecked: false,
			IsEditing: false,
			FacilityId: facility.Id,
			FacilityName: facility.Name,
			FacilityDesc: facility.Description,
			FacilityLat: facility.Location_lat,
			FacilityLon: facility.Location_lon,
			FacilityPath: facility.Image_path,
			TagId: 0,
			TagDatasource: 0,
			TagTableName: "",
			TagColumnName: "",
			TagColumnType: "",
			TagName: "",
			FacilityTreePath: treeItem.Result[0].Path,
			FacilityTreeOrder: treeItem.Result[0].Order,
			Children: tagsList,
		}

		if false == Find(returnList, facilityItem) {
			returnList = append(returnList, facilityItem)
		}
	}

	sort.Slice(returnList, func(i, j int) bool {
        return returnList[i].FacilityTreeOrder < returnList[j].FacilityTreeOrder
	})

	return JSON(200, returnList)
}

func addTsFacilityTreePathItem(list *m.TsFacilityTreeItem) m.TsFacilityField {
	facility := m.GetTsFacilityItemQuery {
		SiteId : list.SiteId,
		FacilityId : list.FacilityId,
	}

	if err := bus.Dispatch(&facility); err != nil {
		facilityItem := m.TsFacilityField {
			Id: 0,
		}
		return facilityItem
	}
	return facility.Result[0]
}

func addTsFacilityTree(c *gfm.ReqContext, req m.AddTsFacilityTreePathQuery) Response {
	returnList := []m.TsFacilityTreeItem{}
	var facilityItem = m.TsFacilityField {
		Id: 0,
	}

	for _, treeItem := range req.Result {
		if facilityItem.Id == 0 {
			facilityItem = addTsFacilityTreePathItem(&treeItem)
		}
		if len(treeItem.FacilityName) > 0 {
			tree := m.UpdateTsFacilityTreeQuery {
				SiteId: treeItem.SiteId,
				FacilityId: 0,
				TagId: treeItem.TagId,
				Path: treeItem.FacilityTreePath,
				Order: treeItem.FacilityTreeOrder,
			}
	
			if err := bus.Dispatch(&tree); err != nil {
				return Error(500, "ThingSPIN Store Error", err)
			}

			returnItem := m.TsFacilityTreeItem {
				SiteId: treeItem.SiteId,
				Label: treeItem.TagColumnName,
				Value: treeItem.FacilityTreePath,
				IsChecked: false,
				IsEditing: false,
				FacilityId: treeItem.FacilityId,
				FacilityName: treeItem.FacilityName,
				FacilityDesc: treeItem.FacilityDesc,
				FacilityLat: treeItem.FacilityLat,
				FacilityLon: treeItem.FacilityLon,
				FacilityPath: treeItem.FacilityPath,
				TagId: treeItem.TagId,
				TagDatasource: treeItem.TagDatasource,
				TagTableName: treeItem.TagTableName,
				TagColumnName: treeItem.TagColumnName,
				TagColumnType: treeItem.TagColumnType,
				TagName: treeItem.TagName,
				FacilityTreePath: treeItem.FacilityTreePath,
				FacilityTreeOrder: treeItem.FacilityTreeOrder,
				Children: []m.TsFacilityTreeItem{},
			}
			returnList = append(returnList, returnItem)				
		} else {
			tag := m.AddTsFacilityTagQuery {
				SiteId       : treeItem.SiteId,
				FacilityId   : treeItem.FacilityId,
				DatasourceId : treeItem.TagDatasource,
				Table_name   : treeItem.TagTableName,
				Column_name  : treeItem.TagColumnName,
				Column_type  : treeItem.TagColumnType,
				Name         : treeItem.TagName,
			}
			if err := bus.Dispatch(&tag); err != nil {
				return Error(500, "ThingSPIN Store Error", err)
			}
	
			tree := m.AddTsFacilityTreeQuery {
				SiteId: treeItem.SiteId,
				FacilityId: 0,
				TagId: tag.Result,
				Path: strconv.Itoa(treeItem.FacilityId) + "/" + strconv.Itoa(tag.Result),
				Order: treeItem.FacilityTreeOrder,
			}
	
			if err := bus.Dispatch(&tree); err != nil {
				return Error(500, "ThingSPIN Store Error", err)
			}
			returnItem := m.TsFacilityTreeItem {
				SiteId: treeItem.SiteId,
				Label: treeItem.TagColumnName,
				Value: tree.Path,
				IsChecked: false,
				IsEditing: false,
				FacilityId: facilityItem.Id,
				FacilityName: facilityItem.Name,
				FacilityDesc: facilityItem.Description,
				FacilityLat: facilityItem.Location_lat,
				FacilityLon: facilityItem.Location_lon,
				FacilityPath: facilityItem.Image_path,
				TagId: tag.Result,
				TagDatasource: tag.DatasourceId,
				TagTableName: tag.Table_name,
				TagColumnName: tag.Column_name,
				TagColumnType: tag.Column_type,
				TagName: tag.Name,
				FacilityTreePath: tree.Path,
				FacilityTreeOrder: tree.Order,
				Children: []m.TsFacilityTreeItem{},
			}
			returnList = append(returnList, returnItem)	
		}
	}
	// fmt.Printf("%+v", returnList)
	return JSON(200, returnList)
}

func updateTsFacilityTreeTag(treeItem *m.TsFacilityTreeItem) error {
	tag := m.UpdateTsFacilityTagQuery {
		Id        : treeItem.TagId,
		SiteId       : treeItem.SiteId,
		FacilityId   : treeItem.FacilityId,
		DatasourceId : treeItem.TagDatasource,
		Table_name   : treeItem.TagTableName,
		Column_name  : treeItem.TagColumnName,
		Column_type  : treeItem.TagColumnType,
		Name         : treeItem.TagName,
	}
	if err := bus.Dispatch(&tag); err != nil {
		return err
	}

	tree := m.UpdateTsFacilityTreeQuery {
		SiteId: treeItem.SiteId,
		FacilityId: 0,
		TagId: treeItem.TagId,
		Path: strconv.Itoa(treeItem.FacilityId) + "/" + strconv.Itoa(treeItem.TagId),
		Order: treeItem.FacilityTreeOrder,
	}

	if err := bus.Dispatch(&tree); err != nil {
		return err
	}
	return nil
}

func updateTsFacilityTreeFacility(treeItem *m.TsFacilityTreePathItem) error {
	tree := m.UpdateTsFacilityTreeQuery {
		SiteId: treeItem.SiteId,
		FacilityId: treeItem.FacilityId,
		TagId: 0,
		Path: strconv.Itoa(treeItem.FacilityId) + "/",
		Order: treeItem.FacilityTreeOrder,
	}

	if err := bus.Dispatch(&tree); err != nil {
		return err
	}
	return nil
}

func updateTsFacilityTree(c *gfm.ReqContext, req m.UpdateTsFacilityTreePathQuery) Response {
	for _, treeItem := range req.Result {
		if treeItem.TagId > 0 {
			result := updateTsFacilityTreeTag(&treeItem)
			if result != nil {
				return Error(500, "ThingSPIN Store Error", result)
			}
		} else {
			JSON(200, "ThingSPIN Store Error")
		}
	}
	return JSON(200, "")
}

func deleteTsFacilityTree(c *gfm.ReqContext, req m.DeleteTsFacilityTreePathQuery) Response {
	return JSON(200, "updateTsFacilityTree")
}


func getSampleTsFacilityTree(c *gfm.ReqContext) Response {
	target := c.Params(":siteId")
	return JSON(200, getAllTsFacilityTreeSample(target))
}
//---------------------------------------------------------------------------------------------------------------
//	Facility Sample Data Creator
//---------------------------------------------------------------------------------------------------------------

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
		TagName: "ns=5;s=Counter1",
		FacilityTreePath: "1/1",
		FacilityTreeOrder: 1,
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
		TagName: "ns=5;s=Counter2",
		FacilityTreePath: "1/2",
		FacilityTreeOrder: 2,
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
		Children: []m.TsFacilityTreeItem{ hopper_a_control_1,hopper_a_control_2,hopper_a_control_3 },
	}

	hopper_b_rail_1 := m.TsFacilityTreeItem {
		SiteId: 1,
		Label: "속도",
		Value: "2/3/4",
		FacilityId: 3,
		FacilityName: "Rail",
		FacilityDesc: "호퍼B로 유입되는 철분말의 레일 장비",
		FacilityLat: 37.5599782,
		FacilityLon: 126.9795979,
		FacilityPath: "/public/img/facility-hopper-B-Rail.jpg",
		TagId: 4,
		TagDatasource: 1,
		TagTableName: "mqtt_1",
		TagColumnName: "speed",
		TagColumnType: "float",
		TagName: "속도",
		FacilityTreePath: "2/3/4",
		FacilityTreeOrder: 1,
		Children: []m.TsFacilityTreeItem{},					
	}
	hopper_b_rail_2 := m.TsFacilityTreeItem {
		SiteId: 1,
		Label: "전력",
		Value: "2/3/5",
		FacilityId: 3,
		FacilityName: "Rail",
		FacilityDesc: "호퍼B로 유입되는 철분말의 레일 장비",
		FacilityLat: 37.5599782,
		FacilityLon: 126.9795979,
		FacilityPath: "/public/img/facility-hopper-B-Rail.jpg",
		TagId: 5,
		TagDatasource: 1,
		TagTableName: "mqtt_1",
		TagColumnName: "power",
		TagColumnType: "float",
		TagName: "전력",
		FacilityTreePath: "2/3/5",
		FacilityTreeOrder: 2,
		Children: []m.TsFacilityTreeItem{},					
	}
	hopper_b_rail_3 := m.TsFacilityTreeItem {
		SiteId: 1,
		Label: "전압",
		Value: "2/3/6",
		FacilityId: 3,
		FacilityName: "Rail",
		FacilityDesc: "호퍼B로 유입되는 철분말의 레일 장비",
		FacilityLat: 37.5599782,
		FacilityLon: 126.9795979,
		FacilityPath: "/public/img/facility-hopper-B-Rail.jpg",
		TagId: 6,
		TagDatasource: 1,
		TagTableName: "mqtt_1",
		TagColumnName: "volte",
		TagColumnType: "float",
		TagName: "전압",
		FacilityTreePath: "2/3/6",
		FacilityTreeOrder: 3,
		Children: []m.TsFacilityTreeItem{},					
	}	

	hopper_b_rail := m.TsFacilityTreeItem {
		SiteId: 1,
		Label: "Rail",
		Value: "2/3",
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
		FacilityTreePath: "2/3",
		FacilityTreeOrder: 1,
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