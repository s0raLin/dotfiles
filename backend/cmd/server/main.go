package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"linux-config-manager-backend/internal/middleware"
	"linux-config-manager-backend/internal/routes"
)

func main() {
	// 设置日志格式
	log.SetFlags(log.LstdFlags | log.Lshortfile)

	// 获取端口配置
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// 设置路由
	router := routes.SetupRoutes()

	// 设置中间件
	corsMiddleware := middleware.SetupCORS()
	handler := corsMiddleware.Handler(router)
	handler = middleware.LoggingMiddleware(handler)

	// 启动服务器
	addr := ":" + port
	fmt.Printf("🚀 Linux 配置管理器后端服务启动在端口 %s\n", port)
	fmt.Printf("📋 API 文档: http://localhost:%s/api/health\n", port)
	fmt.Printf("🔧 配置文件管理: http://localhost:%s/api/files\n", port)

	if err := http.ListenAndServe(addr, handler); err != nil {
		log.Fatal("服务器启动失败:", err)
	}
}
