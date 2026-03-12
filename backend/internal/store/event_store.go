package store

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type EventStore struct {
	pool *pgxpool.Pool
}

type EventInput struct {
	Title       string
	Description string
	StartsAt    time.Time
	EndsAt      time.Time
	Location    string
	ImageURL    string
	Tags        []string
}

func NewEventStore(pool *pgxpool.Pool) *EventStore {
	return &EventStore{pool: pool}
}

func (s *EventStore) List(ctx context.Context) ([]Event, error) {
	const query = `
		SELECT id, title, description, starts_at, ends_at, location, image_url, tags, created_at, updated_at
		FROM events
		ORDER BY starts_at ASC, created_at DESC
	`

	rows, err := s.pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("list events: %w", err)
	}
	defer rows.Close()

	events := make([]Event, 0)
	for rows.Next() {
		var event Event
		if err := rows.Scan(
			&event.ID,
			&event.Title,
			&event.Description,
			&event.StartsAt,
			&event.EndsAt,
			&event.Location,
			&event.ImageURL,
			&event.Tags,
			&event.CreatedAt,
			&event.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("scan event: %w", err)
		}
		events = append(events, event)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate events: %w", err)
	}

	return events, nil
}

func (s *EventStore) Create(ctx context.Context, input EventInput) (Event, error) {
	const query = `
		INSERT INTO events (title, description, starts_at, ends_at, location, image_url, tags)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, title, description, starts_at, ends_at, location, image_url, tags, created_at, updated_at
	`

	var event Event
	if err := s.pool.QueryRow(
		ctx,
		query,
		input.Title,
		input.Description,
		input.StartsAt,
		input.EndsAt,
		input.Location,
		input.ImageURL,
		input.Tags,
	).Scan(
		&event.ID,
		&event.Title,
		&event.Description,
		&event.StartsAt,
		&event.EndsAt,
		&event.Location,
		&event.ImageURL,
		&event.Tags,
		&event.CreatedAt,
		&event.UpdatedAt,
	); err != nil {
		return Event{}, fmt.Errorf("create event: %w", err)
	}

	return event, nil
}
