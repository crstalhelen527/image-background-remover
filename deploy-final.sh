#!/bin/bash

# QuickBG Cloudflare Pages 最终部署脚本
# GitHub: crstalhelen527/image-background-remover
# Cloudflare Account ID: da9508a0610236e7085687e13c88bf59

set -e  # 遇到错误时退出

echo "🚀 QuickBG Cloudflare Pages 最终部署"
echo "======================================"
echo "GitHub: crstalhelen527/image-background-remover"
echo "Cloudflare Account: da9508a0610236e7085687e13c88bf59"
echo ""

# 检查环境变量
echo "🔐 检查环境变量..."
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "❌ CLOUDFLARE_API_TOKEN 未设置"
    echo "💡 请设置环境变量:"
    echo "   export CLOUDFLARE_API_TOKEN='cfat_wDQfWeUKHTPIubYWSAg5MkHzqOWYMtrxY30ImW7P774c7618'"
    exit 1
else
    echo "✅ CLOUDFLARE_API_TOKEN 已设置"
fi

if [ -z "$REMOVEBG_API_KEY" ]; then
    echo "❌ REMOVEBG_API_KEY 未设置"
    echo "💡 请设置环境变量:"
    echo "   export REMOVEBG_API_KEY='j7NDKynS79NQ3dsJp3sgAvy4'"
    exit 1
else
    echo "✅ REMOVEBG_API_KEY 已设置"
fi

# 初始化 Git 仓库
echo ""
echo "📦 初始化 Git 仓库..."
if [ ! -d ".git" ]; then
    git init
    git add .
    git commit -m "feat: Add QuickBG project with Cloudflare Pages deployment"
    echo "✅ Git 仓库初始化完成"
else
    echo "✅ Git 仓库已存在"
fi

# 设置 Git 远程仓库
echo ""
echo "🔗 设置 GitHub 远程仓库..."
GIT_REMOTE="https://github.com/crstalhelen527/image-background-remover.git"
if git remote | grep -q "origin"; then
    git remote set-url origin $GIT_REMOTE
    echo "✅ 更新远程仓库地址"
else
    git remote add origin $GIT_REMOTE
    echo "✅ 添加远程仓库"
fi

# 推送到 GitHub
echo ""
echo "📤 推送到 GitHub..."
git branch -M main
git push -u origin main || {
    echo "⚠️  推送失败，可能是仓库不存在或权限问题"
    echo "💡 请先在 GitHub 创建仓库:"
    echo "   https://github.com/new"
    echo "   仓库名: image-background-remover"
    echo "   描述: Quick Background Remover"
    echo "   公开仓库"
    echo ""
    read -p "创建仓库后按回车继续..." -n 1
    git push -u origin main
}

echo "✅ 代码已推送到 GitHub"

# 安装依赖
echo ""
echo "📦 安装项目依赖..."
npm ci --silent
echo "✅ 依赖安装完成"

# 构建项目
echo ""
echo "🏗️  构建项目..."
npm run build
echo "✅ 项目构建完成"

# 登录 Cloudflare
echo ""
echo "🔑 登录 Cloudflare..."
if ! wrangler whoami &>/dev/null; then
    echo "📝 需要登录 Cloudflare..."
    wrangler login
fi
echo "✅ Cloudflare 登录状态正常"

# 部署到 Cloudflare Pages
echo ""
echo "🚀 部署到 Cloudflare Pages..."
echo "   项目: quickbg"
echo "   账户: da9508a0610236e7085687e13c88bf59"
echo "   GitHub: crstalhelen527/image-background-remover"

# 执行部署
DEPLOY_OUTPUT=$(wrangler pages deploy ./public \
    --project-name=quickbg \
    --branch=main \
    --commit-hash=$(git rev-parse --short HEAD) \
    --commit-message="Deploy to Cloudflare Pages" \
    2>&1)

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 部署成功!"
    echo ""
    echo "🔗 访问地址:"
    echo "   https://quickbg.pages.dev"
    echo ""
    echo "🧪 测试链接:"
    echo "   健康检查: https://quickbg.pages.dev/health"
    echo "   API端点: https://quickbg.pages.dev/api/remove-bg"
    echo "   主页面: https://quickbg.pages.dev"
    echo ""
    echo "📊 管理面板:"
    echo "   https://dash.cloudflare.com/da9508a0610236e7085687e13c88bf59/pages/view/quickbg"
    echo ""
    echo "💡 下一步:"
    echo "   1. 在 Cloudflare Dashboard 中配置环境变量"
    echo "   2. 测试 API 功能"
    echo "   3. 访问 https://quickbg.pages.dev 使用应用"
else
    echo "❌ 部署失败"
    echo "错误信息:"
    echo "$DEPLOY_OUTPUT"
    echo ""
    echo "💡 解决方案:"
    echo "   1. 检查 Cloudflare API Token 权限"
    echo "   2. 确认账户绑定状态"
    echo "   3. 手动部署: 访问 Cloudflare Dashboard → Pages → Connect to Git"
    exit 1
fi

echo ""
echo "✅ 部署脚本完成!"
echo ""
echo "📝 总结:"
echo "   GitHub仓库: https://github.com/crstalhelen527/image-background-remover"
echo "   Cloudflare项目: https://quickbg.pages.dev"
echo "   账户ID: da9508a0610236e7085687e13c88bf59"