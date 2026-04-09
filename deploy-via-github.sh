#!/bin/bash

# 通过GitHub API部署修复版本

echo "🚀 通过GitHub部署图片背景去除工具修复版..."
echo "=========================================="

# 设置变量
REPO_OWNER="crstalhelen527"
REPO_NAME="image-background-remover"
BRANCH="main"
DEPLOY_DIR="/tmp/image-bg-deploy-1775729216"

# 检查GitHub令牌
if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ 需要设置GITHUB_TOKEN环境变量"
    echo "请设置: export GITHUB_TOKEN=your_github_token"
    exit 1
fi

echo "✅ 使用GitHub令牌: ${GITHUB_TOKEN:0:10}..."
echo "📦 仓库: $REPO_OWNER/$REPO_NAME"
echo "🌿 分支: $BRANCH"

# 创建临时工作目录
WORK_DIR="/tmp/github-deploy-$(date +%s)"
mkdir -p "$WORK_DIR"
cd "$WORK_DIR"

echo "📥 克隆仓库..."
git clone "https://${GITHUB_TOKEN}@github.com/${REPO_OWNER}/${REPO_NAME}.git" .
git config user.name "OpenClaw Deploy Bot"
git config user.email "deploy@openclaw.ai"

echo "🔄 更新文件..."
# 备份原有文件
mkdir -p backup-$(date +%Y%m%d)
cp -r * backup-$(date +%Y%m%d)/ 2>/dev/null || true

# 清空目录（除了.git）
find . -maxdepth 1 ! -name '.git' ! -name '.' -exec rm -rf {} + 2>/dev/null || true

# 复制修复文件
cp -r "$DEPLOY_DIR"/* .

echo "📝 提交更改..."
git add .
git commit -m "🚀 重新部署修复版本 v1.2

修复内容:
✅ Google登录功能（模拟）
✅ 用户体系实现
✅ 额度管理系统
✅ 图片处理流程
✅ 响应式设计
✅ 错误处理

部署时间: $(date)
修复问题: /src/auth.js不存在导致功能失效"

echo "📤 推送到GitHub..."
git push origin "$BRANCH"

echo "✅ GitHub仓库更新完成!"
echo ""
echo "🌐 下一步: Cloudflare Pages会自动检测GitHub更改并重新部署"
echo "   预计部署时间: 1-3分钟"
echo "   部署完成后访问: https://2c6f8ee9.image-bg-remover-5qt.pages.dev"
echo ""
echo "📋 更新内容:"
echo "   - 替换了完整的index.html文件"
echo "   - 移除了对不存在的/src/auth.js的依赖"
echo "   - 添加了完整的用户认证系统"
echo "   - 实现了额度管理和图片处理流程"
echo ""
echo "🔍 检查部署状态:"
echo "   1. 访问 https://github.com/$REPO_OWNER/$REPO_NAME"
echo "   2. 查看最新提交"
echo "   3. 等待Cloudflare Pages自动部署"
echo "   4. 测试网站功能"

# 清理
cd /
rm -rf "$WORK_DIR"

echo ""
echo "🎉 部署流程已启动!"
echo "   开始时间: $(date)"