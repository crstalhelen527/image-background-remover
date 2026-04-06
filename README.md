# 🎨 Image Background Remover

Cloudflare部署的图片背景去除工具，使用Remove.bg API，无存储架构。

## ✨ 特性

- **🚀 Cloudflare Pages部署** - 全球CDN加速，快速访问
- **🔒 无存储架构** - 图片不存储服务器，处理完即删除
- **⚡ Remove.bg API** - 专业级AI背景去除
- **📱 响应式设计** - 完美适配移动端和桌面端
- **🎯 高质量结果** - 透明背景PNG，边缘清晰
- **🆓 免费使用** - 无需注册，完全免费

## 🚀 快速开始

### 1. 本地开发
```bash
# 克隆项目
git clone https://github.com/crstalhelen527/image-background-remover.git
cd image-background-remover

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 2. 部署到 Cloudflare Pages
```bash
# 安装 Wrangler
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 部署
npm run deploy
```

## 📁 项目结构

```
image-background-remover/
├── src/                    # 源代码
│   ├── App.jsx           # 主应用组件
│   ├── App.css           # 全局样式
│   └── main.jsx          # 入口文件
├── public/               # 静态资源
├── worker/               # Cloudflare Worker
│   └── api.js           # Remove.bg API 代理
├── package.json          # 项目配置
├── vite.config.js        # Vite 配置
├── tailwind.config.js    # Tailwind 配置
├── wrangler.toml         # Cloudflare 配置
└── README.md            # 说明文档
```

## 🔧 技术栈

- **前端**: React 18 + Vite + Tailwind CSS
- **部署**: Cloudflare Pages + Workers
- **API**: Remove.bg (背景去除)
- **构建**: Vite (快速构建)
- **样式**: Tailwind CSS (实用优先)

## 📦 环境变量

创建 `.env` 文件：
```env
VITE_REMOVE_BG_API_KEY=your_remove_bg_api_key
```

## 🎯 核心功能

### 图片上传
- 拖拽上传支持
- 文件选择器
- 格式验证 (JPG, PNG, WebP)
- 大小限制 (5MB)

### 背景去除
- Remove.bg API 集成
- 实时处理进度
- 高质量透明背景 PNG
- 错误处理和重试

### 结果处理
- 实时预览对比
- 多种格式下载
- 社交媒体分享
- 重新处理选项

## 🔒 隐私与安全

- **无数据存储**: 图片仅在内存中处理
- **HTTPS 强制**: 全站加密传输
- **API 密钥保护**: 通过 Worker 代理调用
- **无用户追踪**: 不收集个人信息

## 📊 性能优化

- **图片压缩**: 客户端预处理
- **懒加载**: 按需加载资源
- **CDN 缓存**: Cloudflare 全球加速
- **代码分割**: 路由级代码分割

## 🚀 部署指南

### Cloudflare Pages 部署
1. Fork 本仓库
2. 在 Cloudflare Dashboard 创建 Pages 项目
3. 连接 GitHub 仓库
4. 设置环境变量 `REMOVE_BG_API_KEY`
5. 部署完成！

### 手动部署
```bash
# 构建项目
npm run build

# 部署到 Cloudflare
wrangler pages publish ./dist
```

## 📈 使用统计

- **每月免费额度**: 50 张图片 (Remove.bg 免费版)
- **处理时间**: 平均 3-5 秒/张
- **支持格式**: JPG, PNG, WebP
- **最大文件**: 5MB

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目基于 MIT 许可证开源。

## 🙏 致谢

- [Remove.bg](https://www.remove.bg/) - 提供优秀的背景去除 API
- [Cloudflare](https://www.cloudflare.com/) - 提供免费的部署平台
- [React](https://reactjs.org/) - 优秀的前端框架
- [Vite](https://vitejs.dev/) - 快速的构建工具

## 📞 支持

如有问题或建议，请：
1. 查看 [Issues](https://github.com/crstalhelen527/image-background-remover/issues)
2. 提交新的 Issue
3. 或通过 GitHub Discussions 讨论

---

**立即体验**: [https://image-background-remover.pages.dev](https://image-background-remover.pages.dev)

*让去除背景变得简单快捷！*