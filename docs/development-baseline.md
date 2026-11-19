# 项目开发基线

本文档记录当前代码库的实际结构和本地开发方式，作为后续迭代的共同起点。功能规划和历史验收项仍可参考 `project-plan.md`，其中部分目录与环境变量描述尚未同步到当前实现。

## 当前架构

- 前端位于 `blog-frontend/`，使用 Next.js 14 App Router、React 18、TypeScript、Tailwind CSS 和 pnpm。
- CMS 位于 `directus-cms/`，默认 Compose 配置运行 Directus 11 和 SQLite，数据持久化在 `database/` 与 `uploads/`。
- `blog-frontend/lib/directus.ts` 在服务端读取 Directus 内容。未配置或请求失败时会回退到 `lib/mock-data.ts`。
- `blog-frontend/lib/directus-admin.ts` 使用 Directus 管理员凭据执行后台 API 操作。博客管理后台由独立的密码和签名密钥保护。
- `directus-cms/seed.mjs` 初始化 Directus 集合、字段、关系、公开读取权限与示例数据。

## 主要入口

| 路径 | 当前用途 |
| --- | --- |
| `/` | 博客首页 |
| `/posts` | 文章列表 |
| `/posts/[slug]` | 文章详情 |
| `/archive` | 文章归档 |
| `/categories`、`/categories/[slug]` | 分类与分类文章 |
| `/search` | 搜索 |
| `/friends` | 友链 |
| `/about` | 关于页面 |
| `/login`、`/admin` | 独立登录页与管理后台 |
| `/api/admin/posts` | 管理后台文章 API |

路由的最终状态以 `blog-frontend/app/` 下的代码为准。

## 本地开发

### 前置条件

- Node.js 18 或更高版本
- pnpm
- 若需要 CMS，安装并启动 Docker Desktop

### 前端

在仓库根目录执行：

```bash
cd blog-frontend
pnpm install
cp .env.example .env.local
pnpm dev
```

访问 `http://localhost:3000`。只使用模拟内容时可不启动 Directus。要使用管理后台，设置 `ADMIN_PASSWORD` 和 `AUTH_SECRET`。要启用后台文章写入，还需将 `DIRECTUS_ADMIN_EMAIL` 与 `DIRECTUS_ADMIN_PASSWORD` 配置为有效的 Directus 管理员凭据。

### Directus

在仓库根目录执行：

```bash
cp directus-cms/.env.example directus-cms/.env
```

编辑 `directus-cms/.env`，将 `DIRECTUS_KEY`、`DIRECTUS_SECRET` 和 `ADMIN_PASSWORD` 替换为自己的值，然后启动服务：

```bash
cd directus-cms
docker compose up -d
```

首次启动后，可从仓库根目录运行初始化脚本：

```bash
node directus-cms/seed.mjs
```

该脚本使用 `directus-cms/.env` 中的 Directus URL 和管理员账号，在运行中的 Directus 中建立 schema、公开读取权限及样例数据。管理后台写入文章时，`blog-frontend/.env.local` 中的 Directus 管理员凭据也需与之匹配。

## 常用检查

从 `blog-frontend/` 目录运行：

```bash
pnpm lint
pnpm typecheck
pnpm build
```

`pnpm typecheck` 运行 `tsc --noEmit`。`pnpm build` 是生产构建检查，可能需要访问字体或其他外部资源。

Windows 上若 standalone 打包阶段在复制 pnpm 符号链接时出现 `EPERM`，可在独立工作副本的 `pnpm-workspace.yaml` 中设置 `nodeLinker: hoisted`，使用原锁文件执行 `pnpm install --frozen-lockfile` 后重新构建。

## 环境变量文件

- `blog-frontend/.env.example` 是前端模板，复制为 `blog-frontend/.env.local`。
- `directus-cms/.env.example` 是 CMS 模板，复制为 `directus-cms/.env`。
- 不要将真实密钥、管理员密码或 `.env` 文件提交到版本库。

前端和 Directus 的完整变量清单以两份模板文件为准。前端数据读取依赖 `DIRECTUS_URL`，管理写入依赖 `DIRECTUS_ADMIN_EMAIL` 与 `DIRECTUS_ADMIN_PASSWORD`，后台会话依赖 `ADMIN_PASSWORD` 与 `AUTH_SECRET`。

## 已知开发限制

- 当前本地 Directus 的 `posts.tags` 直接关联单个标签。编辑器据此提供单选。现有文章关联的空名称标签不在读者端展示。
- 当前文章集合缺少 `date_updated`。后台优先显示更新时间，缺少该值时按发布日期展示和排序。

- Directus 内容结构需由 `node directus-cms/seed.mjs` 初始化，或在 Directus 中手工建立。没有 schema 时，前端会回退模拟数据。
- Docker Compose 使用本机回环地址发布 CMS 端口 `8055`。
- `docker-compose.postgres.yml` 是独立的 PostgreSQL 配置示例，当前默认启动流程使用 SQLite 配置。
