# QuickBG - 快速部署指南

## 🎯 一句话部署
**已有所有配置，只需3步即可部署到 Cloudflare Pages！**

## 📋 已准备好的配置

### 账户信息 ✅
- **Cloudflare Account ID**: `da9508a0610236e7085687e13c88bf59`
- **GitHub Token**: `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`
- **Cloudflare API Token**: `cfat_wDQfWeUKHTPIubYWSAg5MkHzqOWYMtrxY30ImW7P774c7618`

### 项目配置 ✅
- **项目名称**: `quickbg`
- **所有配置文件已创建完成**
- **GitHub Actions 工作流已配置**
- **一键部署脚本已准备**

## 🚀 3步部署流程

### 第1步: 推送代码到 GitHub
```bash
# 初始化 Git 仓库 (如果还没有)
git init
git add .
git commit -m "feat: Add QuickBG project with Cloudflare Pages deployment"

# 推送到 GitHub (需要你的仓库地址)
git remote add origin https://github.com/YOUR_USERNAME/image-background-remover.git
git branch -M main
git push -u origin main
```

### 第2步: 配置 GitHub Secrets
1. 访问你的 GitHub 仓库: `https://github.com/YOUR_USERNAME/image-background-remover`
2. 进入 **Settings → Secrets and variables → Actions**
3. 点击 **New repository secret**
4. 添加以下 Secrets:

| Secret 名称 | 值 |
|-------------|-----|
| `CLOUDFLARE_API_TOKEN` | `cfat_wDQfWeUKHTPIubYWSAg5MkHzqOWYMtrxY30ImW7P774c7618` |
| `REMOVEBG_API_KEY` | `j7NDKynS79NQ3dsJp3sgAvy4` (你的 Remove.bg API 密钥) |

### 第3步: 触发部署

#### 方式 A: 自动部署 (推荐)
- 推送代码后，GitHub Actions 会自动部署
- 查看部署状态: `https://github.com/YOUR_USERNAME/image-background-remover/actions`

#### 方式 B: 手动部署
1. 访问 Cloudflare Dashboard: https://dash.cloudflare.com/
2. 进入 **Pages → Create a project**
3. 选择 **"Connect to Git"**
4. 授权 GitHub 访问
5. 选择你的仓库 `image-background-remover`
6. 点击 **"Save and Deploy"**

#### 方式 C: 使用一键脚本
```bash
# 设置环境变量
export CLOUDFLARE_API_TOKEN="cfat_wDQfWeUKHTPIubYWSAg5MkHzqOWYMtrxY30ImW7P774c7618"
export REMOVEBG_API_KEY="j7NDKynS79NQ3dsJp3sgAvy4"

# 运行部署脚本
./deploy.sh
```

## 🔗 部署后访问

### 默认地址
- **生产环境**: `https://quickbg.pages.dev`
- **预览环境**: `https://<commit-hash>.quickbg.pages.dev`

### 测试端点
```bash
# 健康检查
curl https://quickbg.pages.dev/health

# API 测试
curl -X POST https://quickbg.pages.dev/api/remove-bg \
  -H "Content-Type: application/json" \
  -d '{"image":"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="}'
```

## ⚙️ 环境变量配置

### Cloudflare Pages 环境变量
部署后，在 Cloudflare Dashboard 中配置:

1. 进入 Pages 项目 `quickbg`
2. 点击 **Settings → Environment variables**
3. 添加:
   - `REMOVEBG_API_KEY`: `j7NDKynS79NQ3dsJp3sgAvy4`
   - `NODE_ENV`: `production`

## 📁 已创建的文件

```
✅ _redirects              # 路由重定向
✅ _routes.json           # Pages 路由配置
✅ functions/             # Cloudflare Functions
│   ├── api/remove-bg.js # Remove.bg API 代理
│   └── health.js        # 健康检查端点
✅ .github/workflows/deploy.yml # GitHub Actions 工作流
✅ wrangler-pages.toml   # Wrangler 配置文件
✅ deploy.sh             # 一键部署脚本
✅ DEPLOY.md             # 详细部署文档
✅ QUICK_DEPLOY_GUIDE.md # 本快速指南
```

## 🛠️ 技术架构

### Cloudflare Pages 优势
- **全球 CDN**: 边缘网络加速
- **自动 SSL**: 免费 HTTPS
- **Functions**: 边缘计算能力
- **Git 集成**: 自动部署
- **自定义域名**: 支持绑定自己的域名

### 项目结构
- **前端**: 静态 HTML/CSS/JS 文件
- **后端**: Cloudflare Pages Functions
- **API**: Remove.bg 专业背景去除服务
- **部署**: GitHub Actions + Cloudflare Pages

## 🐛 常见问题

### Q1: 部署失败怎么办？
- 检查 GitHub Secrets 是否正确配置
- 查看 GitHub Actions 日志
- 确认 Cloudflare API Token 有 Pages 权限

### Q2: API 返回错误怎么办？
- 检查 `REMOVEBG_API_KEY` 环境变量
- 验证 Remove.bg API 密钥有效性
- 查看 Cloudflare Functions 日志

### Q3: 如何查看部署状态？
- GitHub Actions: `https://github.com/YOUR_USERNAME/image-background-remover/actions`
- Cloudflare Dashboard: `https://dash.cloudflare.com/da9508a0610236e7085687e13c88bf59/pages`

### Q4: 如何更新代码？
- 推送新代码到 GitHub
- GitHub Actions 会自动重新部署
- 或手动触发部署脚本

## 📞 支持

### 文档链接
- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Remove.bg API 文档](https://www.remove.bg/api)

### 问题反馈
1. 查看部署日志
2. 检查环境变量配置
3. 验证 API 密钥状态

## 🎉 完成！

部署完成后，你的 QuickBG 应用将在全球 Cloudflare 边缘网络上运行，提供快速的图片背景去除服务！

**访问地址**: `https://quickbg.pages.dev`

**管理面板**: `https://dash.cloudflare.com/da9508a0610236e7085687e13c88bf59/pages/view/quickbg`