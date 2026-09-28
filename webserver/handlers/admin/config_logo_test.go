package admin

import (
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestSetLogoResetRestoresDefault(t *testing.T) {
	logoPath := filepath.Join("data", "logo.png")
	defer os.Remove(logoPath)

	if err := os.WriteFile(logoPath, []byte("custom-logo"), 0o600); err != nil {
		t.Fatalf("seed logo: %v", err)
	}

	body := makeConfigValueBody("")
	req := httptest.NewRequest(http.MethodPost, "/api/admin/config/logo", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	testAdmin.SetLogo(w, req)

	resp := parseResponse(t, w)
	if !resp.Success {
		t.Fatalf("expected success, got error: %s", resp.Message)
	}

	written, err := os.ReadFile(logoPath)
	if err != nil {
		t.Fatalf("read restored logo: %v", err)
	}
	if string(written) == "custom-logo" {
		t.Fatal("delete logo left the custom file in place")
	}
	if testAdmin.configRepository.GetLogoPath() != "logo.png" {
		t.Fatalf("logo path = %q, want logo.png", testAdmin.configRepository.GetLogoPath())
	}
}
