#!/bin/bash

# 直接部署脚本 - 使用 API Token

set -e

echo "🚀 直接部署到 Cloudflare Pages"
echo "================================"

# 设置环境变量
export CLOUDFLARE_API_TOKEN="cfat_wDQfWeUKHTPIubYWSAg5MkHzqOWYMtrxY30ImW7P774c7618"
export REMOVEBG_API_KEY="j7NDKynS79NQ3dsJp3sgAvy4"

echo "🔐 环境变量已设置"
echo "   CLOUDFLARE_API_TOKEN: ${CLOUDFLARE_API_TOKEN:0:10}..."
echo "   REMOVEBG_API_KEY: ${REMOVEBG_API_KEY:0:10}..."

cd /root/.openclaw/agents/编程/workspace/projects/image-background-remover

# 1. 推送到 GitHub
echo ""
echo "1. 📤 推送到 GitHub..."
GIT_URL="https://crstalhelen527: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@github.com/crstalhelen527/image-background-remover.git"

# 确保远程仓库正确
git remote remove origin 2>/dev/null || true
git remote add origin $GIT_URL
git branch -M main

echo "   推送代码到 GitHub..."
git push -f origin main

if [ $? -eq 0 ]; then
    echo "   ✅ 代码推送成功"
else
    echo "   ❌ 推送失败，继续尝试部署"
fi

# 2. 构建项目
echo ""
echo "2. 🏗️  构建项目..."
npm ci --silent
npm run build
echo "   ✅ 项目构建完成"

# 3. 使用 curl 直接调用 Cloudflare Pages API
echo ""
echo "3. 🚀 调用 Cloudflare Pages API..."
echo "   账户ID: da9508a0610236e7085687e13c88bf59"
echo "   项目名: quickbg"

# 首先检查项目是否存在
echo "   检查项目状态..."
PROJECT_CHECK=$(curl -s -X GET \
  "https://api.cloudflare.com/client/v4/accounts/da9508a0610236e7085687e13c88bf59/pages/projects/quickbg" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json")

if echo "$PROJECT_CHECK" | grep -q '"success":true'; then
    echo "   ✅ 项目已存在"
    ACTION="更新部署"
else
    echo "   📝 项目不存在，将创建新项目"
    ACTION="创建部署"
fi

# 创建部署
echo "   开始部署..."
DEPLOY_RESULT=$(curl -s -X POST \
  "https://api.cloudflare.com/client/v4/accounts/da9508a0610236e7085687e13c88bf59/pages/projects/quickbg/deployments" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "branch": "main",
    "commit_hash": "'$(git rev-parse --short HEAD)'",
    "commit_message": "Deploy QuickBG via API",
    "build_config": {
      "build_command": "npm run build",
      "destination_dir": "./public",
      "root_dir": "/"
    }
  }')

echo "   部署请求已发送"

# 检查部署结果
if echo "$DEPLOY_RESULT" | grep -q '"success":true'; then
    echo "   ✅ 部署请求成功"
    
    # 提取部署信息
    DEPLOYMENT_ID=$(echo "$DEPLOY_RESULT" | python3 -c "import json,sys; data=json.load(sys.stdin); print(data.get('result', {}).get('id', ''))" 2>/dev/null || echo "")
    DEPLOYMENT_URL=$(echo "$DEPLOY_RESULT" | python3 -c "import json,sys; data=json.load(sys.stdin); print(data.get('result', {}).get('url', ''))" 2>/dev/null || echo "")
    
    if [ -n "$DEPLOYMENT_URL" ]; then
        echo ""
        echo "🎉 部署成功!"
        echo ""
        echo "🔗 部署信息:"
        echo "   部署ID: $DEPLOYMENT_ID"
        echo "   部署URL: $DEPLOYMENT_URL"
        echo "   生产环境: https://quickbg.pages.dev"
        echo ""
        echo "🧪 测试链接:"
        echo "   健康检查: https://quickbg.pages.dev/health"
        echo "   API端点: https://quickbg.pages.dev/api/remove-bg"
        echo "   主页面: https://quickbg.pages.dev"
    else
        echo "   ℹ️  部署已提交，请稍后检查状态"
        echo "   管理面板: https://dash.cloudflare.com/da9508a0610236e7085687e13c88bf59/pages"
    fi
else
    echo "   ❌ 部署请求失败"
    echo "   错误信息:"
    echo "$DEPLOY_RESULT" | python3 -m json.tool 2>/dev/null || echo "$DEPLOY_RESULT"
    echo ""
    echo "💡 建议:"
    echo "   1. 检查 Cloudflare API Token 权限"
    echo "   2. 访问 Cloudflare Dashboard 手动部署"
    echo "   3. 确保账户ID正确"
fi

echo ""
echo "✅ 部署流程完成"
echo ""
echo "📝 总结:"
echo "   GitHub: https://github.com/crstalhelen527/image-background-remover"
echo "   Cloudflare: https://dash.cloudflare.com/da9508a0610236e7085687e13c88bf59/pages"
echo "   访问地址: https://quickbg.pages.dev"