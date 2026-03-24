#!/bin/bash

# QuickBG Cloudflare Pages 一键部署脚本
# 需要: wrangler CLI, git, node.js

set -e  # 遇到错误时退出

echo "🚀 QuickBG Cloudflare Pages 部署脚本"
echo "======================================"

# 检查必要工具
check_tool() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ 未找到 $1，请先安装"
        exit 1
    fi
    echo "✅ $1 已安装"
}

echo "🔧 检查必要工具..."
check_tool node
check_tool npm
check_tool git

# 检查 wrangler
if ! command -v wrangler &> /dev/null; then
    echo "📦 安装 wrangler CLI..."
    npm install -g wrangler
    echo "✅ wrangler 安装完成"
else
    echo "✅ wrangler 已安装"
fi

# 设置变量
PROJECT_NAME="quickbg"
ACCOUNT_ID="da9508a0610236e7085687e13c88bf59"
BUILD_DIR="./public"
FUNCTIONS_DIR="./functions"

echo ""
echo "📋 部署配置:"
echo "   项目名称: $PROJECT_NAME"
echo "   Account ID: $ACCOUNT_ID"
echo "   构建目录: $BUILD_DIR"
echo "   Functions 目录: $FUNCTIONS_DIR"

# 检查环境变量
echo ""
echo "🔐 检查环境变量..."
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "⚠️  CLOUDFLARE_API_TOKEN 未设置"
    echo "💡 请设置环境变量:"
    echo "   export CLOUDFLARE_API_TOKEN='你的Cloudflare API Token'"
    read -p "是否继续? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ CLOUDFLARE_API_TOKEN 已设置"
fi

if [ -z "$REMOVEBG_API_KEY" ]; then
    echo "⚠️  REMOVEBG_API_KEY 未设置"
    echo "💡 请设置环境变量:"
    echo "   export REMOVEBG_API_KEY='你的Remove.bg API密钥'"
    read -p "是否继续? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ REMOVEBG_API_KEY 已设置"
fi

# 构建项目
echo ""
echo "🏗️  构建项目..."
if [ ! -d "$BUILD_DIR" ]; then
    echo "📁 创建构建目录..."
    mkdir -p $BUILD_DIR
fi

# 复制静态文件
echo "📄 复制静态文件..."
cp -r public/* $BUILD_DIR/ 2>/dev/null || echo "⚠️  无静态文件可复制"

# 复制配置文件
echo "⚙️  复制配置文件..."
cp _redirects $BUILD_DIR/ 2>/dev/null || echo "⚠️  无_redirects文件"
cp _routes.json $BUILD_DIR/ 2>/dev/null || echo "⚠️  无_routes.json文件"

# 安装依赖
echo "📦 安装依赖..."
npm ci --silent

# 运行构建脚本
echo "🔨 运行构建脚本..."
npm run build 2>/dev/null || echo "⚠️  构建脚本可能未定义，跳过"

# 登录 Cloudflare
echo ""
echo "🔑 登录 Cloudflare..."
wrangler whoami 2>/dev/null || {
    echo "📝 需要登录 Cloudflare..."
    wrangler login
}

# 部署到 Cloudflare Pages
echo ""
echo "🚀 部署到 Cloudflare Pages..."
echo "   项目: $PROJECT_NAME"
echo "   账户: $ACCOUNT_ID"

# 检查是否已存在项目
if wrangler pages project list | grep -q "$PROJECT_NAME"; then
    echo "📝 项目已存在，更新部署..."
    DEPLOY_CMD="wrangler pages deploy $BUILD_DIR \
        --project-name=$PROJECT_NAME \
        --branch=main"
else
    echo "🆕 创建新项目..."
    DEPLOY_CMD="wrangler pages deploy $BUILD_DIR \
        --project-name=$PROJECT_NAME \
        --production-branch=main"
fi

# 执行部署
echo "💻 执行部署命令..."
eval $DEPLOY_CMD

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 部署成功!"
    echo ""
    echo "🔗 访问地址:"
    echo "   https://$PROJECT_NAME.pages.dev"
    echo ""
    echo "🧪 测试链接:"
    echo "   健康检查: https://$PROJECT_NAME.pages.dev/health"
    echo "   API端点: https://$PROJECT_NAME.pages.dev/api/remove-bg"
    echo "   主页面: https://$PROJECT_NAME.pages.dev"
    echo ""
    echo "📊 管理面板:"
    echo "   https://dash.cloudflare.com/da9508a0610236e7085687e13c88bf59/pages/view/$PROJECT_NAME"
    echo ""
    echo "💡 下一步:"
    echo "   1. 在 Cloudflare Dashboard 中配置环境变量"
    echo "   2. 测试 API 功能"
    echo "   3. 配置自定义域名 (可选)"
else
    echo "❌ 部署失败"
    echo "💡 请检查:"
    echo "   1. Cloudflare API Token 权限"
    echo "   2. 账户绑定状态"
    echo "   3. 网络连接"
    exit 1
fi

echo ""
echo "✅ 部署脚本完成!"