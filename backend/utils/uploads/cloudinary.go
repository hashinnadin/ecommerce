package uploads

import (
	"context"
	"mime/multipart"
	"os"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
)

type CloudinaryResult struct {
	URL      string
	PublicID string
}

func UploadImageFile(file multipart.File, filename string) (*CloudinaryResult, error) {
	cld, err := cloudinary.NewFromParams(
		os.Getenv("CLOUD_NAME"),
		os.Getenv("API_KEY"),
		os.Getenv("API_SECRET"),
	)
	if err != nil {
		return nil, err
	}

	ctx := context.Background()
	
	resp, err := cld.Upload.Upload(ctx, file, uploader.UploadParams{
		Folder: "products",
		PublicID: filename,
	})
	if err != nil {
		return nil, err
	}

	return &CloudinaryResult{
		URL:      resp.SecureURL,
		PublicID: resp.PublicID,
	}, nil
}

func DeleteImage(publicID string) error {
	cld, err := cloudinary.NewFromParams(
		os.Getenv("CLOUD_NAME"),
		os.Getenv("API_KEY"),
		os.Getenv("API_SECRET"),
	)
	if err != nil {
		return err
	}

	ctx := context.Background()
	_, err = cld.Upload.Destroy(ctx, uploader.DestroyParams{
		PublicID: publicID,
	})
	return err
}
