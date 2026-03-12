package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/joho/godotenv"

	"parbin/backend/internal/config"
	"parbin/backend/internal/database"
	"parbin/backend/internal/httpapi"
	"parbin/backend/internal/service"
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

	pool, err := store.OpenPool(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("open postgres: %v", err)
	}
	defer pool.Close()

	if err := database.RunMigrations(ctx, pool); err != nil {
		log.Fatalf("run migrations: %v", err)
	}

	adminStore := store.NewAdminStore(pool)
	sessionStore := store.NewSessionStore(pool)
	eventStore := store.NewEventStore(pool)
	suggestionStore := store.NewEventSuggestionStore(pool)

	authService := service.NewAuthService(adminStore, sessionStore, cfg.SessionSecret, cfg.SessionTTL)
	eventService := service.NewEventService(eventStore, suggestionStore, cfg.Location)

	if err := authService.CleanupExpiredSessions(ctx); err != nil {
		log.Printf("cleanup sessions: %v", err)
	}

	if cfg.SeedAdminAutoProvision {
		if err := authService.EnsureSeedAdmin(ctx, cfg.SeedAdminEmail, cfg.SeedAdminPassword); err != nil {
			log.Fatalf("seed admin: %v", err)
		}
	}

	router := httpapi.NewRouter(cfg, authService, eventService)
	server := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           router,
		ReadHeaderTimeout: 5 * time.Second,
	}

	go func() {
		<-ctx.Done()

		shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		if err := server.Shutdown(shutdownCtx); err != nil {
			log.Printf("server shutdown: %v", err)
		}
	}()

	log.Printf("parbin backend listening on http://localhost:%s", cfg.Port)
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("listen and serve: %v", err)
	}
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
