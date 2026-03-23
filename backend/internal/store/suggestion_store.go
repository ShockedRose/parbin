package store

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type EventSuggestionStore struct {
	pool *pgxpool.Pool
}

func NewEventSuggestionStore(pool *pgxpool.Pool) *EventSuggestionStore {
	return &EventSuggestionStore{pool: pool}
}

func optionalStringPtr(p *string) interface{} {
	if p == nil {
		return nil
	}
	trimmed := strings.TrimSpace(*p)
	if trimmed == "" {
		return nil
	}
	return trimmed
}

func (s *EventSuggestionStore) Create(ctx context.Context, input EventInput) (EventSuggestion, error) {
	const query = `
		INSERT INTO event_suggestions (title, description, starts_at, ends_at, location, image_url, tags, source_event_page)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, title, description, starts_at, ends_at, location, image_url, tags, status, source_event_id, source_event_page, created_at, reviewed_at, reviewed_by
	`

	var suggestion EventSuggestion
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
		&suggestion.ID,
		&suggestion.Title,
		&suggestion.Description,
		&suggestion.StartsAt,
		&suggestion.EndsAt,
		&suggestion.Location,
		&suggestion.ImageURL,
		&suggestion.Tags,
		&suggestion.Status,
		&suggestion.SourceEventID,
		&sourcePage,
		&suggestion.CreatedAt,
		&suggestion.ReviewedAt,
		&suggestion.ReviewedBy,
	); err != nil {
		return EventSuggestion{}, fmt.Errorf("create suggestion: %w", err)
	}

	suggestion.SourceEventPage = nullStringToPtr(sourcePage)
	return suggestion, nil
}

func (s *EventSuggestionStore) ListDistinctSourceEventPages(ctx context.Context) ([]string, error) {
	const query = `
		SELECT DISTINCT source_event_page FROM event_suggestions WHERE source_event_page IS NOT NULL
		UNION
		SELECT DISTINCT source_event_page FROM events WHERE source_event_page IS NOT NULL
	`

	rows, err := s.pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("list source event pages: %w", err)
	}
	defer rows.Close()

	out := make([]string, 0)
	for rows.Next() {
		var u string
		if err := rows.Scan(&u); err != nil {
			return nil, fmt.Errorf("scan source event page: %w", err)
		}
		out = append(out, u)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate source event pages: %w", err)
	}

	return out, nil
}

func (s *EventSuggestionStore) List(ctx context.Context) ([]EventSuggestion, error) {
	const query = `
		SELECT id, title, description, starts_at, ends_at, location, image_url, tags, status, source_event_id, source_event_page, created_at, reviewed_at, reviewed_by
		FROM event_suggestions
		WHERE status = $1
		ORDER BY created_at DESC
	`

	rows, err := s.pool.Query(ctx, query, SuggestionStatusPending)
	if err != nil {
		return nil, fmt.Errorf("list suggestions: %w", err)
	}
	defer rows.Close()

	suggestions := make([]EventSuggestion, 0)
	for rows.Next() {
		var suggestion EventSuggestion
		var sourcePage sql.NullString
		if err := rows.Scan(
			&suggestion.ID,
			&suggestion.Title,
			&suggestion.Description,
			&suggestion.StartsAt,
			&suggestion.EndsAt,
			&suggestion.Location,
			&suggestion.ImageURL,
			&suggestion.Tags,
			&suggestion.Status,
			&suggestion.SourceEventID,
			&sourcePage,
			&suggestion.CreatedAt,
			&suggestion.ReviewedAt,
			&suggestion.ReviewedBy,
		); err != nil {
			return nil, fmt.Errorf("scan suggestion: %w", err)
		}
		suggestion.SourceEventPage = nullStringToPtr(sourcePage)
		suggestions = append(suggestions, suggestion)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate suggestions: %w", err)
	}

	return suggestions, nil
}

func (s *EventSuggestionStore) Approve(ctx context.Context, suggestionID, adminID string) (EventSuggestion, Event, error) {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return EventSuggestion{}, Event{}, fmt.Errorf("begin approve suggestion: %w", err)
	}
	defer tx.Rollback(ctx)

	var suggestion EventSuggestion
	var sourcePage sql.NullString
	if err := tx.QueryRow(ctx, `
		SELECT id, title, description, starts_at, ends_at, location, image_url, tags, status, source_event_id, source_event_page, created_at, reviewed_at, reviewed_by
		FROM event_suggestions
		WHERE id = $1
		FOR UPDATE
	`, suggestionID).Scan(
		&suggestion.ID,
		&suggestion.Title,
		&suggestion.Description,
		&suggestion.StartsAt,
		&suggestion.EndsAt,
		&suggestion.Location,
		&suggestion.ImageURL,
		&suggestion.Tags,
		&suggestion.Status,
		&suggestion.SourceEventID,
		&sourcePage,
		&suggestion.CreatedAt,
		&suggestion.ReviewedAt,
		&suggestion.ReviewedBy,
	); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return EventSuggestion{}, Event{}, ErrNotFound
		}
		return EventSuggestion{}, Event{}, fmt.Errorf("load suggestion for approval: %w", err)
	}
	suggestion.SourceEventPage = nullStringToPtr(sourcePage)

	if suggestion.Status != SuggestionStatusPending {
		return EventSuggestion{}, Event{}, ErrConflict
	}

	var event Event
	var eventSourcePage sql.NullString
	if err := tx.QueryRow(ctx, `
		INSERT INTO events (title, description, starts_at, ends_at, location, image_url, tags, source_event_page)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, title, description, starts_at, ends_at, location, image_url, tags, source_event_page, created_at, updated_at
	`,
		suggestion.Title,
		suggestion.Description,
		suggestion.StartsAt,
		suggestion.EndsAt,
		suggestion.Location,
		suggestion.ImageURL,
		suggestion.Tags,
		optionalStringPtr(suggestion.SourceEventPage),
	).Scan(
		&event.ID,
		&event.Title,
		&event.Description,
		&event.StartsAt,
		&event.EndsAt,
		&event.Location,
		&event.ImageURL,
		&event.Tags,
		&eventSourcePage,
		&event.CreatedAt,
		&event.UpdatedAt,
	); err != nil {
		return EventSuggestion{}, Event{}, fmt.Errorf("create event from suggestion: %w", err)
	}
	event.SourceEventPage = nullStringToPtr(eventSourcePage)

	var approvedSourcePage sql.NullString
	if err := tx.QueryRow(ctx, `
		UPDATE event_suggestions
		SET status = $2, source_event_id = $3, reviewed_at = NOW(), reviewed_by = $4, updated_at = NOW()
		WHERE id = $1
		RETURNING id, title, description, starts_at, ends_at, location, image_url, tags, status, source_event_id, source_event_page, created_at, reviewed_at, reviewed_by
	`,
		suggestionID,
		SuggestionStatusApproved,
		event.ID,
		adminID,
	).Scan(
		&suggestion.ID,
		&suggestion.Title,
		&suggestion.Description,
		&suggestion.StartsAt,
		&suggestion.EndsAt,
		&suggestion.Location,
		&suggestion.ImageURL,
		&suggestion.Tags,
		&suggestion.Status,
		&suggestion.SourceEventID,
		&approvedSourcePage,
		&suggestion.CreatedAt,
		&suggestion.ReviewedAt,
		&suggestion.ReviewedBy,
	); err != nil {
		return EventSuggestion{}, Event{}, fmt.Errorf("mark suggestion approved: %w", err)
	}
	suggestion.SourceEventPage = nullStringToPtr(approvedSourcePage)

	if err := tx.Commit(ctx); err != nil {
		return EventSuggestion{}, Event{}, fmt.Errorf("commit approval: %w", err)
	}

	return suggestion, event, nil
}

func (s *EventSuggestionStore) Reject(ctx context.Context, suggestionID, adminID string) (EventSuggestion, error) {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return EventSuggestion{}, fmt.Errorf("begin reject suggestion: %w", err)
	}
	defer tx.Rollback(ctx)

	var currentStatus string
	if err := tx.QueryRow(
		ctx,
		`SELECT status FROM event_suggestions WHERE id = $1 FOR UPDATE`,
		suggestionID,
	).Scan(&currentStatus); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return EventSuggestion{}, ErrNotFound
		}
		return EventSuggestion{}, fmt.Errorf("load suggestion for rejection: %w", err)
	}

	if currentStatus != SuggestionStatusPending {
		return EventSuggestion{}, ErrConflict
	}

	var suggestion EventSuggestion
	var sourcePage sql.NullString
	if err := tx.QueryRow(ctx, `
		UPDATE event_suggestions
		SET status = $2, reviewed_at = NOW(), reviewed_by = $3, updated_at = NOW()
		WHERE id = $1
		RETURNING id, title, description, starts_at, ends_at, location, image_url, tags, status, source_event_id, source_event_page, created_at, reviewed_at, reviewed_by
	`,
		suggestionID,
		SuggestionStatusRejected,
		adminID,
	).Scan(
		&suggestion.ID,
		&suggestion.Title,
		&suggestion.Description,
		&suggestion.StartsAt,
		&suggestion.EndsAt,
		&suggestion.Location,
		&suggestion.ImageURL,
		&suggestion.Tags,
		&suggestion.Status,
		&suggestion.SourceEventID,
		&sourcePage,
		&suggestion.CreatedAt,
		&suggestion.ReviewedAt,
		&suggestion.ReviewedBy,
	); err != nil {
		return EventSuggestion{}, fmt.Errorf("reject suggestion: %w", err)
	}
	suggestion.SourceEventPage = nullStringToPtr(sourcePage)

	if err := tx.Commit(ctx); err != nil {
		return EventSuggestion{}, fmt.Errorf("commit rejection: %w", err)
	}

	return suggestion, nil
}
