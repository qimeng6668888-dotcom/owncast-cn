package admin

import (
	"encoding/json"
	"fmt"
	"net/http"

	log "github.com/sirupsen/logrus"

	"github.com/owncast/owncast/config"
	"github.com/owncast/owncast/utils"
	"github.com/owncast/owncast/webserver/router/middleware"
	webutils "github.com/owncast/owncast/webserver/utils"
)

// BanChatUsers disables the selected viewers, hides their messages, and
// disconnects them. It does not ban their IP address.
func (a *Admin) BanChatUsers(w http.ResponseWriter, r *http.Request) {
	if !requirePOST(w, r) {
		return
	}

	var request struct {
		UserIDs []string `json:"userIds"`
	}
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		webutils.WriteSimpleResponse(w, false, "unable to ban users")
		return
	}

	seen := map[string]struct{}{}
	ids := make([]string, 0, len(request.UserIDs))
	for _, id := range request.UserIDs {
		if id == "" {
			continue
		}
		if _, ok := seen[id]; ok {
			continue
		}
		seen[id] = struct{}{}
		ids = append(ids, id)
		if len(ids) == 30 {
			break
		}
	}
	if len(ids) == 0 {
		webutils.WriteSimpleResponse(w, false, "没有选择观众")
		return
	}

	moderator := middleware.UserFromRequest(r)
	banned := 0
	for _, id := range ids {
		user := a.userRepository.GetUserByID(id)
		if user == nil || user.IsModerator() {
			continue
		}
		if err := a.userRepository.SetEnabled(id, false, ""); err != nil {
			log.Errorln("error banning chat user", err)
			continue
		}
		messageIDs, err := a.chatMessageRepository.GetMessageIdsForUserID(id)
		if err != nil {
			log.Errorln("error fetching messages for banned user", err)
		} else if len(messageIDs) > 0 {
			if err := a.chat.SetMessagesVisibility(messageIDs, false, moderator); err != nil {
				log.Errorln("error hiding messages for banned user", err)
			}
		}
		a.disconnectBannedUser(id)
		banned++
	}
	if banned == 0 {
		webutils.WriteSimpleResponse(w, false, "没有可封禁的观众")
		return
	}
	webutils.WriteSimpleResponse(w, true, fmt.Sprintf("banned %d", banned))
}

func (a *Admin) disconnectBannedUser(userID string) {
	clients, err := a.chat.GetClientsForUser(userID)
	if err != nil || len(clients) == 0 {
		return
	}
	a.chat.DisconnectClients(clients)
	user := a.userRepository.GetUserByID(userID)
	if user == nil {
		return
	}
	displayName := utils.MakeSafeStringOfLength(user.DisplayName, config.MaxChatDisplayNameLength)
	_ = a.chat.SendSystemAction(fmt.Sprintf("**%s** 已被移出聊天。", displayName), true)
}
