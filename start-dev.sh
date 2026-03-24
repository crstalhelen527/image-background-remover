#!/bin/bash

echo "🚀 启动QuickBG开发服务器..."

# 加载环境变量
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo "✅ 环境变量已加载"
else
    echo "❌ 错误: .env文件不存在"
    echo "请先运行: ./setup-env.sh YOUR_API_KEY"
    exit 1
fi

# 检查API密钥
if [ -z "$REMOVEBG_API_KEY" ]; then
    echo "❌ 错误: REMOVEBG_API_KEY未设置"
    exit 1
fi

echo "🔑 API密钥: ${REMOVEBG_API_KEY:0:10}..."
echo "🌐 允许的源: $ALLOWED_ORIGINS"

# 启动开发服务器
echo "\n启动开发服务器..."
npm run dev
