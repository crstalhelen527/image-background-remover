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
