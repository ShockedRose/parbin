package service

import (
	"context"
	"time"

	"parbin/backend/internal/store"
)

type DashboardStats struct {
	Timezone            string                       `json:"timezone"`
	Summary             DashboardSummary             `json:"summary"`
	EventsByMonth       []store.MonthCount           `json:"eventsByMonth"`
	SuggestionsByMonth  []store.SuggestionMonthCount `json:"suggestionsByMonth"`
	TopTags             []store.LabeledCount         `json:"topTags"`
	TopLocations        []store.LabeledCount         `json:"topLocations"`
	EventsByWeekday     []store.LabeledCount         `json:"eventsByWeekday"`
	EventSourceMix      []store.LabeledCount         `json:"eventSourceMix"`
	SuggestionSourceMix []store.LabeledCount         `json:"suggestionSourceMix"`
	SuggestionStatusMix []store.LabeledCount         `json:"suggestionStatusMix"`
}

type DashboardSummary struct {
	TotalEvents             int      `json:"totalEvents"`
	UpcomingEvents          int      `json:"upcomingEvents"`
	PastEvents              int      `json:"pastEvents"`
	EventsWithSourcePage    int      `json:"eventsWithSourcePage"`
	EventsWithoutSourcePage int      `json:"eventsWithoutSourcePage"`
	TotalSuggestions        int      `json:"totalSuggestions"`
	PendingSuggestions      int      `json:"pendingSuggestions"`
	ApprovedSuggestions     int      `json:"approvedSuggestions"`
	RejectedSuggestions     int      `json:"rejectedSuggestions"`
	SourcedSuggestions      int      `json:"sourcedSuggestions"`
	CommunitySuggestions    int      `json:"communitySuggestions"`
	ApprovalRate            *float64 `json:"approvalRate"`
	AvgReviewHours          *float64 `json:"avgReviewHours"`
}

func (s *EventService) GetDashboard(ctx context.Context) (DashboardStats, error) {
	today := startOfTodayInAppTimezone(s.location)
	snapshot, err := s.dashboard.Snapshot(ctx, s.timezone, today)
	if err != nil {
		return DashboardStats{}, err
	}

	now := time.Now().In(s.location)
	months := lastNMonths(now, 12)

	return DashboardStats{
		Timezone:           s.timezone,
		Summary:            toDashboardSummary(snapshot.Summary),
		EventsByMonth:      fillEventMonths(months, snapshot.EventsByMonth),
		SuggestionsByMonth: fillSuggestionMonths(months, snapshot.SuggestionsByMonth),
		TopTags:            snapshot.TopTags,
		TopLocations:       snapshot.TopLocations,
		EventsByWeekday:    snapshot.EventsByWeekday,
		EventSourceMix: []store.LabeledCount{
			{Label: "Sourced", Count: snapshot.Summary.EventsWithSourcePage},
			{Label: "Manual", Count: snapshot.Summary.EventsWithoutSourcePage},
		},
		SuggestionSourceMix: []store.LabeledCount{
			{Label: "Sourced", Count: snapshot.Summary.SourcedSuggestions},
			{Label: "Community", Count: snapshot.Summary.CommunitySuggestions},
		},
		SuggestionStatusMix: []store.LabeledCount{
			{Label: "Pending", Count: snapshot.Summary.PendingSuggestions},
			{Label: "Approved", Count: snapshot.Summary.ApprovedSuggestions},
			{Label: "Rejected", Count: snapshot.Summary.RejectedSuggestions},
		},
	}, nil
}

func toDashboardSummary(summary store.DashboardSummary) DashboardSummary {
	return DashboardSummary{
		TotalEvents:             summary.TotalEvents,
		UpcomingEvents:          summary.UpcomingEvents,
		PastEvents:              summary.PastEvents,
		EventsWithSourcePage:    summary.EventsWithSourcePage,
		EventsWithoutSourcePage: summary.EventsWithoutSourcePage,
		TotalSuggestions:        summary.TotalSuggestions,
		PendingSuggestions:      summary.PendingSuggestions,
		ApprovedSuggestions:     summary.ApprovedSuggestions,
		RejectedSuggestions:     summary.RejectedSuggestions,
		SourcedSuggestions:      summary.SourcedSuggestions,
		CommunitySuggestions:    summary.CommunitySuggestions,
		ApprovalRate:            summary.ApprovalRate,
		AvgReviewHours:          summary.AvgReviewHours,
	}
}

func lastNMonths(now time.Time, n int) []string {
	cursor := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	out := make([]string, n)
	for i := n - 1; i >= 0; i-- {
		out[i] = cursor.Format("2006-01")
		cursor = cursor.AddDate(0, -1, 0)
	}
	return out
}

func fillEventMonths(months []string, rows []store.MonthCount) []store.MonthCount {
	lookup := make(map[string]int, len(rows))
	for _, row := range rows {
		lookup[row.Month] = row.Count
	}

	out := make([]store.MonthCount, 0, len(months))
	for _, month := range months {
		out = append(out, store.MonthCount{Month: month, Count: lookup[month]})
	}
	return out
}

func fillSuggestionMonths(months []string, rows []store.SuggestionMonthCount) []store.SuggestionMonthCount {
	lookup := make(map[string]store.SuggestionMonthCount, len(rows))
	for _, row := range rows {
		lookup[row.Month] = row
	}

	out := make([]store.SuggestionMonthCount, 0, len(months))
	for _, month := range months {
		item := lookup[month]
		item.Month = month
		out = append(out, item)
	}
	return out
}
