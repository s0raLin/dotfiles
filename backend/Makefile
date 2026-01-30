# Linux 配置管理器后端 Makefile

# 变量定义
BINARY_NAME=linux-config-manager
BUILD_DIR=bin
CMD_DIR=cmd/server
MAIN_FILE=$(CMD_DIR)/main.go

# 默认目标
.PHONY: all
all: clean build

# 清理构建文件
.PHONY: clean
clean:
	@echo "🧹 清理构建文件..."
	@rm -rf $(BUILD_DIR)
	@go clean

# 构建应用
.PHONY: build
build:
	@echo "🔨 构建应用..."
	@mkdir -p $(BUILD_DIR)
	@go build -o $(BUILD_DIR)/$(BINARY_NAME) $(MAIN_FILE)
	@echo "✅ 构建完成: $(BUILD_DIR)/$(BINARY_NAME)"

# 运行开发服务器
.PHONY: dev
dev:
	@echo "🚀 启动开发服务器..."
	@go run $(MAIN_FILE)

# 运行测试
.PHONY: test
test:
	@echo "🧪 运行测试..."
	@go test -v ./...

# 格式化代码
.PHONY: fmt
fmt:
	@echo "📝 格式化代码..."
	@go fmt ./...

# 代码检查
.PHONY: vet
vet:
	@echo "🔍 代码检查..."
	@go vet ./...

# 下载依赖
.PHONY: deps
deps:
	@echo "📦 下载依赖..."
	@go mod download
	@go mod tidy

# 运行构建的应用
.PHONY: run
run: build
	@echo "🚀 运行应用..."
	@./$(BUILD_DIR)/$(BINARY_NAME)

# 健康检查
.PHONY: health
health:
	@echo "🏥 检查服务健康状态..."
	@curl -f http://localhost:8080/api/health || echo "❌ 服务未运行"

# 显示帮助信息
.PHONY: help
help:
	@echo "Linux 配置管理器后端 - 可用命令:"
	@echo ""
	@echo "  make build      - 构建应用"
	@echo "  make dev        - 运行开发服务器"
	@echo "  make run        - 构建并运行应用"
	@echo "  make test       - 运行测试"
	@echo "  make fmt        - 格式化代码"
	@echo "  make vet        - 代码检查"
	@echo "  make deps       - 下载依赖"
	@echo "  make health     - 健康检查"
	@echo "  make clean      - 清理构建文件"
	@echo "  make help       - 显示此帮助信息"