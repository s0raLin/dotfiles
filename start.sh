#!/bin/bash

# Linux 配置管理器启动脚本

echo "🔧 Linux 配置管理器"
echo "===================="
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到 Node.js"
    echo "请先安装 Node.js: https://nodejs.org/"
    exit 1
fi

# 检查 pnpm
if ! command -v pnpm &> /dev/null; then
    echo "📦 正在安装 pnpm..."
    npm install -g pnpm
fi

echo "📦 安装依赖..."
pnpm install

echo ""
echo "🚀 启动开发服务器..."
echo "应用将在 http://localhost:5173 打开"
echo ""
echo "按 Ctrl+C 停止服务器"
echo ""

pnpm dev