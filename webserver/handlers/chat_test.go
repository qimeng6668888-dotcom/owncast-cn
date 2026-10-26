package handlers

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"unicode/utf8"

	"github.com/owncast/owncast/config"
	"github.com/owncast/owncast/models"
)

// A proposed display name that sanitizes to an empty string (e.g. only HTML
// tags) must fall back to a generated name instead of failing registration.
func TestRegisterAnonymousChatUserEmptyAfterSanitizationFallsBack(t *testing.T) {
	tests := []struct {
		name        string
		body        string
		headers     map[string]string
		wantExactly string
	}{
		{name: "body display name of only HTML", body: `{"displayName": "<b></b>"}`},
		{name: "body display name of HTML around text keeps the text", body: `{"displayName": "<b>gabe</b>"}`, wantExactly: "gabe"},
		{name: "X-Forwarded-User of only HTML", body: `{}`, headers: map[string]string{"X-Forwarded-User": "<b></b>"}},
		{name: "body display name of only whitespace", body: `{"displayName": "   "}`},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			gate := testHandlers.configRepository.GetEntryGate()
			gate.Enabled = false
			if err := testHandlers.configRepository.SetEntryGate(gate); err != nil {
				t.Fatal(err)
			}

			req := httptest.NewRequest(http.MethodPost, "/api/chat/register", strings.NewReader(tc.body))
			for k, v := range tc.headers {
				req.Header.Set(k, v)
			}
			w := httptest.NewRecorder()

			testHandlers.RegisterAnonymousChatUser(w, req)

			resp := w.Result()
			if resp.StatusCode != http.StatusOK {
				t.Fatalf("expected status 200, got %d", resp.StatusCode)
			}

			var response struct {
				ID          string `json:"id"`
				AccessToken string `json:"accessToken"`
				DisplayName string `json:"displayName"`
			}
			if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
				t.Fatalf("decode response: %v", err)
			}
			if response.DisplayName == "" {
				t.Error("expected a non-empty generated display name")
			}
			if tc.wantExactly == "" && strings.ContainsAny(response.DisplayName, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-") {
				t.Errorf("expected a Simplified Chinese display name, got %q", response.DisplayName)
			}
			if utf8.RuneCountInString(response.DisplayName) > config.MaxChatDisplayNameLength {
				t.Errorf("display name %q exceeds max length %d", response.DisplayName, config.MaxChatDisplayNameLength)
			}
			if tc.wantExactly != "" && response.DisplayName != tc.wantExactly {
				t.Errorf("expected display name %q, got %q", tc.wantExactly, response.DisplayName)
			}
			if response.AccessToken == "" {
				t.Error("expected a non-empty access token")
			}
		})
	}
}

func TestRegisterAnonymousChatUserRequiresNameWhenEntryGateEnabled(t *testing.T) {
	gate := testHandlers.configRepository.GetEntryGate()
	gate.Enabled = true
	if err := testHandlers.configRepository.SetEntryGate(gate); err != nil {
		t.Fatal(err)
	}

	req := httptest.NewRequest(http.MethodPost, "/api/chat/register", strings.NewReader(`{"displayName":"   "}`))
	w := httptest.NewRecorder()
	testHandlers.RegisterAnonymousChatUser(w, req)

	resp := w.Result()
	if resp.StatusCode != http.StatusBadRequest {
		t.Fatalf("expected status 400, got %d", resp.StatusCode)
	}
	var response models.BaseAPIResponse
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		t.Fatal(err)
	}
	if response.Message != "请填写真实姓名" {
		t.Fatalf("message = %q", response.Message)
	}
}

func TestRegisterAnonymousChatUserKeepsTypedChineseName(t *testing.T) {
	gate := testHandlers.configRepository.GetEntryGate()
	gate.Enabled = true
	if err := testHandlers.configRepository.SetEntryGate(gate); err != nil {
		t.Fatal(err)
	}

	req := httptest.NewRequest(http.MethodPost, "/api/chat/register", strings.NewReader(`{"displayName":"张三"}`))
	w := httptest.NewRecorder()
	testHandlers.RegisterAnonymousChatUser(w, req)

	resp := w.Result()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected status 200, got %d", resp.StatusCode)
	}
	var response struct {
		DisplayName string `json:"displayName"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		t.Fatal(err)
	}
	if response.DisplayName != "张三" {
		t.Fatalf("display name = %q", response.DisplayName)
	}
}
