# 🪄 QuickBG - 快速图片背景去除网站

一个基于 Cloudflare Workers 和 Remove.bg API 的轻量级图片背景去除工具。

## ✨ 特性

- 🚀 **快速处理**: 调用专业 Remove.bg API，快速去除背景
- 🔒 **隐私保护**: 图片仅在内存中处理，不上传服务器
- 🆓 **完全免费**: 基于免费额度，无隐藏费用
- 📱 **响应式设计**: 完美支持桌面和移动设备
- ⚡ **边缘计算**: 全球 Cloudflare 网络，低延迟访问
- 🎨 **专业效果**: 使用业界领先的 Remove.bg 算法

## 🛠 技术栈

### 前端
- HTML5 + CSS3 + JavaScript (ES6+)
- Canvas API (图片预览)
- File API (文件上传)
- Fetch API (API调用)

### 后端
- Cloudflare Workers (无服务器)
- Remove.bg API (背景去除)
- 无数据库，纯内存处理

### 部署
- Cloudflare Pages (前端托管)
- Cloudflare Workers (API代理)
- 自定义域名支持

## 📁 项目结构

```
quickbg/
├── public/                    # 前端静态文件
│   ├── index.html            # 主页面
│   ├── css/                  # 样式文件
│   ├── js/                   # JavaScript文件
│   └── assets/               # 静态资源
├── worker/                   # Cloudflare Worker
│   └── index.js             # Worker主文件
├── tests/                    # 测试文件
├── package.json             # 项目配置
├── wrangler.toml           # Cloudflare配置
├── README.md               # 本文档
└── 需求文档.md             # 完整需求文档
```

## 🚀 快速开始

### 1. 环境准备

```bash
# 安装 Wrangler CLI
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 克隆项目
git clone https://github.com/yourusername/quickbg.git
cd quickbg
```

### 2. 获取 API 密钥

1. 访问 [Remove.bg](https://www.remove.bg/api) 注册账户
2. 获取免费 API Key (50张/月)
3. 保存 API Key 备用

### 3. 配置项目

```bash
# 设置环境变量
wrangler secret put REMOVEBG_API_KEY
# 输入你的 Remove.bg API Key

# 配置允许的域名
wrangler secret put ALLOWED_ORIGINS "https://quickbg.yourdomain.com"
```

### 4. 本地开发

```bash
# 启动开发服务器
wrangler dev

# 访问 http://localhost:8787
```

### 5. 部署到生产

```bash
# 部署 Worker
wrangler publish

# 部署前端到 Cloudflare Pages
wrangler pages deploy ./public

# 绑定自定义域名
wrangler route create quickbg.yourdomain.com/* quickbg-worker
```

## 📖 使用指南

### 基本使用

1. **上传图片**
   - 拖放图片到上传区域
   - 或点击"选择图片"按钮
   - 支持 JPG、PNG、WebP 格式
   - 最大文件大小: 5MB

2. **处理图片**
   - 点击"去除背景"按钮
   - 等待处理完成 (通常 3-10秒)
   - 查看处理结果

3. **下载结果**
   - 点击"下载PNG"按钮
   - 图片自动保存为透明背景PNG
   - 文件名: `background-removed-{timestamp}.png`

### 高级功能

#### 批量处理
```javascript
// 即将推出
```

#### 背景替换
```javascript
// 即将推出
```

#### 手动编辑
```javascript
// 即将推出
```

## 🔧 API 文档

### 端点
```
POST /api/remove-bg
```

### 请求参数
```json
{
  "image": "base64_string",
  "format": "png",
  "size": "auto"
}
```

### 响应
```json
{
  "success": true,
  "data": "base64_image_data",
  "credits_charged": 1
}
```

### 错误响应
```json
{
  "success": false,
  "error": "错误描述",
  "timestamp": "2024-03-22T12:00:00Z"
}
```

## 🧪 测试

### 运行测试
```bash
# 单元测试
npm run test:unit

# 集成测试
npm run test:integration

# 端到端测试
npm run test:e2e

# 所有测试
npm run test:all
```

### 测试覆盖率
```bash
npm run test:coverage
```

## 📊 监控与维护

### 监控指标
- 服务可用性
- API 调用成功率
- 图片处理时间
- 用户使用量

### 日志查看
```bash
# 查看 Worker 日志
wrangler tail

# 查看 Pages 访问日志
# 通过 Cloudflare Dashboard
```

### 故障排除

#### 常见问题

**Q: 图片上传失败**
A: 检查文件格式和大小限制

**Q: 背景去除失败**
A: 检查 Remove.bg API 额度，查看错误日志

**Q: 下载失败**
A: 检查浏览器权限，尝试不同浏览器

**Q: 网站无法访问**
A: 检查域名解析，Cloudflare 状态

## 📈 性能指标

| 指标 | 目标值 | 当前状态 |
|------|--------|----------|
| 页面加载时间 | < 3秒 | ✅ |
| 首次内容渲染 | < 1.5秒 | ✅ |
| 图片处理时间 | < 10秒 | ✅ |
| API 成功率 | > 99% | ✅ |
| 移动端兼容性 | 100% | ✅ |

## 💰 成本估算

### 免费方案
- Cloudflare Workers: 100,000次/天免费
- Cloudflare Pages: 无限请求免费
- Remove.bg API: 50张/月免费

### 付费方案 (按需)
- Remove.bg API: $0.02-0.10/张
- Cloudflare Pro: $5/月起
- 自定义域名: $10-15/年

## 🔒 安全与隐私

### 隐私保护
- ✅ 图片不上传服务器
- ✅ 无持久化存储
- ✅ 无用户跟踪
- ✅ HTTPS 加密传输

### 安全措施
- ✅ 文件类型验证
- ✅ 文件大小限制
- ✅ API 密钥保护
- ✅ CORS 严格限制

## 🤝 贡献指南

### 开发流程
1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

### 代码规范
- 使用 ESLint 检查代码
- 遵循 Airbnb JavaScript 规范
- 添加必要的注释
- 编写单元测试

### 提交信息规范
- feat: 新功能
- fix: 修复 bug
- docs: 文档更新
- style: 代码格式
- refactor: 代码重构
- test: 测试相关
- chore: 构建过程或辅助工具

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 支持与联系

### 问题反馈
- GitHub Issues: [报告问题](https://github.com/yourusername/quickbg/issues)
- 邮箱: support@quickbg.com

### 文档
- [使用指南](docs/usage.md)
- [API 文档](docs/api.md)
- [部署指南](docs/deployment.md)
- [故障排除](docs/troubleshooting.md)

### 社区
- GitHub Discussions: [讨论区](https://github.com/yourusername/quickbg/discussions)
- Twitter: [@quickbg](https://twitter.com/quickbg)

## 🚀 路线图

### v1.0 (当前)
- [x] 基础图片上传
- [x] Remove.bg API 集成
- [x] 图片下载
- [x] 响应式设计

### v1.1 (计划中)
- [ ] 批量处理
- [ ] 背景替换
- [ ] 手动编辑工具
- [ ] 用户账户

### v1.2 (规划中)
- [ ] API 服务开放
- [ ] 插件系统
- [ ] 多语言支持
- [ ] 高级分析

## 🙏 致谢

- [Remove.bg](https://www.remove.bg/) - 提供专业的背景去除 API
- [Cloudflare](https://www.cloudflare.com/) - 提供优秀的边缘计算平台
- 所有贡献者和用户

---

**Made with ❤️ by [Your Name]**

如果这个项目对你有帮助，请给个 ⭐️ 支持一下！

## 📝 更新日志

### v1.0.0 (2024-03-22)
- 🎉 初始版本发布
- ✨ 基础图片上传和处理功能
- 🎨 现代化用户界面
- 📱 响应式设计
- 🔒 隐私保护设计
- 🚀 Cloudflare Workers 部署

---

**开始使用 QuickBG，快速去除图片背景！** 🪄

访问: https://quickbg.yourdomain.com