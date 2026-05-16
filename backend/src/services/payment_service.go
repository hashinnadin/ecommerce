package services

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"myapp/src/repository"
	"myapp/src/schema"

	"github.com/razorpay/razorpay-go"
)

type PaymentService struct {
	Repo   repository.PgSQLRepository
	Config *schema.Config
	Client *razorpay.Client
}

func NewPaymentService(repo repository.PgSQLRepository, cfg *schema.Config) *PaymentService {
	client := razorpay.NewClient(cfg.Razorpay.KeyID, cfg.Razorpay.KeySecret)
	return &PaymentService{
		Repo:   repo,
		Config: cfg,
		Client: client,
	}
}

func (s *PaymentService) CreateRazorpayOrder(amount int64, receipt string) (string, error) {
	data := map[string]interface{}{
		"amount":   amount * 100, // amount in paisa
		"currency": "INR",
		"receipt":  receipt,
	}

	body, err := s.Client.Order.Create(data, nil)
	if err != nil {
		return "", err
	}

	orderID := body["id"].(string)
	return orderID, nil
}

func (s *PaymentService) VerifyPayment(orderID, paymentID, signature string) error {
	data := orderID + "|" + paymentID
	h := hmac.New(sha256.New, []byte(s.Config.Razorpay.KeySecret))
	h.Write([]byte(data))
	expectedSignature := hex.EncodeToString(h.Sum(nil))

	if expectedSignature != signature {
		return errors.New("invalid payment signature")
	}

	return nil
}
