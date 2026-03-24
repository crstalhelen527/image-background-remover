#!/bin/bash

echo "🔍 QuickBG 健康检查"

# 检查必要文件
echo "\n📁 文件检查:"
files=("package.json" "public/index.html" "worker/index.js" ".env" "wrangler.toml")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file"
    fi
done

# 检查环境变量
echo "\n🔧 环境变量检查:"
if [ -f .env ]; then
    source .env
    if [ -n "$REMOVEBG_API_KEY" ]; then
        echo "  ✅ REMOVEBG_API_KEY: 已设置 (${REMOVEBG_API_KEY:0:10}...)"
    else
        echo "  ❌ REMOVEBG_API_KEY: 未设置"
    fi
    
    if [ -n "$ALLOWED_ORIGINS" ]; then
        echo "  ✅ ALLOWED_ORIGINS: $ALLOWED_ORIGINS"
    else
        echo "  ❌ ALLOWED_ORIGINS: 未设置"
    fi
else
    echo "  ❌ .env文件不存在"
fi

# 检查依赖
echo "\n📦 依赖检查:"
if [ -d "node_modules" ]; then
    echo "  ✅ node_modules目录存在"
else
    echo "  ❌ node_modules目录不存在"
fi

# 检查端口占用
echo "\n🔌 端口检查:"
if command -v lsof &> /dev/null; then
    if lsof -i:8787 > /dev/null 2>&1; then
        echo "  ⚠️  端口8787已被占用"
    else
        echo "  ✅ 端口8787可用"
    fi
else
    echo "  ℹ️  跳过端口检查 (lsof未安装)"
fi

echo "\n🎯 启动命令:"
echo "  ./start-dev.sh    # 启动开发服务器"
echo "  npm test          # 运行测试"
echo "  npm run deploy    # 部署到Cloudflare"

echo "\n✅ 健康检查完成"
