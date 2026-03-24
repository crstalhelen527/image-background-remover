/**
 * 快速测试服务器 - 验证QuickBG功能
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

// 加载环境变量
require('dotenv').config();

const PORT = 8787;
const API_KEY = process.env.REMOVEBG_API_KEY;

console.log('🚀 QuickBG 测试服务器启动');
console.log(`🔑 API密钥: ${API_KEY ? '已设置' : '未设置'}`);
if (API_KEY) {
  console.log(`   密钥长度: ${API_KEY.length} 字符`);
  console.log(`   密钥前缀: ${API_KEY.substring(0, 10)}...`);
}

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
      service: 'QuickBG Test Server',
      timestamp: new Date().toISOString(),
      api_key_configured: !!API_KEY
    }));
    return;
  }
  
  // API端点
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
          
          console.log('🔄 调用Remove.bg API...');
          
          // 模拟API调用（实际使用时需要调用真实API）
          // 这里先返回模拟响应进行功能验证
          setTimeout(() => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              success: true,
              data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
              credits_charged: 1,
              width: 100,
              height: 100,
              timestamp: new Date().toISOString(),
              note: '这是模拟响应，实际需要调用Remove.bg API'
            }));
            console.log('✅ 返回模拟响应');
          }, 1000);
          
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
  
  // 调试页面
  if (url.pathname === '/debug') {
    const debugHtml = fs.readFileSync(path.join(__dirname, 'debug-test.html'), 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(debugHtml);
    return;
  }
  
  // 修复测试页面
  if (url.pathname === '/fix') {
    const fixHtml = fs.readFileSync(path.join(__dirname, 'fix-upload.html'), 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(fixHtml);
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

// 启动服务器
server.listen(PORT, () => {
  console.log(`🌐 服务器运行在 http://localhost:${PORT}`);
  console.log(`📊 健康检查: http://localhost:${PORT}/health`);
  console.log(`🔄 API端点: http://localhost:${PORT}/api/remove-bg`);
  console.log('\n🎯 测试步骤:');
  console.log('1. 打开浏览器访问 http://localhost:8787');
  console.log('2. 上传测试图片');
  console.log('3. 点击"去除背景"按钮');
  console.log('4. 检查功能是否正常');
  console.log('\n⚠️  注意: 当前使用模拟API响应，如需真实功能需要:');
  console.log('   - 在test-server.js中取消注释真实API调用代码');
  console.log('   - 确保API密钥有效且有额度');
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n🛑 关闭服务器...');
  server.close(() => {
    console.log('✅ 服务器已关闭');
    process.exit(0);
  });
});