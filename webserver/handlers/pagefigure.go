package handlers

import (
	"net/http"
	"path/filepath"

	"github.com/owncast/owncast/config"
	"github.com/owncast/owncast/utils"
)

// GetPageFigure serves the poster image shown under the page body.
func (h *Handlers) GetPageFigure(w http.ResponseWriter, r *http.Request) {
	figure := h.configRepository.GetPageFigure()
	filename := filepath.Base(figure.ImagePath)
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
	}
	cacheTime := utils.GetCacheDurationSecondsForPath(imagePath)
	writeBytesAsImage(imageBytes, contentType, w, cacheTime)
}
