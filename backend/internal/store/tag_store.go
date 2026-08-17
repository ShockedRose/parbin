package store

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

const eventTagsSelect = `COALESCE((
	SELECT ARRAY_AGG(t.name ORDER BY et.sort_order, t.name)
	FROM event_tags et
	JOIN tags t ON t.id = et.tag_id
	WHERE et.event_id = events.id
), '{}') AS tags`

const suggestionTagsSelect = `COALESCE((
	SELECT ARRAY_AGG(t.name ORDER BY est.sort_order, t.name)
	FROM event_suggestion_tags est
	JOIN tags t ON t.id = est.tag_id
	WHERE est.suggestion_id = event_suggestions.id
), '{}') AS tags`

type queryExecer interface {
	Exec(ctx context.Context, sql string, arguments ...any) (pgconn.CommandTag, error)
	Query(ctx context.Context, sql string, args ...any) (pgx.Rows, error)
	QueryRow(ctx context.Context, sql string, args ...any) pgx.Row
}

type TagStore struct {
	pool *pgxpool.Pool
}

func NewTagStore(pool *pgxpool.Pool) *TagStore {
	return &TagStore{pool: pool}
}

func (s *TagStore) List(ctx context.Context) ([]Tag, error) {
	const query = `
		SELECT id, name, created_at
		FROM tags
		ORDER BY name ASC
	`

	rows, err := s.pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("list tags: %w", err)
	}
	defer rows.Close()

	tags := make([]Tag, 0)
	for rows.Next() {
		var tag Tag
		if err := rows.Scan(&tag.ID, &tag.Name, &tag.CreatedAt); err != nil {
			return nil, fmt.Errorf("scan tag: %w", err)
		}
		tags = append(tags, tag)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate tags: %w", err)
	}

	return tags, nil
}

func emptyIfNil(tags []string) []string {
	if tags == nil {
		return []string{}
	}
	return tags
}

func resolveTagIDs(ctx context.Context, q queryExecer, names []string) ([]string, error) {
	ids := make([]string, 0, len(names))
	for _, name := range names {
		var id string
		if err := q.QueryRow(ctx, `
			INSERT INTO tags (name)
			VALUES ($1)
			ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
			RETURNING id
		`, name).Scan(&id); err != nil {
			return nil, fmt.Errorf("resolve tag %q: %w", name, err)
		}
		ids = append(ids, id)
	}
	return ids, nil
}

func setEventTags(ctx context.Context, q queryExecer, eventID string, names []string) error {
	ids, err := resolveTagIDs(ctx, q, names)
	if err != nil {
		return err
	}

	if _, err := q.Exec(ctx, `DELETE FROM event_tags WHERE event_id = $1`, eventID); err != nil {
		return fmt.Errorf("clear event tags: %w", err)
	}

	for i, id := range ids {
		if _, err := q.Exec(ctx, `
			INSERT INTO event_tags (event_id, tag_id, sort_order)
			VALUES ($1, $2, $3)
		`, eventID, id, i); err != nil {
			return fmt.Errorf("assign event tag: %w", err)
		}
	}

	return nil
}

func setSuggestionTags(ctx context.Context, q queryExecer, suggestionID string, names []string) error {
	ids, err := resolveTagIDs(ctx, q, names)
	if err != nil {
		return err
	}

	if _, err := q.Exec(ctx, `DELETE FROM event_suggestion_tags WHERE suggestion_id = $1`, suggestionID); err != nil {
		return fmt.Errorf("clear suggestion tags: %w", err)
	}

	for i, id := range ids {
		if _, err := q.Exec(ctx, `
			INSERT INTO event_suggestion_tags (suggestion_id, tag_id, sort_order)
			VALUES ($1, $2, $3)
		`, suggestionID, id, i); err != nil {
			return fmt.Errorf("assign suggestion tag: %w", err)
		}
	}

	return nil
}

func copySuggestionTagsToEvent(ctx context.Context, q queryExecer, suggestionID, eventID string) error {
	if _, err := q.Exec(ctx, `
		INSERT INTO event_tags (event_id, tag_id, sort_order)
		SELECT $1, tag_id, sort_order
		FROM event_suggestion_tags
		WHERE suggestion_id = $2
	`, eventID, suggestionID); err != nil {
		return fmt.Errorf("copy suggestion tags to event: %w", err)
	}
	return nil
}
