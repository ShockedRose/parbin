package service

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"parbin/backend/internal/store"
)

type EventPayload struct {
	Title       string
	Description string
	Date        string
	EndDate     string
	Location    string
	Image       string
	Tags        []string
}

type EventService struct {
	events      *store.EventStore
	suggestions *store.EventSuggestionStore
	location    *time.Location
}

func NewEventService(events *store.EventStore, suggestions *store.EventSuggestionStore, location *time.Location) *EventService {
	return &EventService{
		events:      events,
		suggestions: suggestions,
		location:    location,
	}
}

func (s *EventService) ListEvents(ctx context.Context) ([]store.Event, error) {
	return s.events.List(ctx)
}

func (s *EventService) UpdateEvent(ctx context.Context, id string, payload EventPayload) (store.Event, error) {
	id = strings.TrimSpace(id)
	if id == "" {
		return store.Event{}, fmt.Errorf("%w: event id is required", ErrValidation)
	}

	input, err := buildEventInput(payload, s.location)
	if err != nil {
		return store.Event{}, err
	}

	return s.events.Update(ctx, id, input)
}

func (s *EventService) CreateEvent(ctx context.Context, payload EventPayload) (store.Event, error) {
	input, err := buildEventInput(payload, s.location)
	if err != nil {
		return store.Event{}, err
	}

	return s.events.Create(ctx, input)
}

func (s *EventService) CreateSuggestion(ctx context.Context, payload EventPayload) (store.EventSuggestion, error) {
	input, err := buildEventInput(payload, s.location)
	if err != nil {
		return store.EventSuggestion{}, err
	}

	return s.suggestions.Create(ctx, input)
}

func (s *EventService) ListSuggestions(ctx context.Context) ([]store.EventSuggestion, error) {
	return s.suggestions.List(ctx)
}

func (s *EventService) ApproveSuggestion(ctx context.Context, suggestionID, adminID string) (store.EventSuggestion, store.Event, error) {
	suggestionID = strings.TrimSpace(suggestionID)
	if suggestionID == "" {
		return store.EventSuggestion{}, store.Event{}, fmt.Errorf("%w: suggestion id is required", ErrValidation)
	}

	suggestion, event, err := s.suggestions.Approve(ctx, suggestionID, adminID)
	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			return store.EventSuggestion{}, store.Event{}, store.ErrNotFound
		}
		if errors.Is(err, store.ErrConflict) {
			return store.EventSuggestion{}, store.Event{}, store.ErrConflict
		}
		return store.EventSuggestion{}, store.Event{}, err
	}

	return suggestion, event, nil
}

func (s *EventService) RejectSuggestion(ctx context.Context, suggestionID, adminID string) (store.EventSuggestion, error) {
	suggestionID = strings.TrimSpace(suggestionID)
	if suggestionID == "" {
		return store.EventSuggestion{}, fmt.Errorf("%w: suggestion id is required", ErrValidation)
	}

	suggestion, err := s.suggestions.Reject(ctx, suggestionID, adminID)
	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			return store.EventSuggestion{}, store.ErrNotFound
		}
		if errors.Is(err, store.ErrConflict) {
			return store.EventSuggestion{}, store.ErrConflict
		}
		return store.EventSuggestion{}, err
	}

	return suggestion, nil
}

func buildEventInput(payload EventPayload, location *time.Location) (store.EventInput, error) {
	title := strings.TrimSpace(payload.Title)
	date := strings.TrimSpace(payload.Date)
	endDate := strings.TrimSpace(payload.EndDate)
	if title == "" || date == "" || endDate == "" {
		return store.EventInput{}, fmt.Errorf("%w: title, date and endDate are required", ErrValidation)
	}

	startsAt, err := parseDateTime(date, location)
	if err != nil {
		return store.EventInput{}, fmt.Errorf("%w: invalid date", ErrValidation)
	}

	endsAt, err := parseDateTime(endDate, location)
	if err != nil {
		return store.EventInput{}, fmt.Errorf("%w: invalid endDate", ErrValidation)
	}

	if endsAt.Before(startsAt) {
		return store.EventInput{}, fmt.Errorf("%w: endDate must be after date", ErrValidation)
	}

	return store.EventInput{
		Title:       title,
		Description: strings.TrimSpace(payload.Description),
		StartsAt:    startsAt,
		EndsAt:      endsAt,
		Location:    strings.TrimSpace(payload.Location),
		ImageURL:    strings.TrimSpace(payload.Image),
		Tags:        cleanTags(payload.Tags),
	}, nil
}

func parseDateTime(value string, location *time.Location) (time.Time, error) {
	if parsed, err := time.Parse(time.RFC3339, value); err == nil {
		return parsed, nil
	}

	layouts := []string{"2006-01-02T15:04", "2006-01-02T15:04:05"}
	for _, layout := range layouts {
		if parsed, err := time.ParseInLocation(layout, value, location); err == nil {
			return parsed, nil
		}
	}

	return time.Time{}, fmt.Errorf("unsupported datetime format")
}

func cleanTags(tags []string) []string {
	cleaned := make([]string, 0, len(tags))
	seen := make(map[string]struct{}, len(tags))

	for _, tag := range tags {
		normalized := strings.TrimSpace(tag)
		if normalized == "" {
			continue
		}
		key := strings.ToLower(normalized)
		if _, ok := seen[key]; ok {
			continue
		}
		seen[key] = struct{}{}
		cleaned = append(cleaned, normalized)
	}

	return cleaned
}
