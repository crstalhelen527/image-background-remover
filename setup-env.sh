#!/bin/bash

# QuickBG 环境配置脚本
echo "🚀 QuickBG 环境配置开始"

# 检查是否提供了API密钥
if [ -z "$1" ]; then
    echo "❌ 错误: 请提供Remove.bg API密钥"
    echo "用法: ./setup-env.sh YOUR_API_KEY"
    echo "示例: ./setup-env.sh abc123def456ghi789"
    exit 1
fi

API_KEY="$1"
echo "✅ 使用API密钥: ${API_KEY:0:10}..."

# 1. 创建.env文件
echo "📝 创建环境配置文件..."
cat > .env << EOF
# QuickBG 环境配置
REMOVEBG_API_KEY=$API_KEY
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8787
NODE_ENV=development
EOF

echo "✅ .env文件创建完成"

# 2. 检查项目依赖
echo "📦 检查项目依赖..."
if [ ! -d "node_modules" ]; then
    echo "正在安装依赖..."
    npm install
else
    echo "依赖已安装"
fi

# 3. 设置wrangler配置
echo "⚙️  配置wrangler..."
if command -v wrangler &> /dev/null; then
    echo "wrangler已安装"
else
    echo "安装wrangler..."
    npm install -g wrangler
fi

# 4. 创建测试脚本
echo "🧪 创建测试脚本..."
cat > test-api.js << 'EOF'
// Remove.bg API测试脚本
const API_KEY = process.env.REMOVEBG_API_KEY;

if (!API_KEY) {
    console.error('❌ 错误: 未设置REMOVEBG_API_KEY环境变量');
    process.exit(1);
}

console.log('✅ API密钥已配置');
console.log(`密钥长度: ${API_KEY.length} 字符`);
console.log(`密钥前缀: ${API_KEY.substring(0, 10)}...`);

// 测试API密钥格式
if (API_KEY.length < 20) {
    console.warn('⚠️  API密钥可能过短，请检查是否正确');
}

console.log('\n🎯 测试步骤:');
console.log('1. 启动开发服务器: npm run dev');
console.log('2. 访问: http://localhost:8787');
console.log('3. 上传测试图片进行背景去除');
console.log('4. 检查处理结果');

console.log('\n📊 环境检查完成！');
EOF

chmod +x test-api.js

# 5. 创建启动脚本
echo "🚀 创建启动脚本..."
cat > start-dev.sh << 'EOF'
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
EOF

chmod +x start-dev.sh

# 6. 创建健康检查脚本
echo "🏥 创建健康检查脚本..."
cat > health-check.sh << 'EOF'
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
EOF

chmod +x health-check.sh

echo "\n🎉 环境配置完成！"
echo "\n📋 可用命令:"
echo "  ./health-check.sh    # 检查配置状态"
echo "  ./start-dev.sh       # 启动开发服务器"
echo "  node test-api.js     # 测试API配置"
echo "\n🚀 下一步:"
echo "  1. 运行: ./health-check.sh 检查配置"
echo "  2. 运行: ./start-dev.sh 启动服务器"
echo "  3. 访问: http://localhost:8787 测试功能"

# 设置文件权限
chmod +x setup-env.sh