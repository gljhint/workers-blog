# 🛠️ 安装配置指南

这是博客系统的详细安装和配置指南。

## 📋 环境要求

- Node.js 18.17 或更高版本
- npm 或 yarn 包管理器
- Git 版本控制

## 🚀 安装步骤

### 1. 克隆项目

```bash
git clone <repository-url>
cd my-blog
```

### 2. 安装依赖

```bash
npm install
# 或者
yarn install
```

### 3. 环境配置

```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件，配置必要的环境变量。

### 4. 数据库初始化

```bash
# 本地开发数据库
npx wrangler d1 create my-blog-db
npx wrangler d1 execute my-blog-db --local --file=./schema.sql
```
# 线上
npx wrangler d1 execute my-blog-db --remote --file=./schema.sql

### 5. 启动开发服务器

```bash
npm run dev
# 或者
yarn dev
```

### 6. 访问应用

- 前台：http://localhost:3000
- 后台：http://localhost:3000/admin
- 默认管理员账户：`admin` / `admin123`

## ⚙️ 环境配置详解

### 环境变量说明

创建 `.env.local` 文件并配置以下变量：

```env
# 数据库配置
DATABASE_URL=your_database_url
CF_DATABASE_ID=your_cloudflare_d1_database_id

# JWT 密钥（用于用户认证）
JWT_SECRET=your_jwt_secret_key

# 站点配置
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Cloudflare 配置（可选）
CF_ACCOUNT_ID=your_cloudflare_account_id
CF_API_TOKEN=your_cloudflare_api_token
```

### Cloudflare 配置

创建和配置 Cloudflare 资源：

```bash
# 创建 D1 数据库
npx wrangler d1 create my-blog-db

# 创建 KV 命名空间（用于缓存）
npx wrangler kv:namespace create "CACHE"
npx wrangler kv:namespace create "CACHE" --preview

# 创建 R2 存储桶（可选，用于图片存储）
npx wrangler r2 bucket create my-blog-assets

# 执行数据库迁移
npx wrangler d1 execute my-blog-db --file=./schema.sql

# 本地开发
npx wrangler d1 execute my-blog-db --local --file=./schema.sql
```

**注意**：创建 KV 命名空间后，将返回的 ID 配置到 `wrangler.jsonc` 中：

```jsonc
"kv_namespaces": [{
  "binding": "CACHE",
  "id": "你的KV命名空间ID",
  "preview_id": "你的KV预览ID"
}]
```

## 🌐 部署配置

### Cloudflare Pages 部署

1. **连接 Git 仓库**
   - 登录 Cloudflare Dashboard
   - 进入 Pages，点击 "Create a project"
   - 连接你的 Git 仓库

2. **配置构建设置**
   ```yaml
   Framework preset: Next.js
   Build command: npm run build
   Build output directory: .next
   Root directory: /
   ```

3. **环境变量配置**
   在 Cloudflare Pages 设置中添加所需的环境变量。

4. **数据库绑定**
   ```bash
   # 绑定 D1 数据库到 Pages
   npx wrangler pages project create my-blog
   npx wrangler pages secret put JWT_SECRET --project-name=my-blog
   ```

### 自定义域名

1. 在 Cloudflare Pages 中添加自定义域名
2. 配置 DNS 解析
3. 启用 HTTPS（Cloudflare 自动提供）

## 🐛 常见问题解决

### 1. 数据库连接失败

```bash
# 检查数据库配置
npx wrangler d1 list

# 重新创建本地数据库
npx wrangler d1 execute my-blog-db --local --file=./schema.sql
```

### 2. 构建失败

```bash
# 清除缓存
rm -rf .next
npm run build
```

### 3. 样式不生效

```bash
# 重新构建 Tailwind CSS
npm run build:css
```

## 🔍 调试技巧

### 开启调试模式

```javascript
// next.config.js
module.exports = {
  env: {
    DEBUG: process.env.NODE_ENV === 'development'
  }
}
```

### 查看数据库数据

```bash
# 查询本地数据库
npx wrangler d1 execute my-blog-db --local --command="SELECT * FROM posts LIMIT 5"
```

## 🔄 数据迁移

### 运行迁移脚本

```bash
# 运行数据库迁移脚本
npx wrangler d1 execute my-blog-db --file=./migrations/001_add_new_fields.sql
```

### 数据备份

```bash
# 备份本地数据库
npx wrangler d1 export my-blog-db --local --output backup.sql

# 恢复数据库
npx wrangler d1 execute my-blog-db --local --file backup.sql
```

## 🔒 安全配置

### 认证安全
- 修改默认管理员密码
- 使用强 JWT 密钥
- 启用 HTTPS

### 环境变量安全
- 不要将 `.env.local` 文件提交到版本控制
- 使用安全的随机字符串作为密钥
- 定期轮换敏感信息

## ⚡ 性能优化配置

### Next.js 优化

```javascript
// next.config.js
module.exports = {
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../../'),
  },
  images: {
    domains: ['yourdomain.com'],
  },
  compress: true,
  poweredByHeader: false,
}
```

### 缓存配置

```javascript
// 配置缓存策略
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600',
          },
        ],
      },
    ]
  },
}
```

---

如果在安装过程中遇到任何问题，请参考主 [README.md](README.md) 文档或提交 Issue。