package httpapi

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"

	"parbin/backend/internal/config"
)

func preflight(router *gin.Engine, path, origin string) *httptest.ResponseRecorder {
	req := httptest.NewRequest(http.MethodOptions, path, nil)
	req.Header.Set("Origin", origin)
	req.Header.Set("Access-Control-Request-Method", http.MethodPost)
	req.Header.Set("Access-Control-Request-Headers", "Content-Type")
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)
	return rec
}

func TestCORSBrowserExtensionOrigins(t *testing.T) {
	gin.SetMode(gin.TestMode)
	cfg := config.Config{FrontendOrigin: "http://localhost:5173", CORSAllowExtensions: true}
	router := NewRouter(cfg, nil, nil)

	cases := []struct {
		name   string
		path   string
		origin string
		want   int
	}{
		{"frontend origin", "/api/admin/event-suggestions", "http://localhost:5173", http.StatusNoContent},
		{"chrome extension on suggestions", "/api/event-suggestions", "chrome-extension://abcdefghijklmnop", http.StatusNoContent},
		{"firefox extension on tags", "/api/tags", "moz-extension://1b2c3d4e-0000-4000-8000-000000000000", http.StatusNoContent},
		{"extension on admin route", "/api/admin/event-suggestions", "chrome-extension://abcdefghijklmnop", http.StatusForbidden},
		{"extension on login", "/api/auth/login", "chrome-extension://abcdefghijklmnop", http.StatusForbidden},
		{"unknown web origin", "/api/event-suggestions", "https://evil.example", http.StatusForbidden},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			rec := preflight(router, tc.path, tc.origin)
			if rec.Code != tc.want {
				t.Fatalf("status = %d, want %d", rec.Code, tc.want)
			}
			if tc.want == http.StatusNoContent && rec.Header().Get("Access-Control-Allow-Origin") != tc.origin {
				t.Fatalf("Access-Control-Allow-Origin = %q", rec.Header().Get("Access-Control-Allow-Origin"))
			}
		})
	}

	disabled := NewRouter(config.Config{FrontendOrigin: "http://localhost:5173"}, nil, nil)
	if rec := preflight(disabled, "/api/event-suggestions", "chrome-extension://abcdefghijklmnop"); rec.Code != http.StatusForbidden {
		t.Fatalf("extensions disabled: status = %d, want %d", rec.Code, http.StatusForbidden)
	}
}
