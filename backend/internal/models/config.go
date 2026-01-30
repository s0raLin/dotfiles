package models

import (
	"time"
)

// ConfigFile 表示配置文件的数据模型
type ConfigFile struct {
	ID           string    `json:"id"`
	Name         string    `json:"name"`
	Path         string    `json:"path"`
	Category     string    `json:"category"`
	Description  string    `json:"description"`
	LastModified time.Time `json:"lastModified"`
	Size         int64     `json:"size"`
	IsSymlink    bool      `json:"isSymlink"`
	BackupExists bool      `json:"backupExists"`
	Content      string    `json:"content,omitempty"`
}

// ConfigCategory 表示配置文件分类的数据模型
type ConfigCategory struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Icon        string `json:"icon"`
	Color       string `json:"color"`
	Description string `json:"description"`
}

// SystemInfo 表示系统信息的数据模型
type SystemInfo struct {
	OS      string `json:"os"`
	Kernel  string `json:"kernel"`
	Shell   string `json:"shell"`
	HomeDir string `json:"homeDir"`
	User    string `json:"user"`
}

// UpdateFileRequest 表示更新文件的请求数据
type UpdateFileRequest struct {
	Content string `json:"content" validate:"required"`
}

// BackupFileResponse 表示备份文件的响应数据
type BackupFileResponse struct {
	Message    string `json:"message"`
	BackupPath string `json:"backupPath"`
}
