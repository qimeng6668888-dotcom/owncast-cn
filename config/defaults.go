package config

import (
	"time"

	"github.com/owncast/owncast/models"
)

// Defaults will hold default configuration values.
type Defaults struct {
	PageBodyContent string

	FederationGoLiveMessage string

	Summary              string
	ServerWelcomeMessage string
	Logo                 string
	YPServer             string

	Title string

	DatabaseFilePath string

	FederationUsername string
	WebServerIP        string
	Name               string
	AdminPassword      string
	StreamKeys         []models.StreamKey

	StreamVariants []models.StreamOutputVariant

	Tags               []string
	RTMPServerPort     int
	RTMPBindAddress    string
	SegmentsInPlaylist int

	SegmentLengthSeconds int
	WebServerPort        int

	ChatEstablishedUserModeTimeDuration time.Duration

	YPEnabled bool
}

// GetDefaults will return default configuration values.
func GetDefaults() Defaults {
	defaultStreamKey := "abc123"
	defaultStreamKeyComment := "Default stream key"
	return Defaults{
		Name:                 "New Owncast Server",
		Summary:              "这是一台由 Owncast 驱动的新直播服务器。",
		ServerWelcomeMessage: "",
		Logo:                 "logo.svg",
		AdminPassword:        "abc123",
		StreamKeys: []models.StreamKey{
			{Key: &defaultStreamKey, Comment: &defaultStreamKeyComment},
		},
		Tags: []string{
			"owncast",
			"streaming",
		},

		PageBodyContent: `
# 欢迎使用 Owncast！

- 这是由 [Owncast](https://owncast.online) 驱动的直播。Owncast 是自由开源的直播服务器。

- 想看更多直播示例，请访问 [Owncast 目录](https://owncast.directory)。

- 如果你是这台服务器的管理员，请打开管理后台，自定义本页内容。

<hr/>

<video id="video" controls preload="metadata" style="width: 60vw; max-width: 600px; min-width: 200px;" poster="https://videos.owncast.online/t/xaJ3xNn9Y6pWTdB25m9ai3">
  <source src="https://assets.owncast.tv/video/owncast-embed.mp4" type="video/mp4" />
</video>
	`,

		DatabaseFilePath: "data/owncast.db",

		YPEnabled: false,
		YPServer:  "https://owncast.directory",

		WebServerPort:  8080,
		WebServerIP:    "0.0.0.0",
		RTMPServerPort: 1935,

		ChatEstablishedUserModeTimeDuration: time.Minute * 15,

		// One 720p H.264 rendition. Audio is re-encoded to AAC (not copied)
		// because AudioBitrate is set and passthrough is off. The video codec
		// itself defaults to libx264 in the config repository.
		StreamVariants: []models.StreamOutputVariant{
			{
				Name:               "720p",
				IsVideoPassthrough: false,
				IsAudioPassthrough: false,
				VideoBitrate:       2500,
				AudioBitrate:       128,
				ScaledHeight:       720,
				Framerate:          30,
				CPUUsageLevel:      2,
			},
		},

		FederationUsername:      "streamer",
		FederationGoLiveMessage: "I've gone live!",
	}
}
