package services

import (
	"os"
	"os/exec"
	"strings"

	"linux-config-manager-backend/internal/models"
)

// SystemService 处理系统信息相关的业务逻辑
type SystemService struct{}

// NewSystemService 创建新的系统服务实例
func NewSystemService() *SystemService {
	return &SystemService{}
}

// GetSystemInfo 获取系统信息
func (s *SystemService) GetSystemInfo() (*models.SystemInfo, error) {
	homeDir, _ := os.UserHomeDir()
	user := os.Getenv("USER")
	shell := os.Getenv("SHELL")

	// 尝试获取内核版本
	kernel := "Unknown"
	if cmd := exec.Command("uname", "-r"); cmd != nil {
		if output, err := cmd.Output(); err == nil {
			kernel = strings.TrimSpace(string(output))
		}
	}

	// 尝试获取操作系统信息
	osInfo := "Linux"
	if cmd := exec.Command("lsb_release", "-d"); cmd != nil {
		if output, err := cmd.Output(); err == nil {
			parts := strings.Split(string(output), ":")
			if len(parts) > 1 {
				osInfo = strings.TrimSpace(parts[1])
			}
		}
	}

	systemInfo := &models.SystemInfo{
		OS:      osInfo,
		Kernel:  kernel,
		Shell:   shell,
		HomeDir: homeDir,
		User:    user,
	}

	return systemInfo, nil
}
