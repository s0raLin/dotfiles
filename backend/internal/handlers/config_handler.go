package handlers

import (
	"encoding/json"
	"net/http"

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
