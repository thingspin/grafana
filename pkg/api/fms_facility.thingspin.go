package api

import (
	"fmt"
	"sort"
	"strconv"
	"strings"

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

	return JSON(200, q.Result)
}

func getTsFacility(c *gfm.ReqContext) Response {
	siteId := c.ParamsInt(":siteId")
	facilityId := c.ParamsInt(":facilityId")

	q := m.GetTsFacilityItemQuery{
		SiteId:     siteId,
		FacilityId: facilityId,
	}

	if err := bus.Dispatch(&q); err != nil {
		return Error(500, "ThingSPIN Server Error", err)
	}
	return JSON(200, q.Result)
}

func addTsFacilityTreeData(siteId int, facilityId int) error {
	q1 := m.GetTsFacilityTreeLastPathQuery{}
	q1.SiteId = siteId
	if err := bus.Dispatch(&q1); err != nil {
		return err
	}

	var intOrder int
	if len(q1.Result) > 0 {
		for i := 0; i < len(q1.Result); i++ {
			slicePath := strings.Split(q1.Result[i].Path, "/")
			if len(slicePath) == 2 {
				intOrder = q1.Result[i].Order + 1
				break
			} else {
				continue
			}
		}
	} else {
		intOrder = 1
	}

	q2 := m.AddTsFacilityTreeQuery{
		SiteId:     siteId,
		FacilityId: facilityId,
		TagId:      0,
		Path:       strconv.Itoa(facilityId) + "/",
		Order:      intOrder,
	}
	fmt.Println("Path : ", q2.Path, "Order : ", q2.Order)
	if err := bus.Dispatch(&q2); err != nil {
		return err
	}

	return nil
}

func addTsFacility(c *gfm.ReqContext, req m.AddTsFacilityQuery) Response {

	fmt.Println(req.Result)
	q := m.AddTsFacilityQuery{
		SiteId:  req.SiteId,
		Name:    req.Name,
		Desc:    req.Desc,
		Lat:     req.Lat,
		Lon:     req.Lon,
		ImgPath: req.ImgPath,
	}

	if err := bus.Dispatch(&q); err != nil {
		return Error(500, "ThingSPIN Store Error", err)
	}

	if req.Result == -1 {
		return JSON(200, q.Result)
	}

	resultErr := addTsFacilityTreeData(req.SiteId, q.Result)
	if resultErr != nil {
		return Error(500, "ThingSPIN Store Error", resultErr)
	}

	returnList := []m.TsFacilityTreeItem{}
	GetFacilityTreeData(req.SiteId, &returnList)
	sort.Slice(returnList, func(i, j int) bool {
		return returnList[i].FacilityTreeOrder < returnList[j].FacilityTreeOrder
	})
	sortReturnTreeData(returnList)
	return JSON(200, returnList)
}

func updateTsFacility(c *gfm.ReqContext, req m.UpdateTsFacilityQuery) Response {
	q := m.UpdateTsFacilityQuery{
		Id:      req.Id,
		Name:    req.Name,
		Desc:    req.Desc,
		Lat:     req.Lat,
		Lon:     req.Lon,
		ImgPath: req.ImgPath,
	}
	if err := bus.Dispatch(&q); err != nil {
		return Error(500, "ThingSPIN Store Error", err)
	}

	return JSON(200, q.Result)
}

func deleteTsFacilityTreeData(siteId int, facilityId int) error {
	q := m.DeleteTsFacilityTreeQuery{
		SiteId:     siteId,
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
		SiteId:     siteId,
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

	q := m.UpdateTsFacilityTagNameStructQuery{
		Id:         tagId,
		SiteId:     siteId,
		FacilityId: facilityId,
		Name:       req.Name,
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

	req := m.DeleteTsFacilityTagQuery{
		Id: tagId,
	}

	if err := bus.Dispatch(&req); err != nil {
		return Error(500, "ThingSPIN Server Error", err)
	}
	return JSON(200, req.Result)
}

//---------------------------------------------------------------------------------------------------------------
//	Facility TREE API
//---------------------------------------------------------------------------------------------------------------

func addTsFacilityTreePath(c *gfm.ReqContext, req m.AddTsFacilityTreePathOneQuery) Response {
	facilityId := c.ParamsInt(":facilityId")
	treeItem := req.Result

	parentTree := m.GetTsFacilityTreeFacilityItemQuery{
		SiteId:     treeItem.SiteId,
		FacilityId: treeItem.FacilityId,
	}
	if err := bus.Dispatch(&parentTree); err != nil {
		return Error(500, "ThingSPIN Store Error", err)
	}

	if len(parentTree.Result) > 0 {
		parentPath := parentTree.Result[0].Path

		q := m.AddTsFacilityTreeQuery{
			SiteId:     treeItem.SiteId,
			FacilityId: facilityId,
			TagId:      0,
			Path:       parentPath + strconv.Itoa(facilityId) + "/",
			Order:      treeItem.FacilityTreeOrder,
		}
		if err := bus.Dispatch(&q); err != nil {
			return Error(500, "ThingSPIN Store Error", err)
		}

		return JSON(200, q.Result)
	}

	return nil
}

func createFacilityTreeData(tree *[]m.TsFacilityTreeItem, treeMap map[string]m.TsFacilityTreeItem) {
	var keys []string
	for k := range treeMap {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	for i := len(keys) - 1; i >= 0; i-- {
		key := keys[i]
		item := treeMap[key]
		// fmt.Println(key)
		if i == 0 {
			*tree = append(*tree, item)
			break
		}
		slicePath := strings.Split(item.FacilityTreePath, "/")
		pathStr := []string{}
		prevStr := ""
		for j := 0; j < len(slicePath); j++ {
			if len(slicePath[j]) > 0 {
				if len(prevStr) > 0 {
					prevStr = prevStr + slicePath[j] + "/"
					pathStr = append(pathStr, prevStr)
				} else {
					prevStr = slicePath[j] + "/"
					pathStr = append(pathStr, prevStr)
				}
			}
		}

		for k := len(pathStr) - 1; k >= 0; k-- {
			if pathStr[k] == key {
				if len(pathStr)-1 == 0 {
					*tree = append(*tree, item)
				}
				continue
			}
			parent := treeMap[pathStr[k]]
			parent.Children = append(parent.Children, item)
			treeMap[pathStr[k]] = parent
			break
		}
	}
}

func GetFacilityTreeData(siteId int, data *[]m.TsFacilityTreeItem) error {
	treeMap := make(map[string]m.TsFacilityTreeItem)

	treeList := m.GetAllTsFacilityTreeQuery{
		SiteId: siteId,
	}

	if err := bus.Dispatch(&treeList); err != nil {
		return err
	}

	for _, treePath := range treeList.Result {
		facilityList := m.GetTsFacilityItemQuery{
			SiteId:     siteId,
			FacilityId: treePath.FacilityId,
		}

		if err := bus.Dispatch(&facilityList); err != nil {
			return err
		}

		for _, facility := range facilityList.Result {
			tagsList := []m.TsFacilityTreeItem{}
			tags := m.GetAllTsFacilityTagQuery{
				SiteId:     siteId,
				FacilityId: facility.Id,
			}
			if err := bus.Dispatch(&tags); err != nil {
				return err
			}

			for _, tag := range tags.Result {
				tagItem := m.GetTsFacilityTreeTagItemQuery{
					SiteId: siteId,
					TagId:  tag.Id,
				}
				if err := bus.Dispatch(&tagItem); err != nil {
					return err
				}
				if len(tagItem.Result) > 0 {
					tagItem := m.TsFacilityTreeItem{
						SiteId:            siteId,
						Label:             tag.Name,
						Value:             tagItem.Result[0].Path,
						IsPtag:            false,
						IsChecked:         false,
						IsEditing:         false,
						FacilityId:        facility.Id,
						FacilityName:      facility.Name,
						FacilityDesc:      facility.Description,
						FacilityLat:       facility.Location_lat,
						FacilityLon:       facility.Location_lon,
						FacilityPath:      facility.Image_path,
						TagId:             tag.Id,
						TagDatasource:     tag.DatasourceId,
						TagTableName:      tag.Table_name,
						TagColumnName:     tag.Column_name,
						TagColumnType:     tag.Column_type,
						TagName:           tag.Name,
						FacilityTreePath:  tagItem.Result[0].Path,
						FacilityTreeOrder: tagItem.Result[0].Order,
						Children:          []m.TsFacilityTreeItem{},
					}
					tagsList = append(tagsList, tagItem)
				}
			}
			sort.Slice(tagsList, func(i, j int) bool {
				return tagsList[i].FacilityTreeOrder < tagsList[j].FacilityTreeOrder
			})

			treeItem := m.GetTsFacilityTreeFacilityItemQuery{
				SiteId:     siteId,
				FacilityId: facility.Id,
			}
			if err := bus.Dispatch(&treeItem); err != nil {
				return err
			}

			if len(treeItem.Result) > 0 {
				facilityItem := m.TsFacilityTreeItem{
					SiteId:            siteId,
					Label:             facility.Name,
					Value:             treeItem.Result[0].Path,
					IsPtag:            false,
					IsChecked:         false,
					IsEditing:         false,
					FacilityId:        facility.Id,
					FacilityName:      facility.Name,
					FacilityDesc:      facility.Description,
					FacilityLat:       facility.Location_lat,
					FacilityLon:       facility.Location_lon,
					FacilityPath:      facility.Image_path,
					TagId:             0,
					TagDatasource:     0,
					TagTableName:      "",
					TagColumnName:     "",
					TagColumnType:     "",
					TagName:           "",
					FacilityTreePath:  treeItem.Result[0].Path,
					FacilityTreeOrder: treeItem.Result[0].Order,
					Children:          tagsList,
				}

				treeMap[facilityItem.FacilityTreePath] = facilityItem
			}
		}
	}
	createFacilityTreeData(data, treeMap)
	return nil
}

func sortReturnTreeData(data []m.TsFacilityTreeItem) {
	for i := 0; i < len(data); i++ {
		childrenItem := data[i].Children
		sort.Slice(childrenItem, func(i, j int) bool {
			return childrenItem[i].FacilityTreeOrder < childrenItem[j].FacilityTreeOrder
		})
		for j := 0; j < len(childrenItem); j++ {
			if len(childrenItem[j].Children) > 0 {
				sortReturnTreeData(childrenItem[j].Children)
			}
		}
	}
}

func getAllTsFacilityTree(c *gfm.ReqContext) Response {
	returnList := []m.TsFacilityTreeItem{}
	siteId := c.ParamsInt(":siteId")
	GetFacilityTreeData(siteId, &returnList)
	sort.Slice(returnList, func(i, j int) bool {
		return returnList[i].FacilityTreeOrder < returnList[j].FacilityTreeOrder
	})

	sortReturnTreeData(returnList)

	return JSON(200, returnList)
}

func addTsFacilityTreePathItem(list *m.TsFacilityTreeItem) m.TsFacilityField {
	facility := m.GetTsFacilityItemQuery{
		SiteId:     list.SiteId,
		FacilityId: list.FacilityId,
	}

	if err := bus.Dispatch(&facility); err != nil {
		facilityItem := m.TsFacilityField{
			Id: 0,
		}
		return facilityItem
	}
	if len(facility.Result) == 0 {
		facilityItem := m.TsFacilityField{
			Id: 0,
		}
		return facilityItem
	} else {
		return facility.Result[0]
	}

}

func addTsFacilityTree(c *gfm.ReqContext, req m.AddTsFacilityTreePathQuery) Response {
	returnList := []m.TsFacilityTreeItem{}
	var facilityItem = m.TsFacilityField{
		Id: 0,
	}

	for _, treeItem := range req.Result {
		if facilityItem.Id == 0 {
			facilityItem = addTsFacilityTreePathItem(&treeItem)
		}
		if len(treeItem.FacilityName) > 0 {
			// 설비
			tree := m.UpdateTsFacilityTreeTagQuery{
				SiteId:     treeItem.SiteId,
				FacilityId: 0,
				TagId:      treeItem.TagId,
				Path:       treeItem.FacilityTreePath,
				Order:      treeItem.FacilityTreeOrder,
			}

			if err := bus.Dispatch(&tree); err != nil {
				return Error(500, "ThingSPIN Store Error", err)
			}

			returnItem := m.TsFacilityTreeItem{
				SiteId:            treeItem.SiteId,
				Label:             treeItem.TagColumnName,
				Value:             treeItem.FacilityTreePath,
				IsPtag:            false,
				IsChecked:         false,
				IsEditing:         false,
				FacilityId:        treeItem.FacilityId,
				FacilityName:      treeItem.FacilityName,
				FacilityDesc:      treeItem.FacilityDesc,
				FacilityLat:       treeItem.FacilityLat,
				FacilityLon:       treeItem.FacilityLon,
				FacilityPath:      treeItem.FacilityPath,
				TagId:             treeItem.TagId,
				TagDatasource:     treeItem.TagDatasource,
				TagTableName:      treeItem.TagTableName,
				TagColumnName:     treeItem.TagColumnName,
				TagColumnType:     treeItem.TagColumnType,
				TagName:           treeItem.TagName,
				FacilityTreePath:  treeItem.FacilityTreePath,
				FacilityTreeOrder: treeItem.FacilityTreeOrder,
				Children:          []m.TsFacilityTreeItem{},
			}
			returnList = append(returnList, returnItem)
		} else {
			// 태그
			tag := m.AddTsFacilityTagQuery{
				SiteId:       treeItem.SiteId,
				FacilityId:   treeItem.FacilityId,
				DatasourceId: treeItem.TagDatasource,
				Table_name:   treeItem.TagTableName,
				Column_name:  treeItem.TagColumnName,
				Column_type:  treeItem.TagColumnType,
				Name:         treeItem.TagName,
			}
			if err := bus.Dispatch(&tag); err != nil {
				return Error(500, "ThingSPIN Store Error", err)
			}

			// 부모 설비의 id를 가지고 path를 받아와야한다.
			parentTree := m.GetTsFacilityTreeFacilityItemQuery{
				SiteId:     treeItem.SiteId,
				FacilityId: treeItem.FacilityId,
			}
			if err := bus.Dispatch(&parentTree); err != nil {
				return Error(500, "ThingSPIN Store Error", err)
			}

			if len(parentTree.Result) > 0 {
				parentPath := parentTree.Result[0].Path
				tree := m.AddTsFacilityTreeQuery{
					SiteId:     treeItem.SiteId,
					FacilityId: 0,
					TagId:      tag.Result,
					Path:       parentPath + strconv.Itoa(tag.Result),
					Order:      treeItem.FacilityTreeOrder,
				}

				if err := bus.Dispatch(&tree); err != nil {
					return Error(500, "ThingSPIN Store Error", err)
				}

				returnItem := m.TsFacilityTreeItem{
					SiteId:            treeItem.SiteId,
					Label:             treeItem.TagColumnName,
					Value:             tree.Path,
					IsPtag:            false,
					IsChecked:         false,
					IsEditing:         false,
					FacilityId:        facilityItem.Id,
					FacilityName:      facilityItem.Name,
					FacilityDesc:      facilityItem.Description,
					FacilityLat:       facilityItem.Location_lat,
					FacilityLon:       facilityItem.Location_lon,
					FacilityPath:      facilityItem.Image_path,
					TagId:             tag.Result,
					TagDatasource:     tag.DatasourceId,
					TagTableName:      tag.Table_name,
					TagColumnName:     tag.Column_name,
					TagColumnType:     tag.Column_type,
					TagName:           tag.Name,
					FacilityTreePath:  tree.Path,
					FacilityTreeOrder: tree.Order,
					Children:          []m.TsFacilityTreeItem{},
				}
				returnList = append(returnList, returnItem)
			}
		}
	}
	// fmt.Printf("%+v", returnList)
	return JSON(200, returnList)
}

func updateTSFacilityTreeTagUnderFacility(newPath string, treeItem *m.TsFacilityTreeItem) error {
	// 태그 트리 정보 업데이트 with New path
	tree := m.UpdateTsFacilityTreeTagQuery{
		SiteId:     treeItem.SiteId,
		FacilityId: 0,
		TagId:      treeItem.TagId,
		Path:       newPath,
		Order:      treeItem.FacilityTreeOrder,
	}

	if err := bus.Dispatch(&tree); err != nil {
		return err
	}
	return nil
}

func updateTsFacilityTreeFacilityUnderFacility(newPath string, treeItem *m.TsFacilityTreeItem) error {
	tree := m.UpdateTsFacilityTreeFacilityQuery{
		SiteId:     treeItem.SiteId,
		FacilityId: treeItem.FacilityId,
		TagId:      0,
		Path:       newPath,
		Order:      treeItem.FacilityTreeOrder,
	}

	if err := bus.Dispatch(&tree); err != nil {
		return err
	}
	return nil
}

func updateTsFacilityTreeTag(treeItem *m.TsFacilityTreeItem) error {
	slicePath := strings.Split(treeItem.Value, "/")
	if len(slicePath) == 1 {
		// 태그 부모가 바뀌는 경우
		newParentId, err := strconv.Atoi(treeItem.Value)
		if err != nil {
			return err
		}

		tag := m.UpdateTsFacilityTagQuery{
			Id:           treeItem.TagId,
			SiteId:       treeItem.SiteId,
			FacilityId:   newParentId,
			DatasourceId: treeItem.TagDatasource,
			Table_name:   treeItem.TagTableName,
			Column_name:  treeItem.TagColumnName,
			Column_type:  treeItem.TagColumnType,
			Name:         treeItem.TagName,
		}
		if err := bus.Dispatch(&tag); err != nil {
			return err
		}
		parentTree := m.GetTsFacilityTreeFacilityItemQuery{
			SiteId:     treeItem.SiteId,
			FacilityId: newParentId,
		}
		if err := bus.Dispatch(&parentTree); err != nil {
			return err
		}

		if len(parentTree.Result) > 0 {
			parentPath := parentTree.Result[0].Path
			tree := m.UpdateTsFacilityTreeTagQuery{
				SiteId:     treeItem.SiteId,
				FacilityId: 0,
				TagId:      treeItem.TagId,
				Path:       parentPath + strconv.Itoa(treeItem.TagId),
				Order:      treeItem.FacilityTreeOrder,
			}

			if err := bus.Dispatch(&tree); err != nil {
				return err
			}
		}
	} else {
		// 태그 순서만 바뀌는 겨우
		tree := m.UpdateTsFacilityTreeTagQuery{
			SiteId:     treeItem.SiteId,
			FacilityId: 0,
			TagId:      treeItem.TagId,
			Path:       treeItem.FacilityTreePath,
			Order:      treeItem.FacilityTreeOrder,
		}

		if err := bus.Dispatch(&tree); err != nil {
			return err
		}
	}
	return nil
}

func updateTsFacilityTreeFacility(treeItem *m.TsFacilityTreeItem) error {
	slicePath := strings.Split(treeItem.Value, "/")
	if len(slicePath) == 1 {
		// 부모가 바뀌는 경우
		fmt.Println("===Parent changed")
		newParentId, err := strconv.Atoi(treeItem.Value)
		if err != nil {
			return err
		}
		// fmt.Printf("newParentId : %d", newParentId)
		if newParentId == 0 {
			// Lv1 로 가는 경우
			tree := m.UpdateTsFacilityTreeFacilityQuery{
				SiteId:     treeItem.SiteId,
				FacilityId: treeItem.FacilityId,
				TagId:      0,
				Path:       strconv.Itoa(treeItem.FacilityId) + "/",
				Order:      treeItem.FacilityTreeOrder,
			}

			if err := bus.Dispatch(&tree); err != nil {
				return err
			}

			/// 자식들도 업데이트 해야함
			for _, lv2Item := range treeItem.Children {
				if lv2Item.TagId > 0 {
					// lv2 태그
					lv2TagPath := tree.Path + strconv.Itoa(lv2Item.TagId)
					updateTSFacilityTreeTagUnderFacility(lv2TagPath, &lv2Item)
				} else {
					// lv2 설비
					lv2FacilityPath := tree.Path + strconv.Itoa(lv2Item.FacilityId) + "/"
					updateTsFacilityTreeFacilityUnderFacility(lv2FacilityPath, &lv2Item)

					for _, lv3Item := range lv2Item.Children {
						if lv3Item.TagId > 0 {
							// lv3 태그
							lv3TagPath := lv2FacilityPath + strconv.Itoa(lv3Item.TagId)
							updateTSFacilityTreeTagUnderFacility(lv3TagPath, &lv3Item)
						} else {
							// lv3 설비
							lv3FacilityPath := lv2FacilityPath + strconv.Itoa(lv3Item.FacilityId) + "/"
							updateTsFacilityTreeFacilityUnderFacility(lv3FacilityPath, &lv3Item)

							for _, lv4Item := range lv3Item.Children {
								if lv4Item.TagId > 0 {
									// lv4 태그
									lv4TagPath := lv3FacilityPath + strconv.Itoa(lv4Item.TagId)
									updateTSFacilityTreeTagUnderFacility(lv4TagPath, &lv4Item)
								} else {
									// lv4 설비
									lv4FacilityPath := lv3FacilityPath + strconv.Itoa(lv4Item.FacilityId) + "/"
									updateTsFacilityTreeFacilityUnderFacility(lv4FacilityPath, &lv4Item)
								}
							}
						}
					}
				}
			}

		} else {
			// 부모설비 밑으로 가는 경우
			parentTree := m.GetTsFacilityTreeFacilityItemQuery{
				SiteId:     treeItem.SiteId,
				FacilityId: newParentId,
			}
			if err := bus.Dispatch(&parentTree); err != nil {
				return err
			}

			if len(parentTree.Result) > 0 {
				parentPath := parentTree.Result[0].Path
				tree := m.UpdateTsFacilityTreeFacilityQuery{
					SiteId:     treeItem.SiteId,
					FacilityId: treeItem.FacilityId,
					TagId:      0,
					Path:       parentPath + strconv.Itoa(treeItem.FacilityId) + "/",
					Order:      treeItem.FacilityTreeOrder,
				}

				if err := bus.Dispatch(&tree); err != nil {
					return err
				}

				// 자식들도 업데이트 해야함
				for _, lv2Item := range treeItem.Children {
					if lv2Item.TagId > 0 {
						// lv2 태그
						lv2TagPath := tree.Path + strconv.Itoa(lv2Item.TagId)
						updateTSFacilityTreeTagUnderFacility(lv2TagPath, &lv2Item)
					} else {
						// lv2 설비
						lv2FacilityPath := tree.Path + strconv.Itoa(lv2Item.FacilityId) + "/"
						updateTsFacilityTreeFacilityUnderFacility(lv2FacilityPath, &lv2Item)

						for _, lv3Item := range lv2Item.Children {
							if lv3Item.TagId > 0 {
								// lv3 태그
								lv3TagPath := lv2FacilityPath + strconv.Itoa(lv3Item.TagId)
								updateTSFacilityTreeTagUnderFacility(lv3TagPath, &lv3Item)
							} else {
								// lv3 설비
								lv3FacilityPath := lv2FacilityPath + strconv.Itoa(lv3Item.FacilityId) + "/"
								updateTsFacilityTreeFacilityUnderFacility(lv3FacilityPath, &lv3Item)

								for _, lv4Item := range lv3Item.Children {
									if lv4Item.TagId > 0 {
										// lv4 태그
										lv4TagPath := lv3FacilityPath + strconv.Itoa(lv4Item.TagId)
										updateTSFacilityTreeTagUnderFacility(lv4TagPath, &lv4Item)
									} else {
										// lv4 설비
										lv4FacilityPath := lv3FacilityPath + strconv.Itoa(lv4Item.FacilityId) + "/"
										updateTsFacilityTreeFacilityUnderFacility(lv4FacilityPath, &lv4Item)
									}
								}
							}
						}
					}
				}
			}
		}
	} else {
		// 순서만 바뀌는 경우

		tree := m.UpdateTsFacilityTreeFacilityQuery{
			SiteId:     treeItem.SiteId,
			FacilityId: treeItem.FacilityId,
			TagId:      0,
			Path:       treeItem.FacilityTreePath,
			Order:      treeItem.FacilityTreeOrder,
		}

		if err := bus.Dispatch(&tree); err != nil {
			return err
		}
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
			result := updateTsFacilityTreeFacility(&treeItem)
			if result != nil {
				return Error(500, "ThingSPIN Store Error", result)
			}
		}
	}
	return JSON(200, true)
}

func deleteTsFacilityTree(c *gfm.ReqContext, req m.DeleteTsFacilityTreePathQuery) Response {
	for _, treeItem := range req.Result {
		if treeItem.TagId > 0 {
			result := updateTsFacilityTreeTag(&treeItem)
			if result != nil {
				return Error(500, "ThingSPIN Store Error", result)
			}
		} else {
			result := updateTsFacilityTreeFacility(&treeItem)
			if result != nil {
				return Error(500, "ThingSPIN Store Error", result)
			}
		}
	}
	for _, treeDelItem := range req.Delete {
		if treeDelItem.TagId > 0 {
			delTag := m.DeleteTsFacilityTagQuery{
				Id: treeDelItem.TagId,
			}

			if err := bus.Dispatch(&delTag); err != nil {
				return Error(500, "ThingSPIN Server Error", err)
			}

			delTreeItem := m.DeleteTsFacilityTreeTagQuery{
				TagId: treeDelItem.TagId,
			}

			if err := bus.Dispatch(&delTreeItem); err != nil {
				return Error(500, "ThingSPIN Server Error", err)
			}
		} else {
			if len(treeDelItem.Children) > 0 {
				for _, treeDelItemChild := range treeDelItem.Children {
					delTag := m.DeleteTsFacilityTagQuery{
						Id: treeDelItemChild.TagId,
					}

					if err := bus.Dispatch(&delTag); err != nil {
						return Error(500, "ThingSPIN Server Error", err)
					}
				}
				delFacility := m.DeleteTsFacilityQuery{
					Id: treeDelItem.FacilityId,
				}
				if err := bus.Dispatch(&delFacility); err != nil {
					return Error(500, "ThingSPIN Store Error", err)
				}
				resultErr := deleteTsFacilityTreeData(treeDelItem.SiteId, treeDelItem.FacilityId)
				if resultErr != nil {
					return Error(500, "ThingSPIN Store Error", resultErr)
				}
			} else {
				delFacility := m.DeleteTsFacilityQuery{
					Id: treeDelItem.FacilityId,
				}
				if err := bus.Dispatch(&delFacility); err != nil {
					return Error(500, "ThingSPIN Store Error", err)
				}
				resultErr := deleteTsFacilityTreeData(treeDelItem.SiteId, treeDelItem.FacilityId)
				if resultErr != nil {
					return Error(500, "ThingSPIN Store Error", resultErr)
				}
			}
		}
	}
	return JSON(200, true)
}

func getSampleTsFacilityTree(c *gfm.ReqContext) Response {
	target := c.Params(":siteId")
	return JSON(200, getAllTsFacilityTreeSample(target))
}

//---------------------------------------------------------------------------------------------------------------
//	Facility Sample Data Creator
//---------------------------------------------------------------------------------------------------------------

func getAllTsFacilitySample(target string) []m.TsFacilityField {
	switch target {
	case "1":
		result := []m.TsFacilityField{
			{
				Id:           1,
				SiteId:       1,
				Name:         "호퍼A",
				Description:  "분말 저장 장치",
				Location_lat: 37.5599782,
				Location_lon: 126.9795979,
				Image_path:   "/public/img/facility-hopper-A.jpg",
			},
			{
				Id:           2,
				SiteId:       1,
				Name:         "호퍼B",
				Description:  "분말 저장 장치",
				Location_lat: 37.5599782,
				Location_lon: 126.9795979,
				Image_path:   "/public/img/facility-hopper-B.jpg",
			},
			{
				Id:           3,
				SiteId:       1,
				Name:         "호퍼C",
				Description:  "분말 저장 장치",
				Location_lat: 37.5599782,
				Location_lon: 126.9795979,
				Image_path:   "/public/img/facility-hopper-C.jpg",
			},
			{
				Id:           4,
				SiteId:       1,
				Name:         "호퍼D",
				Description:  "분말 저장 장치",
				Location_lat: 37.5599782,
				Location_lon: 126.9795979,
				Image_path:   "/public/img/facility-hopper-D.jpg",
			},
		}
		return result
	case "2":
		result := []m.TsFacilityField{
			{
				Id:           10,
				SiteId:       2,
				Name:         "수분사-1",
				Description:  "철을 녹인 상태에서 물을 압으로 분말로 만드는 과정",
				Location_lat: 35.1485845,
				Location_lon: 128.9981016,
				Image_path:   "/public/img/facility_waterpress-1.jpg",
			},
			{
				Id:           11,
				SiteId:       2,
				Name:         "수분사-2",
				Description:  "철을 녹인 상태에서 물을 압으로 분말로 만드는 과정",
				Location_lat: 35.1485845,
				Location_lon: 128.9981016,
				Image_path:   "/public/img/facility_waterpress-2.jpg",
			},
		}
		return result
	case "3":
		result := []m.TsFacilityField{
			{
				Id:           20,
				SiteId:       3,
				Name:         "내면처리기",
				Description:  "실린더에 내면을 철분말과 압을 이용해서 내면을 청소하는 기계",
				Location_lat: 35.8693295,
				Location_lon: 128.5387992,
				Image_path:   "/public/img/facility-inside.jpg",
			},
			{
				Id:           21,
				SiteId:       3,
				Name:         "진공처리기",
				Description:  "실린더에 내부를 진공 상태로 만드는 기계",
				Location_lat: 35.8693295,
				Location_lon: 128.5387992,
				Image_path:   "/public/img/facility-vacuum.jpg",
			},
			{
				Id:           22,
				SiteId:       3,
				Name:         "소분작업기",
				Description:  "TC액체와 드라이아이스를 이용해서 실린더에 온도를 낮춰서 소분을 처리할 수 있도록 도와주는 장치",
				Location_lat: 35.8693295,
				Location_lon: 128.5387992,
				Image_path:   "/public/img/facility-minute.jpg",
			},
		}
		return result
	}
	result := []m.TsFacilityField{}
	return result
}

func getAllTsFacilityTreeSample(target string) []m.TsFacilityTreeItem {
	hopper_a_control_1 := m.TsFacilityTreeItem{
		SiteId:            1,
		Label:             "ns=5;s=Counter1",
		Value:             "1/1",
		FacilityId:        1,
		FacilityName:      "호퍼A",
		FacilityDesc:      "분말 저장 장치",
		FacilityLat:       37.5599782,
		FacilityLon:       126.9795979,
		FacilityPath:      "/public/img/facility-hopper-A.jpg",
		TagId:             1,
		TagDatasource:     1,
		TagTableName:      "opcua_1",
		TagColumnName:     "ns=5;s=Counter1",
		TagColumnType:     "float",
		TagName:           "ns=5;s=Counter1",
		FacilityTreePath:  "1/1",
		FacilityTreeOrder: 1,
		Children:          []m.TsFacilityTreeItem{},
	}
	hopper_a_control_2 := m.TsFacilityTreeItem{
		SiteId:            1,
		Label:             "ns=5;s=Counter2",
		Value:             "1/2",
		FacilityId:        1,
		FacilityName:      "호퍼A",
		FacilityDesc:      "분말 저장 장치",
		FacilityLat:       37.5599782,
		FacilityLon:       126.9795979,
		FacilityPath:      "/public/img/facility-hopper-A.jpg",
		TagId:             2,
		TagDatasource:     1,
		TagTableName:      "opcua_1",
		TagColumnName:     "ns=5;s=Counter2",
		TagColumnType:     "float",
		TagName:           "ns=5;s=Counter2",
		FacilityTreePath:  "1/2",
		FacilityTreeOrder: 2,
		Children:          []m.TsFacilityTreeItem{},
	}
	hopper_a_control_3 := m.TsFacilityTreeItem{
		SiteId:            1,
		Label:             "분말 조절 장치-3",
		Value:             "1/3",
		FacilityId:        1,
		FacilityName:      "호퍼A",
		FacilityDesc:      "분말 저장 장치",
		FacilityLat:       37.5599782,
		FacilityLon:       126.9795979,
		FacilityPath:      "/public/img/facility-hopper-A.jpg",
		TagId:             3,
		TagDatasource:     1,
		TagTableName:      "opcua_1",
		TagColumnName:     "ns=5;s=Counter3",
		TagColumnType:     "float",
		TagName:           "분말 조절 장치-3",
		FacilityTreePath:  "1/3",
		FacilityTreeOrder: 3,
		Children:          []m.TsFacilityTreeItem{},
	}

	hopper_a := m.TsFacilityTreeItem{
		SiteId:            1,
		Label:             "호퍼A",
		Value:             "1/",
		FacilityId:        1,
		FacilityName:      "호퍼A",
		FacilityDesc:      "분말 저장 장치",
		FacilityLat:       37.5599782,
		FacilityLon:       126.9795979,
		FacilityPath:      "/public/img/facility-hopper-A.jpg",
		TagId:             0,
		TagDatasource:     0,
		TagTableName:      "",
		TagColumnName:     "",
		TagColumnType:     "",
		TagName:           "",
		FacilityTreePath:  "1/",
		FacilityTreeOrder: 1,
		Children:          []m.TsFacilityTreeItem{hopper_a_control_1, hopper_a_control_2, hopper_a_control_3},
	}

	hopper_b_rail_1 := m.TsFacilityTreeItem{
		SiteId:            1,
		Label:             "속도",
		Value:             "2/3/4",
		FacilityId:        3,
		FacilityName:      "Rail",
		FacilityDesc:      "호퍼B로 유입되는 철분말의 레일 장비",
		FacilityLat:       37.5599782,
		FacilityLon:       126.9795979,
		FacilityPath:      "/public/img/facility-hopper-B-Rail.jpg",
		TagId:             4,
		TagDatasource:     1,
		TagTableName:      "mqtt_1",
		TagColumnName:     "speed",
		TagColumnType:     "float",
		TagName:           "속도",
		FacilityTreePath:  "2/3/4",
		FacilityTreeOrder: 1,
		Children:          []m.TsFacilityTreeItem{},
	}
	hopper_b_rail_2 := m.TsFacilityTreeItem{
		SiteId:            1,
		Label:             "전력",
		Value:             "2/3/5",
		FacilityId:        3,
		FacilityName:      "Rail",
		FacilityDesc:      "호퍼B로 유입되는 철분말의 레일 장비",
		FacilityLat:       37.5599782,
		FacilityLon:       126.9795979,
		FacilityPath:      "/public/img/facility-hopper-B-Rail.jpg",
		TagId:             5,
		TagDatasource:     1,
		TagTableName:      "mqtt_1",
		TagColumnName:     "power",
		TagColumnType:     "float",
		TagName:           "전력",
		FacilityTreePath:  "2/3/5",
		FacilityTreeOrder: 2,
		Children:          []m.TsFacilityTreeItem{},
	}
	hopper_b_rail_3 := m.TsFacilityTreeItem{
		SiteId:            1,
		Label:             "전압",
		Value:             "2/3/6",
		FacilityId:        3,
		FacilityName:      "Rail",
		FacilityDesc:      "호퍼B로 유입되는 철분말의 레일 장비",
		FacilityLat:       37.5599782,
		FacilityLon:       126.9795979,
		FacilityPath:      "/public/img/facility-hopper-B-Rail.jpg",
		TagId:             6,
		TagDatasource:     1,
		TagTableName:      "mqtt_1",
		TagColumnName:     "volte",
		TagColumnType:     "float",
		TagName:           "전압",
		FacilityTreePath:  "2/3/6",
		FacilityTreeOrder: 3,
		Children:          []m.TsFacilityTreeItem{},
	}

	hopper_b_rail := m.TsFacilityTreeItem{
		SiteId:            1,
		Label:             "Rail",
		Value:             "2/3",
		FacilityId:        3,
		FacilityName:      "Rail",
		FacilityDesc:      "호퍼B로 유입되는 철분말의 레일 장비",
		FacilityLat:       37.5599782,
		FacilityLon:       126.9795979,
		FacilityPath:      "/public/img/facility-hopper-B-Rail.jpg",
		TagId:             0,
		TagDatasource:     0,
		TagTableName:      "",
		TagColumnName:     "",
		TagColumnType:     "",
		TagName:           "",
		FacilityTreePath:  "2/3",
		FacilityTreeOrder: 1,
		Children:          []m.TsFacilityTreeItem{hopper_b_rail_1, hopper_b_rail_2, hopper_b_rail_3},
	}

	hopper_b := m.TsFacilityTreeItem{
		SiteId:            1,
		Label:             "호퍼B",
		Value:             "2/",
		FacilityId:        2,
		FacilityName:      "호퍼B",
		FacilityDesc:      "분말 저장 장치",
		FacilityLat:       37.5599782,
		FacilityLon:       126.9795979,
		FacilityPath:      "/public/img/facility-hopper-B.jpg",
		TagId:             0,
		TagDatasource:     0,
		TagTableName:      "",
		TagColumnName:     "",
		TagColumnType:     "",
		TagName:           "",
		FacilityTreePath:  "2/",
		FacilityTreeOrder: 2,
		Children:          []m.TsFacilityTreeItem{hopper_b_rail},
	}
	switch target {
	case "1":
		result := []m.TsFacilityTreeItem{hopper_a, hopper_b}
		return result
	}
	result := []m.TsFacilityTreeItem{}
	return result
}
