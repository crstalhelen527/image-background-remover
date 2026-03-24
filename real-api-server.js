/**
 * QuickBG 真实API服务器
 * 使用真实的Remove.bg API
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

// 加载环境变量
require('dotenv').config();

const PORT = 8787;
const API_KEY = process.env.REMOVEBG_API_KEY;

if (!API_KEY) {
    console.error('❌ 错误: 未设置REMOVEBG_API_KEY环境变量');
    process.exit(1);
}

console.log('🚀 QuickBG 真实API服务器启动');
console.log(`🔑 API密钥: ${API_KEY.substring(0, 10)}... (${API_KEY.length} 字符)`);
console.log(`📊 免费额度: 50张/月`);

// 创建HTTP服务器
const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // 处理OPTIONS请求
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // 健康检查端点
    if (url.pathname === '/health' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'ok',
            service: 'QuickBG Real API Server',
            timestamp: new Date().toISOString(),
            api_key_configured: true,
            api_key_prefix: API_KEY.substring(0, 10)
        }));
        return;
    }
    
    // API端点 - 真实Remove.bg API
    if (url.pathname === '/api/remove-bg' && req.method === 'POST') {
        console.log('📨 收到背景去除请求');
        
        try {
            // 读取请求体
            let body = '';
            req.on('data', chunk => body += chunk.toString());
            
            req.on('end', async () => {
                try {
                    const data = JSON.parse(body);
                    
                    if (!data.image) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            success: false,
                            error: 'Missing required field: image',
                            timestamp: new Date().toISOString()
                        }));
                        return;
                    }
                    
                    console.log('🔄 调用真实Remove.bg API...');
                    
                    // 调用真实的Remove.bg API
                    const removeBgResponse = await callRemoveBgAPI(data.image, {
                        size: data.size || 'auto',
                        format: data.format || 'png',
                        bg_color: data.bg_color,
                        bg_image_file_b64: data.bg_image_file_b64
                    });
                    
                    if (!removeBgResponse.ok) {
                        // 处理API错误
                        const errorText = await removeBgResponse.text();
                        console.error('Remove.bg API错误:', removeBgResponse.status, errorText);
                        
                        let errorMessage = 'Background removal failed';
                        if (removeBgResponse.status === 402) {
                            errorMessage = 'API credits exhausted (免费额度已用完)';
                        } else if (removeBgResponse.status === 429) {
                            errorMessage = 'Rate limit exceeded (请求频率过高)';
                        } else if (removeBgResponse.status === 400) {
                            errorMessage = 'Invalid request (请求参数错误)';
                        }
                        
                        res.writeHead(removeBgResponse.status, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            success: false,
                            error: errorMessage,
                            timestamp: new Date().toISOString()
                        }));
                        return;
                    }
                    
                    // 解析API响应
                    const result = await removeBgResponse.json();
                    
                    console.log('✅ Remove.bg API调用成功');
                    console.log(`   消耗额度: ${result.data.credits_charged || 1} 张`);
                    console.log(`   图片尺寸: ${result.data.result_width}x${result.data.result_height}`);
                    
                    // 返回成功响应
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        success: true,
                        data: result.data.result_b64,
                        credits_charged: result.data.credits_charged || 1,
                        width: result.data.result_width,
                        height: result.data.result_height,
                        timestamp: new Date().toISOString()
                    }));
                    
                } catch (error) {
                    console.error('❌ 请求处理错误:', error.message);
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        success: false,
                        error: 'Invalid JSON or request format',
                        timestamp: new Date().toISOString()
                    }));
                }
            });
            
        } catch (error) {
            console.error('❌ 服务器错误:', error.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                error: 'Internal server error',
                timestamp: new Date().toISOString()
            }));
        }
        return;
    }
    
    // 静态文件服务
    if (req.method === 'GET') {
        let filePath = url.pathname === '/' ? '/index.html' : url.pathname;
        filePath = path.join(__dirname, 'public', filePath);
        
        // 安全检查
        if (!filePath.startsWith(path.join(__dirname, 'public'))) {
            res.writeHead(403);
            res.end('Forbidden');
            return;
        }
        
        fs.readFile(filePath, (err, content) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    // 文件不存在，返回404或默认页面
                    if (url.pathname === '/') {
                        // 尝试返回index.html
                        fs.readFile(path.join(__dirname, 'public', 'index.html'), (err2, content2) => {
                            if (err2) {
                                res.writeHead(404);
                                res.end('File not found');
                            } else {
                                res.writeHead(200, { 'Content-Type': 'text/html' });
                                res.end(content2);
                            }
                        });
                    } else {
                        res.writeHead(404);
                        res.end('File not found');
                    }
                } else {
                    res.writeHead(500);
                    res.end('Server error');
                }
            } else {
                // 根据文件类型设置Content-Type
                const extname = path.extname(filePath);
                let contentType = 'text/html';
                
                switch (extname) {
                    case '.js':
                        contentType = 'text/javascript';
                        break;
                    case '.css':
                        contentType = 'text/css';
                        break;
                    case '.json':
                        contentType = 'application/json';
                        break;
                    case '.png':
                        contentType = 'image/png';
                        break;
                    case '.jpg':
                    case '.jpeg':
                        contentType = 'image/jpeg';
                        break;
                }
                
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content);
            }
        });
        return;
    }
    
    // 其他请求返回404
    res.writeHead(404);
    res.end('Not found');
});

/**
 * 调用真实的Remove.bg API
 */
async function callRemoveBgAPI(base64Image, options = {}) {
    const requestBody = {
        image_file_b64: base64Image,
        size: options.size || 'auto',
        format: options.format || 'png',
    };

    // 添加可选参数
    if (options.bg_color) {
        requestBody.bg_color = options.bg_color;
    }
    
    if (options.bg_image_file_b64) {
        requestBody.bg_image_file_b64 = options.bg_image_file_b64;
    }

    console.log('🌐 调用Remove.bg API...');
    console.log(`   参数: size=${requestBody.size}, format=${requestBody.format}`);
    
    return fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
            'X-Api-Key': API_KEY,
            'Content-Type': 'application/json',
            'User-Agent': 'QuickBG/1.0'
        },
        body: JSON.stringify(requestBody)
    });
}

// 启动服务器
server.listen(PORT, () => {
    console.log(`🌐 服务器运行在 http://localhost:${PORT}`);
    console.log(`📊 健康检查: http://localhost:${PORT}/health`);
    console.log(`🔄 API端点: http://localhost:${PORT}/api/remove-bg`);
    console.log('\n🎯 测试步骤:');
    console.log('1. 打开浏览器访问 http://localhost:8787');
    console.log('2. 上传测试图片 (JPG/PNG/WebP, <5MB)');
    console.log('3. 点击"去除背景"按钮');
    console.log('4. 等待真实API处理 (约3-10秒)');
    console.log('5. 下载处理结果');
    console.log('\n⚠️  注意:');
    console.log('   • 使用真实的Remove.bg API');
    console.log('   • 免费额度: 50张/月');
    console.log('   • 每张图片消耗1个额度');
    console.log('   • 处理时间: 3-10秒');
    console.log('   • 最大文件: 5MB');
    console.log('\n✅ 已修复的问题:');
    console.log('   • HTML文件JavaScript不完整的问题');
    console.log('   • 上传按钮无反应的问题');
    console.log('   • 切换到真实Remove.bg API');
});

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n🛑 关闭服务器...');
    server.close(() => {
        console.log('✅ 服务器已关闭');
        process.exit(0);
    });
});

// 错误处理
server.on('error', (err) => {
    console.error('❌ 服务器错误:', err.message);
    if (err.code === 'EADDRINUSE') {
        console.log('💡 提示: 端口8787已被占用，请等待或使用其他端口');
    }
});