package middleware

import (
	"github.com/rs/cors"
)

// SetupCORS 设置CORS中间件
func SetupCORS() *cors.Cors {
	return cors.New(cors.Options{
		AllowedOrigins: []string{
			"http://localhost:5173", // Vite 开发服务器
			"http://localhost:3000", // React 开发服务器
			"http://localhost:8080", // 可能的其他端口
		},
		AllowedMethods: []string{
			"GET",
			"POST",
			"PUT",
			"DELETE",
			"OPTIONS",
			"PATCH",
		},
		AllowedHeaders: []string{
			"Accept",
			"Authorization",
			"Content-Type",
			"X-CSRF-Token",
			"X-Requested-With",
		},
		ExposedHeaders: []string{
			"Link",
		},
		AllowCredentials: true,
		MaxAge:           300, // 5分钟
	})
}
