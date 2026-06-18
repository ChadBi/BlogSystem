# Shark Tech Blog

一个现代化的个人博客系统，前端使用 Next.js，后端使用 Directus CMS。

## 技术栈

- **前端**：Next.js 14 + React 18 + TypeScript + Tailwind CSS
- **CMS**：Directus 11（Docker 运行，SQLite 数据库）
- **包管理**：pnpm

## 项目结构

```
blog-system/
├── blog-frontend/      # Next.js 前端
│   ├── app/            # 页面路由
│   │   ├── about/      # 关于页面
│   │   ├── archive/    # 归档页面
│   │   ├── categories/ # 分类页面
│   │   ├── dashboard/  # 仪表盘
│   │   ├── editor/     # 编辑器
│   │   ├── friends/    # 友链页面
│   │   ├── posts/      # 文章页面
│   │   └── search/     # 搜索页面
│   └── components/     # 组件库
├── directus-cms/       # Directus CMS 配置
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

## 许可证

MIT
