#!/bin/bash

# 通过SSH部署到GitHub，触发Cloudflare Pages自动部署

echo "🚀 通过SSH部署图片背景去除工具修复版..."
echo "=========================================="

# 设置变量
REPO_URL="git@github.com:crstalhelen527/image-background-remover.git"
BRANCH="main"
DEPLOY_DIR="/tmp/image-bg-deploy-1775729216"

echo "📦 仓库: $REPO_URL"
echo "🌿 分支: $BRANCH"
echo "📁 源文件: $DEPLOY_DIR"

# 创建临时工作目录
WORK_DIR="/tmp/deploy-work-$(date +%s)"
echo "📥 创建工作目录: $WORK_DIR"
mkdir -p "$WORK_DIR"
cd "$WORK_DIR"

# 克隆仓库
echo "📥 克隆仓库..."
git clone "$REPO_URL" .
if [ $? -ne 0 ]; then
    echo "❌ 克隆仓库失败"
    exit 1
fi

# 配置git
echo "⚙️ 配置Git..."
git config user.name "OpenClaw Deploy Bot"
git config user.email "deploy@openclaw.ai"

# 备份原有文件
echo "💾 备份原有文件..."
BACKUP_DIR="backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r * "$BACKUP_DIR"/ 2>/dev/null || true

# 清空目录（保留.git）
echo "🧹 清理目录..."
find . -maxdepth 1 ! -name '.git' ! -name '.' ! -name "$BACKUP_DIR" -exec rm -rf {} + 2>/dev/null || true

# 复制修复文件
echo "📄 复制修复文件..."
cp -r "$DEPLOY_DIR"/* .

# 检查文件
echo "🔍 检查部署文件..."
echo "文件列表:"
ls -la
echo ""
echo "index.html 大小: $(stat -c%s index.html) 字节"
echo "README.md 内容:"
head -5 README.md

# 提交更改
echo "📝 提交更改..."
git add .
git status

COMMIT_MESSAGE="🚀 重新部署修复版本 v1.2

修复内容:
✅ Google登录功能（模拟）
✅ 用户体系实现  
✅ 额度管理系统
✅ 图片处理流程
✅ 响应式设计
✅ 错误处理

问题修复:
- 修复了 /src/auth.js 不存在导致的功能失效
- 实现了完整的用户认证系统
- 添加了额度管理和使用跟踪
- 完善了图片处理流程

技术改进:
- 纯HTML/CSS/JavaScript实现
- 无外部依赖
- 本地存储持久化
- 完整的错误处理

部署时间: $(date '+%Y-%m-%d %H:%M:%S')
部署方式: SSH自动部署"

git commit -m "$COMMIT_MESSAGE"

# 推送到GitHub
echo "📤 推送到GitHub..."
git push origin "$BRANCH"

if [ $? -eq 0 ]; then
    echo "✅ GitHub推送成功!"
    
    # 等待Cloudflare Pages检测更改
    echo "⏳ 等待Cloudflare Pages检测更改..."
    echo "   通常需要1-3分钟开始部署"
    
    # 显示部署信息
    echo ""
    echo "🎉 部署流程已启动!"
    echo "=========================================="
    echo "📋 部署信息:"
    echo "   仓库: https://github.com/crstalhelen527/image-background-remover"
    echo "   提交: $(git log --oneline -1)"
    echo "   文件: index.html ($(stat -c%s index.html) 字节)"
    echo "   时间: $(date)"
    echo ""
    echo "🌐 网站信息:"
    echo "   测试链接: https://2c6f8ee9.image-bg-remover-5qt.pages.dev"
    echo "   预计可用: 2-5分钟后"
    echo ""
    echo "🧪 测试步骤:"
    echo "   1. 等待几分钟让Cloudflare Pages完成部署"
    echo "   2. 访问测试链接"
    echo "   3. 点击'使用Google登录'（模拟）"
    echo "   4. 输入测试信息"
    echo "   5. 测试图片处理功能"
    echo "   6. 验证所有功能正常"
    echo ""
    echo "🔍 监控部署:"
    echo "   1. GitHub仓库查看最新提交"
    echo "   2. Cloudflare Dashboard查看部署状态"
    echo "   3. 访问网站测试功能"
    echo ""
    echo "⚠️  注意事项:"
    echo "   - 这是模拟版本，实际图片处理需要集成Remove.bg API"
    echo "   - Google登录是模拟的，真实登录需要配置OAuth"
    echo "   - 部署后可能需要清除浏览器缓存 (Ctrl+F5)"
    
    # 创建部署报告
    cat > "$DEPLOY_DIR/deploy-report.md" << EOF
# 部署报告 - 图片背景去除工具

## 部署状态
- **状态**: ✅ 成功推送到GitHub
- **时间**: $(date)
- **方式**: SSH自动部署
- **触发**: Cloudflare Pages自动部署

## 部署内容
- **主文件**: index.html ($(stat -c%s index.html) 字节)
- **版本**: v1.2 (重新部署修复版)
- **提交**: $(git log --oneline -1 | cut -d' ' -f2-)

## 修复内容
✅ Google登录功能（模拟）
✅ 用户体系实现
✅ 额度管理系统  
✅ 图片处理流程
✅ 响应式设计
✅ 错误处理

## 测试信息
- **测试链接**: https://2c6f8ee9.image-bg-remover-5qt.pages.dev
- **预计可用**: $(date -d '+3 minutes' '+%H:%M:%S')
- **测试步骤**: 见部署脚本输出

## 后续步骤
1. 等待Cloudflare Pages完成部署
2. 访问测试链接验证功能
3. 如有问题，查看浏览器控制台错误
4. 清除浏览器缓存后重试

## 技术说明
- 纯HTML/CSS/JavaScript实现
- 无外部依赖
- 本地存储用户数据
- 模拟API调用

---
*部署完成时间: $(date)*
EOF
    
    echo "📄 部署报告已保存: $DEPLOY_DIR/deploy-report.md"
    
else
    echo "❌ GitHub推送失败"
    echo "请检查:"
    echo "1. SSH密钥权限"
    echo "2. 网络连接"
    echo "3. 仓库访问权限"
fi

# 清理
echo "🧹 清理工作目录..."
cd /
rm -rf "$WORK_DIR"

echo ""
echo "=========================================="
echo "🚀 部署流程执行完成!"
echo "   结束时间: $(date)"