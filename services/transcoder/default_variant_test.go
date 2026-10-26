package transcoder

import (
	"strings"
	"testing"

	"github.com/owncast/owncast/config"
)

func TestDefaultVariantEncodes720pH264AAC(t *testing.T) {
	defaults := config.GetDefaults().StreamVariants
	if len(defaults) != 2 {
		t.Fatalf("expected 720p and 480p default variants, got %d", len(defaults))
	}

	variant := getVariantFromConfigQuality(defaults[0], 0)
	if variant.isVideoPassthrough {
		t.Fatal("video passthrough would skip the H.264 encode")
	}
	if variant.isAudioPassthrough {
		t.Fatal("audio passthrough would skip the AAC encode")
	}
	if variant.videoSize.Height != 720 {
		t.Fatalf("height = %d, want 720", variant.videoSize.Height)
	}

	audio := strings.Join(variant.getAudioQualityString(), " ")
	if !strings.Contains(audio, "-c:a:0 aac") {
		t.Fatalf("audio flags = %q, want AAC", audio)
	}
	if strings.Contains(audio, " copy") {
		t.Fatalf("audio flags = %q, want a re-encode", audio)
	}

	codec := getCodec("libx264")
	if codec.Name() != "libx264" {
		t.Fatalf("default codec name = %q, want libx264", codec.Name())
	}

	second := getVariantFromConfigQuality(defaults[1], 1)
	if second.videoSize.Height != 480 {
		t.Fatalf("second height = %d, want 480", second.videoSize.Height)
	}
}
