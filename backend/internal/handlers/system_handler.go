package handlers

import (
	"encoding/json"
	"net/http"

	"linux-config-manager-backend/internal/models"
	"linux-config-manager-backend/internal/services"
)

// SystemHandler 处理系统信息相关的HTTP请求
type SystemHandler struct {
	systemService *services.SystemService
}

// NewSystemHandler 创建新的系统处理器实例
func NewSystemHandler(systemService *services.SystemService) *SystemHandler {
	return &SystemHandler{
		systemService: systemService,
	}
}

// GetSystemInfo 获取系统信息
// GET /api/system
func (h *SystemHandler) GetSystemInfo(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	systemInfo, err := h.systemService.GetSystemInfo()
	if err != nil {
		response := models.NewErrorResponse("获取系统信息失败: " + err.Error())
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	response := models.NewSuccessResponse(systemInfo)
	json.NewEncoder(w).Encode(response)
}
