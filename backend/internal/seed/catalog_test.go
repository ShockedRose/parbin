package seed

import (
	"math/rand"
	"reflect"
	"testing"
	"time"
)

func TestBuildCatalogSplitsFeedsFromTheClock(t *testing.T) {
	loc := mustLoc(t, "America/Panama")
	cases := []struct {
		name  string
		now   time.Time
		year  int
		month time.Month
		day   int
		hour  int
	}{
		{
			name:  "afternoon",
			now:   time.Date(2026, 10, 17, 15, 0, 0, 0, loc),
			year:  2026,
			month: time.October,
			day:   17,
			hour:  meetupHour,
		},
		{
			name:  "exactly eighteen",
			now:   time.Date(2026, 10, 17, 18, 0, 0, 0, loc),
			year:  2026,
			month: time.October,
			day:   17,
			hour:  meetupHour,
		},
		{
			name:  "after eighteen",
			now:   time.Date(2026, 10, 17, 18, 30, 0, 0, loc),
			year:  2026,
			month: time.October,
			day:   17,
			hour:  meetupHour,
		},
		{
			name:  "late evening",
			now:   time.Date(2026, 10, 17, 23, 40, 0, 0, loc),
			year:  2026,
			month: time.October,
			day:   17,
			hour:  23,
		},
		{
			name:  "just after midnight",
			now:   time.Date(2026, 10, 17, 0, 5, 0, 0, loc),
			year:  2026,
			month: time.October,
			day:   17,
			hour:  meetupHour,
		},
		{
			name:  "month boundary",
			now:   time.Date(2026, 3, 1, 8, 0, 0, 0, loc),
			year:  2026,
			month: time.March,
			day:   1,
			hour:  meetupHour,
		},
		{
			name:  "utc instant still previous evening in panama",
			now:   time.Date(2026, 10, 18, 3, 30, 0, 0, time.UTC),
			year:  2026,
			month: time.October,
			day:   17,
			hour:  22,
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			catalog := mustCatalog(t, tc.now, loc, devRandSeed)
			assertSchedule(t, catalog, tc.now, loc)
			border := findBorderline(t, catalog)
			local := border.StartsAt.In(loc)
			if local.Year() != tc.year || local.Month() != tc.month || local.Day() != tc.day || local.Hour() != tc.hour || local.Minute() != 0 {
				t.Fatalf("borderline start = %s, want %04d-%02d-%02d %02d:00", local.Format(time.RFC3339), tc.year, tc.month, tc.day, tc.hour)
			}
		})
	}
}

func TestBuildCatalogKeepsCopyStableAndMovesDatesWithTheClock(t *testing.T) {
	loc := mustLoc(t, "America/Panama")
	now := time.Date(2026, 10, 17, 15, 0, 0, 0, loc)
	first := mustCatalog(t, now, loc, devRandSeed)
	second := mustCatalog(t, now, loc, devRandSeed)
	if !reflect.DeepEqual(first, second) {
		t.Fatal("catalog changed between runs with the same clock and seed")
	}

	laterNow := now.AddDate(0, 0, 10)
	later := mustCatalog(t, laterNow, loc, devRandSeed)
	byTitle := make(map[string]EventDraft, len(first.Events))
	for _, event := range first.Events {
		byTitle[event.Title] = event
	}
	if len(later.Events) != len(byTitle) {
		t.Fatalf("event count = %d", len(later.Events))
	}
	for _, event := range later.Events {
		prev, ok := byTitle[event.Title]
		if !ok {
			t.Fatalf("title %q appeared after the clock moved", event.Title)
		}
		if event.Description != prev.Description || event.Location != prev.Location || event.ImageURL != prev.ImageURL || !reflect.DeepEqual(event.Tags, prev.Tags) || event.Role != prev.Role {
			t.Fatalf("copy for %q changed when the clock moved", event.Title)
		}
		if !event.StartsAt.Equal(prev.StartsAt.AddDate(0, 0, 10)) {
			t.Fatalf("%q start = %s, want %s", event.Title, event.StartsAt, prev.StartsAt.AddDate(0, 0, 10))
		}
	}

	assertSchedule(t, later, laterNow, loc)
}

func TestBuildCatalogShuffleChangesWithTheSeed(t *testing.T) {
	loc := mustLoc(t, "America/Panama")
	now := time.Date(2026, 10, 17, 15, 0, 0, 0, loc)
	first := mustCatalog(t, now, loc, 1)
	second := mustCatalog(t, now, loc, 2)
	assertSchedule(t, first, now, loc)
	assertSchedule(t, second, now, loc)
	if reflect.DeepEqual(titlesOf(first), titlesOf(second)) && reflect.DeepEqual(tagsOf(first), tagsOf(second)) {
		t.Fatal("expected a different shuffle for a different seed")
	}
}

func TestBuildCatalogRequiresInputs(t *testing.T) {
	loc := mustLoc(t, "America/Panama")
	if _, err := BuildCatalog(time.Now(), nil, rand.New(rand.NewSource(1))); err == nil {
		t.Fatal("expected an error for a missing timezone")
	}
	if _, err := BuildCatalog(time.Now(), loc, nil); err == nil {
		t.Fatal("expected an error for a missing rng")
	}
	if _, err := BuildCatalog(time.Time{}, loc, rand.New(rand.NewSource(1))); err == nil {
		t.Fatal("expected an error for a zero clock")
	}
}

func assertSchedule(t *testing.T, catalog Catalog, now time.Time, loc *time.Location) {
	t.Helper()
	if len(catalog.Tags) != TagCount {
		t.Fatalf("tag count = %d", len(catalog.Tags))
	}
	if len(catalog.Events) != EventCount {
		t.Fatalf("event count = %d", len(catalog.Events))
	}

	today := startOfDay(now, loc)
	tomorrow := today.AddDate(0, 0, 1)
	past := 0
	upcoming := 0
	borderline := 0
	titles := make(map[string]struct{}, len(catalog.Events))
	locations := make(map[string]struct{}, len(catalog.Events))
	usedTags := make(map[string]struct{})
	knownTags := make(map[string]struct{}, len(tagNames))
	for _, tag := range tagNames {
		knownTags[tag] = struct{}{}
	}

	var earliestUpcoming time.Time
	for _, event := range catalog.Events {
		if event.Title == "" || event.Description == "" || event.Location == "" || event.ImageURL == "" {
			t.Fatalf("event %q is missing copy", event.Title)
		}
		if _, ok := titles[event.Title]; ok {
			t.Fatalf("duplicate title %q", event.Title)
		}
		titles[event.Title] = struct{}{}
		if _, ok := locations[event.Location]; ok {
			t.Fatalf("duplicate location %q", event.Location)
		}
		locations[event.Location] = struct{}{}
		if !event.EndsAt.After(event.StartsAt) {
			t.Fatalf("%q ends at %s before start %s", event.Title, event.EndsAt, event.StartsAt)
		}
		endLocal := event.EndsAt.In(loc)
		startLocal := event.StartsAt.In(loc)
		if endLocal.Year() != startLocal.Year() || endLocal.Month() != startLocal.Month() || endLocal.Day() != startLocal.Day() {
			t.Fatalf("%q ends on %s, want the same local day as %s", event.Title, endLocal, startLocal)
		}
		if len(event.Tags) < 1 || len(event.Tags) > maxTagsPerEvent {
			t.Fatalf("%q has %d tags", event.Title, len(event.Tags))
		}
		seen := make(map[string]struct{}, len(event.Tags))
		for _, tag := range event.Tags {
			if _, ok := seen[tag]; ok {
				t.Fatalf("%q repeats tag %q", event.Title, tag)
			}
			seen[tag] = struct{}{}
			if _, ok := knownTags[tag]; !ok {
				t.Fatalf("%q has unknown tag %q", event.Title, tag)
			}
			usedTags[tag] = struct{}{}
		}

		switch event.Role {
		case RolePast:
			past++
			if !event.StartsAt.Before(today) {
				t.Fatalf("past event %q starts %s", event.Title, event.StartsAt)
			}
		case RoleBorderline:
			borderline++
			if event.StartsAt.Before(today) || !event.StartsAt.Before(tomorrow) {
				t.Fatalf("borderline event %q starts %s", event.Title, event.StartsAt)
			}
		case RoleUpcoming:
			upcoming++
			if event.StartsAt.Before(tomorrow) {
				t.Fatalf("upcoming event %q starts %s", event.Title, event.StartsAt)
			}
			if earliestUpcoming.IsZero() || event.StartsAt.Before(earliestUpcoming) {
				earliestUpcoming = event.StartsAt
			}
		default:
			t.Fatalf("unknown role %q", event.Role)
		}
	}

	if past != PastEventCount || upcoming != UpcomingEventCount || borderline != 1 {
		t.Fatalf("counts past=%d upcoming=%d borderline=%d", past, upcoming, borderline)
	}
	if len(usedTags) != TagCount {
		t.Fatalf("used %d of %d tags", len(usedTags), TagCount)
	}

	border := findBorderline(t, catalog)
	if !earliestUpcoming.IsZero() && !border.StartsAt.Before(earliestUpcoming) {
		t.Fatalf("borderline start %s is not before the next upcoming event %s", border.StartsAt, earliestUpcoming)
	}
}

func findBorderline(t *testing.T, catalog Catalog) EventDraft {
	t.Helper()
	var found EventDraft
	count := 0
	for _, event := range catalog.Events {
		if event.Role == RoleBorderline {
			found = event
			count++
		}
	}
	if count != 1 {
		t.Fatalf("borderline events = %d", count)
	}
	return found
}

func titlesOf(catalog Catalog) []string {
	titles := make([]string, len(catalog.Events))
	for i, event := range catalog.Events {
		titles[i] = event.Title
	}
	return titles
}

func tagsOf(catalog Catalog) [][]string {
	tags := make([][]string, len(catalog.Events))
	for i, event := range catalog.Events {
		tags[i] = event.Tags
	}
	return tags
}

func mustCatalog(t *testing.T, now time.Time, loc *time.Location, seed int64) Catalog {
	t.Helper()
	catalog, err := BuildCatalog(now, loc, rand.New(rand.NewSource(seed)))
	if err != nil {
		t.Fatalf("build catalog: %v", err)
	}
	return catalog
}

func mustLoc(t *testing.T, name string) *time.Location {
	t.Helper()
	loc, err := time.LoadLocation(name)
	if err != nil {
		t.Fatalf("load location: %v", err)
	}
	return loc
}
