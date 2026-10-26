package utils

// Chinese display-name parts used when a viewer is registered without typing
// a name. They stay in Simplified Chinese so an empty registration does not
// fall back to an English word pair.
var chineseNameLead = []string{
	"青松", "远山", "明月", "清风", "流云", "晓色", "静海", "暖阳",
	"听雨", "归舟", "星河", "晚风", "新茶", "竹影", "湖光", "松风",
}

var chineseNameTrail = []string{
	"行者", "看客", "来客", "听众", "朋友", "过客", "知己", "同路",
	"新友", "嘉宾", "学友", "游人", "舟子", "墨客", "访客", "同伴",
}

// GenerateChinesePhrase returns a short Simplified Chinese display name.
func GenerateChinesePhrase() string {
	lead := chineseNameLead[RandomIndex(len(chineseNameLead))]
	trail := chineseNameTrail[RandomIndex(len(chineseNameTrail))]
	return lead + trail
}
