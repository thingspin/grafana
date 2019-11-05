package tsmodels

// [ thingspin >>> ]

import (
	"mime/multipart"
)

// ---------------------
// Common
type FileCommonResult struct {
	Success bool   `json:"success"`
	Error   string `json:"error"`
}

// ---------------------
// Listing
type FileListingResult struct {
	Name   string `json:"name"`
	Rights string `json:"rights"`
	Size   string `json:"size"`
	Date   string `json:"date"`
	Type   string `json:"type"`
}
type FileListingReq struct {
	Action string `json:"action"`
	Path   string `json:"path"`
}
type FileListingRes struct {
	Result []FileListingResult `json:"result"`
}

// ---------------------
// Rename
type FileRenameReq struct {
	Action      string `json:"action"`
	Item        string `json:"item"`
	NewItemPath string `json:"newItemPath"`
}
type FileRenameRes struct {
	Result FileCommonResult `json:"result"`
}

// ---------------------
// Rename
type FileMoveReq struct {
	Action  string   `json:"action"`
	Items   []string `json:"items"`
	NewPath string   `json:"newPath"`
}
type FileMoveRes struct {
	Result FileCommonResult `json:"result"`
}

// ---------------------
// Copy
type FileCopyReq struct {
	Action         string   `json:"action"`
	Items          []string `json:"items"`
	NewPath        string   `json:"newPath"`
	SingleFilename string   `json:"singleFilename"`
}
type FileCopyRes struct {
	Result FileCommonResult `json:"result"`
}

// ---------------------
// Remove
type FileRemoveReq struct {
	Action string   `json:"action"`
	Items  []string `json:"items"`
}
type FileRemoveRes struct {
	Result FileCommonResult `json:"result"`
}

// ---------------------
// Edit
type FileEditReq struct {
	Action  string `json:"action"`
	Item    string `json:"item"`
	Content string `json:"content"`
}
type FileEditRes struct {
	Result FileCommonResult `json:"result"`
}

// ---------------------
// Get Content
type FileGetContentReq struct {
	Action string `json:"action"`
	Item   string `json:"item"`
}
type FileGetContentRes struct {
	Result string `json:"result"`
}

// ---------------------
// Create Folder
type FileCreateFolderReq struct {
	Action  string `json:"action"`
	NewPath string `json:"newPath"`
}
type FileCreateFolderRes struct {
	Result FileCommonResult `json:"result"`
}

// ---------------------
// Set Permissions
type FileSetPermissionsReq struct {
	Action    string   `json:"action"`
	Items     []string `json:"items"`
	Perms     string   `json:"perms"`
	PermsCode string   `json:"permsCode"`
	Recursive bool     `json:"recursive"`
}
type FileSetPermissionsRes struct {
	Result FileCommonResult `json:"result"`
}

// ---------------------
// Compress
type FileCompressReq struct {
	Action             string   `json:"action"`
	Items              []string `json:"items"`
	Destination        string   `json:"destination"`
	CompressedFilename string   `json:"compressedFilename"`
}
type FileCompressRes struct {
	Result FileCommonResult `json:"result"`
}

// ---------------------
// Extract
type FileExtractReq struct {
	Action      string `json:"action"`
	Destination string `json:"destination"`
	Item        string `json:"item"`
}
type FileExtractRes struct {
	Result FileCommonResult `json:"result"`
}

// ---------------------
// Upload
type FileUploadReq struct {
	Dest   string                `form:"destination"`
	Upload *multipart.FileHeader `form:"file-0"`
}
type FileUploadRes struct {
	Result FileCommonResult `json:"result"`
}

// ---------------------
// Download
// ---------------------
// Download Multiple
type FileDownloadMultipleReq struct {
	Action     string   `json:"action"`
	Items      []string `json:"items"`
	ToFilename string   `json:"toFilename"`
}

// ---------------------
