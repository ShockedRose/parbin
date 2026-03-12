package store

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type SessionStore struct {
	pool *pgxpool.Pool
}

func NewSessionStore(pool *pgxpool.Pool) *SessionStore {
	return &SessionStore{pool: pool}
}

func (s *SessionStore) Create(ctx context.Context, adminID, tokenHash string, expiresAt time.Time) (Session, error) {
	const query = `
		INSERT INTO sessions (admin_id, token_hash, expires_at)
		VALUES ($1, $2, $3)
		RETURNING id, admin_id, token_hash, expires_at, created_at
	`

	var session Session
	if err := s.pool.QueryRow(ctx, query, adminID, tokenHash, expiresAt).Scan(
		&session.ID,
		&session.AdminID,
		&session.TokenHash,
		&session.ExpiresAt,
		&session.CreatedAt,
	); err != nil {
		return Session{}, fmt.Errorf("create session: %w", err)
	}

	return session, nil
}

func (s *SessionStore) DeleteByHash(ctx context.Context, tokenHash string) error {
	if _, err := s.pool.Exec(ctx, `DELETE FROM sessions WHERE token_hash = $1`, tokenHash); err != nil {
		return fmt.Errorf("delete session by hash: %w", err)
	}
	return nil
}

func (s *SessionStore) DeleteExpired(ctx context.Context) error {
	if _, err := s.pool.Exec(ctx, `DELETE FROM sessions WHERE expires_at <= NOW()`); err != nil {
		return fmt.Errorf("delete expired sessions: %w", err)
	}
	return nil
}

func (s *SessionStore) GetAdminByHash(ctx context.Context, tokenHash string) (Admin, error) {
	const query = `
		SELECT a.id, a.email, a.password_hash, a.created_at
		FROM sessions s
		JOIN admins a ON a.id = s.admin_id
		WHERE s.token_hash = $1
		  AND s.expires_at > NOW()
	`

	var admin Admin
	if err := s.pool.QueryRow(ctx, query, tokenHash).Scan(
		&admin.ID,
		&admin.Email,
		&admin.PasswordHash,
		&admin.CreatedAt,
	); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return Admin{}, ErrNotFound
		}
		return Admin{}, fmt.Errorf("get admin by session hash: %w", err)
	}

	return admin, nil
}
