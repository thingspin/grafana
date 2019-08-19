package tsmodels

// import "database/sql"

type TsFacilityTreePathItem struct {
	SiteId            int                  `json:"site_id"`
	Label             string               `json:"label"`
	Value             string               `json:"value"`
	IsChecked         bool                 `json:"isChecked"`
	IsEditing         bool                 `json:"isEditing"`
	FacilityId        int                  `json:"facility_id"`
	FacilityName      string               `json:"facility_name"`
	FacilityDesc      string               `json:"facility_desc"`
	FacilityLat       float32              `json:"facility_lat"`
	FacilityLon       float32              `json:"facility_lon"`
	FacilityPath      string               `json:"facility_path"`
	TagId             int                  `json:"tag_id"`
	TagDatasource     int                  `json:"tag_datasource"`
	TagTableName      string               `json:"tag_table_name"`
	TagColumnName     string               `json:"tag_column_name"`
	TagColumnType     string               `json:"tag_column_type"`
	TagName           string               `json:"tag_name"`
	FacilityTreePath  string               `json:"facility_tree_path"`
	FacilityTreeOrder int                  `json:"facility_tree_order"`
}

type AddTsFacilityTreePathOneQuery struct {
	Result TsFacilityTreeItem
}

type AddTsFacilityTreePathQuery struct {
	Result []TsFacilityTreeItem
}

type UpdateTsFacilityTreePathQuery struct {
	Result []TsFacilityTreeItem
}

type DeleteTsFacilityTreePathQuery struct {
	Result []TsFacilityTreeItem
	Delete []TsFacilityTreeItem
}

type TsFacilityTreeItem struct {
	SiteId            int                  `json:"site_id"`
	Label             string               `json:"label"`
	Value             string               `json:"value"`
	IsValid           bool                 `json:"isValid"`
	IsPtag            bool                 `json:"isPtag"`
	IsChecked         bool                 `json:"isChecked"`
	IsEditing         bool                 `json:"isEditing"`	
	FacilityId        int                  `json:"facility_id"`
	FacilityName      string               `json:"facility_name"`
	FacilityDesc      string               `json:"facility_desc"`
	FacilityLat       float32              `json:"facility_lat"`
	FacilityLon       float32              `json:"facility_lon"`
	FacilityPath      string               `json:"facility_path"`
	TagId             int                  `json:"tag_id"`
	TagDatasource     int                  `json:"tag_datasource"`
	TagTableName      string               `json:"tag_table_name"`
	TagColumnName     string               `json:"tag_column_name"`
	TagColumnType     string               `json:"tag_column_type"`
	TagName           string               `json:"tag_name"`
	FacilityTreePath  string               `json:"facility_tree_path"`
	FacilityTreeOrder int                  `json:"facility_tree_order"`
	Children          []TsFacilityTreeItem `json:"children"`
}
