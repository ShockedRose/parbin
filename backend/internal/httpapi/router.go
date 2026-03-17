package httpapi

import (
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"parbin/backend/internal/config"
	"parbin/backend/internal/service"
	"parbin/backend/internal/store"
)

const adminContextKey = "currentAdmin"

type Server struct {
	cfg          config.Config
	authService  *service.AuthService
	eventService *service.EventService
}

type eventRequest struct {
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Date        string   `json:"date"`
	EndDate     string   `json:"endDate"`
	Location    string   `json:"location"`
	Image       string   `json:"image"`
	Tags        []string `json:"tags"`
}

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type eventResponse struct {
	ID          string   `json:"id"`
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Date        string   `json:"date"`
	EndDate     string   `json:"endDate"`
	Location    string   `json:"location"`
	Image       string   `json:"image"`
	Tags        []string `json:"tags"`
}

type suggestionResponse struct {
	ID            string   `json:"id"`
	Title         string   `json:"title"`
	Description   string   `json:"description"`
	Date          string   `json:"date"`
	EndDate       string   `json:"endDate"`
	Location      string   `json:"location"`
	Image         string   `json:"image"`
	Tags          []string `json:"tags"`
	Status        string   `json:"status"`
	SourceEventID *string  `json:"sourceEventId"`
	CreatedAt     string   `json:"createdAt"`
	ReviewedAt    *string  `json:"reviewedAt"`
	ReviewedBy    *string  `json:"reviewedBy"`
}

func NewRouter(cfg config.Config, authService *service.AuthService, eventService *service.EventService) *gin.Engine {
	server := &Server{
		cfg:          cfg,
		authService:  authService,
		eventService: eventService,
	}

	router := gin.Default()
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{cfg.FrontendOrigin},
		AllowMethods:     []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodOptions},
		AllowHeaders:     []string{"Content-Type"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	router.GET("/healthz", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	api := router.Group("/api")
	api.GET("/events", server.listEvents)
	api.POST("/event-suggestions", server.createSuggestion)
	api.POST("/auth/login", server.login)
	api.POST("/auth/logout", server.logout)
	api.GET("/auth/me", server.requireAdmin(), server.me)

	admin := api.Group("/")
	admin.Use(server.requireAdmin())
	admin.POST("/events", server.createEvent)
	admin.PUT("/events/:id", server.updateEvent)
	admin.GET("/admin/event-suggestions", server.listSuggestions)
	admin.POST("/admin/event-suggestions/:id/approve", server.approveSuggestion)
	admin.POST("/admin/event-suggestions/:id/reject", server.rejectSuggestion)

	return router
}

func (s *Server) listEvents(c *gin.Context) {
	events, err := s.eventService.ListEvents(c.Request.Context())
	if err != nil {
		respondError(c, http.StatusInternalServerError, err.Error())
		return
	}

	response := make([]eventResponse, 0, len(events))
	for _, event := range events {
		response = append(response, s.toEventResponse(event))
	}

	c.JSON(http.StatusOK, gin.H{"events": response})
}

func (s *Server) createEvent(c *gin.Context) {
	var req eventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "invalid request body")
		return
	}

	event, err := s.eventService.CreateEvent(c.Request.Context(), service.EventPayload(req))
	if err != nil {
		handleServiceError(c, err)
		return
	}

	c.JSON(http.StatusCreated, gin.H{"event": s.toEventResponse(event)})
}

func (s *Server) updateEvent(c *gin.Context) {
	var req eventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "invalid request body")
		return
	}

	event, err := s.eventService.UpdateEvent(c.Request.Context(), c.Param("id"), service.EventPayload(req))
	if err != nil {
		handleServiceError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"event": s.toEventResponse(event)})
}

func (s *Server) createSuggestion(c *gin.Context) {
	var req eventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "invalid request body")
		return
	}

	suggestion, err := s.eventService.CreateSuggestion(c.Request.Context(), service.EventPayload(req))
	if err != nil {
		handleServiceError(c, err)
		return
	}

	c.JSON(http.StatusCreated, gin.H{"suggestion": s.toSuggestionResponse(suggestion)})
}

func (s *Server) listSuggestions(c *gin.Context) {
	suggestions, err := s.eventService.ListSuggestions(c.Request.Context())
	if err != nil {
		respondError(c, http.StatusInternalServerError, err.Error())
		return
	}

	response := make([]suggestionResponse, 0, len(suggestions))
	for _, suggestion := range suggestions {
		response = append(response, s.toSuggestionResponse(suggestion))
	}

	c.JSON(http.StatusOK, gin.H{"suggestions": response})
}

func (s *Server) approveSuggestion(c *gin.Context) {
	admin := currentAdmin(c)
	suggestion, event, err := s.eventService.ApproveSuggestion(
		c.Request.Context(),
		c.Param("id"),
		admin.ID,
	)
	if err != nil {
		handleServiceError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"suggestion": s.toSuggestionResponse(suggestion),
		"event":      s.toEventResponse(event),
	})
}

func (s *Server) rejectSuggestion(c *gin.Context) {
	admin := currentAdmin(c)
	suggestion, err := s.eventService.RejectSuggestion(
		c.Request.Context(),
		c.Param("id"),
		admin.ID,
	)
	if err != nil {
		handleServiceError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"suggestion": s.toSuggestionResponse(suggestion)})
}

func (s *Server) login(c *gin.Context) {
	var req loginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, "invalid request body")
		return
	}

	admin, token, expiresAt, err := s.authService.Login(c.Request.Context(), req.Email, req.Password)
	if err != nil {
		handleServiceError(c, err)
		return
	}

	setSessionCookie(c, s.cfg, token, expiresAt)
	c.JSON(http.StatusOK, gin.H{"admin": sanitizeAdmin(admin)})
}

func (s *Server) logout(c *gin.Context) {
	token, _ := c.Cookie(s.cfg.SessionCookieName)
	if err := s.authService.Logout(c.Request.Context(), token); err != nil {
		respondError(c, http.StatusInternalServerError, err.Error())
		return
	}

	clearSessionCookie(c, s.cfg)
	c.Status(http.StatusNoContent)
}

func (s *Server) me(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"admin": sanitizeAdmin(currentAdmin(c))})
}

func (s *Server) requireAdmin() gin.HandlerFunc {
	return func(c *gin.Context) {
		token, err := c.Cookie(s.cfg.SessionCookieName)
		if err != nil {
			respondError(c, http.StatusUnauthorized, "authentication required")
			c.Abort()
			return
		}

		admin, err := s.authService.GetAdminFromToken(c.Request.Context(), token)
		if err != nil {
			handleServiceError(c, err)
			c.Abort()
			return
		}

		c.Set(adminContextKey, admin)
		c.Next()
	}
}

func currentAdmin(c *gin.Context) store.Admin {
	value, _ := c.Get(adminContextKey)
	admin, _ := value.(store.Admin)
	return admin
}

func sanitizeAdmin(admin store.Admin) gin.H {
	return gin.H{
		"id":        admin.ID,
		"email":     admin.Email,
		"createdAt": admin.CreatedAt.Format(time.RFC3339),
	}
}

func (s *Server) toEventResponse(event store.Event) eventResponse {
	return eventResponse{
		ID:          event.ID,
		Title:       event.Title,
		Description: event.Description,
		Date:        formatLocalDateTime(event.StartsAt, s.cfg.Location),
		EndDate:     formatLocalDateTime(event.EndsAt, s.cfg.Location),
		Location:    event.Location,
		Image:       event.ImageURL,
		Tags:        event.Tags,
	}
}

func (s *Server) toSuggestionResponse(suggestion store.EventSuggestion) suggestionResponse {
	var reviewedAt *string
	if suggestion.ReviewedAt != nil {
		formatted := formatLocalDateTime(*suggestion.ReviewedAt, s.cfg.Location)
		reviewedAt = &formatted
	}

	return suggestionResponse{
		ID:            suggestion.ID,
		Title:         suggestion.Title,
		Description:   suggestion.Description,
		Date:          formatLocalDateTime(suggestion.StartsAt, s.cfg.Location),
		EndDate:       formatLocalDateTime(suggestion.EndsAt, s.cfg.Location),
		Location:      suggestion.Location,
		Image:         suggestion.ImageURL,
		Tags:          suggestion.Tags,
		Status:        suggestion.Status,
		SourceEventID: suggestion.SourceEventID,
		CreatedAt:     formatLocalDateTime(suggestion.CreatedAt, s.cfg.Location),
		ReviewedAt:    reviewedAt,
		ReviewedBy:    suggestion.ReviewedBy,
	}
}

func formatLocalDateTime(value time.Time, location *time.Location) string {
	return value.In(location).Format("2006-01-02T15:04:05")
}

func setSessionCookie(c *gin.Context, cfg config.Config, token string, expiresAt time.Time) {
	maxAge := int(time.Until(expiresAt).Seconds())
	if maxAge < 0 {
		maxAge = 0
	}

	c.SetSameSite(http.SameSiteNoneMode)
	c.SetCookie(
		cfg.SessionCookieName,
		token,
		maxAge,
		"/",
		"",
		cfg.SessionSecureCookies,
		true,
	)
}

func clearSessionCookie(c *gin.Context, cfg config.Config) {
	c.SetSameSite(http.SameSiteNoneMode)
	c.SetCookie(cfg.SessionCookieName, "", -1, "/", "", cfg.SessionSecureCookies, true)
}

func handleServiceError(c *gin.Context, err error) {
	switch {
	case errors.Is(err, service.ErrValidation):
		respondError(c, http.StatusBadRequest, trimErrorPrefix(err.Error()))
	case errors.Is(err, service.ErrInvalidCredentials):
		respondError(c, http.StatusUnauthorized, "invalid credentials")
	case errors.Is(err, service.ErrUnauthorized):
		respondError(c, http.StatusUnauthorized, "authentication required")
	case errors.Is(err, store.ErrNotFound):
		respondError(c, http.StatusNotFound, "resource not found")
	case errors.Is(err, store.ErrConflict):
		respondError(c, http.StatusConflict, "resource already processed")
	default:
		respondError(c, http.StatusInternalServerError, err.Error())
	}
}

func respondError(c *gin.Context, status int, message string) {
	c.JSON(status, gin.H{"error": strings.TrimSpace(message)})
}

func trimErrorPrefix(message string) string {
	parts := strings.Split(message, ":")
	return strings.TrimSpace(parts[len(parts)-1])
}
