package logger

import (
	"io"
	"os"

	"github.com/sirupsen/logrus"
	"gopkg.in/natefinch/lumberjack.v2"
)

var Log *logrus.Logger

func InitLogger() *logrus.Logger {
	Log = logrus.New()

	Log.SetFormatter(&logrus.TextFormatter{
		FullTimestamp:   true,
		TimestampFormat: "2006-01-02 15:04:05",
	})

	logRotator := &lumberjack.Logger{
		Filename:   "logs/my.log",
		MaxSize:    10, // megabytes
		MaxBackups: 3,
		MaxAge:     28, // days
		Compress:   true,
	}

	Log.SetOutput(io.MultiWriter(os.Stdout, logRotator))
	Log.SetLevel(logrus.InfoLevel)
	Log.Info("Logger initialised")

	return Log
}
