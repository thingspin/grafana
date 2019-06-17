package models

// build error fix(JGW)
type BatchDisableUsersCommand struct {
	UserIds    []int64
	IsDisabled interface{}
}