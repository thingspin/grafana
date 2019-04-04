package thingspin

import (
	"fmt"
	"strings"

	m "github.com/grafana/grafana/pkg/models-thingspin"
	. "github.com/grafana/grafana/pkg/services/sqlstore/migrator"
)

func getInsertQueryData(id int, org_id int, parent_id string, new_name string, mbid int, order int) string {
	return fmt.Sprintf("(%d, %d, %s, %s, %d, %d)",
		id, org_id, parent_id, new_name, mbid, order)
}

func addFmsMenuMigrations(mg *Migrator) {
	query := fmt.Sprintf(`CREATE TABLE IF NOT EXISTS '%s' (
		"id" integer PRIMARY KEY AUTOINCREMENT,
		"permission" varchar(20),
		"org_id" integer,
		'parent_id' integer references %s(id),
		'name' text,
		'mbid' integer references %s(id),
		'req_params' json,
		'order' integer,
		"created" datetime default (datetime('now', 'localtime')),
		"updated" datetime default (datetime('now', 'localtime'))
	)`, m.TsFmsMenuTbl, m.TsFmsMenuTbl, m.TsFmsMenuBaseTbl)

	// create table
	mg.AddMigration("[thingspin] FMS 그룹 메뉴 테이블 생성", NewRawSqlMigration(query))

	defaultData := fmt.Sprintf(`INSERT INTO '%s' ('id', 'org_id', 'parent_id', 'name', 'mbid', 'order') VALUES `,
		m.TsFmsMenuTbl)
	var insertData []string
	insertData = append(insertData, getInsertQueryData(1, 0, "NULL", "NULL", 1, 1))
	insertData = append(insertData, getInsertQueryData(2, 0, "1", "NULL", 2, 1))
	insertData = append(insertData, getInsertQueryData(3, 0, "1", "NULL", 3, 2))
	insertData = append(insertData, getInsertQueryData(4, 0, "1", "NULL", 4, 3))

	insertData = append(insertData, getInsertQueryData(5, 0, "NULL", "NULL", 5, 2))
	insertData = append(insertData, getInsertQueryData(6, 0, "5", "NULL", 6, 1))
	insertData = append(insertData, getInsertQueryData(7, 0, "5", "NULL", 7, 2))
	insertData = append(insertData, getInsertQueryData(8, 0, "5", "NULL", 8, 3))
	insertData = append(insertData, getInsertQueryData(9, 0, "5", "NULL", 9, 4))
	insertData = append(insertData, getInsertQueryData(10, 0, "5", "NULL", 10, 5))

	insertData = append(insertData, getInsertQueryData(11, 0, "NULL", "NULL", 11, 3))

	insertData = append(insertData, getInsertQueryData(12, 0, "NULL", "NULL", 12, 4))
	insertData = append(insertData, getInsertQueryData(13, 0, "12", "NULL", 13, 1))
	insertData = append(insertData, getInsertQueryData(14, 0, "12", "NULL", 14, 2))
	insertData = append(insertData, getInsertQueryData(15, 0, "12", "NULL", 15, 3))

	insertData = append(insertData, getInsertQueryData(16, 0, "NULL", "NULL", 16, 5))
	insertData = append(insertData, getInsertQueryData(17, 0, "16", "NULL", 17, 1))
	insertData = append(insertData, getInsertQueryData(18, 0, "16", "NULL", 18, 2))

	insertData = append(insertData, getInsertQueryData(19, 0, "NULL", "NULL", 19, 6))
	insertData = append(insertData, getInsertQueryData(20, 0, "19", "NULL", 20, 1))
	insertData = append(insertData, getInsertQueryData(21, 0, "19", "NULL", 21, 2))
	insertData = append(insertData, getInsertQueryData(22, 0, "19", "NULL", 22, 3))
	insertData = append(insertData, getInsertQueryData(23, 0, "19", "NULL", 23, 4))
	insertData = append(insertData, getInsertQueryData(24, 0, "19", "NULL", 24, 5))
	insertData = append(insertData, getInsertQueryData(25, 0, "19", "NULL", 25, 6))

	insertData = append(insertData, getInsertQueryData(26, 0, "NULL", "NULL", 26, 7))
	insertData = append(insertData, getInsertQueryData(27, 0, "26", "NULL", 27, 1))
	insertData = append(insertData, getInsertQueryData(28, 0, "26", "NULL", 28, 2))
	insertData = append(insertData, getInsertQueryData(29, 0, "26", "NULL", 29, 3))
	insertData = append(insertData, getInsertQueryData(30, 0, "26", "NULL", 30, 4))

	insertData = append(insertData, getInsertQueryData(31, 0, "NULL", "NULL", 31, 8))
	insertData = append(insertData, getInsertQueryData(32, 0, "31", "NULL", 32, 1))
	insertData = append(insertData, getInsertQueryData(33, 0, "31", "NULL", 33, 2))
	insertData = append(insertData, getInsertQueryData(34, 0, "31", "NULL", 34, 3))

	defaultData = defaultData + strings.Join(insertData, ", ")
	mg.AddMigration("[thingspin] FMS 기본 메뉴 추가", NewRawSqlMigration(defaultData))
}
