#!/bin/bash

# Image Background Remover 一键部署脚本

set -e

echo "🚀 Image Background Remover 部署脚本"
echo "=========================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 函数：打印带颜色的消息
print_message() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查命令是否存在
check_command() {
    if ! command -v $1 &> /dev/null; then
        print_error "需要安装 $1"
        exit 1
    fi
}

# 主函数
main() {
    print_message "开始部署 Image Background Remover..."
    
    # 检查必要命令
    print_message "检查系统依赖..."
    check_command npm
    check_command git
    check_command curl
    
    # 检查是否在项目目录
    if [ ! -f "package.json" ]; then
        print_error "请在项目根目录运行此脚本"
        exit 1
    fi
    
    # 步骤1：安装依赖
    print_message "步骤1: 安装项目依赖..."
    if [ ! -d "node_modules" ]; then
        npm install
        if [ $? -eq 0 ]; then
            print_success "依赖安装完成"
        else
            print_error "依赖安装失败"
            exit 1
        fi
    else
        print_warning "依赖已存在，跳过安装"
    fi
    
    # 步骤2：构建项目
    print_message "步骤2: 构建项目..."
    npm run build
    if [ $? -eq 0 ]; then
        print_success "项目构建成功"
    else
        print_error "项目构建失败"
        exit 1
    fi
    
    # 步骤3：检查环境变量
    print_message "步骤3: 检查环境变量..."
    
    if [ -z "$REMOVE_BG_API_KEY" ]; then
        print_warning "未设置 REMOVE_BG_API_KEY 环境变量"
        echo ""
        echo "📋 获取 Remove.bg API 密钥:"
        echo "1. 访问 https://www.remove.bg/api"
        echo "2. 注册账户"
        echo "3. 获取 API 密钥"
        echo ""
        read -p "请输入 Remove.bg API 密钥: " api_key
        export REMOVE_BG_API_KEY="$api_key"
    fi
    
    if [ -z "$REMOVE_BG_API_KEY" ]; then
        print_error "必须设置 Remove.bg API 密钥"
        exit 1
    fi
    
    # 步骤4：检查 Wrangler
    print_message "步骤4: 检查 Cloudflare Wrangler..."
    if ! command -v wrangler &> /dev/null; then
        print_warning "Wrangler 未安装，正在安装..."
        npm install -g wrangler
    fi
    
    # 步骤5：登录 Cloudflare（如果需要）
    print_message "步骤5: 检查 Cloudflare 登录状态..."
    if ! wrangler whoami &> /dev/null; then
        print_warning "需要登录 Cloudflare"
        wrangler login
    fi
    
    # 步骤6：设置 API 密钥
    print_message "步骤6: 设置 Remove.bg API 密钥..."
    echo "$REMOVE_BG_API_KEY" | wrangler secret put REMOVE_BG_API_KEY
    
    # 步骤7：部署到 Cloudflare Pages
    print_message "步骤7: 部署到 Cloudflare Pages..."
    
    echo ""
    print_warning "请选择部署方式:"
    echo "1) 自动部署（使用当前配置）"
    echo "2) 手动配置部署"
    echo "3) 仅构建，不部署"
    read -p "请选择 (1/2/3): " deploy_choice
    
    case $deploy_choice in
        1)
            print_message "开始自动部署..."
            wrangler pages deploy ./dist --project-name=image-background-remover
            if [ $? -eq 0 ]; then
                print_success "部署成功！"
            else
                print_error "部署失败"
                exit 1
            fi
            ;;
        2)
            print_message "手动部署说明:"
            echo ""
            echo "📋 手动部署步骤:"
            echo "1. 访问 https://dash.cloudflare.com"
            echo "2. 进入 Workers & Pages"
            echo "3. 创建 Pages 项目"
            echo "4. 选择 'Direct Upload'"
            echo "5. 上传 dist 文件夹"
            echo ""
            echo "📋 GitHub 集成部署:"
            echo "1. 在 Pages 项目中选择 'Connect to Git'"
            echo "2. 连接本仓库: crstalhelen527/image-background-remover"
            echo "3. 设置构建命令: npm run build"
            echo "4. 设置输出目录: dist"
            echo "5. 添加环境变量 REMOVE_BG_API_KEY"
            ;;
        3)
            print_success "项目构建完成，未部署"
            echo "构建文件位于: ./dist"
            ;;
        *)
            print_error "无效选择"
            exit 1
            ;;
    esac
    
    # 步骤8：完成提示
    echo ""
    print_success "🎉 部署流程完成！"
    echo ""
    echo "📋 下一步操作:"
    echo "1. 访问你的 Cloudflare Pages 域名"
    echo "2. 测试图片上传和处理功能"
    echo "3. 检查 Remove.bg API 使用情况"
    echo ""
    echo "🔧 故障排除:"
    echo "- 查看 Cloudflare Dashboard 日志"
    echo "- 检查环境变量配置"
    echo "- 验证 Remove.bg API 密钥"
    echo ""
    echo "📞 支持:"
    echo "- GitHub Issues: https://github.com/crstalhelen527/image-background-remover/issues"
    echo "- Cloudflare 文档: https://developers.cloudflare.com/pages/"
    echo ""
    echo "🌐 预计访问地址:"
    echo "https://image-background-remover.pages.dev"
}

# 运行主函数
main "$@"