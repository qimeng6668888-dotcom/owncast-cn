package admin

import (
	"net/http"

	webutils "github.com/owncast/owncast/webserver/utils"
)

// SetChatMuted turns mute-all on or off and tells connected viewers immediately.
func (a *Admin) SetChatMuted(w http.ResponseWriter, r *http.Request) {
	if !requirePOST(w, r) {
		return
	}

	configValue, success := getValueFromRequest(w, r)
	if !success {
		return
	}
	muted, ok := configValue.Value.(bool)
	if !ok {
		webutils.WriteSimpleResponse(w, false, "unable to update mute")
		return
	}
	if err := a.configRepository.SetChatMuted(muted); err != nil {
		webutils.WriteSimpleResponse(w, false, err.Error())
		return
	}
	a.chat.BroadcastChatMuted(muted)
	webutils.WriteSimpleResponse(w, true, "chat mute updated")
}
