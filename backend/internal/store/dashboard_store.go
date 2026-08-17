package store

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type DashboardStore struct {
	pool *pgxpool.Pool
}

type DashboardSummary struct {
	TotalEvents             int
	UpcomingEvents          int
	PastEvents              int
	EventsWithSourcePage    int
	EventsWithoutSourcePage int
	TotalSuggestions        int
	PendingSuggestions      int
	ApprovedSuggestions     int
	RejectedSuggestions     int
	SourcedSuggestions      int
	CommunitySuggestions    int
	ApprovalRate            *float64
	AvgReviewHours          *float64
}

type MonthCount struct {
	Month string `json:"month"`
	Count int    `json:"count"`
}

type SuggestionMonthCount struct {
	Month    string `json:"month"`
	Pending  int    `json:"pending"`
	Approved int    `json:"approved"`
	Rejected int    `json:"rejected"`
}

type LabeledCount struct {
	Label string `json:"label"`
	Count int    `json:"count"`
}

type DashboardSnapshot struct {
	Summary            DashboardSummary
	EventsByMonth      []MonthCount
	SuggestionsByMonth []SuggestionMonthCount
	TopTags            []LabeledCount
	TopLocations       []LabeledCount
	EventsByWeekday    []LabeledCount
}

func NewDashboardStore(pool *pgxpool.Pool) *DashboardStore {
	return &DashboardStore{pool: pool}
}

func (s *DashboardStore) Snapshot(ctx context.Context, timezone string, today time.Time) (DashboardSnapshot, error) {
	summary, err := s.summary(ctx, today)
	if err != nil {
		return DashboardSnapshot{}, err
	}

	eventsByMonth, err := s.eventsByMonth(ctx, timezone)
	if err != nil {
		return DashboardSnapshot{}, err
	}

	suggestionsByMonth, err := s.suggestionsByMonth(ctx, timezone)
	if err != nil {
		return DashboardSnapshot{}, err
	}

	topTags, err := s.topTags(ctx)
	if err != nil {
		return DashboardSnapshot{}, err
	}

	topLocations, err := s.topLocations(ctx)
	if err != nil {
		return DashboardSnapshot{}, err
	}

	eventsByWeekday, err := s.eventsByWeekday(ctx, timezone)
	if err != nil {
		return DashboardSnapshot{}, err
	}

	return DashboardSnapshot{
		Summary:            summary,
		EventsByMonth:      eventsByMonth,
		SuggestionsByMonth: suggestionsByMonth,
		TopTags:            topTags,
		TopLocations:       topLocations,
		EventsByWeekday:    eventsByWeekday,
	}, nil
}

func (s *DashboardStore) summary(ctx context.Context, today time.Time) (DashboardSummary, error) {
	const eventsQuery = `
		SELECT
			COUNT(*)::int AS total_events,
			COUNT(*) FILTER (WHERE starts_at >= $1)::int AS upcoming_events,
			COUNT(*) FILTER (WHERE starts_at < $1)::int AS past_events,
			COUNT(*) FILTER (WHERE NULLIF(BTRIM(COALESCE(source_event_page, '')), '') IS NOT NULL)::int AS with_source,
			COUNT(*) FILTER (WHERE NULLIF(BTRIM(COALESCE(source_event_page, '')), '') IS NULL)::int AS without_source
		FROM events
	`

	var summary DashboardSummary
	if err := s.pool.QueryRow(ctx, eventsQuery, today).Scan(
		&summary.TotalEvents,
		&summary.UpcomingEvents,
		&summary.PastEvents,
		&summary.EventsWithSourcePage,
		&summary.EventsWithoutSourcePage,
	); err != nil {
		return DashboardSummary{}, fmt.Errorf("dashboard event summary: %w", err)
	}

	const suggestionsQuery = `
		SELECT
			COUNT(*)::int AS total_suggestions,
			COUNT(*) FILTER (WHERE status = 'pending')::int AS pending_suggestions,
			COUNT(*) FILTER (WHERE status = 'approved')::int AS approved_suggestions,
			COUNT(*) FILTER (WHERE status = 'rejected')::int AS rejected_suggestions,
			COUNT(*) FILTER (WHERE NULLIF(BTRIM(COALESCE(source_event_page, '')), '') IS NOT NULL)::int AS sourced_suggestions,
			COUNT(*) FILTER (WHERE NULLIF(BTRIM(COALESCE(source_event_page, '')), '') IS NULL)::int AS community_suggestions,
			AVG(EXTRACT(EPOCH FROM (reviewed_at - created_at)) / 3600.0) FILTER (WHERE reviewed_at IS NOT NULL) AS avg_review_hours
		FROM event_suggestions
	`

	var avgReviewHours *float64
	if err := s.pool.QueryRow(ctx, suggestionsQuery).Scan(
		&summary.TotalSuggestions,
		&summary.PendingSuggestions,
		&summary.ApprovedSuggestions,
		&summary.RejectedSuggestions,
		&summary.SourcedSuggestions,
		&summary.CommunitySuggestions,
		&avgReviewHours,
	); err != nil {
		return DashboardSummary{}, fmt.Errorf("dashboard suggestion summary: %w", err)
	}

	reviewed := summary.ApprovedSuggestions + summary.RejectedSuggestions
	if reviewed > 0 {
		rate := float64(summary.ApprovedSuggestions) / float64(reviewed)
		summary.ApprovalRate = &rate
	}
	if avgReviewHours != nil {
		rounded := float64(int(*avgReviewHours*10+0.5)) / 10
		summary.AvgReviewHours = &rounded
	}

	return summary, nil
}

func (s *DashboardStore) eventsByMonth(ctx context.Context, timezone string) ([]MonthCount, error) {
	const query = `
		SELECT to_char(date_trunc('month', starts_at AT TIME ZONE $1), 'YYYY-MM') AS month, COUNT(*)::int AS count
		FROM events
		WHERE (starts_at AT TIME ZONE $1) >= date_trunc('month', CURRENT_TIMESTAMP AT TIME ZONE $1) - INTERVAL '11 months'
		GROUP BY 1
		ORDER BY 1
	`

	rows, err := s.pool.Query(ctx, query, timezone)
	if err != nil {
		return nil, fmt.Errorf("dashboard events by month: %w", err)
	}
	defer rows.Close()

	out := make([]MonthCount, 0)
	for rows.Next() {
		var item MonthCount
		if err := rows.Scan(&item.Month, &item.Count); err != nil {
			return nil, fmt.Errorf("scan events by month: %w", err)
		}
		out = append(out, item)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate events by month: %w", err)
	}

	return out, nil
}

func (s *DashboardStore) suggestionsByMonth(ctx context.Context, timezone string) ([]SuggestionMonthCount, error) {
	const query = `
		SELECT
			to_char(date_trunc('month', created_at AT TIME ZONE $1), 'YYYY-MM') AS month,
			COUNT(*) FILTER (WHERE status = 'pending')::int AS pending,
			COUNT(*) FILTER (WHERE status = 'approved')::int AS approved,
			COUNT(*) FILTER (WHERE status = 'rejected')::int AS rejected
		FROM event_suggestions
		WHERE (created_at AT TIME ZONE $1) >= date_trunc('month', CURRENT_TIMESTAMP AT TIME ZONE $1) - INTERVAL '11 months'
		GROUP BY 1
		ORDER BY 1
	`

	rows, err := s.pool.Query(ctx, query, timezone)
	if err != nil {
		return nil, fmt.Errorf("dashboard suggestions by month: %w", err)
	}
	defer rows.Close()

	out := make([]SuggestionMonthCount, 0)
	for rows.Next() {
		var item SuggestionMonthCount
		if err := rows.Scan(&item.Month, &item.Pending, &item.Approved, &item.Rejected); err != nil {
			return nil, fmt.Errorf("scan suggestions by month: %w", err)
		}
		out = append(out, item)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate suggestions by month: %w", err)
	}

	return out, nil
}

func (s *DashboardStore) topTags(ctx context.Context) ([]LabeledCount, error) {
	const query = `
		SELECT t.name AS label, COUNT(*)::int AS count
		FROM event_tags et
		JOIN tags t ON t.id = et.tag_id
		GROUP BY t.name
		ORDER BY count DESC, label ASC
		LIMIT 10
	`

	return s.scanLabeledCounts(ctx, query, "dashboard top tags")
}

func (s *DashboardStore) topLocations(ctx context.Context) ([]LabeledCount, error) {
	const query = `
		SELECT COALESCE(NULLIF(BTRIM(location), ''), 'Unspecified') AS label, COUNT(*)::int AS count
		FROM events
		GROUP BY 1
		ORDER BY count DESC, label ASC
		LIMIT 8
	`

	return s.scanLabeledCounts(ctx, query, "dashboard top locations")
}

func (s *DashboardStore) eventsByWeekday(ctx context.Context, timezone string) ([]LabeledCount, error) {
	const query = `
		SELECT EXTRACT(DOW FROM starts_at AT TIME ZONE $1)::int AS dow, COUNT(*)::int AS count
		FROM events
		GROUP BY 1
		ORDER BY 1
	`

	rows, err := s.pool.Query(ctx, query, timezone)
	if err != nil {
		return nil, fmt.Errorf("dashboard events by weekday: %w", err)
	}
	defer rows.Close()

	counts := make(map[int]int, 7)
	for rows.Next() {
		var dow, count int
		if err := rows.Scan(&dow, &count); err != nil {
			return nil, fmt.Errorf("scan events by weekday: %w", err)
		}
		counts[dow] = count
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate events by weekday: %w", err)
	}

	labels := []string{"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"}
	out := make([]LabeledCount, 0, 7)
	for dow, label := range labels {
		out = append(out, LabeledCount{Label: label, Count: counts[dow]})
	}

	return out, nil
}

func (s *DashboardStore) scanLabeledCounts(ctx context.Context, query, op string) ([]LabeledCount, error) {
	rows, err := s.pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("%s: %w", op, err)
	}
	defer rows.Close()

	out := make([]LabeledCount, 0)
	for rows.Next() {
		var item LabeledCount
		if err := rows.Scan(&item.Label, &item.Count); err != nil {
			return nil, fmt.Errorf("scan %s: %w", op, err)
		}
		out = append(out, item)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate %s: %w", op, err)
	}

	return out, nil
}
