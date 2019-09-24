package annotations

type TsItemQuery struct {
	ItemQuery

	NewState string `json:"newState"`
}

type TsRepository interface {
	Repository

	TsFind(query *TsItemQuery) ([]*ItemDTO, error)
	FindStateCount(query *TsItemQuery) (num int64, err error)
}

func GetTsRepository() TsRepository {
	return repositoryInstance.(TsRepository)
}
