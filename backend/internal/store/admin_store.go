package store

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type AdminStore struct {
	pool *pgxpool.Pool
}

func NewAdminStore(pool *pgxpool.Pool) *AdminStore {
	return &AdminStore{pool: pool}
}

func (s *AdminStore) GetByEmail(ctx context.Context, email string) (Admin, error) {
	const query = `
		SELECT id, email, password_hash, created_at
		FROM admins
		WHERE email = $1
	`

	var admin Admin
	if err := s.pool.QueryRow(ctx, query, email).Scan(
		&admin.ID,
		&admin.Email,
		&admin.PasswordHash,
		&admin.CreatedAt,
	); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return Admin{}, ErrNotFound
		}
		return Admin{}, fmt.Errorf("get admin by email: %w", err)
	}

	return admin, nil
}

func (s *AdminStore) GetByID(ctx context.Context, id string) (Admin, error) {
	const query = `
		SELECT id, email, password_hash, created_at
		FROM admins
		WHERE id = $1
	`

	var admin Admin
	if err := s.pool.QueryRow(ctx, query, id).Scan(
		&admin.ID,
		&admin.Email,
		&admin.PasswordHash,
		&admin.CreatedAt,
	); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return Admin{}, ErrNotFound
		}
		return Admin{}, fmt.Errorf("get admin by id: %w", err)
	}

	return admin, nil
}

func (s *AdminStore) EnsureSeedAdmin(ctx context.Context, email, passwordHash string) error {
	const query = `
		INSERT INTO admins (email, password_hash)
		VALUES ($1, $2)
		ON CONFLICT (email) DO UPDATE
		SET password_hash = EXCLUDED.password_hash
	`

	if _, err := s.pool.Exec(ctx, query, email, passwordHash); err != nil {
		return fmt.Errorf("ensure seed admin: %w", err)
	}

	return nil
}
