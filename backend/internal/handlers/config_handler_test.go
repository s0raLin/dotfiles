package handlers

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"linux-config-manager-backend/internal/models"
	"linux-config-manager-backend/internal/services"
)

func TestGetCategories(t *testing.T) {
	// 创建服务和处理器
	configService := services.NewConfigService()
	handler := NewConfigHandler(configService)

	// 创建请求
	req, err := http.NewRequest("GET", "/api/categories", nil)
	if err != nil {
		t.Fatal(err)
	}

	// 创建响应记录器
	rr := httptest.NewRecorder()

	// 调用处理器
	handler.GetCategories(rr, req)

	// 检查状态码
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("处理器返回了错误的状态码: got %v want %v", status, http.StatusOK)
	}

	// 检查响应内容
	var response models.APIResponse
	if err := json.Unmarshal(rr.Body.Bytes(), &response); err != nil {
		t.Errorf("无法解析响应 JSON: %v", err)
	}

	if !response.Success {
		t.Errorf("API 响应显示失败: %v", response.Error)
	}

	// 检查是否返回了分类数据
	if response.Data == nil {
		t.Error("响应中没有数据")
	}
}

func TestGetFiles(t *testing.T) {
	// 创建服务和处理器
	configService := services.NewConfigService()
	handler := NewConfigHandler(configService)

	// 创建请求
	req, err := http.NewRequest("GET", "/api/files", nil)
	if err != nil {
		t.Fatal(err)
	}

	// 创建响应记录器
	rr := httptest.NewRecorder()

	// 调用处理器
	handler.GetFiles(rr, req)

	// 检查状态码
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("处理器返回了错误的状态码: got %v want %v", status, http.StatusOK)
	}

	// 检查响应内容
	var response models.APIResponse
	if err := json.Unmarshal(rr.Body.Bytes(), &response); err != nil {
		t.Errorf("无法解析响应 JSON: %v", err)
	}

	if !response.Success {
		t.Errorf("API 响应显示失败: %v", response.Error)
	}
}