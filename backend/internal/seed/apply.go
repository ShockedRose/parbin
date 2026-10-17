package seed

import (
	"context"
	"errors"
	"fmt"
	"math/rand"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"parbin/backend/internal/auth"
	"parbin/backend/internal/store"
)

// Result reports what the development seed wrote.
type Result struct {
	AdminEmail       string
	TagCount         int
	EventCount       int
	PastCount        int
	UpcomingCount    int
	BorderlineTitle  string
	BorderlineStarts time.Time
	Inserted         int
	Rescheduled      int
}

// Apply ensures the development admin, 20 tags, and 20 sample events.
// Sample rows are matched by title. A later run refreshes start and end times
// from now and leaves titles, descriptions, locations, images, and tags in place.
func Apply(ctx context.Context, pool *pgxpool.Pool, loc *time.Location, adminEmail, adminPassword string, now time.Time) (Result, error) {
	if pool == nil {
		return Result{}, fmt.Errorf("database pool is required")
	}

	email, err := ensureAdmin(ctx, pool, adminEmail, adminPassword)
	if err != nil {
		return Result{}, err
	}

	catalog, err := BuildCatalog(now, loc, rand.New(rand.NewSource(devRandSeed)))
	if err != nil {
		return Result{}, err
	}
	if err := ensureTags(ctx, pool, catalog.Tags); err != nil {
		return Result{}, err
	}

	inserted := 0
	rescheduled := 0
	past := 0
	upcoming := 0
	var borderline EventDraft
	events := store.NewEventStore(pool)

	for _, draft := range catalog.Events {
		switch draft.Role {
		case RolePast:
			past++
		case RoleUpcoming:
			upcoming++
		case RoleBorderline:
			borderline = draft
		default:
			return Result{}, fmt.Errorf("seed event %q has unknown role %q", draft.Title, draft.Role)
		}

		wrote, err := upsertEvent(ctx, pool, events, draft)
		if err != nil {
			return Result{}, err
		}
		switch wrote {
		case writeInserted:
			inserted++
		case writeRescheduled:
			rescheduled++
		}
	}

	if borderline.Title == "" || past != PastEventCount || upcoming != UpcomingEventCount {
		return Result{}, fmt.Errorf("seed catalog counts: past=%d upcoming=%d borderline=%q", past, upcoming, borderline.Title)
	}
	if inserted+rescheduled != len(catalog.Events) {
		return Result{}, fmt.Errorf("seed wrote %d of %d events", inserted+rescheduled, len(catalog.Events))
	}

	return Result{
		AdminEmail:       email,
		TagCount:         len(catalog.Tags),
		EventCount:       len(catalog.Events),
		PastCount:        past,
		UpcomingCount:    upcoming,
		BorderlineTitle:  borderline.Title,
		BorderlineStarts: borderline.StartsAt,
		Inserted:         inserted,
		Rescheduled:      rescheduled,
	}, nil
}

type writeKind int

const (
	writeInserted writeKind = iota + 1
	writeRescheduled
)

func ensureAdmin(ctx context.Context, pool *pgxpool.Pool, email, password string) (string, error) {
	email = strings.TrimSpace(strings.ToLower(email))
	password = strings.TrimSpace(password)
	if email == "" || password == "" {
		return "", fmt.Errorf("seed admin email and password are required")
	}

	hash, err := auth.HashPassword(password)
	if err != nil {
		return "", fmt.Errorf("hash seed admin password: %w", err)
	}
	if err := store.NewAdminStore(pool).EnsureSeedAdmin(ctx, email, hash); err != nil {
		return "", err
	}
	return email, nil
}

func ensureTags(ctx context.Context, pool *pgxpool.Pool, names []string) error {
	for _, name := range names {
		if _, err := pool.Exec(ctx, `
			INSERT INTO tags (name)
			VALUES ($1)
			ON CONFLICT (name) DO NOTHING
		`, name); err != nil {
			return fmt.Errorf("seed tag %q: %w", name, err)
		}
	}
	return nil
}

func upsertEvent(ctx context.Context, pool *pgxpool.Pool, events *store.EventStore, draft EventDraft) (writeKind, error) {
	if !draft.EndsAt.After(draft.StartsAt) {
		return 0, fmt.Errorf("seed event %q ends before it starts", draft.Title)
	}

	var id string
	err := pool.QueryRow(ctx, `
		SELECT id
		FROM events
		WHERE title = $1
		ORDER BY created_at ASC
		LIMIT 1
	`, draft.Title).Scan(&id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			if _, err := events.Create(ctx, store.EventInput{
				Title:       draft.Title,
				Description: draft.Description,
				StartsAt:    draft.StartsAt,
				EndsAt:      draft.EndsAt,
				Location:    draft.Location,
				ImageURL:    draft.ImageURL,
				Tags:        draft.Tags,
			}); err != nil {
				return 0, fmt.Errorf("insert seed event %q: %w", draft.Title, err)
			}
			return writeInserted, nil
		}
		return 0, fmt.Errorf("lookup seed event %q: %w", draft.Title, err)
	}

	if _, err := pool.Exec(ctx, `
		UPDATE events
		SET starts_at = $2, ends_at = $3, updated_at = NOW()
		WHERE id = $1
	`, id, draft.StartsAt, draft.EndsAt); err != nil {
		return 0, fmt.Errorf("reschedule seed event %q: %w", draft.Title, err)
	}
	return writeRescheduled, nil
}
