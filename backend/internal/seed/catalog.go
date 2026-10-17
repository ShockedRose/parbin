package seed

import (
	"fmt"
	"math/rand"
	"strings"
	"time"
)

const (
	TagCount           = 20
	EventCount         = 20
	PastEventCount     = 5
	UpcomingEventCount = 14

	// maxTagsPerEvent matches the limit enforced by service.cleanTags.
	maxTagsPerEvent = 6

	RolePast       = "past"
	RoleBorderline = "borderline"
	RoleUpcoming   = "upcoming"

	// devRandSeed keeps titles, locations, and tags stable across dev starts.
	// Schedules are still rebuilt from the clock passed to BuildCatalog.
	devRandSeed int64 = 20261017

	meetupHour = 18
)

// EventDraft is one sample event. Role is past, borderline (starts today), or upcoming.
type EventDraft struct {
	Title       string
	Description string
	Location    string
	ImageURL    string
	Tags        []string
	StartsAt    time.Time
	EndsAt      time.Time
	Role        string
}

// Catalog is the full development sample: every tag, plus 20 events.
type Catalog struct {
	Tags   []string
	Events []EventDraft
}

// BuildCatalog builds 20 tags and 20 events from now in loc.
// Five events start before today, fourteen start on a later day, and one starts
// today so it stays on the upcoming feed until the next local midnight.
// rng only shuffles copy, locations, and tags. Pass the same seed to get the
// same copy with dates that follow now.
func BuildCatalog(now time.Time, loc *time.Location, rng *rand.Rand) (Catalog, error) {
	if loc == nil {
		return Catalog{}, fmt.Errorf("timezone is required")
	}
	if rng == nil {
		return Catalog{}, fmt.Errorf("rng is required")
	}
	if now.IsZero() {
		return Catalog{}, fmt.Errorf("clock is required")
	}
	if err := validatePools(); err != nil {
		return Catalog{}, err
	}

	slots, err := buildSlots(now, loc, rng)
	if err != nil {
		return Catalog{}, err
	}

	templates := shuffle(rng, eventTemplates)
	locations := shuffle(rng, locationCatalog)
	tagSets, err := assignTags(rng, append([]string(nil), tagNames...), len(slots))
	if err != nil {
		return Catalog{}, err
	}

	events := make([]EventDraft, len(slots))
	for i, slot := range slots {
		events[i] = EventDraft{
			Title:       templates[i].title,
			Description: templates[i].description,
			Location:    locations[i],
			ImageURL:    templates[i].imageURL,
			Tags:        tagSets[i],
			StartsAt:    slot.start,
			EndsAt:      endOnSameDay(slot.start, templates[i].duration),
			Role:        slot.role,
		}
		if !events[i].EndsAt.After(events[i].StartsAt) {
			return Catalog{}, fmt.Errorf("seed event %q ends before it starts", events[i].Title)
		}
	}

	return Catalog{Tags: append([]string(nil), tagNames...), Events: events}, nil
}

type slot struct {
	role  string
	day   time.Time
	start time.Time
}

func buildSlots(now time.Time, loc *time.Location, rng *rand.Rand) ([]slot, error) {
	today := startOfDay(now, loc)
	slots := make([]slot, 0, EventCount)
	for _, offset := range pastDayOffsets {
		slots = append(slots, slot{role: RolePast, day: today.AddDate(0, 0, -offset)})
	}
	slots = append(slots, slot{role: RoleBorderline, day: today})
	for _, offset := range upcomingDayOffsets {
		slots = append(slots, slot{role: RoleUpcoming, day: today.AddDate(0, 0, offset)})
	}
	if len(slots) != EventCount {
		return nil, fmt.Errorf("expected %d schedule slots, got %d", EventCount, len(slots))
	}

	hours := []int{9, 10, 11, 14, 16, 18, 19}
	border := borderlineStart(now, loc)
	tomorrow := today.AddDate(0, 0, 1)
	for i := range slots {
		hour := hours[rng.Intn(len(hours))]
		start := time.Date(slots[i].day.Year(), slots[i].day.Month(), slots[i].day.Day(), hour, 0, 0, 0, loc)
		switch slots[i].role {
		case RoleBorderline:
			start = border
			if start.Before(today) || !start.Before(tomorrow) {
				return nil, fmt.Errorf("borderline event must start today")
			}
		case RolePast:
			if !start.Before(today) {
				return nil, fmt.Errorf("past event must start before today")
			}
		case RoleUpcoming:
			if start.Before(tomorrow) {
				return nil, fmt.Errorf("upcoming event must start after today")
			}
		default:
			return nil, fmt.Errorf("unknown slot role %q", slots[i].role)
		}
		slots[i].start = start
	}

	return slots, nil
}

// borderlineStart is on today's calendar date in loc, which is the upcoming side
// of the same midnight boundary ListEvents and ListPastEvents use. Before 18:00
// it is an evening meetup; later it starts during the current hour so it is
// still today.
func borderlineStart(now time.Time, loc *time.Location) time.Time {
	local := now.In(loc)
	evening := time.Date(local.Year(), local.Month(), local.Day(), meetupHour, 0, 0, 0, loc)
	if !local.After(evening) {
		return evening
	}
	return time.Date(local.Year(), local.Month(), local.Day(), local.Hour(), 0, 0, 0, loc)
}

func startOfDay(now time.Time, loc *time.Location) time.Time {
	local := now.In(loc)
	return time.Date(local.Year(), local.Month(), local.Day(), 0, 0, 0, 0, loc)
}

func endOnSameDay(start time.Time, duration time.Duration) time.Time {
	if duration <= 0 {
		duration = 2 * time.Hour
	}
	end := start.Add(duration)
	nextDay := time.Date(start.Year(), start.Month(), start.Day()+1, 0, 0, 0, 0, start.Location())
	if !end.Before(nextDay) {
		end = nextDay.Add(-time.Minute)
	}
	if !end.After(start) {
		end = start.Add(30 * time.Minute)
	}
	return end
}

func assignTags(rng *rand.Rand, tags []string, n int) ([][]string, error) {
	if len(tags) != n {
		return nil, fmt.Errorf("assign tags: got %d tags for %d events", len(tags), n)
	}

	primary := shuffle(rng, tags)
	assigned := make([][]string, n)
	for i := range assigned {
		additional := rng.Intn(maxTagsPerEvent) // 0..5 extras, so each event has 1..6 tags
		chosen := []string{primary[i]}
		for _, tag := range shuffle(rng, tags) {
			if len(chosen) == 1+additional {
				break
			}
			if containsTag(chosen, tag) {
				continue
			}
			chosen = append(chosen, tag)
		}
		assigned[i] = chosen
	}
	return assigned, nil
}

func containsTag(tags []string, want string) bool {
	for _, tag := range tags {
		if tag == want {
			return true
		}
	}
	return false
}

func shuffle[T any](rng *rand.Rand, in []T) []T {
	out := append([]T(nil), in...)
	rng.Shuffle(len(out), func(i, j int) { out[i], out[j] = out[j], out[i] })
	return out
}

func validatePools() error {
	if len(pastDayOffsets) != PastEventCount {
		return fmt.Errorf("expected %d past day offsets", PastEventCount)
	}
	if len(upcomingDayOffsets) != UpcomingEventCount {
		return fmt.Errorf("expected %d upcoming day offsets", UpcomingEventCount)
	}
	if PastEventCount+UpcomingEventCount+1 != EventCount {
		return fmt.Errorf("event role counts must add up to %d", EventCount)
	}
	if len(eventTemplates) != EventCount || len(locationCatalog) != EventCount || len(tagNames) != TagCount {
		return fmt.Errorf(
			"seed data has %d templates, %d locations, and %d tags",
			len(eventTemplates),
			len(locationCatalog),
			len(tagNames),
		)
	}

	titles := make(map[string]struct{}, len(eventTemplates))
	for _, tmpl := range eventTemplates {
		title := strings.TrimSpace(tmpl.title)
		if title == "" || strings.TrimSpace(tmpl.description) == "" || strings.TrimSpace(tmpl.imageURL) == "" || tmpl.duration <= 0 {
			return fmt.Errorf("seed template %q is incomplete", tmpl.title)
		}
		if _, ok := titles[title]; ok {
			return fmt.Errorf("duplicate seed title %q", title)
		}
		titles[title] = struct{}{}
	}

	locations := make(map[string]struct{}, len(locationCatalog))
	for _, location := range locationCatalog {
		location = strings.TrimSpace(location)
		if location == "" {
			return fmt.Errorf("seed location is empty")
		}
		if _, ok := locations[location]; ok {
			return fmt.Errorf("duplicate seed location %q", location)
		}
		locations[location] = struct{}{}
	}

	tags := make(map[string]struct{}, len(tagNames))
	for _, tag := range tagNames {
		tag = strings.TrimSpace(tag)
		if tag == "" {
			return fmt.Errorf("seed tag is empty")
		}
		if _, ok := tags[tag]; ok {
			return fmt.Errorf("duplicate seed tag %q", tag)
		}
		tags[tag] = struct{}{}
	}

	return nil
}

// Offsets are whole days before or after today in the app timezone.
// The smallest past offset is 1, so those events stay on the past feed.
var pastDayOffsets = []int{1, 4, 9, 18, 40}

var upcomingDayOffsets = []int{1, 2, 3, 5, 8, 12, 18, 25, 35, 48, 60, 75, 90, 120}

var tagNames = []string{
	"JavaScript",
	"TypeScript",
	"React",
	"Go",
	"Python",
	"Rust",
	"Cloud",
	"DevOps",
	"AI",
	"Web",
	"Mobile",
	"Security",
	"Data",
	"Design",
	"Community",
	"Open Source",
	"Career",
	"Startups",
	"Backend",
	"Frontend",
}

var locationCatalog = []string{
	"Ciudad del Saber, Clayton",
	"Casco Viejo, Panama City",
	"Universidad Tecnológica de Panamá",
	"Atlapa Convention Center, Panama City",
	"WeWork, Obarrio",
	"Yuxi Cowork, Calle 50",
	"Selina, Casco Antiguo",
	"Universidad de Panamá",
	"Panama Convention Center, Amador",
	"Multiplaza Pacific Center",
	"Hub Panama, El Cangrejo",
	"Biblioteca Nacional, Calidonia",
	"Marriott Panama, Punta Pacífica",
	"Costa del Este",
	"Fundación Ciudad del Saber",
	"San Francisco, Panama City",
	"Online",
	"Kindred Cowork, San Francisco",
	"Innovation Lab, Clayton",
	"Museo del Canal, Casco Viejo",
}

type eventTemplate struct {
	title       string
	description string
	imageURL    string
	duration    time.Duration
}

var eventTemplates = []eventTemplate{
	{
		title:       "React Panama: Server Components",
		description: "An evening with the local React community on Server Components, data fetching, and what teams in Panama are shipping.",
		imageURL:    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop",
		duration:    2 * time.Hour,
	},
	{
		title:       "AI Meetup: Models in Production",
		description: "Practitioners compare notes on evaluation, cost, and the day-to-day work of keeping a model online.",
		imageURL:    "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop",
		duration:    2 * time.Hour,
	},
	{
		title:       "Go Night: Small APIs",
		description: "A practical night on Go services, Postgres, and APIs that stay easy to operate.",
		imageURL:    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop",
		duration:    2 * time.Hour,
	},
	{
		title:       "Platform Engineering Breakfast",
		description: "Morning talks on internal platforms, paved paths, and the tooling product teams actually adopt.",
		imageURL:    "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=400&fit=crop",
		duration:    90 * time.Minute,
	},
	{
		title:       "TypeScript Workshop",
		description: "Hands-on exercises in advanced types and safer API contracts. Bring a laptop.",
		imageURL:    "https://images.unsplash.com/photo-1516116216624-8e32067e8d02?w=800&h=400&fit=crop",
		duration:    3 * time.Hour,
	},
	{
		title:       "Kubernetes at the City of Knowledge",
		description: "Stories from running clusters in production: upgrades, cost, and the dashboards people trust.",
		imageURL:    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=400&fit=crop",
		duration:    2 * time.Hour,
	},
	{
		title:       "Design Systems for Product Teams",
		description: "Tokens, components, and how design and engineering share a system without freezing the product.",
		imageURL:    "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&h=400&fit=crop",
		duration:    3 * time.Hour,
	},
	{
		title:       "Rust for Backend Developers",
		description: "Ownership, explicit errors, and a small web service built step by step. Systems experience is optional.",
		imageURL:    "https://images.unsplash.com/photo-1515879218367-8466d910aede?w=800&h=400&fit=crop",
		duration:    3 * time.Hour,
	},
	{
		title:       "Cross-Platform Mobile Night",
		description: "React Native, Flutter, and native apps, compared with demos from local projects.",
		imageURL:    "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=400&fit=crop",
		duration:    2 * time.Hour,
	},
	{
		title:       "Open Source Saturday",
		description: "A working session for first contributions: issues, reviews, and how to land a pull request.",
		imageURL:    "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=400&fit=crop",
		duration:    3 * time.Hour,
	},
	{
		title:       "Threat Modeling Clinic",
		description: "Bring a real system. The group sketches assets, boundaries, and the threats worth mitigating.",
		imageURL:    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=400&fit=crop",
		duration:    2 * time.Hour,
	},
	{
		title:       "Data Engineering Meetup",
		description: "Pipelines, warehouse modeling, and the operational side of analytics for product teams.",
		imageURL:    "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&h=400&fit=crop",
		duration:    2 * time.Hour,
	},
	{
		title:       "Career Panel: Junior to Staff",
		description: "Engineers at different stages talk about scope, feedback, and growing in Panama's tech community.",
		imageURL:    "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=400&fit=crop",
		duration:    90 * time.Minute,
	},
	{
		title:       "Founders Breakfast",
		description: "Early-stage founders share what they are building and the technical bets they are making.",
		imageURL:    "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&h=400&fit=crop",
		duration:    90 * time.Minute,
	},
	{
		title:       "Python Panama: Async Patterns",
		description: "Async IO, background jobs, and how local teams structure Python services.",
		imageURL:    "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=400&fit=crop",
		duration:    2 * time.Hour,
	},
	{
		title:       "CSS and Accessibility Guild",
		description: "Modern CSS, keyboard behavior, and the fixes that make a meetup site usable for everyone.",
		imageURL:    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=400&fit=crop",
		duration:    2 * time.Hour,
	},
	{
		title:       "Postgres Performance Night",
		description: "Indexes, query plans, and the checks to run before blaming the database.",
		imageURL:    "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&h=400&fit=crop",
		duration:    2 * time.Hour,
	},
	{
		title:       "Community Demo Hour",
		description: "Short demos from side projects and local tools, with time for questions after each one.",
		imageURL:    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=400&fit=crop",
		duration:    90 * time.Minute,
	},
	{
		title:       "Web Performance Workshop",
		description: "Measure a real page, find the expensive work, and leave with a shorter loading path.",
		imageURL:    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=400&fit=crop",
		duration:    3 * time.Hour,
	},
	{
		title:       "Edge Computing in Panama",
		description: "What moves to the edge, what stays in the region, and how teams reason about latency from Panama.",
		imageURL:    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop",
		duration:    2 * time.Hour,
	},
}
