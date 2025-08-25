# 🌟 我的博客系统

一个基于 Next.js 15 和 Cloudflare 技术栈构建的现代化博客系统，具备完整的内容管理、用户交互和后台管理功能。

## 📋 目录

- [功能特性](#-功能特性)
- [技术栈](#-技术栈)
- [项目结构](#-项目结构)
- [快速开始](#-快速开始)
- [安装配置指南](SETUP.md) 🔧
- [部署指南](#-部署指南)
- [API 文档](#-api-文档)
- [功能模块详解](#-功能模块详解)
- [贡献指南](#-贡献指南)

## ✨ 功能特性

### 🎯 核心功能
- **📝 文章管理** - 完整的文章 CRUD，支持 Markdown 编辑、分类标签、草稿发布
- **🎨 自定义页面** - 创建独立页面，支持自定义 CSS/JS、SEO 设置
- **💬 评论系统** - 嵌套评论、评论审核、垃圾评论过滤
- **🗂️ 分类标签** - 灵活的内容组织方式
- **🔍 搜索筛选** - 全文搜索、分类筛选、标签筛选、年份归档
- **📊 统计分析** - 浏览量统计、后台数据分析

### 🛠️ 管理功能
- **👤 用户认证** - 安全的登录系统、会话管理
- **🎛️ 后台管理** - 完整的内容管理界面
- **⚙️ 站点设置** - 站点信息、显示设置、评论设置
- **🧭 菜单管理** - 自定义导航菜单、层级结构
- **📄 页面管理** - 自定义页面的创建和管理

### 🎨 用户体验
- **📱 响应式设计** - 完美适配各种设备，移动端菜单优化
- **⚡ 边缘计算** - 部署在 Cloudflare Workers，全球加速
- **🚀 智能缓存** - 使用 Cloudflare KV 存储，5分钟TTL，提升响应速度
- **📄 数据备份** - 完整的导入导出功能
- **📝 日志系统** - 详细的操作日志和错误追踪

## 🛠️ 技术栈

### 前端技术
- **Next.js 15** - React 全栈框架，支持 SSR/SSG
- **React 18** - 用户界面构建
- **TypeScript** - 类型安全的 JavaScript
- **Tailwind CSS** - 原子化 CSS 框架
- **Radix UI** - 无样式组件库

### 后端技术
- **Next.js API Routes** - 后端 API 接口
- **Cloudflare D1** - SQLite 无服务器数据库
- **bcryptjs** - 密码加密
- **JWT** - 用户认证

### 开发工具
- **ESLint** - 代码质量检查
- **Prettier** - 代码格式化
- **Husky** - Git hooks
- **TypeScript** - 静态类型检查

### 部署平台
- **Cloudflare Workers** - 边缘计算平台，使用 OpenNext.js
- **Cloudflare D1** - SQLite 兼容的边缘数据库
- **Cloudflare R2** - 对象存储（用于图片和文件）
- **Cloudflare KV** - 键值存储（用于缓存）

## 📁 项目结构

```
my-blog/
├── 📁 src/
│   ├── 📁 app/                      # Next.js App Router
│   │   ├── 📁 admin/               # 后台管理页面
│   │   │   ├── 📁 posts/           # 文章管理
│   │   │   ├── 📁 pages/           # 页面管理
│   │   │   ├── 📁 categories/      # 分类管理
│   │   │   ├── 📁 tags/            # 标签管理
│   │   │   ├── 📁 comments/        # 评论管理
│   │   │   ├── 📁 menus/           # 菜单管理
│   │   │   └── 📁 settings/        # 站点设置
│   │   ├── 📁 api/                 # API 路由
│   │   │   ├── 📁 admin/           # 后台 API
│   │   │   ├── 📁 posts/           # 文章 API
│   │   │   ├── 📁 pages/           # 页面 API
│   │   │   ├── 📁 comments/        # 评论 API
│   │   │   └── 📁 auth/            # 认证 API
│   │   ├── 📁 posts/               # 文章页面
│   │   ├── 📁 pages/               # 自定义页面
│   │   ├── 📁 categories/          # 分类页面
│   │   └── 📁 tags/                # 标签页面
│   ├── 📁 components/              # React 组件
│   │   ├── 📄 Navigation.tsx       # 导航组件
│   │   ├── 📄 PostCard.tsx         # 文章卡片
│   │   ├── 📄 Comments.tsx         # 评论组件
│   │   ├── 📄 MarkdownEditor.tsx   # Markdown 编辑器
│   │   └── 📄 SearchAndFilter.tsx  # 搜索筛选
│   ├── 📁 models/                  # 数据模型
│   │   ├── 📄 PostModel.ts         # 文章模型
│   │   ├── 📄 PageModel.ts         # 页面模型
│   │   ├── 📄 CommentModel.ts      # 评论模型
│   │   ├── 📄 CategoryModel.ts     # 分类模型
│   │   └── 📄 TagModel.ts          # 标签模型
│   ├── 📁 services/                # 服务层
│   │   ├── 📄 DatabaseService.ts   # 数据库服务
│   │   └── 📄 SiteSettingsService.ts # 站点设置服务
│   ├── 📁 hooks/                   # React Hooks
│   │   └── 📄 useAuth.ts           # 认证 Hook
│   ├── 📁 middleware/              # 中间件
│   │   └── 📄 auth.ts              # 认证中间件
│   └── 📁 lib/                     # 工具库
│       └── 📄 blog.ts              # 博客工具函数
├── 📄 schema.sql                   # 数据库结构
├── 📄 wrangler.toml               # Cloudflare 配置
├── 📄 package.json                # 项目依赖
├── 📄 next.config.js              # Next.js 配置
├── 📄 tailwind.config.js          # Tailwind 配置
└── 📄 README.md                   # 项目文档
```

## 🚀 快速开始

### 环境要求
- Node.js 18.17 或更高版本
- npm 或 yarn 包管理器
- Git 版本控制

### 快速安装

```bash
# 克隆项目
git clone <repository-url>
cd my-blog

# 安装依赖
npm install

# 环境配置
cp .env.example .env.local

# 数据库初始化
npx wrangler d1 create my-blog-db
npx wrangler d1 execute my-blog-db --local --file=./schema.sql

# 启动开发服务器
npm run dev
```

### 访问应用
- 前台：http://localhost:3000
- 后台：http://localhost:3000/admin
- 默认管理员账户：`admin` / `admin123`

### 📝 详细安装说明

需要详细的安装和配置步骤？请查看 **[安装配置指南 📖](SETUP.md)**，包含：
- 完整的环境配置说明
- Cloudflare 服务配置
- 部署配置详解
- 常见问题解决方案

## 🌐 部署指南

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

## 📚 API 文档

### 认证 API

#### 登录
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

#### 登出
```http
POST /api/auth/logout
```

### 文章 API

#### 获取文章列表
```http
GET /api/posts?page=1&limit=10&category=tech&tag=nextjs
```

#### 获取单篇文章
```http
GET /api/posts/[slug]
```

#### 创建文章（需认证）
```http
POST /api/admin/posts
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "文章标题",
  "content": "文章内容",
  "published": true,
  "category_id": 1,
  "tags": [1, 2, 3]
}
```

### 评论 API

#### 获取文章评论
```http
GET /api/comments/[postId]
```

#### 提交评论
```http
POST /api/comments
Content-Type: application/json

{
  "post_id": 1,
  "author_name": "用户名",
  "author_email": "user@example.com",
  "content": "评论内容",
  "parent_id": null
}
```

### 页面 API

#### 获取自定义页面
```http
GET /api/pages/[slug]
```

#### 创建页面（需认证）
```http
POST /api/admin/pages
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "页面标题",
  "slug": "page-url",
  "content": "页面内容",
  "is_published": true,
  "show_in_menu": true
}
```

## 🔧 功能模块详解

### 文章管理系统

#### 核心功能
- **Markdown 编辑器**：支持实时预览、语法高亮
- **分类标签**：灵活的内容组织方式
- **草稿系统**：支持保存草稿、定时发布
- **SEO 优化**：自定义 meta 标签、URL 别名

#### 技术实现
```typescript
// 文章模型示例
interface Post {
  id: number;
  slug: string;
  title: string;
  content: string;
  markdown_content: string;
  published: boolean;
  category_id: number;
  tags: Tag[];
  view_count: number;
  created_at: string;
}
```

### 自定义页面系统

#### 功能特性
- **页面模板**：支持默认和自定义模板
- **自定义代码**：可添加页面级 CSS/JavaScript
- **菜单集成**：自动集成到网站导航
- **SEO 设置**：独立的元数据配置

#### 使用示例
```typescript
// 创建自定义页面
const pageData = {
  title: "关于我们",
  slug: "about",
  content: "<h1>关于我们</h1>",
  is_published: true,
  show_in_menu: true,
  menu_order: 1
};
```

### 评论系统

#### 功能特性
- **嵌套回复**：支持多层评论回复
- **审核机制**：评论需要审核后显示
- **垃圾过滤**：基本的垃圾评论检测
- **用户信息**：记录 IP、User Agent 等

#### 评论流程
1. 用户提交评论
2. 系统验证数据（邮箱格式、内容长度）
3. 记录用户信息（IP、浏览器）
4. 设置为待审核状态
5. 管理员审核后公开显示

### 搜索筛选系统

#### 搜索功能
- **全文搜索**：标题、摘要、内容全文检索
- **分类筛选**：按文章分类筛选
- **标签筛选**：按标签筛选文章
- **年份归档**：按发布年份筛选

#### 实现原理
```typescript
// 搜索逻辑示例
const filteredPosts = posts.filter(post => {
  if (searchQuery) {
    const searchLower = searchQuery.toLowerCase();
    return post.title.toLowerCase().includes(searchLower) ||
           post.content.toLowerCase().includes(searchLower);
  }
  return true;
});
```

### 后台管理系统

#### 管理模块
- **内容管理**：文章、页面、评论的增删改查
- **用户管理**：管理员账户管理
- **站点设置**：基本信息、显示设置、功能开关
- **数据统计**：访问量、评论数等统计信息

#### 权限控制
- JWT Token 认证
- 中间件拦截未授权请求
- 会话过期自动跳转登录

## 🎨 定制化指南

### 主题定制

#### 颜色配置
编辑 `tailwind.config.js`：
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        }
      }
    }
  }
}
```

#### 自定义组件
创建新组件在 `src/components/` 目录：
```typescript
// src/components/CustomCard.tsx
export default function CustomCard({ children }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      {children}
    </div>
  );
}
```

### 功能扩展

#### 添加新的内容类型
1. 修改数据库 schema
2. 创建对应的数据模型
3. 添加 API 路由
4. 创建管理界面

#### 集成第三方服务
```typescript
// 示例：集成分析服务
export function trackPageView(url: string) {
  if (typeof window !== 'undefined') {
    gtag('config', 'GA_TRACKING_ID', {
      page_path: url,
    });
  }
}
```

## 🐛 故障排除

### 常见问题

#### 1. 数据库连接失败
```bash
# 检查数据库配置
npx wrangler d1 list

# 重新创建本地数据库
npx wrangler d1 execute my-blog-db --local --file=./schema.sql
```

#### 2. 构建失败
```bash
# 清除缓存
rm -rf .next
npm run build
```

#### 3. 样式不生效
```bash
# 重新构建 Tailwind CSS
npm run build:css
```

### 调试技巧

#### 开启调试模式
```javascript
// next.config.js
module.exports = {
  env: {
    DEBUG: process.env.NODE_ENV === 'development'
  }
}
```

#### 查看数据库数据
```bash
# 查询本地数据库
npx wrangler d1 execute my-blog-db --local --command="SELECT * FROM posts LIMIT 5"
```

## 🔄 版本更新

### 更新流程
1. 查看 CHANGELOG.md 了解更新内容
2. 备份数据库和配置文件
3. 更新代码：`git pull origin main`
4. 安装新依赖：`npm install`
5. 运行数据库迁移（如有）
6. 重新构建和部署

### 数据迁移
```bash
# 运行数据库迁移脚本
npx wrangler d1 execute my-blog-db --file=./migrations/001_add_new_fields.sql
```

## 📊 性能优化

### 前端优化
- **图片优化**：使用 Next.js Image 组件
- **代码分割**：动态导入大型组件
- **缓存策略**：合理设置缓存头

### 后端优化
- **数据库索引**：为常用查询字段添加索引
- **查询优化**：减少 N+1 查询问题
- **缓存机制**：使用 Redis 或内存缓存

### 部署优化
```javascript
// next.config.js
module.exports = {
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../../'),
  },
  images: {
    domains: ['yourdomain.com'],
  },
}
```

## 🔒 安全最佳实践

### 认证安全
- 使用强密码策略
- JWT Token 定期轮换
- 实现登录尝试限制

### 数据安全
- 输入验证和净化
- SQL 注入防护
- XSS 攻击防护

### 部署安全
- 启用 HTTPS
- 设置安全头
- 定期更新依赖

## 🤝 贡献指南

### 开发规范
- 使用 TypeScript 编写代码
- 遵循 ESLint 和 Prettier 规则
- 编写单元测试
- 更新相关文档

### 提交规范
```bash
# 功能添加
git commit -m "feat: 添加文章搜索功能"

# 问题修复
git commit -m "fix: 修复评论提交失败的问题"

# 文档更新
git commit -m "docs: 更新 API 文档"
```

### Pull Request
1. Fork 项目到你的账户
2. 创建功能分支：`git checkout -b feature/new-feature`
3. 提交更改：`git commit -m "feat: 添加新功能"`
4. 推送分支：`git push origin feature/new-feature`
5. 创建 Pull Request

## 📝 许可证

本项目采用 MIT 许可证。详情请查看 [LICENSE](LICENSE) 文件。

## 🙏 致谢

感谢以下开源项目和工具：
- [Next.js](https://nextjs.org/) - React 全栈框架
- [Tailwind CSS](https://tailwindcss.com/) - 原子化 CSS 框架
- [Cloudflare](https://cloudflare.com/) - 边缘计算平台
- [TypeScript](https://typescriptlang.org/) - JavaScript 类型系统

## 📮 联系方式

- 项目地址：[GitHub Repository]
- 问题报告：[GitHub Issues]
- 邮箱：your-email@example.com

---

**⭐ 如果这个项目对你有帮助，请给个 Star！**