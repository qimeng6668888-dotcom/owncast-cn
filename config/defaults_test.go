package config

import (
	"strings"
	"testing"
)

func TestDefaultStreamIs720pAnd480p(t *testing.T) {
	variants := GetDefaults().StreamVariants
	if len(variants) != 2 {
		t.Fatalf("expected 720p and 480p renditions, got %d", len(variants))
	}

	want := []struct {
		name    string
		height  int
		bitrate int
	}{
		{name: "720p", height: 720, bitrate: 1600},
		{name: "480p", height: 480, bitrate: 800},
	}
	for i, variant := range variants {
		if variant.Name != want[i].name {
			t.Errorf("variant %d name = %q, want %s", i, variant.Name, want[i].name)
		}
		if variant.ScaledHeight != want[i].height {
			t.Errorf("variant %d scaled height = %d, want %d", i, variant.ScaledHeight, want[i].height)
		}
		if variant.VideoBitrate != want[i].bitrate {
			t.Errorf("variant %d video bitrate = %d, want %d", i, variant.VideoBitrate, want[i].bitrate)
		}
		if variant.ScaledWidth != 0 {
			t.Errorf("variant %d scaled width = %d, want 0 so the aspect ratio is preserved", i, variant.ScaledWidth)
		}
		if variant.IsVideoPassthrough {
			t.Errorf("variant %d video should be transcoded, not passed through", i)
		}
		if variant.GetIsAudioPassthrough() {
			t.Errorf("variant %d audio should be re-encoded to AAC, not passed through", i)
		}
		if variant.AudioBitrate != 128 {
			t.Errorf("variant %d audio bitrate = %d, want 128 kbps AAC", i, variant.AudioBitrate)
		}
	}

	defaults := GetDefaults()
	if !strings.Contains(defaults.PageBodyContent, "欢迎使用 Owncast") {
		t.Error("default visitor page should be Simplified Chinese")
	}
	if !strings.Contains(defaults.Summary, "直播服务器") {
		t.Error("default summary should be Simplified Chinese")
	}
}
