# Shark Tech Blog

一个现代化的个人博客系统，前端使用 Next.js，后端使用 Directus CMS。

## 技术栈

- **前端**：Next.js 14 + React 18 + TypeScript + Tailwind CSS
- **CMS**：Directus 11（Docker 运行，SQLite 数据库）
- **包管理**：pnpm

## 项目结构

```
BlogSystem/
├── blog-frontend/      # Next.js 前端
│   ├── app/            # 页面路由
│   │   ├── about/      # 关于页面
│   │   ├── admin/      # 管理后台（仪表盘 + 编辑器，需登录）
│   │   ├── archive/    # 归档页面
│   │   ├── categories/ # 分类页面
│   │   ├── friends/    # 友链页面
│   │   ├── login/      # 登录页
│   │   ├── posts/      # 文章页面
│   │   └── search/     # 搜索页面
│   ├── components/     # 组件库
│   ├── lib/            # 数据层与工具
│   ├── types/          # TypeScript 类型
│   ├── public/         # 静态资源
│   └── docs/           # 前端文档
├── directus-cms/       # Directus CMS 配置
│   └── .env.example    # 环境变量示例
└── docs/               # 项目文档
```

## 快速开始

### 前置要求

- Node.js 18+
- pnpm
- Docker

### 启动 Directus CMS

```bash
cd directus-cms
docker compose up -d
```

Directus 将运行在 http://localhost:8055

### 启动前端开发服务器

```bash
cd blog-frontend
pnpm install
pnpm dev
```

前端将运行在 http://localhost:3000

## 可用脚本

在 `blog-frontend` 目录下：

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 构建生产版本 |
| `pnpm start` | 启动生产服务器 |
| `pnpm lint` | 代码检查 |
| `pnpm directus:up` | 启动 Directus |
| `pnpm directus:down` | 停止 Directus |

## 环境变量

复制 `.env.example` 为 `.env.local`：

```bash
cp blog-frontend/.env.example blog-frontend/.env.local
```

### 前端（`blog-frontend/.env.local`）

| 变量 | 说明 | 示例 |
|------|------|------|
| `DIRECTUS_URL` | Directus API 地址（仅服务端，不要加 NEXT_PUBLIC_ 前缀） | `http://localhost:8055` |
| `DIRECTUS_STATIC_TOKEN` | Directus 静态 Token（仅服务端） | `xxxx` |
| `NEXT_PUBLIC_SITE_URL` | 站点 URL（用于 metadataBase） | `http://localhost:3000` |

### Directus（`directus-cms/.env`）

| 变量 | 说明 |
|------|------|
| `DIRECTUS_KEY` | JWT 轮换密钥（随机字符串） |
| `DIRECTUS_SECRET` | JWT 签名密钥（随机字符串） |
| `ADMIN_EMAIL` | 管理员邮箱 |
| `ADMIN_PASSWORD` | 管理员密码（≥12 位强密码） |
| `CORS_ORIGIN` | 允许的前端域名 |

## 许可证

MIT
