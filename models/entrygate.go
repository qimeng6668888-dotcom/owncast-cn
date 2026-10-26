package models

import "net/url"

// Defaults for the viewer entry card. The copy matches the operator's
// design; the admin editor can replace every line.
const (
	DefaultEntryGateTitle       = "填写姓名后进入"
	DefaultEntryGateBody        = "请先填写姓名。进入后将以这个姓名观看直播。"
	DefaultEntryGatePlaceholder = "请输入您的姓名"
	DefaultEntryGateButton      = "填写姓名 进入直播间"
	DefaultEntryGateFooter      = "姓名会显示在聊天里，用于本次观看。"
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
