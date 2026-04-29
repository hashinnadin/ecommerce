package repository

import "gorm.io/gorm"

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

func (r *Repository) Updatefields(obj interface{}, id interface{}, fields map[string]interface{}) error {
	return r.DB.Model(obj).Where("id=?", id).Updates(fields).Error
}

func (r *Repository) Delete(obj interface{}, id interface{}) error {
	return r.DB.Where("id = ?", id).Delete(obj).Error
}

func (r *Repository) GetDB() *gorm.DB {
	return r.DB
}
