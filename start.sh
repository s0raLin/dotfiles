#!/bin/bash

# Linux 配置管理器启动脚本

echo "🚀 启动 Linux 配置管理器..."

# 检查依赖
if ! command -v go &> /dev/null; then
    echo "❌ Go 未安装，请先安装 Go"
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm 未安装，请先安装 pnpm"
    exit 1
fi

# 安装前端依赖
echo "📦 安装前端依赖..."
pnpm install

# 启动后端服务器
echo "🔧 启动后端服务器..."
cd backend
go mod tidy
go run main.go &
BACKEND_PID=$!
cd ..

# 等待后端启动
sleep 2

# 启动前端开发服务器
echo "🎨 启动前端开发服务器..."
pnpm dev &
FRONTEND_PID=$!

echo "✅ 服务启动完成！"
echo "📱 前端地址: http://localhost:3000"
echo "🔧 后端地址: http://localhost:8080"
echo ""
echo "按 Ctrl+C 停止所有服务"

# 等待用户中断
trap "echo '🛑 正在停止服务...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait