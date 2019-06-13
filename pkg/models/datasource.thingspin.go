package models

type GetTsDataSourceByIdQuery struct {
	Id     int64
	Result *DataSource
}

type GetTsDataSourceByNameQuery struct {
	Name   string
	Result *DataSource
}
