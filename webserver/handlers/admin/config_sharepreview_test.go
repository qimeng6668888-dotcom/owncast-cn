package admin

import (
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func cleanupSharePreviewFiles(t *testing.T) {
	t.Helper()
	for _, ext := range []string{".png", ".jpeg", ".jpg", ".gif"} {
		os.Remove(filepath.Join("data", "share-preview"+ext))
	}
	configRepository := testAdmin.configRepository
	_ = configRepository.SetSharePreviewPath("")
	_ = configRepository.SetSharePreviewUniquenessString("")
}

func TestSetSharePreviewPNG(t *testing.T) {
	defer cleanupSharePreviewFiles(t)

	body := makeConfigValueBody(makeBase64DataURL("image/png", minimalPNG))
	req := httptest.NewRequest(http.MethodPost, "/api/admin/config/sharepreview", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	testAdmin.SetSharePreview(w, req)

	resp := parseResponse(t, w)
	if !resp.Success {
		t.Fatalf("expected success, got error: %s", resp.Message)
	}

	if path := testAdmin.configRepository.GetSharePreviewPath(); path != "share-preview.png" {
		t.Fatalf("share preview path = %q, want share-preview.png", path)
	}
	if _, err := os.Stat(filepath.Join("data", "share-preview.png")); err != nil {
		t.Fatalf("expected share-preview.png on disk: %v", err)
	}
	if uniq := testAdmin.configRepository.GetSharePreviewUniquenessString(); uniq == "" {
		t.Fatal("expected share preview uniqueness string")
	}
}

func TestSetSharePreviewRejectsUnsupportedType(t *testing.T) {
	defer cleanupSharePreviewFiles(t)

	body := makeConfigValueBody(makeBase64DataURL("image/x-icon", minimalICO))
	req := httptest.NewRequest(http.MethodPost, "/api/admin/config/sharepreview", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	testAdmin.SetSharePreview(w, req)

	resp := parseResponse(t, w)
	if resp.Success {
		t.Fatal("expected SVG upload to fail")
	}
}

func TestSetSharePreviewEmptyClearsImage(t *testing.T) {
	defer cleanupSharePreviewFiles(t)

	if err := os.WriteFile(filepath.Join("data", "share-preview.png"), minimalPNG, 0o600); err != nil {
		t.Fatalf("seed share preview: %v", err)
	}
	if err := testAdmin.configRepository.SetSharePreviewPath("share-preview.png"); err != nil {
		t.Fatalf("seed path: %v", err)
	}

	body := makeConfigValueBody("")
	req := httptest.NewRequest(http.MethodPost, "/api/admin/config/sharepreview", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	testAdmin.SetSharePreview(w, req)

	resp := parseResponse(t, w)
	if !resp.Success {
		t.Fatalf("expected success, got error: %s", resp.Message)
	}
	if path := testAdmin.configRepository.GetSharePreviewPath(); path != "" {
		t.Fatalf("share preview path = %q, want empty", path)
	}
	if _, err := os.Stat(filepath.Join("data", "share-preview.png")); !os.IsNotExist(err) {
		t.Fatal("expected share preview file to be removed")
	}
}

func TestResetSharePreview(t *testing.T) {
	defer cleanupSharePreviewFiles(t)

	if err := os.WriteFile(filepath.Join("data", "share-preview.png"), minimalPNG, 0o600); err != nil {
		t.Fatalf("seed share preview: %v", err)
	}
	if err := testAdmin.configRepository.SetSharePreviewPath("share-preview.png"); err != nil {
		t.Fatalf("seed path: %v", err)
	}

	req := httptest.NewRequest(http.MethodDelete, "/api/admin/config/sharepreview", nil)
	w := httptest.NewRecorder()
	testAdmin.ResetSharePreview(w, req)

	resp := parseResponse(t, w)
	if !resp.Success {
		t.Fatalf("expected success, got error: %s", resp.Message)
	}
	if path := testAdmin.configRepository.GetSharePreviewPath(); path != "" {
		t.Fatalf("share preview path = %q, want empty", path)
	}
}
