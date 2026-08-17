package service

import (
	"testing"
	"time"

	"parbin/backend/internal/store"
)

func TestLastNMonths(t *testing.T) {
	now := time.Date(2026, 8, 17, 12, 0, 0, 0, time.UTC)
	got := lastNMonths(now, 12)
	if len(got) != 12 {
		t.Fatalf("expected 12 months, got %d", len(got))
	}
	if got[0] != "2025-09" {
		t.Fatalf("expected first month 2025-09, got %s", got[0])
	}
	if got[11] != "2026-08" {
		t.Fatalf("expected last month 2026-08, got %s", got[11])
	}
}

func TestFillEventMonths(t *testing.T) {
	months := []string{"2026-06", "2026-07", "2026-08"}
	got := fillEventMonths(months, []store.MonthCount{{Month: "2026-07", Count: 4}})

	if got[0] != (store.MonthCount{Month: "2026-06", Count: 0}) {
		t.Fatalf("unexpected first month: %+v", got[0])
	}
	if got[1] != (store.MonthCount{Month: "2026-07", Count: 4}) {
		t.Fatalf("unexpected second month: %+v", got[1])
	}
	if got[2].Count != 0 {
		t.Fatalf("expected empty current month, got %d", got[2].Count)
	}
}

func TestFillSuggestionMonths(t *testing.T) {
	months := []string{"2026-07", "2026-08"}
	got := fillSuggestionMonths(months, []store.SuggestionMonthCount{
		{Month: "2026-08", Pending: 2, Approved: 1, Rejected: 3},
	})

	if got[0].Month != "2026-07" || got[0].Pending != 0 {
		t.Fatalf("expected zero-filled July, got %+v", got[0])
	}
	if got[1].Approved != 1 || got[1].Rejected != 3 || got[1].Pending != 2 {
		t.Fatalf("expected August counts preserved, got %+v", got[1])
	}
}
