package transcoder

import "testing"

func TestVideoSizeAlignsScaledHeightToMacroblocks(t *testing.T) {
	size := VideoSize{Height: 720}
	got := size.getString()
	want := "trunc(oh*a/16)*16:720"
	if got != want {
		t.Fatalf("height-only scale = %q, want %q", got, want)
	}
}

func TestVideoSizeAlignsExplicitSizeToMacroblocks(t *testing.T) {
	size := VideoSize{Width: 1282, Height: 720}
	got := size.getString()
	want := "1280:720"
	if got != want {
		t.Fatalf("explicit scale = %q, want %q", got, want)
	}
}
