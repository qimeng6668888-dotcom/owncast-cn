package handlers

import (
	"net/http"
	"path/filepath"

	"github.com/owncast/owncast/config"
	"github.com/owncast/owncast/utils"
)

// GetEntryGateCrest serves the uploaded notch image for the entry card.
func (h *Handlers) GetEntryGateCrest(w http.ResponseWriter, r *http.Request) {
	gate := h.configRepository.GetEntryGate()
	filename := filepath.Base(gate.CrestPath)
	if filename == "" || filename == "." || filename == "/" {
		http.NotFound(w, r)
		return
	}
	imagePath := filepath.Join(config.DataDirectory, filename)
	imageBytes, err := getImage(imagePath)
	if err != nil {
		http.NotFound(w, r)
		return
	}

	contentType := "image/jpeg"
	switch filepath.Ext(filename) {
	case ".png":
		contentType = "image/png"
	case ".gif":
		contentType = "image/gif"
	case ".svg":
		contentType = "image/svg+xml"
	}

	cacheTime := utils.GetCacheDurationSecondsForPath(imagePath)
	writeBytesAsImage(imageBytes, contentType, w, cacheTime)
}
