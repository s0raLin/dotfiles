# Linux 配置管理器

一个现代化的 Linux 系统配置文件管理工具，采用前后端分离架构，帮助你整合和管理常用的配置目录和文件。

## 🎯 项目概述

Linux 配置管理器提供了一个类似 VSCode 的界面，让你可以轻松地查看、编辑和管理系统配置文件。支持实时编辑、备份管理、语法高亮等功能。

## ✨ 主要功能

### 📁 配置文件分类管理
- **Shell 配置**: .bashrc, .zshrc, .profile 等
- **编辑器配置**: .vimrc, Neovim 配置等  
- **Git 配置**: .gitconfig, .gitignore_global
- **SSH 配置**: SSH 客户端配置和密钥
- **系统配置**: /etc/hosts, crontab 等
- **应用配置**: 各种应用程序配置文件

### 🎨 现代化界面
- 类似 VSCode 的三栏布局
- 深色主题支持
- 响应式设计，适配各种屏幕尺寸
- 直观的文件树导航

### ✏️ 内置编辑器
- 实时编辑配置文件
- 行号显示
- 语法高亮支持
- 文件修改状态指示
- 自动保存功能

### 🔧 配置管理功能
- 配置文件状态监控
- 符号链接检测
- 备份创建和管理
- 文件大小和修改时间信息
- 实时系统信息显示

## 🚀 技术栈

### 前端
- **框架**: React 19 + TypeScript
- **构建工具**: Vite
- **包管理器**: pnpm
- **样式框架**: Tailwind CSS
- **图标库**: Lucide React
- **状态管理**: React Context + useReducer

### 后端
- **语言**: Go 1.21+
- **Web框架**: Gorilla Mux
- **CORS**: rs/cors
- **API**: RESTful API

## 📦 安装和使用

### 前置要求
- Node.js 18+
- Go 1.21+
- pnpm

### 快速开始

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd linux-config-manager
   ```

2. **使用启动脚本（推荐）**
   ```bash
   chmod +x start.sh
   ./start.sh
   ```

3. **手动启动**
   ```bash
   # 安装前端依赖
   pnpm install
   
   # 启动后端服务器
   cd backend
   go mod tidy
   go run main.go &
   cd ..
   
   # 启动前端开发服务器
   pnpm dev
   ```

4. **访问应用**
   - 前端界面: http://localhost:3000
   - 后端API: http://localhost:8080

### 构建生产版本
```bash
# 构建前端
pnpm build

# 构建后端
cd backend
go build -o config-manager main.go
```

## 🔧 API 接口

### 配置分类
- `GET /api/categories` - 获取所有配置分类

### 配置文件
- `GET /api/files` - 获取所有配置文件列表
- `GET /api/files/{id}` - 获取单个配置文件内容
- `PUT /api/files/{id}` - 更新配置文件内容
- `POST /api/files/{id}/backup` - 创建配置文件备份

### 系统信息
- `GET /api/system` - 获取系统信息

## 🎯 功能特性

### 实时编辑
- 支持直接在浏览器中编辑配置文件
- 实时保存到系统文件
- 修改状态指示

### 备份管理
- 一键创建配置文件备份
- 备份状态显示
- 时间戳命名

### 安全特性
- 系统文件保护
- 只读模式支持
- 错误处理和提示

### 用户体验
- 响应式设计
- 加载状态指示
- 错误提示
- 连接状态监控

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！

### 开发指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

MIT License

## 🔮 未来规划

- [ ] 配置文件搜索和替换
- [ ] 语法验证和错误检查
- [ ] 配置模板系统
- [ ] Git 集成（版本控制）
- [ ] 配置文件导入/导出
- [ ] 多用户支持
- [ ] 远程服务器配置管理
- [ ] 插件系统
