package config

import (
	"strings"
	"testing"
)

func TestDefaultStreamIsSingle720p(t *testing.T) {
	variants := GetDefaults().StreamVariants
	if len(variants) != 1 {
		t.Fatalf("expected a single default rendition, got %d", len(variants))
	}

	variant := variants[0]
	if variant.Name != "720p" {
		t.Errorf("name = %q, want 720p", variant.Name)
	}
	if variant.ScaledHeight != 720 {
		t.Errorf("scaled height = %d, want 720", variant.ScaledHeight)
	}
	if variant.ScaledWidth != 0 {
		t.Errorf("scaled width = %d, want 0 so the aspect ratio is preserved", variant.ScaledWidth)
	}
	if variant.IsVideoPassthrough {
		t.Error("default video should be transcoded, not passed through")
	}
	if variant.GetIsAudioPassthrough() {
		t.Error("default audio should be re-encoded to AAC, not passed through")
	}
	if variant.AudioBitrate != 128 {
		t.Errorf("audio bitrate = %d, want 128 kbps AAC", variant.AudioBitrate)
	}
	if variant.VideoBitrate == 0 {
		t.Error("video bitrate must be set for the H.264 encode")
	}

	defaults := GetDefaults()
	if !strings.Contains(defaults.PageBodyContent, "欢迎使用 Owncast") {
		t.Error("default visitor page should be Simplified Chinese")
	}
	if !strings.Contains(defaults.Summary, "直播服务器") {
		t.Error("default summary should be Simplified Chinese")
	}
}
