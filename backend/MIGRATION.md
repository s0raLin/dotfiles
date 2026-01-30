# 后端架构迁移指南

## 概述

后端已从单文件架构迁移到模块化的 RESTful 架构。

## 主要变化

### 1. 项目结构变化

**旧结构:**
```
backend/
├── main.go          # 所有代码在一个文件中
├── go.mod
└── go.sum
```

**新结构:**
```
backend/
├── cmd/
│   └── server/
│       └── main.go              # 新的应用入口点
├── internal/
│   ├── handlers/                # HTTP 请求处理器
│   ├── middleware/              # HTTP 中间件
│   ├── models/                  # 数据模型
│   ├── routes/                  # 路由配置
│   └── services/                # 业务逻辑层
├── go.mod
├── go.sum
├── main.go                      # 旧文件（已标记为弃用）
├── Makefile                     # 构建工具
└── README.md                    # 项目文档
```

### 2. 启动方式变化

**旧方式:**
```bash
go run main.go
```

**新方式:**
```bash
# 使用 Makefile（推荐）
make dev

# 或直接运行
go run cmd/server/main.go
```

### 3. 架构改进

- **分层架构**: Handler → Service → Model
- **依赖注入**: 通过构造函数注入依赖
- **统一错误处理**: 标准化的 API 响应格式
- **中间件支持**: CORS、日志记录等
- **测试支持**: 单元测试和集成测试

## 迁移步骤

### 1. 验证新架构

```bash
cd backend

# 检查代码格式
make fmt

# 运行代码检查
make vet

# 运行测试
make test

# 构建应用
make build
```

### 2. 测试新服务器

```bash
# 启动新服务器
make dev

# 在另一个终端测试 API
curl http://localhost:8080/api/health
curl http://localhost:8080/api/categories
curl http://localhost:8080/api/files
```

### 3. 更新启动脚本

确保 `start.sh` 使用新的入口点：
```bash
go run cmd/server/main.go
```

### 4. 清理旧文件

在确认新架构正常工作后，可以删除旧的 `main.go` 文件：
```bash
rm main.go
```

## API 兼容性

新架构完全兼容现有的 API 端点：

- `GET /api/categories` - 获取配置分类
- `GET /api/files` - 获取文件列表
- `GET /api/files/{id}` - 获取文件详情
- `PUT /api/files/{id}` - 更新文件内容
- `POST /api/files/{id}/backup` - 创建备份
- `GET /api/system` - 获取系统信息
- `GET /api/health` - 健康检查（新增）

## 开发工作流

### 日常开发

```bash
# 启动开发服务器
make dev

# 格式化代码
make fmt

# 运行测试
make test
```

### 生产部署

```bash
# 构建应用
make build

# 运行构建的应用
make run
```

## 故障排除

### 1. 构建失败

```bash
# 清理并重新构建
make clean
make deps
make build
```

### 2. 导入路径错误

确保所有导入路径使用模块名 `linux-config-manager-backend`：
```go
import "linux-config-manager-backend/internal/models"
```

### 3. 端口冲突

设置不同的端口：
```bash
PORT=8081 make dev
```

## 回滚方案

如果新架构出现问题，可以临时回滚到旧版本：

1. 恢复 `start.sh` 中的启动命令：
   ```bash
   go run main.go
   ```

2. 使用旧的 `main.go` 文件启动服务

但建议尽快修复新架构的问题，因为旧架构不再维护。