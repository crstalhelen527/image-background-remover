/**
 * 最简单的Remove.bg API测试
 * 直接测试API密钥和连接
 */

require('dotenv').config();

const API_KEY = process.env.REMOVEBG_API_KEY;

console.log('🔍 最简单的Remove.bg API测试');
console.log(`🔑 API密钥: ${API_KEY ? API_KEY.substring(0, 10) + '...' : '未设置'}`);

if (!API_KEY) {
    console.error('❌ 错误: 未设置REMOVEBG_API_KEY环境变量');
    console.log('💡 请在项目根目录创建.env文件:');
    console.log('   REMOVEBG_API_KEY=你的API密钥');
    process.exit(1);
}

// 使用一个有效的测试图片 (100x100像素的简单图片)
const testImage = 'iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAgSURBVHgB7cEBAQAAAIIg/69uSEABAAAAAAAAAAAAAAAAAAAAAADgAAGQAAEAAABkAAAA';

console.log('\n🧪 测试1: 验证API密钥格式');
console.log(`   密钥长度: ${API_KEY.length} 字符`);
console.log(`   密钥格式: ${/^[A-Za-z0-9]+$/.test(API_KEY) ? '有效' : '无效'}`);

console.log('\n🧪 测试2: 直接调用Remove.bg API');

async function testDirectAPI() {
    try {
        console.log('🌐 发送请求到Remove.bg API...');
        
        const response = await fetch('https://api.remove.bg/v1.0/removebg', {
            method: 'POST',
            headers: {
                'X-Api-Key': API_KEY,
                'Content-Type': 'application/json',
                'Accept': 'image/png'
            },
            body: JSON.stringify({
                image_file_b64: testImage,
                size: 'auto',
                format: 'png'
            })
        });
        
        console.log(`📊 响应状态: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
            console.log('✅ API调用成功！');
            console.log('📋 响应头信息:');
            
            // 显示重要的响应头
            const headers = [
                'X-Credits-Charged',
                'X-Width', 
                'X-Height',
                'Content-Type',
                'Content-Length'
            ];
            
            headers.forEach(header => {
                const value = response.headers.get(header);
                if (value) {
                    console.log(`   ${header}: ${value}`);
                }
            });
            
            // 获取图片数据
            const imageData = await response.arrayBuffer();
            console.log(`🖼️  图片数据大小: ${imageData.byteLength} 字节`);
            
            if (imageData.byteLength > 1000) {
                console.log('✅ 成功获取有效的图片数据');
                console.log('💡 这次测试消耗了1个免费额度');
            } else {
                console.warn('⚠️  图片数据可能过小');
            }
            
            return true;
            
        } else {
            console.error('❌ API请求失败');
            
            // 尝试获取错误详情
            try {
                const errorText = await response.text();
                console.log(`📝 错误详情: ${errorText.substring(0, 200)}...`);
                
                if (errorText.includes('invalid') || errorText.includes('Invalid')) {
                    console.log('❌ API密钥可能无效');
                } else if (errorText.includes('credit') || errorText.includes('quota')) {
                    console.log('❌ 免费额度可能已用完');
                } else if (errorText.includes('size') || errorText.includes('dimension')) {
                    console.log('❌ 图片尺寸可能有问题');
                }
                
            } catch (e) {
                console.log('无法读取错误响应');
            }
            
            return false;
        }
        
    } catch (error) {
        console.error('❌ 网络错误:', error.message);
        console.log('💡 可能的原因:');
        console.log('   • 网络连接问题');
        console.log('   • Remove.bg API服务暂时不可用');
        console.log('   • 防火墙或代理设置');
        return false;
    }
}

// 运行测试
testDirectAPI().then(success => {
    console.log('\n🎯 测试结果:');
    if (success) {
        console.log('✅ 所有测试通过！');
        console.log('\n📋 下一步:');
        console.log('1. 访问 http://localhost:8787/test 进行网页测试');
        console.log('2. 访问 http://localhost:8787 使用完整功能');
        console.log('3. 上传真实图片测试背景去除效果');
    } else {
        console.log('❌ 测试失败，需要检查问题');
        console.log('\n🔧 常见问题排查:');
        console.log('1. 检查API密钥是否正确');
        console.log('2. 访问 https://www.remove.bg/api 验证密钥');
        console.log('3. 检查网络连接');
        console.log('4. 确保免费额度还有剩余');
    }
    
    console.log('\n🔗 相关链接:');
    console.log('• Remove.bg API控制台: https://www.remove.bg/api');
    console.log('• API文档: https://www.remove.bg/api#remove-background');
    console.log('• 额度查询: 登录Remove.bg账户查看');
});