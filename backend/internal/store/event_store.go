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

const eventSelectColumns = `id, title, description, starts_at, ends_at, location, image_url, ` + eventTagsSelect + `, source_event_page, created_at, updated_at`

type EventStore struct {
	pool *pgxpool.Pool
}

type EventInput struct {
	Title           string
	Description     string
	StartsAt        time.Time
	EndsAt          time.Time
	Location        string
	ImageURL        string
	Tags            []string
	SourceEventPage string
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

func scanEvent(scan func(dest ...any) error) (Event, error) {
	var event Event
	var sourcePage sql.NullString
	if err := scan(
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
		return Event{}, err
	}
	event.SourceEventPage = nullStringToPtr(sourcePage)
	event.Tags = emptyIfNil(event.Tags)
	return event, nil
}

func (s *EventStore) ListUpcoming(ctx context.Context, from time.Time) ([]Event, error) {
	query := `
		SELECT ` + eventSelectColumns + `
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
		event, err := scanEvent(rows.Scan)
		if err != nil {
			return nil, fmt.Errorf("scan event: %w", err)
		}
		events = append(events, event)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate events: %w", err)
	}

	return events, nil
}

func (s *EventStore) ListPastRecent(ctx context.Context, before time.Time, limit int) ([]Event, error) {
	query := `
		SELECT ` + eventSelectColumns + `
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
		event, err := scanEvent(rows.Scan)
		if err != nil {
			return nil, fmt.Errorf("scan event: %w", err)
		}
		events = append(events, event)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate events: %w", err)
	}

	return events, nil
}

func (s *EventStore) Get(ctx context.Context, id string) (Event, error) {
	query := `
		SELECT ` + eventSelectColumns + `
		FROM events
		WHERE id = $1
	`

	event, err := scanEvent(s.pool.QueryRow(ctx, query, id).Scan)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return Event{}, ErrNotFound
		}
		return Event{}, fmt.Errorf("get event: %w", err)
	}

	return event, nil
}

func (s *EventStore) Update(ctx context.Context, id string, input EventInput) (Event, error) {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return Event{}, fmt.Errorf("begin update event: %w", err)
	}
	defer tx.Rollback(ctx)

	query := `
		UPDATE events
		SET title = $2, description = $3, starts_at = $4, ends_at = $5, location = $6, image_url = $7, source_event_page = $8, updated_at = NOW()
		WHERE id = $1
		RETURNING ` + eventSelectColumns + `
	`

	event, err := scanEvent(tx.QueryRow(
		ctx,
		query,
		id,
		input.Title,
		input.Description,
		input.StartsAt,
		input.EndsAt,
		input.Location,
		input.ImageURL,
		optionalText(input.SourceEventPage),
	).Scan)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return Event{}, ErrNotFound
		}
		return Event{}, fmt.Errorf("update event: %w", err)
	}

	if err := setEventTags(ctx, tx, event.ID, input.Tags); err != nil {
		return Event{}, err
	}
	event.Tags = emptyIfNil(input.Tags)

	if err := tx.Commit(ctx); err != nil {
		return Event{}, fmt.Errorf("commit update event: %w", err)
	}

	return event, nil
}

func (s *EventStore) Create(ctx context.Context, input EventInput) (Event, error) {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return Event{}, fmt.Errorf("begin create event: %w", err)
	}
	defer tx.Rollback(ctx)

	const query = `
		INSERT INTO events (title, description, starts_at, ends_at, location, image_url, source_event_page)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING ` + eventSelectColumns + `
	`

	event, err := scanEvent(tx.QueryRow(
		ctx,
		query,
		input.Title,
		input.Description,
		input.StartsAt,
		input.EndsAt,
		input.Location,
		input.ImageURL,
		optionalText(input.SourceEventPage),
	).Scan)
	if err != nil {
		return Event{}, fmt.Errorf("create event: %w", err)
	}

	if err := setEventTags(ctx, tx, event.ID, input.Tags); err != nil {
		return Event{}, err
	}
	event.Tags = emptyIfNil(input.Tags)

	if err := tx.Commit(ctx); err != nil {
		return Event{}, fmt.Errorf("commit create event: %w", err)
	}

	return event, nil
}

func optionalText(value string) interface{} {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return nil
	}
	return trimmed
}
