package configrepository

import "testing"

func TestUnsetVideoCodecDefaultsToH264(t *testing.T) {
	repo := newAutoplayTestRepo(t)
	if got := repo.GetVideoCodec(); got != "libx264" {
		t.Fatalf("GetVideoCodec() = %q, want libx264", got)
	}
}

func TestUnsetStreamVariantsUse720pAnd480pDefault(t *testing.T) {
	repo := newAutoplayTestRepo(t)
	variants := repo.GetStreamOutputVariants()
	if len(variants) != 2 {
		t.Fatalf("expected 720p and 480p defaults, got %d", len(variants))
	}
	if variants[0].ScaledHeight != 720 || variants[0].VideoBitrate != 1600 || variants[0].GetIsAudioPassthrough() {
		t.Fatalf("default variant = %+v, want 720p at 1600 kbps with AAC", variants[0])
	}
	if variants[1].ScaledHeight != 480 || variants[1].VideoBitrate != 800 || variants[1].GetIsAudioPassthrough() {
		t.Fatalf("default variant = %+v, want 480p at 800 kbps with AAC", variants[1])
	}
}
