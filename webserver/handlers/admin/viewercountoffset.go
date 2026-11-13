package admin

import "math"

const maxViewerCountOffset = 1_000_000

func parseViewerCountOffset(value interface{}) (int, bool) {
	number, ok := value.(float64)
	if !ok || math.IsNaN(number) || math.IsInf(number, 0) {
		return 0, false
	}
	if number < 0 || number > maxViewerCountOffset || number != math.Trunc(number) {
		return 0, false
	}
	return int(number), true
}
