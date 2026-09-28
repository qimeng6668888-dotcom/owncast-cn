package configrepository

import "testing"

func TestUnsetVideoCodecDefaultsToH264(t *testing.T) {
	repo := newAutoplayTestRepo(t)
	if got := repo.GetVideoCodec(); got != "libx264" {
		t.Fatalf("GetVideoCodec() = %q, want libx264", got)
	}
}

func TestUnsetStreamVariantsUseSingle720pDefault(t *testing.T) {
	repo := newAutoplayTestRepo(t)
	variants := repo.GetStreamOutputVariants()
	if len(variants) != 1 {
		t.Fatalf("expected one default variant, got %d", len(variants))
	}
	if variants[0].ScaledHeight != 720 || variants[0].GetIsAudioPassthrough() {
		t.Fatalf("default variant = %+v, want 720p with AAC (not audio passthrough)", variants[0])
	}
}
