package tsmodels

type GetFmsTagDefineQuery struct {
	Result []TsFacilityTreeItem
}

type FmsConnectQueryResult struct {
	Id int	    `json:"id"`
	Type string `json:"type"`
	Name string `json:"name"`
}

type GetFmsConnectCommand struct {                                   
	Result []*FmsConnectQueryResult
}

