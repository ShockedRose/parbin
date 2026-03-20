package store

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type EventSuggestionStore struct {
	pool *pgxpool.Pool
}

func NewEventSuggestionStore(pool *pgxpool.Pool) *EventSuggestionStore {
	return &EventSuggestionStore{pool: pool}
}

func (s *EventSuggestionStore) Create(ctx context.Context, input EventInput) (EventSuggestion, error) {
	const query = `
		INSERT INTO event_suggestions (title, description, starts_at, ends_at, location, image_url, tags)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, title, description, starts_at, ends_at, location, image_url, tags, status, source_event_id, created_at, reviewed_at, reviewed_by
	`

	var suggestion EventSuggestion
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
		&suggestion.CreatedAt,
		&suggestion.ReviewedAt,
		&suggestion.ReviewedBy,
	); err != nil {
		return EventSuggestion{}, fmt.Errorf("create suggestion: %w", err)
	}

	return suggestion, nil
}

func (s *EventSuggestionStore) List(ctx context.Context) ([]EventSuggestion, error) {
	const query = `
		SELECT id, title, description, starts_at, ends_at, location, image_url, tags, status, source_event_id, created_at, reviewed_at, reviewed_by
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
			&suggestion.CreatedAt,
			&suggestion.ReviewedAt,
			&suggestion.ReviewedBy,
		); err != nil {
			return nil, fmt.Errorf("scan suggestion: %w", err)
		}

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
	if err := tx.QueryRow(ctx, `
		SELECT id, title, description, starts_at, ends_at, location, image_url, tags, status, source_event_id, created_at, reviewed_at, reviewed_by
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
		&suggestion.CreatedAt,
		&suggestion.ReviewedAt,
		&suggestion.ReviewedBy,
	); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return EventSuggestion{}, Event{}, ErrNotFound
		}
		return EventSuggestion{}, Event{}, fmt.Errorf("load suggestion for approval: %w", err)
	}

	if suggestion.Status != SuggestionStatusPending {
		return EventSuggestion{}, Event{}, ErrConflict
	}

	var event Event
	if err := tx.QueryRow(ctx, `
		INSERT INTO events (title, description, starts_at, ends_at, location, image_url, tags)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, title, description, starts_at, ends_at, location, image_url, tags, created_at, updated_at
	`,
		suggestion.Title,
		suggestion.Description,
		suggestion.StartsAt,
		suggestion.EndsAt,
		suggestion.Location,
		suggestion.ImageURL,
		suggestion.Tags,
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
		return EventSuggestion{}, Event{}, fmt.Errorf("create event from suggestion: %w", err)
	}

	if err := tx.QueryRow(ctx, `
		UPDATE event_suggestions
		SET status = $2, source_event_id = $3, reviewed_at = NOW(), reviewed_by = $4, updated_at = NOW()
		WHERE id = $1
		RETURNING id, title, description, starts_at, ends_at, location, image_url, tags, status, source_event_id, created_at, reviewed_at, reviewed_by
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
		&suggestion.CreatedAt,
		&suggestion.ReviewedAt,
		&suggestion.ReviewedBy,
	); err != nil {
		return EventSuggestion{}, Event{}, fmt.Errorf("mark suggestion approved: %w", err)
	}

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
	if err := tx.QueryRow(ctx, `
		UPDATE event_suggestions
		SET status = $2, reviewed_at = NOW(), reviewed_by = $3, updated_at = NOW()
		WHERE id = $1
		RETURNING id, title, description, starts_at, ends_at, location, image_url, tags, status, source_event_id, created_at, reviewed_at, reviewed_by
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
		&suggestion.CreatedAt,
		&suggestion.ReviewedAt,
		&suggestion.ReviewedBy,
	); err != nil {
		return EventSuggestion{}, fmt.Errorf("reject suggestion: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return EventSuggestion{}, fmt.Errorf("commit rejection: %w", err)
	}

	return suggestion, nil
}
