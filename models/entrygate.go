package models

import "net/url"

// Defaults for the viewer entry card. The copy matches the operator's
// design; the admin editor can replace every line.
const (
	DefaultEntryGateTitle       = "擒龙直播间 实名验证"
	DefaultEntryGateBody        = "为了保障直播间交流环境，新观众请填写您的真实姓名进入观看。"
	DefaultEntryGatePlaceholder = "请输入您的真实姓名"
	DefaultEntryGateButton      = "填写姓名 进入直播间"
	DefaultEntryGateFooter      = "个人信息仅用于实名风控，已加密保护。"
)

// EntryGate is the public entry card. The typed name is the viewer's chat
// display name. CrestPath is the file stored on disk and is not sent to browsers.
type EntryGate struct {
	Title           string `json:"title"`
	Body            string `json:"body"`
	Placeholder     string `json:"placeholder"`
	Button          string `json:"button"`
	Footer          string `json:"footer"`
	Crest           string `json:"crest,omitempty"`
	CrestPath       string `json:"-"`
	CrestUniqueness string `json:"-"`
	Enabled         bool   `json:"enabled"`
}

// Public returns the gate with a browser URL for the crest.
func (g EntryGate) Public() EntryGate {
	if g.CrestPath == "" {
		g.Crest = ""
		return g
	}
	g.Crest = "/entry-gate-crest"
	if g.CrestUniqueness != "" {
		g.Crest += "?hash=" + url.QueryEscape(g.CrestUniqueness)
	}
	return g
}
