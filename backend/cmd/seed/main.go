package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/joho/godotenv"

	"parbin/backend/internal/config"
	"parbin/backend/internal/database"
	"parbin/backend/internal/seed"
	"parbin/backend/internal/store"
)

func main() {
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	if err := loadEnvFiles(); err != nil {
		log.Fatalf("load env files: %v", err)
	}

	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("load config: %v", err)
	}
	if strings.EqualFold(cfg.AppEnv, "production") {
		log.Fatal("refusing to seed when APP_ENV=production")
	}

	pool, err := store.OpenPool(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("open postgres: %v", err)
	}
	defer pool.Close()

	if err := database.RunMigrations(ctx, pool); err != nil {
		log.Fatalf("run migrations: %v", err)
	}

	result, err := seed.Apply(ctx, pool, cfg.Location, cfg.SeedAdminEmail, cfg.SeedAdminPassword, time.Now())
	if err != nil {
		log.Fatalf("seed dev catalog: %v", err)
	}

	log.Printf("dev seed: admin %s", result.AdminEmail)
	log.Printf("dev seed: %d tags", result.TagCount)
	log.Printf(
		"dev seed: %d events (%d past, %d upcoming); %q starts today; inserted %d, rescheduled %d",
		result.EventCount,
		result.PastCount,
		result.UpcomingCount+1,
		result.BorderlineTitle,
		result.Inserted,
		result.Rescheduled,
	)
	localStart := result.BorderlineStarts.In(cfg.Location)
	log.Printf(
		"dev seed: %q starts %s (%s) and stays on the upcoming feed until the next local midnight",
		result.BorderlineTitle,
		localStart.Format("2006-01-02 15:04"),
		cfg.AppTimezone,
	)
}

func loadEnvFiles() error {
	candidates := []string{".env", "backend/.env"}

	for _, file := range candidates {
		if _, err := os.Stat(file); err == nil {
			if err := godotenv.Load(file); err != nil {
				return err
			}
		} else if !os.IsNotExist(err) {
			return err
		}
	}

	return nil
}
