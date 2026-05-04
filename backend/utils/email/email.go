package email

import (
	"fmt"
	"myapp/src/schema"
	"net/smtp"
)

type Service struct {
	cfg schema.Config
}

func NewEmailService(cfg *schema.Config) *Service {
	return &Service{cfg: *cfg}
}

func (s *Service) SendMail(to, subject, body string) error {
	from := s.cfg.SMTP.Username
	fromHeader := s.cfg.SMTP.From

	message := fmt.Sprintf(
		"From: %s\r\n"+
			"To: %s\r\n"+
			"Subject: %s\r\n"+
			"MIME-Version: 1.0\r\n"+
			"Content-Type: text/plain; charset=\"UTF-8\"\r\n\r\n"+
			"%s",
		fromHeader, to, subject, body,
	)
	address := fmt.Sprintf("%s:%d", s.cfg.SMTP.Host, s.cfg.SMTP.Port)

	auth := smtp.PlainAuth("", s.cfg.SMTP.Username, s.cfg.SMTP.Password, s.cfg.SMTP.Host)
	return smtp.SendMail(address, auth, from, []string{to}, []byte(message))

}

func (s *Service) SendOTP(to string, otp string) error {
	body := fmt.Sprintf(
		"Hello,\n\nYour OTP is: %s\nIt will expire in %d minutes. \n\nThanks, \nBakeHub Team",
		otp,
		s.cfg.OTP.ExpiryMinutes,
	)
	return s.SendMail(to, "Your OTP Code", body)
}
