/**
 * 测试Remove.bg API连接和密钥有效性
 */

require('dotenv').config();

const API_KEY = process.env.REMOVEBG_API_KEY;

if (!API_KEY) {
    console.error('❌ 错误: 未设置REMOVEBG_API_KEY环境变量');
    process.exit(1);
}

console.log('🔍 测试Remove.bg API连接');
console.log(`🔑 API密钥: ${API_KEY.substring(0, 10)}... (${API_KEY.length} 字符)`);

// 创建一个很小的测试图片base64 (1x1像素的透明PNG)
const testImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

console.log('\n🧪 测试1: 直接调用Remove.bg API...');

async function testRemoveBgAPI() {
    try {
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
            console.log('✅ API密钥有效！');
            console.log(`📏 响应头:`);
            response.headers.forEach((value, key) => {
                console.log(`   ${key}: ${value}`);
            });
            
            // 检查额度信息
            const creditsCharged = response.headers.get('X-Credits-Charged');
            const width = response.headers.get('X-Width');
            const height = response.headers.get('X-Height');
            
            console.log(`\n💰 额度消耗: ${creditsCharged || '1'} 张`);
            console.log(`📐 图片尺寸: ${width || '未知'}x${height || '未知'}`);
            
            // 获取图片数据
            const imageBuffer = await response.arrayBuffer();
            console.log(`🖼️  图片大小: ${imageBuffer.byteLength} 字节`);
            
            if (imageBuffer.byteLength > 100) {
                console.log('✅ 成功获取处理后的图片');
            } else {
                console.warn('⚠️  图片数据可能过小');
            }
            
        } else {
            console.error('❌ API请求失败');
            
            if (response.status === 400) {
                console.log('💡 可能的原因:');
                console.log('   • API密钥无效或已过期');
                console.log('   • 请求参数错误');
                console.log('   • 图片格式不支持');
            } else if (response.status === 402) {
                console.log('💡 免费额度已用完');
            } else if (response.status === 429) {
                console.log('💡 请求频率过高');
            }
            
            // 尝试获取错误信息
            try {
                const errorText = await response.text();
                console.log(`📝 错误响应: ${errorText.substring(0, 200)}...`);
            } catch (e) {
                console.log('无法读取错误响应');
            }
        }
        
    } catch (error) {
        console.error('❌ 网络错误:', error.message);
        console.log('💡 可能的原因:');
        console.log('   • 网络连接问题');
        console.log('   • Remove.bg API服务暂时不可用');
        console.log('   • DNS解析问题');
    }
}

// 运行测试
testRemoveBgAPI().then(() => {
    console.log('\n🎯 下一步:');
    console.log('1. 如果API密钥无效，请获取新的API密钥');
    console.log('2. 如果免费额度用完，请等待下个月或购买额度');
    console.log('3. 如果网络有问题，请检查网络连接');
    console.log('\n🔗 Remove.bg API控制台: https://www.remove.bg/api');
});