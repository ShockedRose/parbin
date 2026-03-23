package store

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type EventStore struct {
	pool *pgxpool.Pool
}

type EventInput struct {
	Title            string
	Description      string
	StartsAt         time.Time
	EndsAt           time.Time
	Location         string
	ImageURL         string
	Tags             []string
	SourceEventPage  string
}

func NewEventStore(pool *pgxpool.Pool) *EventStore {
	return &EventStore{pool: pool}
}

func nullStringToPtr(n sql.NullString) *string {
	if !n.Valid {
		return nil
	}
	s := n.String
	return &s
}

func (s *EventStore) ListUpcoming(ctx context.Context, from time.Time) ([]Event, error) {
	const query = `
		SELECT id, title, description, starts_at, ends_at, location, image_url, tags, source_event_page, created_at, updated_at
		FROM events
		WHERE starts_at >= $1
		ORDER BY starts_at ASC, created_at DESC
	`

	rows, err := s.pool.Query(ctx, query, from)
	if err != nil {
		return nil, fmt.Errorf("list upcoming events: %w", err)
	}
	defer rows.Close()

	events := make([]Event, 0)
	for rows.Next() {
		var event Event
		var sourcePage sql.NullString
		if err := rows.Scan(
			&event.ID,
			&event.Title,
			&event.Description,
			&event.StartsAt,
			&event.EndsAt,
			&event.Location,
			&event.ImageURL,
			&event.Tags,
			&sourcePage,
			&event.CreatedAt,
			&event.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("scan event: %w", err)
		}
		event.SourceEventPage = nullStringToPtr(sourcePage)
		events = append(events, event)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate events: %w", err)
	}

	return events, nil
}

func (s *EventStore) ListPastRecent(ctx context.Context, before time.Time, limit int) ([]Event, error) {
	const query = `
		SELECT id, title, description, starts_at, ends_at, location, image_url, tags, source_event_page, created_at, updated_at
		FROM events
		WHERE starts_at < $1
		ORDER BY starts_at DESC
		LIMIT $2
	`

	rows, err := s.pool.Query(ctx, query, before, limit)
	if err != nil {
		return nil, fmt.Errorf("list past events: %w", err)
	}
	defer rows.Close()

	events := make([]Event, 0)
	for rows.Next() {
		var event Event
		var sourcePage sql.NullString
		if err := rows.Scan(
			&event.ID,
			&event.Title,
			&event.Description,
			&event.StartsAt,
			&event.EndsAt,
			&event.Location,
			&event.ImageURL,
			&event.Tags,
			&sourcePage,
			&event.CreatedAt,
			&event.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("scan event: %w", err)
		}
		event.SourceEventPage = nullStringToPtr(sourcePage)
		events = append(events, event)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate events: %w", err)
	}

	return events, nil
}

func (s *EventStore) Get(ctx context.Context, id string) (Event, error) {
	const query = `
		SELECT id, title, description, starts_at, ends_at, location, image_url, tags, source_event_page, created_at, updated_at
		FROM events
		WHERE id = $1
	`

	var event Event
	var sourcePage sql.NullString
	if err := s.pool.QueryRow(ctx, query, id).Scan(
		&event.ID,
		&event.Title,
		&event.Description,
		&event.StartsAt,
		&event.EndsAt,
		&event.Location,
		&event.ImageURL,
		&event.Tags,
		&sourcePage,
		&event.CreatedAt,
		&event.UpdatedAt,
	); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return Event{}, ErrNotFound
		}
		return Event{}, fmt.Errorf("get event: %w", err)
	}

	event.SourceEventPage = nullStringToPtr(sourcePage)
	return event, nil
}

func (s *EventStore) Update(ctx context.Context, id string, input EventInput) (Event, error) {
	const query = `
		UPDATE events
		SET title = $2, description = $3, starts_at = $4, ends_at = $5, location = $6, image_url = $7, tags = $8, source_event_page = $9, updated_at = NOW()
		WHERE id = $1
		RETURNING id, title, description, starts_at, ends_at, location, image_url, tags, source_event_page, created_at, updated_at
	`

	var event Event
	var sourcePage sql.NullString
	if err := s.pool.QueryRow(
		ctx,
		query,
		id,
		input.Title,
		input.Description,
		input.StartsAt,
		input.EndsAt,
		input.Location,
		input.ImageURL,
		input.Tags,
		optionalText(input.SourceEventPage),
	).Scan(
		&event.ID,
		&event.Title,
		&event.Description,
		&event.StartsAt,
		&event.EndsAt,
		&event.Location,
		&event.ImageURL,
		&event.Tags,
		&sourcePage,
		&event.CreatedAt,
		&event.UpdatedAt,
	); err != nil {
		if err.Error() == "no rows in result set" {
			return Event{}, ErrNotFound
		}
		return Event{}, fmt.Errorf("update event: %w", err)
	}

	event.SourceEventPage = nullStringToPtr(sourcePage)
	return event, nil
}

func (s *EventStore) Create(ctx context.Context, input EventInput) (Event, error) {
	const query = `
		INSERT INTO events (title, description, starts_at, ends_at, location, image_url, tags, source_event_page)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, title, description, starts_at, ends_at, location, image_url, tags, source_event_page, created_at, updated_at
	`

	var event Event
	var sourcePage sql.NullString
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
		optionalText(input.SourceEventPage),
	).Scan(
		&event.ID,
		&event.Title,
		&event.Description,
		&event.StartsAt,
		&event.EndsAt,
		&event.Location,
		&event.ImageURL,
		&event.Tags,
		&sourcePage,
		&event.CreatedAt,
		&event.UpdatedAt,
	); err != nil {
		return Event{}, fmt.Errorf("create event: %w", err)
	}

	event.SourceEventPage = nullStringToPtr(sourcePage)
	return event, nil
}

func optionalText(value string) interface{} {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return nil
	}
	return trimmed
}
