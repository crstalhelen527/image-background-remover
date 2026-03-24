/**
 * 测试Remove.bg API密钥有效性
 */

require('dotenv').config();

const API_KEY = process.env.REMOVEBG_API_KEY;

if (!API_KEY) {
    console.error('❌ 错误: 未设置REMOVEBG_API_KEY环境变量');
    process.exit(1);
}

console.log('🔍 测试Remove.bg API密钥有效性');
console.log(`🔑 API密钥: ${API_KEY.substring(0, 10)}... (${API_KEY.length} 字符)`);

// 测试API密钥格式
console.log('\n🧪 测试API密钥格式:');
if (API_KEY.length === 24) {
    console.log('✅ 密钥长度正确 (24字符)');
} else {
    console.log(`⚠️  密钥长度异常: ${API_KEY.length} 字符 (通常为24字符)`);
}

// 检查密钥字符
const validChars = /^[A-Za-z0-9]+$/;
if (validChars.test(API_KEY)) {
    console.log('✅ 密钥字符有效 (仅包含字母和数字)');
} else {
    console.log('❌ 密钥包含无效字符');
}

// 简单测试API端点
console.log('\n🧪 测试API端点连接...');

async function testAPIKey() {
    try {
        // 尝试获取API信息（有些API提供验证端点）
        const response = await fetch('https://api.remove.bg/v1.0/account', {
            method: 'GET',
            headers: {
                'X-Api-Key': API_KEY,
                'Accept': 'application/json'
            }
        });
        
        console.log(`📊 响应状态: ${response.status} ${response.statusText}`);
        
        if (response.status === 200) {
            console.log('✅ API密钥有效！可以访问账户信息');
            try {
                const data = await response.json();
                console.log('📋 账户信息:');
                console.log(`   邮箱: ${data.data.email || '未知'}`);
                console.log(`   额度: ${data.data.credits.total || '未知'}`);
                console.log(`   已用: ${data.data.credits.used || '未知'}`);
                console.log(`   剩余: ${data.data.credits.remaining || '未知'}`);
            } catch (e) {
                console.log('✅ API密钥有效，但无法解析账户信息');
            }
        } else if (response.status === 401) {
            console.log('❌ API密钥无效或已过期');
        } else if (response.status === 403) {
            console.log('❌ API密钥权限不足');
        } else if (response.status === 404) {
            console.log('ℹ️  账户端点不存在，但密钥可能仍然有效');
            console.log('💡 尝试使用图片处理测试...');
            await testWithImage();
        } else {
            console.log(`ℹ️  未知响应: ${response.status}`);
            console.log('💡 尝试使用图片处理测试...');
            await testWithImage();
        }
        
    } catch (error) {
        console.error('❌ 网络错误:', error.message);
        console.log('💡 可能的原因:');
        console.log('   • 网络连接问题');
        console.log('   • Remove.bg API服务暂时不可用');
        console.log('   • API端点不存在');
    }
}

async function testWithImage() {
    console.log('\n🧪 使用有效图片测试API...');
    
    // 使用一个有效的测试图片（更大的PNG）
    // 这是一个4x4像素的简单PNG
    const validTestImage = 'iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQIW2NkYGD4z8DAwMgABXAGBgYGBgYGBgYGBgYGBgYAeQ0CAK0mK6EAAAAASUVORK5CYII=';
    
    try {
        const response = await fetch('https://api.remove.bg/v1.0/removebg', {
            method: 'POST',
            headers: {
                'X-Api-Key': API_KEY,
                'Content-Type': 'application/json',
                'Accept': 'image/png'
            },
            body: JSON.stringify({
                image_file_b64: validTestImage,
                size: 'auto',
                format: 'png'
            })
        });
        
        console.log(`📊 图片处理响应: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
            console.log('✅ API密钥有效！可以处理图片');
            console.log('💡 注意: 这次测试会消耗1个免费额度');
        } else if (response.status === 400) {
            const errorText = await response.text();
            console.log(`❌ 请求错误: ${errorText.substring(0, 100)}...`);
            
            if (errorText.includes('invalid_api_key') || errorText.includes('Unauthorized')) {
                console.log('❌ API密钥无效');
            } else if (errorText.includes('credits')) {
                console.log('❌ 免费额度已用完');
            } else {
                console.log('ℹ️  可能是图片参数问题，但API密钥可能有效');
            }
        } else if (response.status === 401 || response.status === 403) {
            console.log('❌ API密钥无效或权限不足');
        } else {
            console.log(`ℹ️  其他错误: ${response.status}`);
        }
        
    } catch (error) {
        console.error('❌ 测试失败:', error.message);
    }
}

// 运行测试
testAPIKey().then(() => {
    console.log('\n🎯 总结:');
    console.log('1. 如果API密钥无效，需要获取新的API密钥');
    console.log('2. 访问 https://www.remove.bg/api 获取API密钥');
    console.log('3. 免费账户每月有50张图片额度');
    console.log('4. 确保API密钥格式正确 (24位字母数字)');
});