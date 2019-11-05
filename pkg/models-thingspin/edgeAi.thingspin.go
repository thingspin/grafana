package tsmodels

import (
	"mime/multipart"
)

type EdgeAiInfo struct {
	Cid            string
	Cname          string
	Pids           []int
	Model          string
	Framework      string
	MlSetting      string
	AlgorithmName  string
	AlgorithmType  string
	AlgorithmFiles []string
	ModelFiles     []string
	Error          string
}

type EdgeAiSaveReq struct {
	Cid             string                  `form:"cid"`
	Cname           string                  `form:"cname"`
	Model           string                  `form:"model"`
	Framework       string                  `form:"framework"`
	EdgeAiSetting   string                  `form:"mlSetting"`
	AlgorithmType   string                  `form:"algorithmType"`
	AlgorithmName   string                  `form:"algorithmName"`
	UploadModel     []*multipart.FileHeader `form:"model[]"`
	UploadAlgorithm []*multipart.FileHeader `form:"algorithm[]"`
}

type EdgeAiUploadReq struct {
	EdgeAiFile *multipart.FileHeader `form:"mlFile"`
}

type EdgeAiStreamMessage struct {
	Stream string      `json:"stream"`
	Data   interface{} `json:"data"`
}
