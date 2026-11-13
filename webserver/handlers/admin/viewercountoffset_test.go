package admin

import "testing"

func TestParseViewerCountOffset(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name  string
		value interface{}
		want  int
		ok    bool
	}{
		{name: "zero", value: float64(0), want: 0, ok: true},
		{name: "five hundred", value: float64(500), want: 500, ok: true},
		{name: "max", value: float64(maxViewerCountOffset), want: maxViewerCountOffset, ok: true},
		{name: "negative", value: float64(-1), ok: false},
		{name: "fraction", value: float64(1.5), ok: false},
		{name: "too large", value: float64(maxViewerCountOffset + 1), ok: false},
		{name: "string", value: "500", ok: false},
		{name: "nil", value: nil, ok: false},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			t.Parallel()
			got, ok := parseViewerCountOffset(test.value)
			if ok != test.ok || (ok && got != test.want) {
				t.Fatalf("parseViewerCountOffset(%v) = (%d, %v), want (%d, %v)", test.value, got, ok, test.want, test.ok)
			}
		})
	}
}
