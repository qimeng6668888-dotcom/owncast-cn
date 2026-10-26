package utils

import (
	"strings"
	"testing"
	"unicode/utf8"
)

func TestGenerateChinesePhrase(t *testing.T) {
	for range 30 {
		name := GenerateChinesePhrase()
		if name == "" {
			t.Fatal("empty Chinese display name")
		}
		if strings.ContainsAny(name, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-") {
			t.Fatalf("display name %q still contains Latin letters", name)
		}
		count := utf8.RuneCountInString(name)
		if count < 4 || count > 30 {
			t.Fatalf("display name %q has %d runes", name, count)
		}
	}
}
