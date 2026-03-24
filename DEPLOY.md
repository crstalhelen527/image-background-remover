# QuickBG - Cloudflare Pages 部署指南

## 📋 部署信息

### 账户信息
- **Cloudflare Account ID**: `da9508a0610236e7085687e13c88bf59`
- **GitHub Token**: `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`
- **Cloudflare API Token**: `cfat_wDQfWeUKHTPIubYWSAg5MkHzqOWYMtrxY30ImW7P774c7618`

### 项目配置
- **项目名称**: `quickbg`
- **构建目录**: `./public`
- **Functions 目录**: `./functions`
- **环境**: Production

## 🚀 部署方式

### 方式一: Cloudflare Dashboard (最简单)
1. 访问 https://dash.cloudflare.com/
2. 进入 Pages → Create a project
3. 选择 "Connect to Git"
4. 授权 GitHub 访问
5. 选择你的仓库和分支
6. 配置构建设置:
   - Build command: `npm run build`
   - Build output directory: `./public`
   - Root directory: `/`
7. 添加环境变量:
   - `REMOVEBG_API_KEY`: 你的 Remove.bg API 密钥
   - `NODE_ENV`: `production`
8. 点击 "Save and Deploy"

### 方式二: Wrangler CLI (自动化)
```bash
# 安装 wrangler
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 部署到 Cloudflare Pages
wrangler pages deploy ./public \
  --project-name=quickbg \
  --branch=main \
  --commit-hash=$(git rev-parse HEAD) \
  --commit-message="Deploy to Cloudflare Pages"

# 或使用配置文件
wrangler pages deploy --config=wrangler-pages.toml
```

### 方式三: GitHub Actions (完全自动化)
1. 在 GitHub 仓库设置中添加 Secrets:
   - `CLOUDFLARE_API_TOKEN`: `cfat_wDQfWeUKHTPIubYWSAg5MkHzqOWYMtrxY30ImW7P774c7618`
   - `REMOVEBG_API_KEY`: 你的 Remove.bg API 密钥
2. 推送代码到 `main` 分支
3. GitHub Actions 会自动部署

## 🔧 环境变量配置

### Cloudflare Pages 环境变量
在 Cloudflare Dashboard 的 Pages 项目设置中添加:

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `REMOVEBG_API_KEY` | 你的 API 密钥 | Remove.bg API 密钥 |
| `NODE_ENV` | `production` | 环境标识 |

### GitHub Secrets
在 GitHub 仓库 Settings → Secrets and variables → Actions 中添加:

| Secret 名称 | 值 |
|-------------|-----|
| `CLOUDFLARE_API_TOKEN` | `cfat_wDQfWeUKHTPIubYWSAg5MkHzqOWYMtrxY30ImW7P774c7618` |
| `REMOVEBG_API_KEY` | 你的 Remove.bg API 密钥 |
| `GITHUB_TOKEN` | 自动生成，无需手动添加 |

## 📁 项目结构

```
image-background-remover/
├── public/                    # 静态文件目录
│   ├── index.html            # 主页面
│   ├── css/                  # 样式文件
│   ├── js/                   # JavaScript 文件
│   └── assets/               # 图片等资源
├── functions/                # Cloudflare Pages Functions
│   ├── api/
│   │   └── remove-bg.js      # Remove.bg API 代理
│   └── health.js             # 健康检查端点
├── .github/workflows/        # GitHub Actions 工作流
│   └── deploy.yml            # 部署工作流
├── _redirects                # 路由重定向规则
├── _routes.json              # Pages 路由配置
├── wrangler-pages.toml       # Wrangler 配置文件
├── package.json              # 项目依赖和脚本
└── DEPLOY.md                 # 本文件
```

## 🛠️ 构建配置

### package.json 脚本
```json
{
  "scripts": {
    "build": "echo 'Building for Cloudflare Pages...' && cp -r src/* public/",
    "deploy": "wrangler pages deploy ./public --project-name=quickbg",
    "dev": "wrangler pages dev ./public --port=8787"
  }
}
```

### 构建流程
1. 复制静态文件到 `public/` 目录
2. 处理 Functions 代码
3. 上传到 Cloudflare Pages
4. 自动配置路由和 Functions

## 🔗 部署后访问

### 默认域名
部署完成后，可以通过以下地址访问:
- **生产环境**: `https://quickbg.pages.dev`
- **预览环境**: `https://<commit-hash>.quickbg.pages.dev`

### 自定义域名 (可选)
1. 在 Cloudflare Pages 项目设置中添加自定义域名
2. 按照提示配置 DNS
3. 等待 SSL 证书自动签发

## 🧪 测试部署

### 健康检查
```bash
curl https://quickbg.pages.dev/health
```

### API 测试
```bash
curl -X POST https://quickbg.pages.dev/api/remove-bg \
  -H "Content-Type: application/json" \
  -d '{"image":"base64-encoded-image"}'
```

### 前端访问
打开浏览器访问: `https://quickbg.pages.dev`

## 🐛 故障排除

### 常见问题 1: 构建失败
- 检查 `package.json` 中的构建脚本
- 查看 Cloudflare Pages 构建日志
- 确保所有依赖已安装

### 常见问题 2: API 请求失败
- 检查环境变量是否设置正确
- 验证 Remove.bg API 密钥有效性
- 查看 Functions 日志

### 常见问题 3: 路由问题
- 检查 `_redirects` 文件
- 验证 `_routes.json` 配置
- 测试各个端点

### 常见问题 4: 权限问题
- 确认 GitHub Token 有仓库访问权限
- 确认 Cloudflare API Token 有 Pages 权限
- 检查账户绑定状态

## 📞 支持资源

1. **Cloudflare Pages 文档**: https://developers.cloudflare.com/pages/
2. **Wrangler CLI 文档**: https://developers.cloudflare.com/workers/wrangler/
3. **GitHub Actions 文档**: https://docs.github.com/en/actions
4. **Remove.bg API 文档**: https://www.remove.bg/api

## 🎯 下一步

1. **推送代码到 GitHub 仓库**
2. **配置 GitHub Secrets**
3. **通过 Cloudflare Dashboard 或 CLI 部署**
4. **测试部署结果**
5. **配置自定义域名 (可选)**

部署完成后，你的 QuickBG 应用将在全球 Cloudflare 边缘网络上运行！