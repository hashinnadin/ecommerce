package cache

import (
	"context"

	"github.com/redis/go-redis/v9"
)

// Creating a single-noded stand alone redis
var Ctx = context.Background()

type Redis struct {
	Client *redis.Client
}

func NewRedis() *Redis {
	client := redis.NewClient(&redis.Options{
		Addr: "127.0.0.1:6379",
		DB:   0,
	})

	// Fail fast if Redis is not running
	if err := client.Ping(Ctx).Err(); err != nil {
		panic("Failed to connect to Redis. Please make sure Redis is installed and running externally! Error: " + err.Error())
	}

	return &Redis{Client: client}
}
