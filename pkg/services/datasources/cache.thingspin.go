package datasources

import (
	"fmt"
	"time"

	m "github.com/grafana/grafana/pkg/models"
)

// customize function GetDatasource
func (dc *CacheServiceImpl) GetTsDatasource(datasourceID int64, user *m.SignedInUser, skipCache bool) (*m.DataSource, error) {
	cacheKey := fmt.Sprintf("ds-%d", datasourceID)

	if !skipCache {
		if cached, found := dc.CacheService.Get(cacheKey); found {
			ds := cached.(*m.DataSource)
			return ds, nil
		}
	}

	query := m.GetTsDataSourceByIdQuery{Id: datasourceID}
	if err := dc.Bus.Dispatch(&query); err != nil {
		return nil, err
	}

	dc.CacheService.Set(cacheKey, query.Result, time.Second*5)
	return query.Result, nil
}
