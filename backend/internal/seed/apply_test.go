package seed

import (
	"context"
	"os"
	"testing"
	"time"

	"parbin/backend/internal/auth"
	"parbin/backend/internal/database"
	"parbin/backend/internal/store"
)

func TestApplyRefreshesScheduleWithoutDuplicating(t *testing.T) {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		t.Skip("DATABASE_URL not set")
	}

	loc := mustLoc(t, "America/Panama")
	firstClock := time.Date(2026, 10, 17, 15, 0, 0, 0, loc)
	secondClock := firstClock.AddDate(0, 0, 12)
	catalog := mustCatalog(t, secondClock, loc, devRandSeed)
	email := "dev-seed-test@parbin.local"
	password := "test-password-123"

	ctx := context.Background()
	pool, err := store.OpenPool(ctx, dsn)
	if err != nil {
		t.Fatalf("open pool: %v", err)
	}
	t.Cleanup(pool.Close)
	t.Cleanup(func() {
		cleanupCtx := context.Background()
		for _, event := range catalog.Events {
			if _, err := pool.Exec(cleanupCtx, `DELETE FROM events WHERE title = $1`, event.Title); err != nil {
				t.Errorf("cleanup event %q: %v", event.Title, err)
			}
		}
		if _, err := pool.Exec(cleanupCtx, `DELETE FROM admins WHERE email = $1`, email); err != nil {
			t.Errorf("cleanup admin: %v", err)
		}
	})

	if err := database.RunMigrations(ctx, pool); err != nil {
		t.Fatalf("migrations: %v", err)
	}

	if _, err := Apply(ctx, pool, loc, email, password, firstClock); err != nil {
		t.Fatalf("first apply: %v", err)
	}
	second, err := Apply(ctx, pool, loc, email, password, secondClock)
	if err != nil {
		t.Fatalf("second apply: %v", err)
	}
	if second.Inserted != 0 || second.Rescheduled != EventCount {
		t.Fatalf("second apply inserted %d and rescheduled %d", second.Inserted, second.Rescheduled)
	}
	if second.PastCount != PastEventCount || second.UpcomingCount != UpcomingEventCount || second.TagCount != TagCount {
		t.Fatalf("result counts: %+v", second)
	}
	if second.AdminEmail != email {
		t.Fatalf("admin email %q", second.AdminEmail)
	}

	admin, err := store.NewAdminStore(pool).GetByEmail(ctx, email)
	if err != nil {
		t.Fatalf("get admin: %v", err)
	}
	if err := auth.CheckPassword(admin.PasswordHash, password); err != nil {
		t.Fatalf("admin password: %v", err)
	}

	names := make(map[string]struct{})
	rows, err := pool.Query(ctx, `SELECT name FROM tags`)
	if err != nil {
		t.Fatalf("list tags: %v", err)
	}
	for rows.Next() {
		var name string
		if err := rows.Scan(&name); err != nil {
			rows.Close()
			t.Fatalf("scan tag: %v", err)
		}
		names[name] = struct{}{}
	}
	rows.Close()
	if err := rows.Err(); err != nil {
		t.Fatalf("iterate tags: %v", err)
	}
	for _, tag := range catalog.Tags {
		if _, ok := names[tag]; !ok {
			t.Fatalf("missing tag %q", tag)
		}
	}

	for _, event := range catalog.Events {
		var count int
		var startsAt, endsAt time.Time
		var description, location, image string
		if err := pool.QueryRow(ctx, `
			SELECT COUNT(*) OVER (), starts_at, ends_at, description, location, image_url
			FROM events
			WHERE title = $1
		`, event.Title).Scan(&count, &startsAt, &endsAt, &description, &location, &image); err != nil {
			t.Fatalf("lookup %q: %v", event.Title, err)
		}
		if count != 1 {
			t.Fatalf("%q count = %d", event.Title, count)
		}
		if !startsAt.Equal(event.StartsAt) || !endsAt.Equal(event.EndsAt) {
			t.Fatalf("%q schedule = %s–%s, want %s–%s", event.Title, startsAt, endsAt, event.StartsAt, event.EndsAt)
		}
		if description == "" || location == "" || image == "" {
			t.Fatalf("%q is missing stored copy", event.Title)
		}
	}

	// The schedule moved with the clock; copy from the first insert stays put.
	original := mustCatalog(t, firstClock, loc, devRandSeed)
	byTitle := make(map[string]EventDraft, len(original.Events))
	for _, event := range original.Events {
		byTitle[event.Title] = event
	}
	for _, event := range catalog.Events {
		prev := byTitle[event.Title]
		var description, location string
		if err := pool.QueryRow(ctx, `SELECT description, location FROM events WHERE title = $1`, event.Title).Scan(&description, &location); err != nil {
			t.Fatalf("reread %q: %v", event.Title, err)
		}
		if description != prev.Description || location != prev.Location {
			t.Fatalf("%q copy changed on reschedule", event.Title)
		}
	}
}
