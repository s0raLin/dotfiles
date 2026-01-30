// 已弃用：此文件已被新的模块化架构替代
// 新的入口点位于: cmd/server/main.go
// 请使用: go run cmd/server/main.go 或 make dev
//
// 此文件将在确认新架构正常工作后删除

package main

import (
	"encoding/json"
	"fmt"
	"io/fs"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

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

type ConfigCategory struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Icon        string `json:"icon"`
	Color       string `json:"color"`
	Description string `json:"description"`
}

type SystemInfo struct {
	OS      string `json:"os"`
	Kernel  string `json:"kernel"`
	Shell   string `json:"shell"`
	HomeDir string `json:"homeDir"`
	User    string `json:"user"`
}

type APIResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

var configCategories = []ConfigCategory{
	{ID: "shell", Name: "Shell 配置", Icon: "Terminal", Color: "bg-green-500", Description: "Shell 环境配置文件"},
	{ID: "editor", Name: "编辑器配置", Icon: "FileText", Color: "bg-blue-500", Description: "文本编辑器配置"},
	{ID: "git", Name: "Git 配置", Icon: "GitBranch", Color: "bg-orange-500", Description: "Git 版本控制配置"},
	{ID: "ssh", Name: "SSH 配置", Icon: "Key", Color: "bg-purple-500", Description: "SSH 客户端配置"},
	{ID: "system", Name: "系统配置", Icon: "Settings", Color: "bg-red-500", Description: "系统级配置文件"},
	{ID: "app", Name: "应用配置", Icon: "Package", Color: "bg-indigo-500", Description: "应用程序配置"},
}

var commonConfigFiles = []ConfigFile{
	{ID: "bashrc", Name: ".bashrc", Path: "~/.bashrc", Category: "shell", Description: "Bash shell 配置"},
	{ID: "zshrc", Name: ".zshrc", Path: "~/.zshrc", Category: "shell", Description: "Zsh shell 配置"},
	{ID: "profile", Name: ".profile", Path: "~/.profile", Category: "shell", Description: "Shell 环境变量"},
	{ID: "gitconfig", Name: ".gitconfig", Path: "~/.gitconfig", Category: "git", Description: "Git 全局配置"},
	{ID: "vimrc", Name: ".vimrc", Path: "~/.vimrc", Category: "editor", Description: "Vim 编辑器配置"},
	{ID: "sshconfig", Name: "config", Path: "~/.ssh/config", Category: "ssh", Description: "SSH 客户端配置"},
}

func main() {
	r := mux.NewRouter()

	// API 路由
	api := r.PathPrefix("/api").Subrouter()
	api.HandleFunc("/categories", getCategoriesHandler).Methods("GET")
	api.HandleFunc("/files", getFilesHandler).Methods("GET")
	api.HandleFunc("/files/{id}", getFileHandler).Methods("GET")
	api.HandleFunc("/files/{id}", updateFileHandler).Methods("PUT")
	api.HandleFunc("/files/{id}/backup", backupFileHandler).Methods("POST")
	api.HandleFunc("/system", getSystemInfoHandler).Methods("GET")

	// CORS 配置
	c := cors.New(cors.Options{
		AllowedOrigins: []string{"http://localhost:5173", "http://localhost:3000"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"*"},
	})

	handler := c.Handler(r)

	fmt.Println("服务器启动在 :8080")
	log.Fatal(http.ListenAndServe(":8080", handler))
}

// API 处理函数
func getCategoriesHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(APIResponse{
		Success: true,
		Data:    configCategories,
	})
}

func getFilesHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	homeDir, _ := os.UserHomeDir()
	var files []ConfigFile

	for _, file := range commonConfigFiles {
		realPath := strings.Replace(file.Path, "~", homeDir, 1)

		// 检查文件是否存在
		if info, err := os.Lstat(realPath); err == nil {
			file.LastModified = info.ModTime()
			file.Size = info.Size()
			file.IsSymlink = info.Mode()&fs.ModeSymlink != 0

			// 检查备份是否存在
			backupPath := realPath + ".backup"
			if _, err := os.Stat(backupPath); err == nil {
				file.BackupExists = true
			}
		}

		files = append(files, file)
	}

	json.NewEncoder(w).Encode(APIResponse{
		Success: true,
		Data:    files,
	})
}

func getFileHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	vars := mux.Vars(r)
	fileID := vars["id"]

	// 查找文件
	var targetFile *ConfigFile
	for _, file := range commonConfigFiles {
		if file.ID == fileID {
			targetFile = &file
			break
		}
	}

	if targetFile == nil {
		json.NewEncoder(w).Encode(APIResponse{
			Success: false,
			Error:   "文件未找到",
		})
		return
	}

	homeDir, _ := os.UserHomeDir()
	realPath := strings.Replace(targetFile.Path, "~", homeDir, 1)

	// 读取文件内容
	content, err := os.ReadFile(realPath)
	if err != nil {
		json.NewEncoder(w).Encode(APIResponse{
			Success: false,
			Error:   "无法读取文件: " + err.Error(),
		})
		return
	}

	targetFile.Content = string(content)

	// 更新文件信息
	if info, err := os.Lstat(realPath); err == nil {
		targetFile.LastModified = info.ModTime()
		targetFile.Size = info.Size()
		targetFile.IsSymlink = info.Mode()&fs.ModeSymlink != 0
	}

	json.NewEncoder(w).Encode(APIResponse{
		Success: true,
		Data:    targetFile,
	})
}

func updateFileHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	vars := mux.Vars(r)
	fileID := vars["id"]

	var updateData struct {
		Content string `json:"content"`
	}

	if err := json.NewDecoder(r.Body).Decode(&updateData); err != nil {
		json.NewEncoder(w).Encode(APIResponse{
			Success: false,
			Error:   "无效的请求数据",
		})
		return
	}

	// 查找文件
	var targetFile *ConfigFile
	for _, file := range commonConfigFiles {
		if file.ID == fileID {
			targetFile = &file
			break
		}
	}

	if targetFile == nil {
		json.NewEncoder(w).Encode(APIResponse{
			Success: false,
			Error:   "文件未找到",
		})
		return
	}

	homeDir, _ := os.UserHomeDir()
	realPath := strings.Replace(targetFile.Path, "~", homeDir, 1)

	// 写入文件
	err := os.WriteFile(realPath, []byte(updateData.Content), 0644)
	if err != nil {
		json.NewEncoder(w).Encode(APIResponse{
			Success: false,
			Error:   "无法写入文件: " + err.Error(),
		})
		return
	}

	json.NewEncoder(w).Encode(APIResponse{
		Success: true,
		Data:    map[string]string{"message": "文件保存成功"},
	})
}

func backupFileHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	vars := mux.Vars(r)
	fileID := vars["id"]

	// 查找文件
	var targetFile *ConfigFile
	for _, file := range commonConfigFiles {
		if file.ID == fileID {
			targetFile = &file
			break
		}
	}

	if targetFile == nil {
		json.NewEncoder(w).Encode(APIResponse{
			Success: false,
			Error:   "文件未找到",
		})
		return
	}

	homeDir, _ := os.UserHomeDir()
	realPath := strings.Replace(targetFile.Path, "~", homeDir, 1)
	backupPath := realPath + ".backup." + time.Now().Format("20060102-150405")

	// 复制文件作为备份
	content, err := os.ReadFile(realPath)
	if err != nil {
		json.NewEncoder(w).Encode(APIResponse{
			Success: false,
			Error:   "无法读取原文件: " + err.Error(),
		})
		return
	}

	err = os.WriteFile(backupPath, content, 0644)
	if err != nil {
		json.NewEncoder(w).Encode(APIResponse{
			Success: false,
			Error:   "无法创建备份: " + err.Error(),
		})
		return
	}

	json.NewEncoder(w).Encode(APIResponse{
		Success: true,
		Data:    map[string]string{"message": "备份创建成功", "backupPath": backupPath},
	})
}

func getSystemInfoHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	homeDir, _ := os.UserHomeDir()
	user := os.Getenv("USER")
	shell := os.Getenv("SHELL")

	systemInfo := SystemInfo{
		OS:      "Linux",
		Kernel:  "Unknown",
		Shell:   shell,
		HomeDir: homeDir,
		User:    user,
	}

	json.NewEncoder(w).Encode(APIResponse{
		Success: true,
		Data:    systemInfo,
	})
}
