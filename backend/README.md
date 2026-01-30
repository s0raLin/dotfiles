# Linux 配置管理器后端

基于 Go 语言开发的 RESTful API 服务，用于管理 Linux 系统配置文件。

## 项目结构

```
backend/
├── cmd/
│   └── server/
│       └── main.go              # 应用程序入口点
├── internal/
│   ├── handlers/                # HTTP 请求处理器
│   │   ├── config_handler.go    # 配置文件相关处理器
│   │   └── system_handler.go    # 系统信息相关处理器
│   ├── middleware/              # HTTP 中间件
│   │   ├── cors.go             # CORS 中间件
│   │   └── logging.go          # 日志中间件
│   ├── models/                  # 数据模型
│   │   ├── config.go           # 配置文件相关模型
│   │   └── response.go         # API 响应模型
│   ├── routes/                  # 路由配置
│   │   └── routes.go           # 路由设置
│   └── services/                # 业务逻辑层
│       ├── config_service.go   # 配置文件服务
│       └── system_service.go   # 系统信息服务
├── go.mod                       # Go 模块文件
├── go.sum                       # Go 依赖锁定文件
├── main.go                      # 旧版本入口（待删除）
└── README.md                    # 项目文档
```

## API 端点

### 配置文件管理

- `GET /api/categories` - 获取所有配置分类
- `GET /api/files` - 获取所有配置文件列表
- `GET /api/files/{id}` - 获取指定配置文件详情
- `PUT /api/files/{id}` - 更新配置文件内容
- `POST /api/files/{id}/backup` - 创建配置文件备份

### 系统信息

- `GET /api/system` - 获取系统信息

### 健康检查

- `GET /api/health` - 服务健康检查

## 运行方式

### 开发环境

```bash
# 使用 Makefile
make dev

# 或直接运行
go run cmd/server/main.go

# 或设置端口
PORT=8080 go run cmd/server/main.go
```

### 生产环境

```bash
# 构建
make build

# 运行
./bin/linux-config-manager
```

## 环境变量

- `PORT` - 服务器端口（默认: 8080）

## 架构特点

### 1. 分层架构
- **Handler 层**: 处理 HTTP 请求和响应
- **Service 层**: 包含业务逻辑
- **Model 层**: 定义数据结构

### 2. RESTful 设计
- 遵循 REST 架构原则
- 使用标准 HTTP 方法和状态码
- 统一的 JSON 响应格式

### 3. 中间件支持
- CORS 跨域支持
- 请求日志记录
- 可扩展的中间件架构

### 4. 错误处理
- 统一的错误响应格式
- 详细的错误信息
- 适当的 HTTP 状态码

## 依赖项

- `github.com/gorilla/mux` - HTTP 路由器
- `github.com/rs/cors` - CORS 中间件

## 开发指南

### 添加新的 API 端点

1. 在 `internal/models/` 中定义数据模型
2. 在 `internal/services/` 中实现业务逻辑
3. 在 `internal/handlers/` 中创建 HTTP 处理器
4. 在 `internal/routes/routes.go` 中注册路由

### 添加中间件

1. 在 `internal/middleware/` 中创建中间件函数
2. 在 `cmd/server/main.go` 中应用中间件

## 迁移说明

从旧版本 `main.go` 迁移到新架构：

1. 所有业务逻辑已移至 Service 层
2. HTTP 处理逻辑已移至 Handler 层
3. 路由配置已模块化
4. 新的入口点为 `cmd/server/main.go`

旧版本的 `main.go` 文件可以在确认新版本正常工作后删除。