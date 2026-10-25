package admin

import (
	"encoding/json"
	"errors"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	log "github.com/sirupsen/logrus"
	"github.com/teris-io/shortid"

	"github.com/owncast/owncast/config"
	"github.com/owncast/owncast/utils"
	webutils "github.com/owncast/owncast/webserver/utils"
)

const maxEntryGateCrestBytes = 2 * 1024 * 1024

var (
	errEntryGateCrestType = errors.New("徽章请使用 PNG、JPEG 或 GIF")
	errEntryGateCrestSize = errors.New("徽章图片不能超过 2MB")
)

// SetEntryGate saves the entry-card switch and copy.
func (a *Admin) SetEntryGate(w http.ResponseWriter, r *http.Request) {
	if !requirePOST(w, r) {
		return
	}

	var request struct {
		Value struct {
			Title       string `json:"title"`
			Body        string `json:"body"`
			Placeholder string `json:"placeholder"`
			Button      string `json:"button"`
			Footer      string `json:"footer"`
			Enabled     bool   `json:"enabled"`
		} `json:"value"`
	}
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		webutils.WriteSimpleResponse(w, false, "unable to update entry gate")
		return
	}

	gate := a.configRepository.GetEntryGate()
	gate.Enabled = request.Value.Enabled
	gate.Title = utils.MakeSafeStringOfLength(request.Value.Title, 40)
	gate.Body = utils.MakeSafeStringOfLength(request.Value.Body, 160)
	gate.Placeholder = utils.MakeSafeStringOfLength(request.Value.Placeholder, 40)
	gate.Button = utils.MakeSafeStringOfLength(request.Value.Button, 30)
	gate.Footer = utils.MakeSafeStringOfLength(request.Value.Footer, 80)
	if err := a.configRepository.SetEntryGate(gate); err != nil {
		webutils.WriteSimpleResponse(w, false, err.Error())
		return
	}

	webutils.WriteSimpleResponse(w, true, "entry gate updated")
}

// SetEntryGateCrest saves or clears the notch image.
func (a *Admin) SetEntryGateCrest(w http.ResponseWriter, r *http.Request) {
	if !requirePOST(w, r) {
		return
	}

	configValue, success := getValueFromRequest(w, r)
	if !success {
		return
	}
	value, _ := configValue.Value.(string)
	if strings.TrimSpace(value) == "" {
		a.removeEntryGateCrestFiles()
		if err := a.configRepository.SetEntryGateCrest("", ""); err != nil {
			webutils.WriteSimpleResponse(w, false, err.Error())
			return
		}
		webutils.WriteSimpleResponse(w, true, "entry gate crest removed")
		return
	}

	if err := a.saveEntryGateCrest(value); err != nil {
		webutils.WriteSimpleResponse(w, false, err.Error())
		return
	}
	webutils.WriteSimpleResponse(w, true, "entry gate crest updated")
}

func (a *Admin) saveEntryGateCrest(value string) error {
	imageBytes, extension, err := utils.DecodeBase64Image(value)
	if err != nil {
		return err
	}
	if extension == ".svg" || extension == ".ico" {
		return errEntryGateCrestType
	}
	if len(imageBytes) > maxEntryGateCrestBytes {
		return errEntryGateCrestSize
	}

	a.removeEntryGateCrestFiles()
	filename := "entry-gate-crest" + extension
	imagePath := filepath.Join(config.DataDirectory, filename)
	if err := os.WriteFile(imagePath, imageBytes, 0o600); err != nil {
		return err
	}
	if err := a.configRepository.SetEntryGateCrest(filename, shortid.MustGenerate()); err != nil {
		log.Errorln("error saving entry gate crest", err)
		return err
	}
	return nil
}

func (a *Admin) removeEntryGateCrestFiles() {
	for _, extension := range []string{".png", ".jpeg", ".jpg", ".gif"} {
		filename := filepath.Join(config.DataDirectory, "entry-gate-crest"+extension)
		if err := os.Remove(filename); err != nil && !os.IsNotExist(err) {
			log.Debugln("error removing entry gate crest", err)
		}
	}
}
