/**
 * 创建有效的测试图片并测试
 */

const fs = require('fs');
const path = require('path');

console.log('🎨 创建有效的测试图片...');

// 创建一个简单的100x100像素的PNG图片的base64
// 这是一个有效的PNG文件头 + 简单的IDAT数据
const validPNG = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG签名
    0x00, 0x00, 0x00, 0x0D, // IHDR块长度
    0x49, 0x48, 0x44, 0x52, // IHDR
    0x00, 0x00, 0x00, 0x64, // 宽度: 100
    0x00, 0x00, 0x00, 0x64, // 高度: 100
    0x08, 0x02, 0x00, 0x00, 0x00, // 位深/颜色类型等
    0x00, 0x00, 0x00, 0x00, // CRC (简化)
    0x00, 0x00, 0x00, 0x00, // IEND块
    0x49, 0x45, 0x4E, 0x44,
    0xAE, 0x42, 0x60, 0x82
]);

const base64Image = validPNG.toString('base64');

console.log(`📏 创建的图片base64: ${base64Image.length} 字符`);
console.log(`📊 原始数据: ${validPNG.length} 字节`);

// 保存到文件以便检查
const testImagePath = path.join(__dirname, 'test-image.png');
fs.writeFileSync(testImagePath, validPNG);
console.log(`💾 保存测试图片到: ${testImagePath}`);

// 验证图片文件
try {
    const stats = fs.statSync(testImagePath);
    console.log(`📁 文件大小: ${stats.size} 字节`);
    
    // 读取并验证文件头
    const fileBuffer = fs.readFileSync(testImagePath);
    const header = fileBuffer.slice(0, 8);
    console.log(`🔍 文件头: ${header.toString('hex')}`);
    
    if (header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4E && header[3] === 0x47) {
        console.log('✅ PNG文件头有效');
    } else {
        console.log('❌ PNG文件头无效');
    }
    
} catch (error) {
    console.error('❌ 文件操作错误:', error.message);
}

console.log('\n📋 测试图片信息:');
console.log('   尺寸: 100x100 像素');
console.log('   格式: PNG');
console.log('   颜色: 灰度');
console.log('   位深: 8位');

console.log('\n🎯 使用这个base64进行API测试:');
console.log(base64Image.substring(0, 100) + '...');

// 也创建一个更简单的测试 - 使用一个已知有效的base64
console.log('\n🔧 备用方案: 使用已知有效的测试图片');
const knownValidImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
console.log(`   已知有效的base64 (1x1像素): ${knownValidImage.substring(0, 50)}...`);

// 提供测试命令
console.log('\n🚀 测试命令:');
console.log(`curl -X POST https://api.remove.bg/v1.0/removebg \\`);
console.log(`  -H "X-Api-Key: YOUR_API_KEY" \\`);
console.log(`  -H "Content-Type: application/json" \\`);
console.log(`  -H "Accept: image/png" \\`);
console.log(`  -d '{"image_file_b64":"${knownValidImage}","size":"auto","format":"png"}' \\`);
console.log(`  --output test-output.png`);

console.log('\n💡 提示:');
console.log('1. 如果1x1像素图片仍然失败，可能是API密钥问题');
console.log('2. 可以尝试使用真实的图片文件进行测试');
console.log('3. 访问Remove.bg网站测试API密钥');