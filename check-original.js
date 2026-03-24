/**
 * 检查原页面JavaScript代码
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 检查原页面JavaScript代码...\n');

// 读取HTML文件
const htmlContent = fs.readFileSync(path.join(__dirname, 'public/index.html'), 'utf8');

// 提取JavaScript代码
const scriptStart = htmlContent.indexOf('<script>');
const scriptEnd = htmlContent.indexOf('</script>', scriptStart);

if (scriptStart === -1 || scriptEnd === -1) {
    console.log('❌ 未找到JavaScript代码');
    process.exit(1);
}

const jsCode = htmlContent.substring(scriptStart + 8, scriptEnd);
console.log(`📏 JavaScript代码长度: ${jsCode.length} 字符\n`);

// 检查常见问题
console.log('🔧 检查常见问题:');

// 1. 检查类定义
if (!jsCode.includes('class QuickBGApp')) {
    console.log('❌ 未找到QuickBGApp类定义');
} else {
    console.log('✅ 找到QuickBGApp类定义');
}

// 2. 检查构造函数
if (!jsCode.includes('constructor()')) {
    console.log('❌ 未找到构造函数');
} else {
    console.log('✅ 找到构造函数');
}

// 3. 检查事件绑定
const events = [
    'addEventListener',
    'select-file-btn',
    'file-input',
    'process-btn',
    'download-btn',
    'reset-btn'
];

events.forEach(event => {
    if (jsCode.includes(event)) {
        console.log(`✅ 找到 "${event}"`);
    } else {
        console.log(`❌ 未找到 "${event}"`);
    }
});

// 4. 检查方法定义
const methods = [
    'handleFileSelect',
    'validateFile',
    'processImage',
    'downloadImage',
    'reset',
    'showNotification',
    'updateUI'
];

console.log('\n🔧 检查方法定义:');
methods.forEach(method => {
    if (jsCode.includes(`${method}(`)) {
        console.log(`✅ 找到 "${method}()" 方法`);
    } else {
        console.log(`❌ 未找到 "${method}()" 方法`);
    }
});

// 5. 检查语法错误
console.log('\n🔧 检查语法错误...');
try {
    // 创建一个简单的测试环境
    const testCode = `
        // 模拟DOM环境
        global.document = {
            getElementById: (id) => ({
                addEventListener: () => {},
                click: () => {},
                disabled: false,
                style: {},
                classList: { add: () => {}, remove: () => {} },
                innerHTML: ''
            }),
            querySelector: () => null,
            createElement: () => ({ click: () => {} })
        };
        
        // 模拟FileReader
        global.FileReader = class {
            constructor() {
                this.onload = null;
                this.onerror = null;
            }
            readAsDataURL() {}
        };
        
        // 模拟URL
        global.URL = { createObjectURL: () => '', revokeObjectURL: () => {} };
        
        // 模拟fetch
        global.fetch = async () => ({ ok: true, json: async () => ({ success: true, data: '' }) });
        
        // 执行JavaScript代码
        ${jsCode}
        
        // 尝试创建实例
        try {
            const app = new QuickBGApp();
            console.log('✅ JavaScript代码语法检查通过');
            console.log('✅ QuickBGApp实例创建成功');
        } catch (error) {
            console.log('❌ 实例创建失败:', error.message);
        }
    `;
    
    eval(testCode);
} catch (error) {
    console.log('❌ JavaScript语法错误:', error.message);
    console.log('错误位置:', error.stack);
}

// 6. 检查实际的问题
console.log('\n🔍 检查具体问题:');

// 检查文件输入事件
if (jsCode.includes("document.getElementById('file-input')")) {
    console.log('✅ 找到file-input元素引用');
    
    // 检查change事件
    if (jsCode.includes("addEventListener('change'")) {
        console.log('✅ 找到change事件监听器');
    } else {
        console.log('❌ 未找到change事件监听器');
    }
} else {
    console.log('❌ 未找到file-input元素引用');
}

// 检查按钮点击事件
if (jsCode.includes("document.getElementById('select-file-btn')")) {
    console.log('✅ 找到select-file-btn元素引用');
    
    // 检查click事件
    if (jsCode.includes("addEventListener('click'")) {
        console.log('✅ 找到click事件监听器');
    } else {
        console.log('❌ 未找到click事件监听器');
    }
} else {
    console.log('❌ 未找到select-file-btn元素引用');
}

console.log('\n🎯 建议测试步骤:');
console.log('1. 访问 http://localhost:8787/debug 进行元素检查');
console.log('2. 访问 http://localhost:8787/fix 测试修复版本');
console.log('3. 检查浏览器控制台是否有JavaScript错误');
console.log('4. 确保所有必要的DOM元素都存在');

console.log('\n📋 可能的问题:');
console.log('• JavaScript代码未正确加载');
console.log('• DOM元素ID不匹配');
console.log('• 事件监听器未正确绑定');
console.log('• 浏览器控制台有JavaScript错误');