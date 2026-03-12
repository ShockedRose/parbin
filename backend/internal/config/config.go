package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"
)

type Config struct {
	AppEnv                 string
	Port                   string
	DatabaseURL            string
	AppTimezone            string
	Location               *time.Location
	FrontendOrigin         string
	SessionCookieName      string
	SessionSecret          string
	SessionTTL             time.Duration
	SessionSecureCookies   bool
	SeedAdminEmail         string
	SeedAdminPassword      string
	SeedAdminAutoProvision bool
}

func Load() (Config, error) {
	timezone := getEnv("APP_TIMEZONE", "America/Panama")
	location, err := time.LoadLocation(timezone)
	if err != nil {
		return Config{}, fmt.Errorf("load app timezone: %w", err)
	}

	cfg := Config{
		AppEnv:                 getEnv("APP_ENV", "development"),
		Port:                   getEnv("PORT", "8080"),
		DatabaseURL:            getEnv("DATABASE_URL", ""),
		AppTimezone:            timezone,
		Location:               location,
		FrontendOrigin:         getEnv("FRONTEND_ORIGIN", "http://localhost:5173"),
		SessionCookieName:      getEnv("SESSION_COOKIE_NAME", "parbin_session"),
		SessionSecret:          getEnv("SESSION_SECRET", ""),
		SessionTTL:             getEnvDuration("SESSION_TTL", 7*24*time.Hour),
		SessionSecureCookies:   getEnvBool("SESSION_SECURE_COOKIES", false),
		SeedAdminEmail:         getEnv("SEED_ADMIN_EMAIL", "admin@parbin.local"),
		SeedAdminPassword:      getEnv("SEED_ADMIN_PASSWORD", "change-me-123"),
		SeedAdminAutoProvision: getEnvBool("SEED_ADMIN_AUTO_PROVISION", true),
	}

	if cfg.DatabaseURL == "" {
		return Config{}, fmt.Errorf("DATABASE_URL is required")
	}

	if strings.TrimSpace(cfg.SessionSecret) == "" {
		return Config{}, fmt.Errorf("SESSION_SECRET is required")
	}

	return cfg, nil
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok && strings.TrimSpace(value) != "" {
		return value
	}

	return fallback
}

func getEnvBool(key string, fallback bool) bool {
	value, ok := os.LookupEnv(key)
	if !ok || strings.TrimSpace(value) == "" {
		return fallback
	}

	parsed, err := strconv.ParseBool(value)
	if err != nil {
		return fallback
	}

	return parsed
}

func getEnvDuration(key string, fallback time.Duration) time.Duration {
	value, ok := os.LookupEnv(key)
	if !ok || strings.TrimSpace(value) == "" {
		return fallback
	}

	parsed, err := time.ParseDuration(value)
	if err != nil {
		return fallback
	}

	return parsed
}
