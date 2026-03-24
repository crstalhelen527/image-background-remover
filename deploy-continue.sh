#!/bin/bash

# 继续部署脚本 - 跳过用户交互

set -e

echo "🚀 继续 Cloudflare Pages 部署..."
echo "GitHub仓库已存在: crstalhelen527/image-background-remover"
echo ""

# 设置环境变量
export CLOUDFLARE_API_TOKEN="cfat_wDQfWeUKHTPIubYWSAg5MkHzqOWYMtrxY30ImW7P774c7618"
export REMOVEBG_API_KEY="j7NDKynS79NQ3dsJp3sgAvy4"

echo "🔐 环境变量已设置"
echo "✅ CLOUDFLARE_API_TOKEN: ${CLOUDFLARE_API_TOKEN:0:10}..."
echo "✅ REMOVEBG_API_KEY: ${REMOVEBG_API_KEY:0:10}..."

# 强制推送到 GitHub
echo ""
echo "📤 强制推送到 GitHub..."
cd /root/.openclaw/agents/编程/workspace/projects/image-background-remover

# 确保使用正确的远程仓库
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/crstalhelen527/image-background-remover.git

# 使用 GitHub Token 进行身份验证
git push -f https://crstalhelen527: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@github.com/crstalhelen527/image-background-remover.git main

if [ $? -eq 0 ]; then
    echo "✅ 代码已推送到 GitHub"
else
    echo "❌ 推送失败，尝试使用 SSH 方式..."
    git push -f git@github.com:crstalhelen527/image-background-remover.git main || {
        echo "❌ 推送失败，请手动推送"
        echo "💡 手动命令:"
        echo "   cd /root/.openclaw/agents/编程/workspace/projects/image-background-remover"
        echo "   git push -u origin main"
        exit 1
    }
fi

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

# 检查 wrangler 登录状态
echo ""
echo "🔑 检查 Cloudflare 登录状态..."
if ! wrangler whoami &>/dev/null; then
    echo "📝 需要登录 Cloudflare..."
    echo "💡 请手动运行: wrangler login"
    echo "   然后重新运行部署脚本"
    exit 1
fi
echo "✅ Cloudflare 登录状态正常"

# 部署到 Cloudflare Pages
echo ""
echo "🚀 部署到 Cloudflare Pages..."
echo "   项目: quickbg"
echo "   账户: da9508a0610236e7085687e13c88bf59"

# 执行部署
DEPLOY_OUTPUT=$(wrangler pages deploy ./public \
    --project-name=quickbg \
    --branch=main \
    --commit-hash=$(git rev-parse --short HEAD) \
    --commit-message="Deploy QuickBG to Cloudflare Pages" \
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
echo "✅ 部署完成!"