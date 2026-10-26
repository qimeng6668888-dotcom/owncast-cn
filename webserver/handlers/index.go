package handlers

import (
	"bytes"
	"crypto/md5" // nolint:gosec
	"encoding/json"
	"fmt"
	"mime"
	"net/http"
	"net/url"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	log "github.com/sirupsen/logrus"

	"github.com/owncast/owncast/config"
	"github.com/owncast/owncast/models"
	"github.com/owncast/owncast/static"
	"github.com/owncast/owncast/utils"
	"github.com/owncast/owncast/webserver/router/middleware"
)

// IndexHandler handles the default index route.
func (h *Handlers) IndexHandler(w http.ResponseWriter, r *http.Request) {
	middleware.EnableCors(w)

	isIndexRequest := r.URL.Path == "/" || filepath.Base(r.URL.Path) == "index.html" || filepath.Base(r.URL.Path) == ""

	if isIndexRequest && (utils.IsUserAgentAPlayer(r.UserAgent()) || requestAcceptsVideo(r)) {
		http.Redirect(w, r, "/hls/stream.m3u8", http.StatusTemporaryRedirect)
		return
	}

	// For search engine bots and social scrapers return a special
	// server-rendered page.
	if utils.IsUserAgentABot(r.UserAgent()) && isIndexRequest {
		h.handleScraperMetadataPage(w, r)
		return
	}

	// Set a cache control max-age header
	middleware.SetCachingHeaders(w, r)

	nonceRandom, _ := utils.GenerateRandomString(5)

	// Set our global HTTP headers
	middleware.SetHeaders(w, fmt.Sprintf("nonce-%s", nonceRandom))

	if isIndexRequest {
		h.renderIndexHtml(w, r, nonceRandom)
		return
	}

	serveWeb(w, r)
}

func requestAcceptsVideo(r *http.Request) bool {
	for _, accept := range r.Header.Values("Accept") {
		for _, mediaRange := range strings.Split(accept, ",") {
			mediaType, params, err := mime.ParseMediaType(strings.TrimSpace(mediaRange))
			if err != nil {
				continue
			}

			if quality, ok := params["q"]; ok {
				q, err := strconv.ParseFloat(quality, 64)
				if err != nil || q <= 0 || q > 1 {
					continue
				}
			}

			if strings.HasPrefix(mediaType, "video/") ||
				mediaType == "application/vnd.apple.mpegurl" ||
				mediaType == "application/x-mpegurl" {
				return true
			}
		}
	}

	return false
}

func (h *Handlers) renderIndexHtml(w http.ResponseWriter, r *http.Request, nonce string) {
	type serverSideContent struct {
		Name             string
		Summary          string
		RequestedURL     string
		TagsString       string
		ThumbnailURL     string
		Thumbnail        string
		Image            string
		StatusJSON       string
		ServerConfigJSON string
		EmbedVideo       string
		Nonce            string
	}

	status := h.getStatusResponse()
	sb, err := json.Marshal(status)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	config := h.getConfigResponse(r)
	cb, err := json.Marshal(config)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	configRepository := h.configRepository
	scheme, host := requestSchemeAndHost(r, configRepository.GetServerURL())
	ogImage := h.ogImageAbsoluteURL(scheme, host)
	requestedURL := fmt.Sprintf("%s://%s/", scheme, host)
	if siteURL := configRepository.GetServerURL(); siteURL != "" {
		requestedURL = strings.TrimRight(siteURL, "/") + "/"
	}
	content := serverSideContent{
		Name:             configRepository.GetServerName(),
		Summary:          configRepository.GetServerSummary(),
		RequestedURL:     requestedURL,
		TagsString:       strings.Join(configRepository.GetServerMetadataTags(), ","),
		ThumbnailURL:     ogImage,
		Thumbnail:        ogImage,
		Image:            ogImage,
		StatusJSON:       string(sb),
		ServerConfigJSON: string(cb),
		EmbedVideo:       "embed/video",
		Nonce:            nonce,
	}

	index, err := static.GetWebIndexTemplate()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Use a buffer to ensure that we do not write a partial response header before checking for errors
	var buf bytes.Buffer
	if err := index.Execute(&buf, content); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "text/html")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(buf.Bytes())
}

// MetadataPage represents a server-rendered web page for bots and web scrapers.
type MetadataPage struct {
	RequestedURL  string
	Image         string
	Thumbnail     string
	TagsString    string
	Summary       string
	Name          string
	Tags          []string
	SocialHandles []models.SocialHandle
}

// Return a basic HTML page with server-rendered metadata from the config
// to give to Opengraph clients and web scrapers (bots, web crawlers, etc).
func (h *Handlers) handleScraperMetadataPage(w http.ResponseWriter, r *http.Request) {
	cacheKey := "bot-scraper-html:" + h.configRepository.GetSharePreviewUniquenessString()
	cacheHtmlExpiration := time.Duration(60) * time.Second
	c := h.cache.GetOrCreate(cacheKey, cacheHtmlExpiration)

	cachedHtml := c.Get(cacheKey)
	if cachedHtml != nil {
		w.Header().Set("Content-Type", "text/html")
		_, _ = w.Write(cachedHtml)
		return
	}

	tmpl, err := static.GetBotMetadataTemplate()
	if err != nil {
		log.Errorln(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	configRepository := h.configRepository
	scheme, host := requestSchemeAndHost(r, configRepository.GetServerURL())

	fullURL, err := url.Parse(fmt.Sprintf("%s://%s%s", scheme, host, r.URL.Path))
	if err != nil {
		log.Errorln(err)
	}

	ogImage := h.ogImageAbsoluteURL(scheme, host)

	tagsString := strings.Join(configRepository.GetServerMetadataTags(), ",")
	metadata := MetadataPage{
		Name:          configRepository.GetServerName(),
		RequestedURL:  fullURL.String(),
		Image:         ogImage,
		Summary:       configRepository.GetServerSummary(),
		Thumbnail:     ogImage,
		TagsString:    tagsString,
		Tags:          configRepository.GetServerMetadataTags(),
		SocialHandles: configRepository.GetSocialHandles(),
	}

	// Cache the rendered HTML
	var b bytes.Buffer
	if err := tmpl.Execute(&b, metadata); err != nil {
		log.Errorln(err)
	}
	c.Set(cacheKey, b.Bytes())

	// Set a cache header
	middleware.SetCachingHeaders(w, r)
	w.Header().Set("ETag", fmt.Sprintf("%x", md5.Sum(b.Bytes()))) // nolint:gosec
	w.Header().Set("Content-Type", "text/html")
	if _, err = w.Write(b.Bytes()); err != nil {
		log.Errorln(err)
	}
}

func requestSchemeAndHost(r *http.Request, siteURL string) (string, string) {
	scheme := "http"
	host := r.Host
	if siteURL != "" {
		if parsed, err := url.Parse(siteURL); err == nil {
			if parsed.Scheme != "" {
				scheme = parsed.Scheme
			}
			if parsed.Host != "" {
				host = parsed.Host
			}
		}
	}
	if r.TLS != nil {
		scheme = "https"
	} else if proto := r.Header.Get("X-Forwarded-Proto"); proto != "" {
		scheme = proto
	}

	return scheme, host
}

func (h *Handlers) ogImageAbsoluteURL(scheme, host string) string {
	base := fmt.Sprintf("%s://%s", scheme, host)
	configRepository := h.configRepository
	if path := configRepository.GetSharePreviewPath(); path != "" {
		if utils.DoesFileExists(filepath.Join(config.DataDirectory, path)) {
			imageURL := base + "/share-preview"
			if uniqueness := configRepository.GetSharePreviewUniquenessString(); uniqueness != "" {
				imageURL += "?hash=" + url.QueryEscape(uniqueness)
			}
			return imageURL
		}
	}

	if h.stream != nil {
		status := h.stream.GetStatus()
		thumbPath := filepath.Join(config.DataDirectory, "tmp", thumbnailFilename)
		if h.cfg != nil && h.cfg.TempDir != "" {
			thumbPath = filepath.Join(h.cfg.TempDir, thumbnailFilename)
		}
		if status.Online && utils.DoesFileExists(thumbPath) {
			return base + "/" + thumbnailFilename
		}
	}

	return base + "/logo/external"
}
