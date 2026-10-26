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
	"github.com/owncast/owncast/models"
	"github.com/owncast/owncast/utils"
	webutils "github.com/owncast/owncast/webserver/utils"
)

const maxPageFigureBytes = 2 * 1024 * 1024

var (
	errPageFigureType = errors.New("图片请使用 PNG、JPEG 或 GIF")
	errPageFigureSize = errors.New("图片不能超过 2MB")
)

// SetPageFigure saves the poster title and description under the page body.
func (a *Admin) SetPageFigure(w http.ResponseWriter, r *http.Request) {
	if !requirePOST(w, r) {
		return
	}

	var request struct {
		Value struct {
			Title string `json:"title"`
			Body  string `json:"body"`
		} `json:"value"`
	}
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		webutils.WriteSimpleResponse(w, false, "unable to update page figure")
		return
	}

	figure := models.PageFigure{
		Title: utils.MakeSafeStringOfLength(request.Value.Title, 40),
		Body:  utils.MakeSafeStringOfLength(request.Value.Body, 400),
	}
	if err := a.configRepository.SetPageFigure(figure); err != nil {
		webutils.WriteSimpleResponse(w, false, err.Error())
		return
	}
	webutils.WriteSimpleResponse(w, true, "page figure updated")
}

// SetPageFigureImage saves or clears the poster image.
func (a *Admin) SetPageFigureImage(w http.ResponseWriter, r *http.Request) {
	if !requirePOST(w, r) {
		return
	}

	configValue, success := getValueFromRequest(w, r)
	if !success {
		return
	}
	value, _ := configValue.Value.(string)
	if strings.TrimSpace(value) == "" {
		a.removePageFigureFiles()
		if err := a.configRepository.SetPageFigureImage("", ""); err != nil {
			webutils.WriteSimpleResponse(w, false, err.Error())
			return
		}
		webutils.WriteSimpleResponse(w, true, "page figure image removed")
		return
	}
	if err := a.savePageFigureImage(value); err != nil {
		webutils.WriteSimpleResponse(w, false, err.Error())
		return
	}
	webutils.WriteSimpleResponse(w, true, "page figure image updated")
}

func (a *Admin) savePageFigureImage(value string) error {
	imageBytes, extension, err := utils.DecodeBase64Image(value)
	if err != nil {
		return err
	}
	if extension == ".svg" || extension == ".ico" {
		return errPageFigureType
	}
	if len(imageBytes) > maxPageFigureBytes {
		return errPageFigureSize
	}

	a.removePageFigureFiles()
	filename := "page-figure" + extension
	imagePath := filepath.Join(config.DataDirectory, filename)
	if err := os.WriteFile(imagePath, imageBytes, 0o600); err != nil {
		return err
	}
	if err := a.configRepository.SetPageFigureImage(filename, shortid.MustGenerate()); err != nil {
		log.Errorln("error saving page figure", err)
		return err
	}
	return nil
}

func (a *Admin) removePageFigureFiles() {
	for _, extension := range []string{".png", ".jpeg", ".jpg", ".gif"} {
		filename := filepath.Join(config.DataDirectory, "page-figure"+extension)
		if err := os.Remove(filename); err != nil && !os.IsNotExist(err) {
			log.Debugln("error removing page figure", err)
		}
	}
}
