package handlers

import (
	"archive/zip"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"strings"
	"time"

	"github.com/gorilla/mux"

	"linux-config-manager-backend/internal/models"
	"linux-config-manager-backend/internal/services"
)

// ConfigHandler 处理配置文件相关的HTTP请求
type ConfigHandler struct {
	configService *services.ConfigService
}

// NewConfigHandler 创建新的配置处理器实例
func NewConfigHandler(configService *services.ConfigService) *ConfigHandler {
	return &ConfigHandler{
		configService: configService,
	}
}

// GetCategories 获取所有配置分类
// GET /api/categories
func (h *ConfigHandler) GetCategories(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	categories := h.configService.GetCategories()
	response := models.NewSuccessResponse(categories)

	json.NewEncoder(w).Encode(response)
}

// GetFiles 获取所有配置文件列表
// GET /api/files
func (h *ConfigHandler) GetFiles(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	files, err := h.configService.GetFiles()
	if err != nil {
		response := models.NewErrorResponse("获取文件列表失败: " + err.Error())
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	response := models.NewSuccessResponse(files)
	json.NewEncoder(w).Encode(response)
}

// GetFile 根据ID获取配置文件详情
// GET /api/files/{id}
func (h *ConfigHandler) GetFile(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	vars := mux.Vars(r)
	fileID := vars["id"]

	if fileID == "" {
		response := models.NewErrorResponse("文件ID不能为空")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	file, err := h.configService.GetFileByID(fileID)
	if err != nil {
		response := models.NewErrorResponse(err.Error())
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(response)
		return
	}

	response := models.NewSuccessResponse(file)
	json.NewEncoder(w).Encode(response)
}

// UpdateFile 更新配置文件内容
// PUT /api/files/{id}
func (h *ConfigHandler) UpdateFile(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	vars := mux.Vars(r)
	fileID := vars["id"]

	if fileID == "" {
		response := models.NewErrorResponse("文件ID不能为空")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	var updateRequest models.UpdateFileRequest
	if err := json.NewDecoder(r.Body).Decode(&updateRequest); err != nil {
		response := models.NewErrorResponse("无效的请求数据: " + err.Error())
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	err := h.configService.UpdateFile(fileID, updateRequest.Content)
	if err != nil {
		response := models.NewErrorResponse(err.Error())
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	response := models.NewSuccessMessageResponse("文件保存成功", nil)
	json.NewEncoder(w).Encode(response)
}

// BackupFile 创建配置文件备份
// POST /api/files/{id}/backup
func (h *ConfigHandler) BackupFile(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	vars := mux.Vars(r)
	fileID := vars["id"]

	if fileID == "" {
		response := models.NewErrorResponse("文件ID不能为空")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	backupResponse, err := h.configService.BackupFile(fileID)
	if err != nil {
		response := models.NewErrorResponse(err.Error())
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	response := models.NewSuccessResponse(backupResponse)
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

// ExportConfigs 导出所有配置文件为压缩包
// GET /api/export
func (h *ConfigHandler) ExportConfigs(w http.ResponseWriter, r *http.Request) {
	// 获取所有配置文件
	files, err := h.configService.GetFiles()
	if err != nil {
		http.Error(w, "获取配置文件失败: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// 获取所有分类信息
	categories := h.configService.GetCategories()

	// 设置响应头
	w.Header().Set("Content-Type", "application/zip")
	w.Header().Set("Content-Disposition", "attachment; filename=linux-configs.zip")

	// 创建ZIP写入器
	zipWriter := zip.NewWriter(w)
	defer zipWriter.Close()

	// 创建分类映射
	categoryMap := make(map[string]models.ConfigCategory)
	for _, cat := range categories {
		categoryMap[cat.ID] = cat
	}

	// 按分类组织文件
	for _, file := range files {
		// 获取文件内容
		fileWithContent, err := h.configService.GetFileByID(file.ID)
		if err != nil {
			continue // 跳过无法读取的文件
		}

		// 构建文件路径：分类名/文件名
		categoryName := "其他"
		if cat, exists := categoryMap[file.Category]; exists {
			categoryName = cat.Name
		}
		
		// 清理文件名，移除路径分隔符
		fileName := strings.ReplaceAll(file.Name, "/", "_")
		filePath := fmt.Sprintf("%s/%s", categoryName, fileName)

		// 创建ZIP文件条目
		fileWriter, err := zipWriter.Create(filePath)
		if err != nil {
			continue
		}

		// 写入文件内容
		if fileWithContent.Content != "" {
			fileWriter.Write([]byte(fileWithContent.Content))
		}
	}

	// 创建配置清单文件
	manifestWriter, err := zipWriter.Create("配置清单.json")
	if err == nil {
		manifest := map[string]interface{}{
			"exportTime": fmt.Sprintf("%s", time.Now().Format("2006-01-02 15:04:05")),
			"totalFiles": len(files),
			"categories": categories,
			"files":      files,
		}
		manifestData, _ := json.MarshalIndent(manifest, "", "  ")
		manifestWriter.Write(manifestData)
	}
}

// ImportConfigs 导入配置文件
// POST /api/import
func (h *ConfigHandler) ImportConfigs(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// 解析multipart表单
	err := r.ParseMultipartForm(32 << 20) // 32MB
	if err != nil {
		response := models.NewErrorResponse("解析上传文件失败: " + err.Error())
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	file, header, err := r.FormFile("configFile")
	if err != nil {
		response := models.NewErrorResponse("获取上传文件失败: " + err.Error())
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}
	defer file.Close()

	// 检查文件类型
	if !strings.HasSuffix(strings.ToLower(header.Filename), ".zip") {
		response := models.NewErrorResponse("只支持ZIP格式的配置文件")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	// 处理ZIP文件
	result, err := h.processImportedZip(file, header.Size)
	if err != nil {
		response := models.NewErrorResponse("处理导入文件失败: " + err.Error())
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	response := models.NewSuccessResponse(result)
	json.NewEncoder(w).Encode(response)
}

// processImportedZip 处理导入的ZIP文件
func (h *ConfigHandler) processImportedZip(file multipart.File, size int64) (map[string]interface{}, error) {
	// 创建ZIP读取器
	zipReader, err := zip.NewReader(file, size)
	if err != nil {
		return nil, fmt.Errorf("无法读取ZIP文件: %v", err)
	}

	importedFiles := 0
	skippedFiles := 0
	errors := []string{}

	// 遍历ZIP文件中的所有文件
	for _, zipFile := range zipReader.File {
		// 跳过目录和配置清单文件
		if zipFile.FileInfo().IsDir() || strings.HasSuffix(zipFile.Name, "配置清单.json") {
			continue
		}

		// 打开ZIP文件中的文件
		rc, err := zipFile.Open()
		if err != nil {
			errors = append(errors, fmt.Sprintf("无法打开文件 %s: %v", zipFile.Name, err))
			skippedFiles++
			continue
		}

		// 读取文件内容
		content, err := io.ReadAll(rc)
		rc.Close()
		if err != nil {
			errors = append(errors, fmt.Sprintf("无法读取文件 %s: %v", zipFile.Name, err))
			skippedFiles++
			continue
		}

		// 解析文件路径，获取分类和文件名
		pathParts := strings.Split(zipFile.Name, "/")
		if len(pathParts) < 2 {
			errors = append(errors, fmt.Sprintf("文件路径格式不正确: %s", zipFile.Name))
			skippedFiles++
			continue
		}

		fileName := pathParts[len(pathParts)-1]
		
		// 尝试根据文件名找到对应的配置文件
		files, err := h.configService.GetFiles()
		if err != nil {
			errors = append(errors, fmt.Sprintf("获取配置文件列表失败: %v", err))
			skippedFiles++
			continue
		}

		// 查找匹配的配置文件
		var targetFile *models.ConfigFile
		for _, f := range files {
			if strings.Contains(f.Name, fileName) || strings.Contains(fileName, f.Name) {
				targetFile = &f
				break
			}
		}

		if targetFile == nil {
			errors = append(errors, fmt.Sprintf("未找到匹配的配置文件: %s", fileName))
			skippedFiles++
			continue
		}

		// 更新配置文件内容
		err = h.configService.UpdateFile(targetFile.ID, string(content))
		if err != nil {
			errors = append(errors, fmt.Sprintf("更新文件 %s 失败: %v", targetFile.Name, err))
			skippedFiles++
			continue
		}

		importedFiles++
	}

	result := map[string]interface{}{
		"importedFiles": importedFiles,
		"skippedFiles":  skippedFiles,
		"errors":        errors,
		"message":       fmt.Sprintf("导入完成：成功 %d 个文件，跳过 %d 个文件", importedFiles, skippedFiles),
	}

	return result, nil
}