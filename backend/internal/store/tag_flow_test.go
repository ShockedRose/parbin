package store

import (
	"context"
	"os"
	"reflect"
	"testing"
	"time"

	"parbin/backend/internal/database"
)

func TestTagPersistenceFlow(t *testing.T) {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		t.Skip("DATABASE_URL not set")
	}

	ctx := context.Background()
	pool, err := OpenPool(ctx, dsn)
	if err != nil {
		t.Fatalf("open pool: %v", err)
	}
	t.Cleanup(pool.Close)

	if err := database.RunMigrations(ctx, pool); err != nil {
		t.Fatalf("migrations: %v", err)
	}

	events := NewEventStore(pool)
	suggestions := NewEventSuggestionStore(pool)
	tags := NewTagStore(pool)
	admins := NewAdminStore(pool)

	start := time.Now().Add(24 * time.Hour)
	end := start.Add(2 * time.Hour)

	event, err := events.Create(ctx, EventInput{
		Title:    "Store create",
		StartsAt: start,
		EndsAt:   end,
		Tags:     []string{"React", "react", "Go"},
	})
	if err != nil {
		t.Fatalf("create event: %v", err)
	}
	if !reflect.DeepEqual(event.Tags, []string{"React", "react", "Go"}) {
		t.Fatalf("create event tags: %#v", event.Tags)
	}

	got, err := events.Get(ctx, event.ID)
	if err != nil {
		t.Fatalf("get event: %v", err)
	}
	if !reflect.DeepEqual(got.Tags, []string{"React", "react", "Go"}) {
		t.Fatalf("get event tags: %#v", got.Tags)
	}

	updated, err := events.Update(ctx, event.ID, EventInput{
		Title:    "Store update",
		StartsAt: start,
		EndsAt:   end,
		Tags:     []string{"Go"},
	})
	if err != nil {
		t.Fatalf("update event: %v", err)
	}
	if !reflect.DeepEqual(updated.Tags, []string{"Go"}) {
		t.Fatalf("update event tags: %#v", updated.Tags)
	}

	suggestion, err := suggestions.Create(ctx, EventInput{
		Title:    "Store suggestion",
		StartsAt: start,
		EndsAt:   end,
		Tags:     []string{"TypeScript", "react"},
	})
	if err != nil {
		t.Fatalf("create suggestion: %v", err)
	}
	if !reflect.DeepEqual(suggestion.Tags, []string{"TypeScript", "react"}) {
		t.Fatalf("create suggestion tags: %#v", suggestion.Tags)
	}

	if err := admins.EnsureSeedAdmin(ctx, "smoke@parbin.local", "hash"); err != nil {
		t.Fatalf("seed admin: %v", err)
	}
	admin, err := admins.GetByEmail(ctx, "smoke@parbin.local")
	if err != nil {
		t.Fatalf("get admin: %v", err)
	}

	approved, published, err := suggestions.Approve(ctx, suggestion.ID, admin.ID)
	if err != nil {
		t.Fatalf("approve: %v", err)
	}
	if approved.Status != SuggestionStatusApproved {
		t.Fatalf("approved status: %s", approved.Status)
	}
	if !reflect.DeepEqual(published.Tags, []string{"TypeScript", "react"}) {
		t.Fatalf("approved event tags: %#v", published.Tags)
	}

	catalog, err := tags.List(ctx)
	if err != nil {
		t.Fatalf("list tags: %v", err)
	}

	seen := map[string]bool{}
	for _, tag := range catalog {
		seen[tag.Name] = true
	}
	for _, name := range []string{"React", "react", "Go", "TypeScript"} {
		if !seen[name] {
			t.Fatalf("expected catalog to keep exact name %q, got %#v", name, catalog)
		}
	}
}
