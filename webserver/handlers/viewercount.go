package handlers

// publicViewerCount is the number shown on the public page. While the
// stream is live, a configured offset is added to the real viewer count.
// The offset does not create viewers.
func publicViewerCount(real int, online bool, offset int) int {
	if !online || offset <= 0 {
		return real
	}
	return real + offset
}
