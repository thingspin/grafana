package sqlstore

import (
	"bytes"
	"fmt"
	"strings"

	"github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/services/annotations"
)

func (r *SqlAnnotationRepo) FindStateCount(query *annotations.TsItemQuery) (num int64, err error) {
	num, err = x.Table("annotation").
		Where("dashboard_id = ?", query.DashboardId).
		Where("panel_id = ?", query.PanelId).
		Where("alert_id > 0").
		Where("new_state = ?", query.NewState).
		Count()

	if err != nil {
		return -1, err
	}

	return num, nil
}

// customized 'Find' Method
func (r *SqlAnnotationRepo) TsFind(query *annotations.TsItemQuery) ([]*annotations.ItemDTO, error) {
	var sql bytes.Buffer
	params := make([]interface{}, 0)

	sql.WriteString(`
		SELECT
			annotation.id,
			annotation.epoch as time,
			annotation.epoch_end as time_end,
			annotation.dashboard_id,
			annotation.panel_id,
			annotation.new_state,
			annotation.prev_state,
			annotation.alert_id,
			annotation.text,
			annotation.tags,
			annotation.data,
			annotation.created,
			annotation.updated,
			usr.email,
			usr.login,
			alert.name as alert_name
		FROM annotation
		LEFT OUTER JOIN ` + dialect.Quote("user") + ` as usr on usr.id = annotation.user_id
		LEFT OUTER JOIN alert on alert.id = annotation.alert_id
		`)

	sql.WriteString(`WHERE annotation.org_id = ?`)
	params = append(params, query.OrgId)

	if query.AnnotationId != 0 {
		// fmt.Print("annotation query")
		sql.WriteString(` AND annotation.id = ?`)
		params = append(params, query.AnnotationId)
	}

	if query.AlertId != 0 {
		sql.WriteString(` AND annotation.alert_id = ?`)
		params = append(params, query.AlertId)
	}

	if query.DashboardId != 0 {
		sql.WriteString(` AND annotation.dashboard_id = ?`)
		params = append(params, query.DashboardId)
	}

	if query.PanelId != 0 {
		sql.WriteString(` AND annotation.panel_id = ?`)
		params = append(params, query.PanelId)
	}

	if query.UserId != 0 {
		sql.WriteString(` AND annotation.user_id = ?`)
		params = append(params, query.UserId)
	}

	if query.From > 0 && query.To > 0 {
		sql.WriteString(` AND annotation.epoch <= ? AND annotation.epoch_end >= ?`)
		params = append(params, query.To, query.From)
	}

	if query.Type == "alert" {
		sql.WriteString(` AND annotation.alert_id > 0`)
	} else if query.Type == "annotation" {
		sql.WriteString(` AND annotation.alert_id = 0`)
	}

	if query.NewState != "" {
		sql.WriteString(` AND annotation.new_state <= '?'`)
		params = append(params, query.NewState)
	}

	if len(query.Tags) > 0 {
		keyValueFilters := []string{}

		tags := models.ParseTagPairs(query.Tags)
		for _, tag := range tags {
			if tag.Value == "" {
				keyValueFilters = append(keyValueFilters, "(tag."+dialect.Quote("key")+" = ?)")
				params = append(params, tag.Key)
			} else {
				keyValueFilters = append(keyValueFilters, "(tag."+dialect.Quote("key")+" = ? AND tag."+dialect.Quote("value")+" = ?)")
				params = append(params, tag.Key, tag.Value)
			}
		}

		if len(tags) > 0 {
			tagsSubQuery := fmt.Sprintf(`
        SELECT SUM(1) FROM annotation_tag at
          INNER JOIN tag on tag.id = at.tag_id
          WHERE at.annotation_id = annotation.id
            AND (
              %s
            )
      `, strings.Join(keyValueFilters, " OR "))

			if query.MatchAny {
				sql.WriteString(fmt.Sprintf(" AND (%s) > 0 ", tagsSubQuery))
			} else {
				sql.WriteString(fmt.Sprintf(" AND (%s) = %d ", tagsSubQuery, len(tags)))
			}

		}
	}

	if query.Limit == 0 {
		query.Limit = 100
	}

	sql.WriteString(" ORDER BY epoch DESC" + dialect.Limit(query.Limit))

	items := make([]*annotations.ItemDTO, 0)

	if err := x.SQL(sql.String(), params...).Find(&items); err != nil {
		return nil, err
	}

	return items, nil
}
