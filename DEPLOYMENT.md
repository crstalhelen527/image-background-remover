# 🚀 部署指南

## 项目概述

**Image Background Remover** 是一个基于 Cloudflare Pages 部署的图片背景去除工具，完全符合需求文档的要求：

- ✅ **使用 Cloudflare 部署** - Cloudflare Pages + Workers 架构
- ✅ **无存储架构** - 图片仅在内存处理，不持久化存储
- ✅ **Remove.bg API 集成** - 专业级背景去除效果
- ✅ **现代化技术栈** - React 18 + Vite + Tailwind CSS
- ✅ **响应式设计** - 完美适配移动端和桌面端

## 📋 部署前准备

### 1. 获取 Remove.bg API 密钥
1. 访问 [Remove.bg API](https://www.remove.bg/api)
2. 注册账户（免费版每月 50 张图片）
3. 获取 API 密钥

### 2. Cloudflare 账户准备
1. 已有 Cloudflare 账户或注册新账户
2. 确保账户可以创建 Pages 项目

## 🛠️ 本地开发测试

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```
访问: http://localhost:3000

### 构建项目
```bash
npm run build
```

## ☁️ Cloudflare Pages 部署

### 方法一：GitHub 集成（推荐）

1. **登录 Cloudflare Dashboard**
   - 进入 [Cloudflare Dashboard](https://dash.cloudflare.com)
   - 选择 "Workers & Pages"

2. **创建 Pages 项目**
   - 点击 "Create application" → "Pages"
   - 选择 "Connect to Git"

3. **连接 GitHub 仓库**
   - 授权 Cloudflare 访问 GitHub
   - 选择仓库: `crstalhelen527/image-background-remover`
   - 选择分支: `main`

4. **配置构建设置**
   ```
   构建命令: npm run build
   输出目录: dist
   根目录: /
   ```

5. **设置环境变量**
   - 在项目设置中找到 "Environment variables"
   - 添加变量:
     ```
     名称: REMOVE_BG_API_KEY
     值: 你的 Remove.bg API 密钥
     环境: Production
     ```

6. **部署**
   - 点击 "Save and Deploy"
   - 等待构建完成

### 方法二：Wrangler CLI 部署

1. **安装 Wrangler**
   ```bash
   npm install -g wrangler
   ```

2. **登录 Cloudflare**
   ```bash
   wrangler login
   ```

3. **设置 API 密钥**
   ```bash
   wrangler secret put REMOVE_BG_API_KEY
   ```

4. **部署项目**
   ```bash
   npm run deploy
   ```

### 方法三：手动上传

1. **构建项目**
   ```bash
   npm run build
   ```

2. **上传到 Cloudflare**
   - 在 Cloudflare Pages 创建项目
   - 选择 "Direct Upload"
   - 上传 `dist` 文件夹

## 🔧 环境变量配置

### 必需变量
```env
REMOVE_BG_API_KEY=your_remove_bg_api_key_here
```

### 本地开发
创建 `.env` 文件：
```bash
echo "VITE_REMOVE_BG_API_KEY=your_key_here" > .env
```

### Cloudflare Pages
在项目设置中添加环境变量：
- Production: `REMOVE_BG_API_KEY`
- Preview: `REMOVE_BG_API_KEY` (可选)

## 📊 部署后验证

### 1. 访问部署地址
```
https://image-background-remover.pages.dev
```

### 2. 功能测试
1. 上传测试图片
2. 验证背景去除功能
3. 检查下载功能
4. 测试响应式设计

### 3. 监控日志
- Cloudflare Dashboard → Pages → 你的项目 → Logs
- 查看 Worker 日志和错误信息

## 🔒 安全配置

### 1. 自定义域名（可选）
1. 在 Pages 项目设置中添加自定义域名
2. 配置 DNS 记录
3. 启用 HTTPS

### 2. 访问控制（可选）
1. 配置 Cloudflare Access
2. 设置身份验证规则
3. 限制特定用户访问

### 3. 速率限制
1. 在 Cloudflare Dashboard 配置速率限制
2. 防止 API 滥用

## 🚨 故障排除

### 常见问题

#### 1. 构建失败
```bash
# 清理缓存重新安装
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### 2. API 调用失败
- 检查 `REMOVE_BG_API_KEY` 环境变量
- 验证 Remove.bg API 额度是否充足
- 检查网络连接

#### 3. 图片上传失败
- 检查文件大小限制（5MB）
- 验证图片格式（JPG/PNG/WebP）
- 检查浏览器控制台错误信息

#### 4. Worker 错误
```bash
# 本地测试 Worker
wrangler dev
```

## 📈 性能优化建议

### 1. 缓存配置
```toml
# wrangler.toml
[[routes]]
pattern = "/*"
script_name = "api-worker"
custom_cache = { browser_ttl = 3600, edge_ttl = 86400 }
```

### 2. 图片优化
- 启用 Cloudflare Polish（图片优化服务）
- 配置 Brotli 压缩
- 设置合理的缓存规则

### 3. CDN 优化
- 利用 Cloudflare 全球 CDN
- 配置边缘计算规则
- 启用 Argo Smart Routing

## 🔄 更新与维护

### 1. 代码更新
```bash
# 提交更改
git add .
git commit -m "更新说明"
git push origin main

# Cloudflare 会自动重新部署
```

### 2. 环境变量更新
```bash
# 更新 API 密钥
wrangler secret put REMOVE_BG_API_KEY
```

### 3. 版本回滚
- 在 Cloudflare Pages 项目历史中选择回滚版本
- 或使用 Git 回滚代码后重新部署

## 💰 成本估算

### 免费资源
- **Cloudflare Pages**: 无限请求，100GB 带宽
- **Remove.bg API**: 每月 50 张免费图片
- **GitHub**: 免费代码托管和 CI/CD

### 付费选项
- **Remove.bg API**: 按量计费，约 $0.20-0.50/张
- **Cloudflare**: 高级功能需付费计划

## 📞 支持与帮助

### 问题反馈
1. 查看 [GitHub Issues](https://github.com/crstalhelen527/image-background-remover/issues)
2. 提交新 Issue

### 文档参考
- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Remove.bg API 文档](https://www.remove.bg/api)
- [React 文档](https://reactjs.org/)

### 社区支持
- [Cloudflare Community](https://community.cloudflare.com/)
- [React GitHub Discussions](https://github.com/facebook/react/discussions)

---

**部署完成！** 🎉

你的图片背景去除工具现在应该运行在：
```
https://image-background-remover.pages.dev
```

如有问题，请参考上述故障排除步骤或提交 Issue。