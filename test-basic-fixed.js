/**
 * Basic functionality test for QuickBG - Fixed version
 */

const fs = require('fs');
const path = require('path');

console.log('=== QuickBG 基本功能测试 ===\n');

// 1. 检查项目结构
console.log('1. 检查项目结构...');
const requiredFiles = [
  'package.json',
  'README.md',
  'public/index.html',
  'public/css/style.css',
  'public/js/app.js',
  'worker/index.js',
  'wrangler.toml'
];

let structurePass = true;
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - 文件不存在`);
    structurePass = false;
  }
});

console.log(structurePass ? '\n✅ 项目结构完整' : '\n❌ 项目结构不完整');

// 2. 检查HTML文件
console.log('\n2. 检查HTML文件...');
let htmlPass = true;
try {
  const htmlContent = fs.readFileSync(path.join(__dirname, 'public/index.html'), 'utf8');
  const htmlChecks = [
    { name: '包含DOCTYPE', check: htmlContent.includes('<!DOCTYPE html>') },
    { name: '包含中文语言', check: htmlContent.includes('lang="zh-CN"') },
    { name: '包含标题', check: htmlContent.includes('QuickBG') },
    { name: '包含上传区域', check: htmlContent.includes('drop-zone') },
    { name: '包含预览区域', check: htmlContent.includes('preview-section') },
    { name: '包含控制按钮', check: htmlContent.includes('removeBgBtn') }
  ];
  
  htmlChecks.forEach(check => {
    console.log(check.check ? `  ✅ ${check.name}` : `  ❌ ${check.name}`);
    if (!check.check) htmlPass = false;
  });
  
  console.log(htmlPass ? '\n✅ HTML文件完整' : '\n❌ HTML文件不完整');
} catch (error) {
  console.log(`  ❌ 无法读取HTML文件: ${error.message}`);
  htmlPass = false;
}

// 3. 检查Worker文件
console.log('\n3. 检查Worker文件...');
let workerPass = true;
try {
  const workerContent = fs.readFileSync(path.join(__dirname, 'worker/index.js'), 'utf8');
  const workerChecks = [
    { name: '包含API端点处理', check: workerContent.includes('/api/remove-bg') },
    { name: '包含CORS处理', check: workerContent.includes('Access-Control-Allow-Origin') },
    { name: '包含错误处理', check: workerContent.includes('errorResponse') },
    { name: '包含Remove.bg API调用', check: workerContent.includes('api.remove.bg') }
  ];
  
  workerChecks.forEach(check => {
    console.log(check.check ? `  ✅ ${check.name}` : `  ❌ ${check.name}`);
    if (!check.check) workerPass = false;
  });
  
  console.log(workerPass ? '\n✅ Worker文件完整' : '\n❌ Worker文件不完整');
} catch (error) {
  console.log(`  ❌ 无法读取Worker文件: ${error.message}`);
  workerPass = false;
}

// 4. 检查配置文件
console.log('\n4. 检查配置文件...');
let configPass = true;
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  const configChecks = [
    { name: '包含项目名称', check: packageJson.name === 'quickbg' },
    { name: '包含版本号', check: packageJson.version },
    { name: '包含启动脚本', check: packageJson.scripts && packageJson.scripts.dev },
    { name: '包含测试脚本', check: packageJson.scripts && packageJson.scripts.test }
  ];
  
  configChecks.forEach(check => {
    console.log(check.check ? `  ✅ ${check.name}` : `  ❌ ${check.name}`);
    if (!check.check) configPass = false;
  });
  
  console.log(configPass ? '\n✅ 配置文件完整' : '\n❌ 配置文件不完整');
} catch (error) {
  console.log(`  ❌ 无法读取配置文件: ${error.message}`);
  configPass = false;
}

// 5. 检查README文档
console.log('\n5. 检查README文档...');
let readmePass = true;
try {
  const readmeContent = fs.readFileSync(path.join(__dirname, 'README.md'), 'utf8');
  const readmeChecks = [
    { name: '包含项目描述', check: readmeContent.includes('QuickBG') },
    { name: '包含特性列表', check: readmeContent.includes('特性') },
    { name: '包含使用指南', check: readmeContent.includes('使用指南') },
    { name: '包含部署说明', check: readmeContent.includes('部署') }
  ];
  
  readmeChecks.forEach(check => {
    console.log(check.check ? `  ✅ ${check.name}` : `  ❌ ${check.name}`);
    if (!check.check) readmePass = false;
  });
  
  console.log(readmePass ? '\n✅ README文档完整' : '\n❌ README文档不完整');
} catch (error) {
  console.log(`  ❌ 无法读取README文件: ${error.message}`);
  readmePass = false;
}

// 总结
console.log('\n=== 测试总结 ===');
const allPass = structurePass && htmlPass && workerPass && configPass && readmePass;

if (allPass) {
  console.log('🎉 所有基本功能测试通过！');
  console.log('\n下一步建议：');
  console.log('1. 运行 npm install 安装依赖');
  console.log('2. 运行 npm test 运行完整测试套件');
  console.log('3. 运行 npm run dev 启动开发服务器');
  console.log('4. 配置 Remove.bg API 密钥进行实际测试');
} else {
  console.log('⚠️  部分测试未通过，请检查上述问题');
  console.log('\n需要修复的问题：');
  if (!structurePass) console.log('- 项目结构不完整');
  if (!htmlPass) console.log('- HTML文件需要修复');
  if (!workerPass) console.log('- Worker文件需要修复');
  if (!configPass) console.log('- 配置文件需要修复');
  if (!readmePass) console.log('- README文档需要完善');
}

console.log('\n=== 测试完成 ===');