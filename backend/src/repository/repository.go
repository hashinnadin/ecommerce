package repository

import (
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type Repository struct {
	DB *gorm.DB
}

func SetUpRepo(db *gorm.DB) *Repository {
	return &Repository{DB: db}
}

func (r *Repository) Insert(req interface{}) error {
	if err := r.DB.Debug().Create(req).Error; err != nil {
		return err
	}
	return nil
}

func (r *Repository) UpdateByFields(obj interface{}, id interface{}, fields map[string]interface{}) error {
	return r.DB.Model(obj).Where("id=?", id).Updates(fields).Error
}

func (r *Repository) Delete(obj interface{}, id interface{}) error {
	return r.DB.Where("id = ?", id).Delete(obj).Error
}

func (r *Repository) FindByID(obj interface{}, id interface{}) error {
	return r.DB.First(obj, "id = ?", id).Error
}

func (r *Repository) FindByIDWithLock(obj interface{}, id interface{}) error {
	return r.DB.Clauses(clause.Locking{Strength: "UPDATE"}).First(obj, "id = ?", id).Error
}

func (r *Repository) FindOneWhere(obj interface{}, query string, args ...interface{}) error {
	return r.DB.Where(query, args...).First(obj).Error
}

func (r *Repository) Where(obj interface{}, query string, args ...interface{}) error {
	return r.DB.Where(query, args...).Find(obj).Error
}

func (r *Repository) FindAll(obj interface{}) error {
	return r.DB.Find(obj).Error
}

func (r *Repository) GetDB() *gorm.DB {
	return r.DB
}

func (r *Repository) Transaction(fn func(txRepo PgSQLRepository) error) error {
	return r.DB.Transaction(func(tx *gorm.DB) error {
		txRepo := &Repository{DB: tx}
		return fn(txRepo)
	})
}
