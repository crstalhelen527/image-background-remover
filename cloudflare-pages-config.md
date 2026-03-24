# Cloudflare Pages 部署配置指南

## 📋 所需信息

### 已提供的 Token:
1. **GitHub Token**: `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`
2. **Cloudflare API Token**: `cfat_wDQfWeUKHTPIubYWSAg5MkHzqOWYMtrxY30ImW7P774c7618`

### 需要你提供的信息:
1. **GitHub 仓库地址**: `https://github.com/_________/image-background-remover`
2. **默认分支**: `main` 或 `master`
3. **Cloudflare 账户邮箱** (可选，用于 CLI 工具)

## 🚀 部署方案

### 方案 A: 通过 Cloudflare Dashboard (推荐)
最简单的方式，通过网页界面完成。

### 方案 B: 使用 Wrangler CLI
更自动化的方式，适合后续 CI/CD。

### 方案 C: GitHub Actions 自动化
完全自动化的部署流程。

## 🔧 配置文件

### 1. `_redirects` 文件 (前端路由)
```
/* /index.html 200
```

### 2. `functions/_middleware.js` (API 代理)
```javascript
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  // 代理 API 请求到 Remove.bg
  if (url.pathname.startsWith('/api/')) {
    return handleAPIRequest(request, env);
  }
  
  // 静态文件服务
  return context.next();
}

async function handleAPIRequest(request, env) {
  // 这里实现 Remove.bg API 代理
  // 使用 env.REMOVEBG_API_KEY
}
```

### 3. `package.json` 构建脚本
```json
{
  "scripts": {
    "build": "echo 'Building for Cloudflare Pages...'",
    "deploy": "wrangler pages deploy ./public --project-name=quickbg"
  }
}
```

### 4. `wrangler.toml` (Cloudflare Pages 配置)
```toml
name = "quickbg-pages"
type = "webpack"
account_id = "your-account-id"
workers_dev = true
compatibility_date = "2024-03-24"

[env.production]
route = "quickbg.yourdomain.com/*"
zone_id = "your-zone-id"

[vars]
REMOVEBG_API_KEY = "your-removebg-api-key"

[[kv_namespaces]]
binding = "CACHE"
id = "cache-id"
```

## 📝 部署步骤

### 步骤 1: 准备仓库
1. 确保代码已推送到 GitHub
2. 创建 `.github/workflows/deploy.yml` (如果使用 GitHub Actions)

### 步骤 2: Cloudflare Dashboard 配置
1. 登录 Cloudflare Dashboard
2. 进入 Pages → Create a project
3. 选择 "Connect to Git"
4. 授权 GitHub 访问
5. 选择仓库和分支
6. 配置构建设置:
   - Build command: `npm run build`
   - Build output directory: `./public`
   - Root directory: `/`

### 步骤 3: 环境变量配置
在 Cloudflare Pages 设置中添加:
- `REMOVEBG_API_KEY`: 你的 Remove.bg API 密钥
- `NODE_ENV`: `production`

### 步骤 4: 自定义域名 (可选)
1. 在 Pages 项目设置中添加自定义域名
2. 按照提示配置 DNS

## 🔐 安全注意事项

### GitHub Token 安全
- 使用 Fine-grained token 限制权限
- 只授予必要的仓库访问权限
- 定期轮换 token

### Cloudflare API Token 安全
- 使用最小权限原则
- 只授予 Pages 相关权限
- 存储在安全的地方

### API 密钥管理
- 使用环境变量，不硬编码在代码中
- 使用 Cloudflare 的环境变量功能
- 定期检查 API 额度

## 🛠️ 故障排除

### 常见问题 1: 构建失败
- 检查构建命令是否正确
- 查看构建日志中的错误信息
- 确保依赖安装成功

### 常见问题 2: API 请求失败
- 检查环境变量是否设置正确
- 验证 Remove.bg API 密钥有效性
- 检查 CORS 配置

### 常见问题 3: 路由问题
- 检查 `_redirects` 文件
- 验证中间件配置
- 测试各个路由端点

## 📞 支持资源

1. **Cloudflare Pages 文档**: https://developers.cloudflare.com/pages/
2. **GitHub Actions 文档**: https://docs.github.com/en/actions
3. **Remove.bg API 文档**: https://www.remove.bg/api

## 🎯 下一步

请提供你的 GitHub 仓库地址，我将为你创建完整的部署配置文件。