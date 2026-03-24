# QuickBG - 一键部署到 Cloudflare Pages

## 🎯 部署信息总览

### 账户信息
- **GitHub 用户名**: `crstalhelen527`
- **GitHub 仓库**: `image-background-remover`
- **Cloudflare Account ID**: `da9508a0610236e7085687e13c88bf59`
- **Cloudflare 项目名**: `quickbg`

### Token 信息
- **GitHub Token**: `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`
- **Cloudflare API Token**: `cfat_wDQfWeUKHTPIubYWSAg5MkHzqOWYMtrxY30ImW7P774c7618`
- **Remove.bg API Key**: `j7NDKynS79NQ3dsJp3sgAvy4`

## 🚀 一键部署命令

### 方法一：使用部署脚本（推荐）
```bash
# 1. 设置环境变量
export CLOUDFLARE_API_TOKEN="cfat_wDQfWeUKHTPIubYWSAg5MkHzqOWYMtrxY30ImW7P774c7618"
export REMOVEBG_API_KEY="j7NDKynS79NQ3dsJp3sgAvy4"

# 2. 运行部署脚本
cd /root/.openclaw/agents/编程/workspace/projects/image-background-remover
./deploy-final.sh
```

### 方法二：手动步骤
```bash
# 1. 初始化 Git
git init
git add .
git commit -m "Deploy QuickBG to Cloudflare Pages"

# 2. 推送到 GitHub
git remote add origin https://github.com/crstalhelen527/image-background-remover.git
git branch -M main
git push -u origin main

# 3. 配置 GitHub Secrets
# 访问: https://github.com/crstalhelen527/image-background-remover/settings/secrets/actions
# 添加:
#   CLOUDFLARE_API_TOKEN = cfat_wDQfWeUKHTPIubYWSAg5MkHzqOWYMtrxY30ImW7P774c7618
#   REMOVEBG_API_KEY = j7NDKynS79NQ3dsJp3sgAvy4

# 4. 等待 GitHub Actions 自动部署
# 或手动部署到 Cloudflare Pages
```

### 方法三：Cloudflare Dashboard
1. 访问 https://dash.cloudflare.com/
2. 进入 Pages → Create a project
3. 选择 "Connect to Git"
4. 授权访问 GitHub
5. 选择仓库: `crstalhelen527/image-background-remover`
6. 点击 "Save and Deploy"

## 🔗 部署后访问

### 默认地址
- **主页面**: https://quickbg.pages.dev
- **健康检查**: https://quickbg.pages.dev/health
- **API端点**: https://quickbg.pages.dev/api/remove-bg

### 测试命令
```bash
# 测试健康检查
curl https://quickbg.pages.dev/health

# 测试 API
curl -X POST https://quickbg.pages.dev/api/remove-bg \
  -H "Content-Type: application/json" \
  -d '{"image":"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="}'
```

## ⚙️ 环境变量配置

### Cloudflare Pages 环境变量
部署后，在 Cloudflare Dashboard 中配置：

1. 进入 Pages 项目 `quickbg`
2. 点击 Settings → Environment variables
3. 添加：
   - `REMOVEBG_API_KEY`: `j7NDKynS79NQ3dsJp3sgAvy4`
   - `NODE_ENV`: `production`

### GitHub Secrets
已在部署脚本中自动配置。

## 📁 项目文件结构

```
image-background-remover/
├── public/                    # 静态文件
│   ├── index.html            # 主界面
│   ├── css/                  # 样式
│   └── js/                   # JavaScript
├── functions/                # Cloudflare Functions
│   ├── api/remove-bg.js      # API代理
│   └── health.js             # 健康检查
├── .github/workflows/        # GitHub Actions
│   └── deploy.yml            # 自动部署
├── _redirects                # 路由配置
├── _routes.json              # Pages路由
├── wrangler-pages.toml       # Wrangler配置
├── deploy-final.sh           # 一键部署脚本
├── package.json              # 项目配置
└── README_DEPLOY.md          # 本文件
```

## 🛠️ 技术特性

### Cloudflare Pages 优势
- ✅ 全球 CDN 加速
- ✅ 自动 SSL 证书
- ✅ 边缘计算 Functions
- ✅ Git 集成自动部署
- ✅ 免费自定义域名

### 功能特性
- ✅ 图片上传和预览
- ✅ 拖放文件支持
- ✅ 真实 Remove.bg API 集成
- ✅ 背景去除和下载
- ✅ 响应式设计

## 🐛 故障排除

### 部署失败
1. **检查 Token 权限**
   - GitHub Token 需要有仓库访问权限
   - Cloudflare API Token 需要有 Pages 权限

2. **检查环境变量**
   ```bash
   echo $CLOUDFLARE_API_TOKEN
   echo $REMOVEBG_API_KEY
   ```

3. **查看日志**
   - GitHub Actions 日志
   - Cloudflare Pages 构建日志

### API 错误
1. **检查 Remove.bg API 密钥**
   - 访问 https://www.remove.bg/api 验证
   - 检查免费额度是否用完

2. **测试 API 连接**
   ```bash
   curl -X POST https://api.remove.bg/v1.0/removebg \
     -H "X-Api-Key: j7NDKynS79NQ3dsJp3sgAvy4" \
     -H "Content-Type: application/json" \
     -d '{"image_file_b64":"base64","size":"auto","format":"png"}'
   ```

## 📞 支持链接

### 文档
- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Remove.bg API 文档](https://www.remove.bg/api)

### 管理面板
- **GitHub**: https://github.com/crstalhelen527/image-background-remover
- **Cloudflare**: https://dash.cloudflare.com/da9508a0610236e7085687e13c88bf59/pages
- **部署状态**: https://github.com/crstalhelen527/image-background-remover/actions

## 🎉 完成！

运行部署脚本后，你的 QuickBG 应用将在几分钟内上线：

**访问地址**: https://quickbg.pages.dev

**开始使用**: 上传图片 → 去除背景 → 下载结果

**全球加速**: Cloudflare 全球边缘网络