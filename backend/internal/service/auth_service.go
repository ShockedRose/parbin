package service

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"parbin/backend/internal/auth"
	"parbin/backend/internal/store"
)

type AuthService struct {
	admins        *store.AdminStore
	sessions      *store.SessionStore
	sessionSecret string
	sessionTTL    time.Duration
}

func NewAuthService(admins *store.AdminStore, sessions *store.SessionStore, sessionSecret string, sessionTTL time.Duration) *AuthService {
	return &AuthService{
		admins:        admins,
		sessions:      sessions,
		sessionSecret: sessionSecret,
		sessionTTL:    sessionTTL,
	}
}

func (s *AuthService) EnsureSeedAdmin(ctx context.Context, email, password string) error {
	email = strings.TrimSpace(strings.ToLower(email))
	password = strings.TrimSpace(password)
	if email == "" || password == "" {
		return fmt.Errorf("%w: seed admin email and password are required", ErrValidation)
	}

	hash, err := auth.HashPassword(password)
	if err != nil {
		return fmt.Errorf("hash seed admin password: %w", err)
	}

	return s.admins.EnsureSeedAdmin(ctx, email, hash)
}

func (s *AuthService) Login(ctx context.Context, email, password string) (store.Admin, string, time.Time, error) {
	email = strings.TrimSpace(strings.ToLower(email))
	password = strings.TrimSpace(password)
	if email == "" || password == "" {
		return store.Admin{}, "", time.Time{}, fmt.Errorf("%w: email and password are required", ErrValidation)
	}

	admin, err := s.admins.GetByEmail(ctx, email)
	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			return store.Admin{}, "", time.Time{}, ErrInvalidCredentials
		}
		return store.Admin{}, "", time.Time{}, err
	}

	if err := auth.CheckPassword(admin.PasswordHash, password); err != nil {
		return store.Admin{}, "", time.Time{}, ErrInvalidCredentials
	}

	token, err := auth.NewSessionToken()
	if err != nil {
		return store.Admin{}, "", time.Time{}, fmt.Errorf("create session token: %w", err)
	}

	expiresAt := time.Now().Add(s.sessionTTL)
	tokenHash := auth.HashSessionToken(s.sessionSecret, token)
	if _, err := s.sessions.Create(ctx, admin.ID, tokenHash, expiresAt); err != nil {
		return store.Admin{}, "", time.Time{}, err
	}

	return admin, token, expiresAt, nil
}

func (s *AuthService) Logout(ctx context.Context, token string) error {
	token = strings.TrimSpace(token)
	if token == "" {
		return nil
	}

	tokenHash := auth.HashSessionToken(s.sessionSecret, token)
	return s.sessions.DeleteByHash(ctx, tokenHash)
}

func (s *AuthService) GetAdminFromToken(ctx context.Context, token string) (store.Admin, error) {
	token = strings.TrimSpace(token)
	if token == "" {
		return store.Admin{}, ErrUnauthorized
	}

	tokenHash := auth.HashSessionToken(s.sessionSecret, token)
	admin, err := s.sessions.GetAdminByHash(ctx, tokenHash)
	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			return store.Admin{}, ErrUnauthorized
		}
		return store.Admin{}, err
	}

	return admin, nil
}

func (s *AuthService) CleanupExpiredSessions(ctx context.Context) error {
	return s.sessions.DeleteExpired(ctx)
}
