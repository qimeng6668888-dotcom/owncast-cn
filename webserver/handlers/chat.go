package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	log "github.com/sirupsen/logrus"

	"github.com/owncast/owncast/config"
	"github.com/owncast/owncast/models"
	"github.com/owncast/owncast/utils"
	"github.com/owncast/owncast/webserver/handlers/generated"
	"github.com/owncast/owncast/webserver/router/middleware"
	webutils "github.com/owncast/owncast/webserver/utils"
)

var (
	errEntryNameRequired  = errors.New("请填写真实姓名")
	errEntryNameForbidden = errors.New("这个姓名不能使用")
)

// ExternalGetChatMessages gets all of the chat messages.
func (h *Handlers) ExternalGetChatMessages(integration models.ExternalAPIUser, w http.ResponseWriter, r *http.Request) {
	middleware.EnableCors(w)
	h.getChatMessages(w, r)
}

// GetChatMessages gets all of the chat messages.
func (h *Handlers) GetChatMessages(u models.User, w http.ResponseWriter, r *http.Request) {
	middleware.EnableCors(w)
	h.getChatMessages(w, r)
}

func (h *Handlers) getChatMessages(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	switch r.Method {
	case http.MethodGet:
		messages := h.chatMessageRepository.GetChatHistory()

		if err := json.NewEncoder(w).Encode(messages); err != nil {
			log.Debugln(err)
		}
	default:
		w.WriteHeader(http.StatusNotImplemented)
		if err := json.NewEncoder(w).Encode(webutils.J{"error": "method not implemented (PRs are accepted)"}); err != nil {
			webutils.InternalErrorHandler(w, err)
		}
	}
}

// RegisterAnonymousChatUser will register a new user.
func (h *Handlers) RegisterAnonymousChatUser(w http.ResponseWriter, r *http.Request) {
	middleware.EnableCors(w)

	if r.Method == http.MethodOptions {
		// All OPTIONS requests should have a wildcard CORS header.
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.WriteHeader(http.StatusNoContent)
		return
	}

	if r.Method != http.MethodPost {
		// nolint:goconst
		webutils.WriteSimpleResponse(w, false, r.Method+" not supported")
		return
	}

	type registerAnonymousUserResponse struct {
		ID          string `json:"id"`
		AccessToken string `json:"accessToken"`
		DisplayName string `json:"displayName"`
	}

	decoder := json.NewDecoder(r.Body)
	var request generated.RegisterAnonymousChatUserJSONBody // registerAnonymousUserRequest
	if err := decoder.Decode(&request); err != nil {        //nolint
		// this is fine. register a new user anyway.
	}

	proposedNewDisplayName := r.Header.Get("X-Forwarded-User")
	if proposedNewDisplayName == "" && request.DisplayName != nil {
		proposedNewDisplayName = *request.DisplayName
	}

	proposedNewDisplayName, err := h.chooseAnonymousDisplayName(proposedNewDisplayName)
	if err != nil {
		webutils.WriteSimpleResponse(w, false, err.Error())
		return
	}
	newUser, accessToken, err := h.userRepository.CreateAnonymousUser(proposedNewDisplayName)
	if err != nil {
		webutils.WriteSimpleResponse(w, false, err.Error())
		return
	}

	response := registerAnonymousUserResponse{
		ID:          newUser.ID,
		AccessToken: accessToken,
		DisplayName: newUser.DisplayName,
	}

	w.Header().Set("Content-Type", "application/json")
	middleware.DisableCache(w)

	// Set the chat identity cookie so subsequent same-origin web requests
	// (e.g. to plugin HTTP handlers) carry this user's identity.
	utils.SetChatAccessTokenCookie(w, r, accessToken)

	webutils.WriteResponse(w, response)
}

func (h *Handlers) chooseAnonymousDisplayName(proposed string) (string, error) {
	proposed = utils.MakeSafeStringOfLength(proposed, config.MaxChatDisplayNameLength)
	if proposed == "" {
		if h.configRepository.GetEntryGate().Enabled {
			return "", errEntryNameRequired
		}
		proposed = utils.MakeSafeStringOfLength(h.generateDisplayName(), config.MaxChatDisplayNameLength)
	}
	if proposed == "" {
		proposed = utils.GenerateChinesePhrase()
	}
	if displayNameForbidden(proposed, h.configRepository.GetForbiddenUsernameList()) {
		return "", errEntryNameForbidden
	}
	return proposed, nil
}

func displayNameForbidden(name string, blocklist []string) bool {
	candidate := strings.ToLower(strings.TrimSpace(name))
	if candidate == "" {
		return false
	}
	for _, blockedName := range blocklist {
		normalizedName := strings.ToLower(strings.TrimSpace(blockedName))
		if normalizedName != "" && strings.Contains(normalizedName, candidate) {
			return true
		}
	}
	return false
}

func (h *Handlers) generateDisplayName() string {
	suggestedUsernamesList := h.configRepository.GetSuggestedUsernamesList()
	minSuggestedUsernamePoolLength := 10

	if len(suggestedUsernamesList) >= minSuggestedUsernamePoolLength {
		index := utils.RandomIndex(len(suggestedUsernamesList))
		return suggestedUsernamesList[index]
	}
	return utils.GenerateChinesePhrase()
}
