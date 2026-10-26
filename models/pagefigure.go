package models

import "net/url"

// PageFigure is the title, description, and image shown under the page body.
type PageFigure struct {
	Title           string `json:"title"`
	Body            string `json:"body"`
	Image           string `json:"image,omitempty"`
	ImagePath       string `json:"-"`
	ImageUniqueness string `json:"-"`
}

// Public returns the figure with a browser URL for the image.
func (f PageFigure) Public() PageFigure {
	if f.ImagePath == "" {
		f.Image = ""
		return f
	}
	f.Image = "/page-figure"
	if f.ImageUniqueness != "" {
		f.Image += "?hash=" + url.QueryEscape(f.ImageUniqueness)
	}
	return f
}

// Empty reports whether nothing would be drawn.
func (f PageFigure) Empty() bool {
	return f.Title == "" && f.Body == "" && f.Image == "" && f.ImagePath == ""
}
