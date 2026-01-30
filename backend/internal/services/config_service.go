package services

import (
	"fmt"
	"io/fs"
	"os"
	"strings"
	"time"

	"linux-config-manager-backend/internal/models"
)

// ConfigService 处理配置文件相关的业务逻辑
type ConfigService struct{}

// NewConfigService 创建新的配置服务实例
func NewConfigService() *ConfigService {
	return &ConfigService{}
}

// 预定义的配置分类
var configCategories = []models.ConfigCategory{
	{ID: "shell", Name: "Shell 配置", Icon: "Terminal", Color: "bg-green-500", Description: "Shell 环境配置文件"},
	{ID: "editor", Name: "编辑器配置", Icon: "FileText", Color: "bg-blue-500", Description: "文本编辑器配置"},
	{ID: "git", Name: "Git 配置", Icon: "GitBranch", Color: "bg-orange-500", Description: "Git 版本控制配置"},
	{ID: "ssh", Name: "SSH 配置", Icon: "Key", Color: "bg-purple-500", Description: "SSH 客户端配置"},
	{ID: "system", Name: "系统配置", Icon: "Settings", Color: "bg-red-500", Description: "系统级配置文件"},
	{ID: "app", Name: "应用配置", Icon: "Package", Color: "bg-indigo-500", Description: "应用程序配置"},
}

// 预定义的常用配置文件
var commonConfigFiles = []models.ConfigFile{
	{ID: "bashrc", Name: ".bashrc", Path: "~/.bashrc", Category: "shell", Description: "Bash shell 配置"},
	{ID: "zshrc", Name: ".zshrc", Path: "~/.zshrc", Category: "shell", Description: "Zsh shell 配置"},
	{ID: "profile", Name: ".profile", Path: "~/.profile", Category: "shell", Description: "Shell 环境变量"},
	{ID: "gitconfig", Name: ".gitconfig", Path: "~/.gitconfig", Category: "git", Description: "Git 全局配置"},
	{ID: "vimrc", Name: ".vimrc", Path: "~/.vimrc", Category: "editor", Description: "Vim 编辑器配置"},
	{ID: "sshconfig", Name: "config", Path: "~/.ssh/config", Category: "ssh", Description: "SSH 客户端配置"},
}

// GetCategories 获取所有配置分类
func (s *ConfigService) GetCategories() []models.ConfigCategory {
	return configCategories
}

// GetFiles 获取所有配置文件列表
func (s *ConfigService) GetFiles() ([]models.ConfigFile, error) {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return nil, fmt.Errorf("无法获取用户主目录: %w", err)
	}

	var files []models.ConfigFile

	for _, file := range commonConfigFiles {
		realPath := strings.Replace(file.Path, "~", homeDir, 1)

		// 检查文件是否存在并获取文件信息
		if info, err := os.Lstat(realPath); err == nil {
			file.LastModified = info.ModTime()
			file.Size = info.Size()
			file.IsSymlink = info.Mode()&fs.ModeSymlink != 0

			// 检查备份是否存在
			backupPath := realPath + ".backup"
			if _, err := os.Stat(backupPath); err == nil {
				file.BackupExists = true
			}

			// 只添加存在的文件到列表中
			files = append(files, file)
		}
	}

	return files, nil
}

// GetFileByID 根据ID获取配置文件详情
func (s *ConfigService) GetFileByID(fileID string) (*models.ConfigFile, error) {
	// 查找文件
	var targetFile *models.ConfigFile
	for _, file := range commonConfigFiles {
		if file.ID == fileID {
			fileCopy := file // 创建副本避免修改原始数据
			targetFile = &fileCopy
			break
		}
	}

	if targetFile == nil {
		return nil, fmt.Errorf("文件未找到: %s", fileID)
	}

	homeDir, err := os.UserHomeDir()
	if err != nil {
		return nil, fmt.Errorf("无法获取用户主目录: %w", err)
	}

	realPath := strings.Replace(targetFile.Path, "~", homeDir, 1)

	// 检查文件是否存在
	if _, err := os.Stat(realPath); os.IsNotExist(err) {
		return nil, fmt.Errorf("文件不存在: %s", realPath)
	}

	// 读取文件内容
	content, err := os.ReadFile(realPath)
	if err != nil {
		return nil, fmt.Errorf("无法读取文件 %s: %w", realPath, err)
	}

	targetFile.Content = string(content)

	// 更新文件信息
	if info, err := os.Lstat(realPath); err == nil {
		targetFile.LastModified = info.ModTime()
		targetFile.Size = info.Size()
		targetFile.IsSymlink = info.Mode()&fs.ModeSymlink != 0
	}

	return targetFile, nil
}

// UpdateFile 更新配置文件内容
func (s *ConfigService) UpdateFile(fileID, content string) error {
	// 查找文件
	var targetFile *models.ConfigFile
	for _, file := range commonConfigFiles {
		if file.ID == fileID {
			targetFile = &file
			break
		}
	}

	if targetFile == nil {
		return fmt.Errorf("文件未找到: %s", fileID)
	}

	homeDir, err := os.UserHomeDir()
	if err != nil {
		return fmt.Errorf("无法获取用户主目录: %w", err)
	}

	realPath := strings.Replace(targetFile.Path, "~", homeDir, 1)

	// 写入文件
	err = os.WriteFile(realPath, []byte(content), 0644)
	if err != nil {
		return fmt.Errorf("无法写入文件 %s: %w", realPath, err)
	}

	return nil
}

// BackupFile 创建配置文件备份
func (s *ConfigService) BackupFile(fileID string) (*models.BackupFileResponse, error) {
	// 查找文件
	var targetFile *models.ConfigFile
	for _, file := range commonConfigFiles {
		if file.ID == fileID {
			targetFile = &file
			break
		}
	}

	if targetFile == nil {
		return nil, fmt.Errorf("文件未找到: %s", fileID)
	}

	homeDir, err := os.UserHomeDir()
	if err != nil {
		return nil, fmt.Errorf("无法获取用户主目录: %w", err)
	}

	realPath := strings.Replace(targetFile.Path, "~", homeDir, 1)

	// 检查文件是否存在
	if _, err := os.Stat(realPath); os.IsNotExist(err) {
		return nil, fmt.Errorf("文件不存在: %s", realPath)
	}

	backupPath := realPath + ".backup." + time.Now().Format("20060102-150405")

	// 复制文件作为备份
	content, err := os.ReadFile(realPath)
	if err != nil {
		return nil, fmt.Errorf("无法读取原文件 %s: %w", realPath, err)
	}

	err = os.WriteFile(backupPath, content, 0644)
	if err != nil {
		return nil, fmt.Errorf("无法创建备份文件 %s: %w", backupPath, err)
	}

	return &models.BackupFileResponse{
		Message:    "备份创建成功",
		BackupPath: backupPath,
	}, nil
}
