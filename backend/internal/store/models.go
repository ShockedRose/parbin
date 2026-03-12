package store

import "time"

const (
	SuggestionStatusPending  = "pending"
	SuggestionStatusApproved = "approved"
	SuggestionStatusRejected = "rejected"
)

type Event struct {
	ID          string    `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	StartsAt    time.Time `json:"-"`
	EndsAt      time.Time `json:"-"`
	Location    string    `json:"location"`
	ImageURL    string    `json:"image"`
	Tags        []string  `json:"tags"`
	CreatedAt   time.Time `json:"-"`
	UpdatedAt   time.Time `json:"-"`
}

type EventSuggestion struct {
	ID            string     `json:"id"`
	Title         string     `json:"title"`
	Description   string     `json:"description"`
	StartsAt      time.Time  `json:"-"`
	EndsAt        time.Time  `json:"-"`
	Location      string     `json:"location"`
	ImageURL      string     `json:"image"`
	Tags          []string   `json:"tags"`
	Status        string     `json:"status"`
	SourceEventID *string    `json:"sourceEventId"`
	CreatedAt     time.Time  `json:"createdAt"`
	ReviewedAt    *time.Time `json:"reviewedAt"`
	ReviewedBy    *string    `json:"reviewedBy"`
}

type Admin struct {
	ID           string    `json:"id"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	CreatedAt    time.Time `json:"createdAt"`
}

type Session struct {
	ID        string
	AdminID   string
	TokenHash string
	ExpiresAt time.Time
	CreatedAt time.Time
}
