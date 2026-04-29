package repository

import "gorm.io/gorm"

type PgSQLRepository interface {
	Insert(req interface{}) error
	Delete(obj interface{}, id interface{}) error

	UpdateByFields(obj interface{}, id interface{}, fields map[string]interface{}) error

	GetDB() *gorm.DB
}
