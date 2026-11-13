package handlers

import "testing"

func TestPublicViewerCount(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name   string
		real   int
		online bool
		offset int
		want   int
	}{
		{name: "offline ignores offset", real: 0, online: false, offset: 500, want: 0},
		{name: "live adds offset", real: 50, online: true, offset: 500, want: 550},
		{name: "zero offset leaves the real count", real: 50, online: true, offset: 0, want: 50},
		{name: "negative offset is ignored", real: 50, online: true, offset: -3, want: 50},
		{name: "live with no viewers still shows the offset", real: 0, online: true, offset: 500, want: 500},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			t.Parallel()
			got := publicViewerCount(test.real, test.online, test.offset)
			if got != test.want {
				t.Fatalf("publicViewerCount(%d, %v, %d) = %d, want %d", test.real, test.online, test.offset, got, test.want)
			}
		})
	}
}
