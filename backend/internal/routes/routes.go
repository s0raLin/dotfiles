package routes

import (
	"net/http"

	"github.com/gorilla/mux"

	"linux-config-manager-backend/internal/handlers"
	"linux-config-manager-backend/internal/services"
)

// SetupRoutes 设置所有API路由
func SetupRoutes() *mux.Router {
	r := mux.NewRouter()

	// 创建服务实例
	configService := services.NewConfigService()
	systemService := services.NewSystemService()

	// 创建处理器实例
	configHandler := handlers.NewConfigHandler(configService)
	systemHandler := handlers.NewSystemHandler(systemService)

	// API 路由组
	api := r.PathPrefix("/api").Subrouter()

	// 配置文件相关路由
	api.HandleFunc("/categories", configHandler.GetCategories).Methods("GET")
	api.HandleFunc("/files", configHandler.GetFiles).Methods("GET")
	api.HandleFunc("/files/{id}", configHandler.GetFile).Methods("GET")
	api.HandleFunc("/files/{id}", configHandler.UpdateFile).Methods("PUT")
	api.HandleFunc("/files/{id}/backup", configHandler.BackupFile).Methods("POST")
	
	// 导入导出相关路由
	api.HandleFunc("/export", configHandler.ExportConfigs).Methods("GET")
	api.HandleFunc("/import", configHandler.ImportConfigs).Methods("POST")

	// 系统信息相关路由
	api.HandleFunc("/system", systemHandler.GetSystemInfo).Methods("GET")

	// 健康检查路由
	api.HandleFunc("/health", healthCheckHandler).Methods("GET")

	return r
}

// healthCheckHandler 健康检查处理器
func healthCheckHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(200)
	w.Write([]byte(`{"status": "ok", "message": "服务运行正常"}`))
}
