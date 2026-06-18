# Shark Tech Blog · 项目实施规划（V1）

> 本文档梳理整个项目的目标、现状、架构、模块分工、实施步骤、验收标准与 TODO 清单。
> 面向对象：项目维护者 / 迭代开发者 / 部署工程师。

---

## 1. 项目定位与目标

### 1.1 项目定位

一个具有"像素鲨客 / Retro × Ocean × Code"视觉气质的个人技术博客：

- 作者可以在 Directus 后台写文章、上传封面图、管理分类和标签；
- 读者在 Next.js 前台浏览文章、分类聚合、时间线归档、搜索、查看好友；
- 所有内容都走 Directus API，没有内容写死在前端代码里；
- 视觉风格统一，像素风 + 海洋配色 + 代码片段美学。

### 1.2 V1 目标（必须完成的闭环）

```
后台写文章 → Directus 保存 → API 暴露 → Next.js 前台渲染 → 读者可浏览
```

V1 验收标准：

- [ ] 后台登录 Directus（`http://localhost:8055`），可新增/编辑/发布文章；
- [ ] 前台首页、文章列表、文章详情页都能读取到已发布文章；
- [ ] 分类、标签、时间线、搜索、好友、关于都有对应页面且能读到数据；
- [ ] 文章支持封面图，正文使用 Markdown 渲染，代码块有语法高亮；
- [ ] 移动端可正常浏览；
- [ ] 提供完整的模拟数据回退方案（无 Directus 也能看到完整页面效果）。

### 1.3 V1 明确不做

- 评论系统
- 注册/登录/会员
- 点赞、收藏、复杂统计
- 真·全文搜索（目前只做前端过滤）
- 多作者协作

---

## 2. 架构总览

### 2.1 系统结构

```
+-----------+       HTTP / REST       +-----------+      File System
|  浏览器     |  <--------------------  |  Next.js   |    (uploads/)
+-----------+                          +-----+-----+
                                             │
                                       fetch │ /items/*
                                             ▼
                                     +-------------------+
                                     |  Directus CMS      |
                                     |  (Docker 容器)       |
                                     +---------+----------+
                                               │
                                            SQLite
                                               │
                                     +-------------------+
                                     |  directus/database  |
                                     |  /uploads            |
                                     +-------------------+
```

### 2.2 目录结构

```
/workspace
├── blog-frontend/            Next.js 前台
│   ├── app/                  App Router 页面
│   │   ├── layout.tsx        根布局（metadata）
│   │   ├── page.tsx          首页
│   │   ├── posts/
│   │   │   ├── page.tsx      文章列表
│   │   │   └── [slug]/       文章详情
│   │   ├── archive/          时间线归档
│   │   ├── categories/       分类聚合
│   │   ├── search/           搜索
│   │   ├── about/            关于我
│   │   ├── friends/          好友页
│   │   ├── editor/           编辑器原型
│   │   └── dashboard/        仪表盘原型
│   ├── components/           可复用组件
│   │   ├── PageShell.tsx     页面外壳（Header + 内容 + Footer）
│   │   ├── Header / Footer / Sidebar
│   │   ├── Hero.tsx
│   │   ├── PixelCard.tsx     统一的像素风卡片
│   │   ├── PostCard.tsx      文章卡片
│   │   ├── PostThumb.tsx
│   │   ├── ArticleContent.tsx Markdown 正文渲染
│   │   ├── TagPill.tsx
│   │   ├── StatsGrid.tsx
│   │   ├── Timeline.tsx
│   │   ├── Logo.tsx
│   │   └── SharkMascot.tsx
│   ├── lib/
│   │   ├── directus.ts       Directus API 封装（失败回退 mock）
│   │   ├── mock-data.ts      模拟数据（文章、分类、标签、好友）
│   │   └── utils.ts          日期格式化等通用函数
│   ├── types/
│   │   └── post.ts           Post / Category / Tag / Friend 类型
│   ├── public/
│   │   ├── generated-assets/ 像素风插画
│   │   └── images/           占位封面
│   ├── docs/
│   │   ├── tech-stack.md     技术栈说明
│   │   └── directus-schema.md Directus 集合建议
│   ├── docker-compose.yml    启动 Directus
│   └── package.json
├── directus-cms/             Directus 容器挂载目录
│   ├── docker-compose.yml    Directus 启动配置（SQLite）
│   ├── database/             Directus 数据（运行时产生）
│   ├── uploads/              上传资源
│   └── extensions/           扩展
└── docs/                     项目文档（根级别）
    ├── 个人博客第一版重构实施文档.md
    ├── 技术栈.md
    └── project-plan.md       ← 你正在看的这一份
```

### 2.3 技术栈

| 层 | 技术 |
| -- | ---- |
| 前端框架 | Next.js 14 (App Router) / React 18 / TypeScript 5 |
| 样式 | Tailwind CSS 3 + 自定义主题（`ocean`、`coral`、`sand` 等） |
| CMS | Directus 11（Docker 容器 + SQLite） |
| 数据源 | Directus REST API，失败时回退 `lib/mock-data.ts` |
| 包管理 | pnpm |
| Markdown | 自定义 `ArticleContent`（后续可接入 `react-markdown` + `rehype-highlight`） |

---

## 3. 数据模型设计

> 目标：在 Directus 中建立清晰的 collection 与关系，让前台只做展示，不做业务。

### 3.1 已存在字段（来自 `types/post.ts`）

**Post**：`id / title / slug / summary / content / cover / status / publishedAt / category / tags / views / likes / comments`

**Category**：`id / name / slug / description / icon / [count]`

**Tag**：`id / name / slug / color / [count]`

**Friend**：`id / name / role / description / url / avatar / tags[]`

### 3.2 Directus 集合建议

在 Directus 后台创建以下 collections（字段名用 `snake_case`，因为 Directus 默认风格）。

#### `posts`

| 字段 | 类型 | 必填 | 说明 |
| ---- | ---- | ---- | ---- |
| `status` | Status (draft/published/archived) | ✅ | 公开过滤 `status == published` |
| `title` | String | ✅ | 文章标题 |
| `slug` | String（唯一） | ✅ | URL 段，例如 `mini-rust-web-framework` |
| `summary` | Text | ✅ | TL;DR 摘要 |
| `content` | Markdown / WYSIWYG | ✅ | 正文 |
| `cover` | Image（file relation） | - | 封面图 |
| `category` | M2O → `categories` | ✅ | 所属分类 |
| `tags` | M2M → `tags` | - | 多标签 |
| `published_at` | DateTime | - | 发布时间（由 Directus 提供 `date_created` 也可） |
| `views` | Integer | - | 浏览量（可留空） |
| `likes` | Integer | - | 点赞数 |
| `comments` | Integer | - | 评论数 |

#### `categories`

| 字段 | 类型 | 必填 |
| ---- | ---- | ---- |
| `name` | String | ✅ |
| `slug` | String（唯一） | ✅ |
| `description` | Text | - |
| `icon` | String（emoji） | - |

#### `tags`

| 字段 | 类型 | 必填 |
| ---- | ---- | ---- |
| `name` | String | ✅ |
| `slug` | String（唯一） | ✅ |
| `color` | String（`coral|sand|mint|blue|purple`） | - |

#### `friends`

| 字段 | 类型 | 必填 |
| ---- | ---- | ---- |
| `name` | String | ✅ |
| `role` | String | - |
| `description` | Text | - |
| `url` | String（URL） | ✅ |
| `avatar` | Image / String（emoji） | - |
| `tags` | Tags（CSV 字符串） | - |

### 3.3 权限（Public 角色）

| Collection | 权限 | 过滤 |
| ---------- | ---- | ---- |
| `posts` | 读 | `status = published` |
| `categories` | 读 | - |
| `tags` | 读 | - |
| `friends` | 读 | - |
| `directus_files` | 读 | `private = false`（用于封面图访问） |

> 注意：为让封面图正确被前台访问，需要给 `Public` 授予 `directus_files` 的读权限，或者上传文件时选择"公开"。

---

## 4. 前端模块分工与职责

### 4.1 数据层（`lib/`）

- `lib/directus.ts`：统一封装 `getPosts / getPostBySlug / getCategories / getTags / getFriends`；
  - 只要 `NEXT_PUBLIC_DIRECTUS_URL` 未设置或请求失败，立即回退 `lib/mock-data.ts`；
  - 返回类型与 `types/post.ts` 保持一致（`Post / Category / Tag / Friend`）。
- `lib/mock-data.ts`：本地开发用的假数据；作为"可视化原型"兜底。
- `lib/utils.ts`：`formatDate` 等通用工具。

### 4.2 类型层（`types/`）

- `types/post.ts`：唯一数据类型来源；所有组件 props 从这里继承。

### 4.3 页面层（`app/`）

| 路由 | 职责 | 数据依赖 |
| ---- | ---- | -------- |
| `/` | Hero + 最新文章 + 统计 + TOP 标签 + 代码片段 | `getPosts, getTags` |
| `/posts` | 文章网格列表 + 标签过滤入口 | `getPosts, getTags` |
| `/posts/[slug]` | 文章详情（标签 + 作者侧栏 + 相关文章） | `getPostBySlug, getPosts` |
| `/archive` | 按年份分组的时间线 | `getPosts` |
| `/categories` | 分类列表 + 分类下的文章聚合 | `getCategories, getPosts` |
| `/search` | 前端关键词搜索（标题 / 摘要 / 标签） | `getPosts` |
| `/friends` | 好友卡片 | `getFriends` |
| `/about` | 关于我（静态文案） | 无 |
| `/editor` | 编辑器原型（静态展示） | 无 |
| `/dashboard` | 仪表盘原型（静态展示） | 无 |

### 4.4 组件层（`components/`）

- **PageShell**: 统一 Header + 内容区 + Footer；
- **PixelCard**: 视觉统一的"像素卡片"容器；
- **PostCard**: 文章卡片，支持紧凑模式（`compact`）；
- **ArticleContent**: Markdown 正文渲染；
- **Hero / SharkMascot / Logo**: 视觉元素；
- **TagPill / PostThumb / StatsGrid / Timeline**: 小组件。

---

## 5. 实施步骤（按顺序执行）

### Phase 0 · 环境准备

**目标**：让项目在本地跑起来，能看到页面效果。

1. `cd blog-frontend && pnpm install`
2. `cp .env.example .env.local`
3. `pnpm dev` → 打开 `http://localhost:3000` 验证首页
4. 启动 Directus（可选）：`cd directus-cms && docker compose up -d`

### Phase 1 · Directus 数据模型落地

**目标**：Directus 后台里有完整的 collection + 至少 5 篇示例文章。

1. 打开 `http://localhost:8055`，用管理员账号登录（见根 README）
2. 创建 `categories` 集合，至少创建 3 个分类（后端开发、前端开发、运维部署…）
3. 创建 `tags` 集合，至少创建 5 个标签（Rust、TypeScript、Linux、Docker、算法…）
4. 创建 `posts` 集合，字段按照 **§3.2** 创建并建立 `category`、`tags` 关系
5. 创建 `friends` 集合
6. 新建至少 5 篇示例文章，设置 status = `published`
7. 在 Settings → Access Control 中给 Public 角色设置读权限（见 **§3.3**）
8. 访问 `http://localhost:8055/items/posts?filter[status][_eq]=published`，能拿到 JSON 数据

### Phase 2 · 前后端联调

**目标**：Next.js 前台真的从 Directus 读数据，而不是只走 mock。

1. 在 `blog-frontend/.env.local` 中设置 `NEXT_PUBLIC_DIRECTUS_URL=http://localhost:8055`
2. 如果需要静态 Token：`DIRECTUS_STATIC_TOKEN=xxxx`
3. 确认 `lib/directus.ts` 中 `normalizePost` 对字段名的映射与 Directus 保持一致（`category.*`、`tags.tags_id.*`）
4. 刷新 `/`、`/posts`、`/posts/mini-rust-web-framework`，页面应展示 Directus 中的文章
5. 验证封面图：`${DIRECTUS_URL}/assets/${fileId}` 能正确返回图片

### Phase 3 · 视觉与交互完善

**目标**：页面看起来精致、统一、响应式。

1. 检查首页 Hero 的标题与副标题，替换为作者个人简介；
2. 检查文章详情页，封面图使用 `post.cover`，没有时回退默认插画；
3. 检查 `/archive` 的时间线分组是否按年份；
4. 检查 `/categories` 的分类聚合是否按分类显示文章；
5. 检查 `/search`：支持按标题、摘要、标签过滤（前端过滤即可）；
6. 移动端 375px / 768px 两种分辨率下没有横滚、错位。

### Phase 4 · 工程质量与部署准备

1. `pnpm build` 构建成功（没有 TS / lint 报错）
2. 补充 `sitemap.xml` 与 `robots.txt`（V1 可选）
3. 制定部署方案（Docker / Vercel / 自托管 Nginx），详见 **§6**
4. 提供生产环境 Directus 配置（修改 SECRET、管理员账号等）

---

## 6. 部署方案

### 6.1 推荐方案（最简单）

- **Directus**：一台 1C1G 的云服务器 + Docker Compose；
- **Next.js**：使用 Vercel / Cloudflare Pages 自动部署；
- **域名**：`blog.example.com` 指向前台，`cms.example.com` 指向 Directus。

### 6.2 单机方案（一台服务器搞定）

```
服务器
├── Directus 容器（8055）
├── Next.js build 后运行 standalone（3000）
└── Nginx 反向代理
    ├── blog.example.com → 3000
    └── cms.example.com → 8055
```

### 6.3 环境变量

**生产环境 `.env.local`**：

```
NEXT_PUBLIC_DIRECTUS_URL=https://cms.example.com
DIRECTUS_STATIC_TOKEN=<directus-后台生成的静态 token>
NEXT_PUBLIC_SITE_URL=https://blog.example.com
```

**Directus `.env`**：

```
SECRET=<随机字符串>
PUBLIC_URL=https://cms.example.com
DB_CLIENT=sqlite3
DB_FILENAME=/directus/database/data.db
WEBSOCKETS_ENABLED=true
```

---

## 7. TODO 清单（按优先级）

> 这是 V1 必须完成的任务列表，按模块组织。

### 7.1 环境与基础

- [ ] `blog-frontend` 下运行 `pnpm install && pnpm dev`，首页可访问
- [ ] 能启动 Directus（`cd directus-cms && docker compose up -d`）
- [ ] `.env.example` 与 `.env.local` 文件齐全
- [ ] `pnpm build` 一次，记录是否有 TS / lint 错误

### 7.2 Directus 数据模型

- [ ] 创建 `categories` 集合（name / slug / description / icon）
- [ ] 创建 `tags` 集合（name / slug / color）
- [ ] 创建 `posts` 集合，字段齐全
- [ ] 建立 `posts.category`（M2O → categories）
- [ ] 建立 `posts.tags`（M2M → tags）
- [ ] 创建 `friends` 集合
- [ ] 新建至少 5 篇示例文章（status = published）
- [ ] 给 Public 角色配置读权限（posts / categories / tags / friends / directus_files）
- [ ] 用浏览器直接访问 `/items/posts?filter[status][_eq]=published` 验证返回

### 7.3 前端数据接入 & 页面

- [ ] 配置 `.env.local` 中 `NEXT_PUBLIC_DIRECTUS_URL`
- [ ] `/`（首页）展示最新 4 篇文章 + TOP 8 标签
- [ ] `/posts` 展示全部文章，网格布局
- [ ] `/posts/[slug]` 展示正文（Markdown 渲染）、标签、作者卡、相关文章
- [ ] `/archive` 按年份 / 月份分组展示时间线
- [ ] `/categories` 展示分类卡片并聚合对应文章
- [ ] `/search` 支持关键词过滤（标题 / 摘要 / 标签名）
- [ ] `/friends` 展示好友卡片
- [ ] `/about` 展示关于我（静态内容，可接入 Directus `site_settings` 作为扩展）
- [ ] 封面图在"有 Directus 图 / 无图 / 仅 mock 图"三种情况下都不裂图

### 7.4 Markdown / 正文渲染

- [ ] `ArticleContent.tsx` 至少支持基础 Markdown（`#`、`**`、列表、代码块）
- [ ] 代码块显示语法高亮（或至少以 `<pre><code>` 包裹的 monospace 样式）
- [ ] 长段落的可读性（行高 / 最大宽度 / 段落间距）

### 7.5 响应式

- [ ] 移动端 375px：无横向滚动、无错位
- [ ] 平板 768px：网格布局正常
- [ ] 桌面 1280px：双栏布局正常

### 7.6 构建与部署

- [ ] `pnpm build` 成功
- [ ] 准备部署文档：服务器目录、Docker Compose、Nginx 反代配置
- [ ] 正式环境修改 Directus `SECRET` 与管理员密码
- [ ] 生产环境可访问 `blog.example.com` 与 `cms.example.com`
- [ ] 生产环境 SSL / HTTPS 正常（Let's Encrypt）

### 7.7 扩展项（V2+）

- [ ] 接入 `react-markdown` + `remark-gfm` + `rehype-highlight`，替换当前纯文本渲染
- [ ] `site_settings` 集合，统一管理站点名、简介、作者头像
- [ ] Directus Flow → Webhook 通知 Next.js `revalidatePath`，文章发布即刷新
- [ ] 接入评论（Giscus / Waline）
- [ ] 文章按分类、按标签单独路由页面（`/categories/[slug]`、`/tags/[slug]`）
- [ ] 浏览量埋点（`posts.views` 自增）
- [ ] Sitemap / RSS

---

## 8. 验收清单

- [ ] 写一篇新文章 → 发布 → 前台 `/posts` 能看到 → 点进去正文、标签、摘要都正确
- [ ] 上传一张封面 → 前台首页与详情页都能显示
- [ ] 点一个标签 → `/search`（或将来的 `/tags/[slug]`）能聚合同类文章
- [ ] 关闭 Directus 容器 → 前台页面仍能用 mock 数据渲染（不白屏）
- [ ] `pnpm build` 0 错误
- [ ] 手机扫码访问线上版本，页面可用

---

## 9. 常见问题速查

| 症状 | 可能原因 | 检查项 |
| ---- | -------- | ------ |
| 前台不显示文章，只有空卡 | Directus 没数据或权限未开启 | `/items/posts` 是否返回 published 文章 |
| 封面图不显示（裂图） | `directus_files` 的 Public 权限未开 / URL 拼接错误 | 浏览器访问 `${DIRECTUS_URL}/assets/${fileId}` 是否有图 |
| 标签不显示 | M2M 的 `fields=*,tags.tags_id.*` 不完整或权限问题 | 打开浏览器 DevTools 看 Network 响应 |
| 页面样式错位 | Tailwind 自定义主题 token（`ocean` / `coral`）拼写错误 | 检查 `tailwind.config.ts` 的 `theme.extend.colors` |
| Docker 容器起不来 | 端口占用 / 磁盘满 | `docker compose logs -f` |
| `pnpm build` 失败 | TS 类型未闭合 / `params` 应为 async（Next 15） | 检查 `app/posts/[slug]/page.tsx` 的 `params` 类型 |

---

## 10. 版本路线图

```
V1 → 发布闭环。首页/文章列表/详情/分类/时间线/搜索/好友/关于，都能用。
V2 → 标签/分类独立路由页面、文章发布自动刷新、评论系统。
V3 → 站点设置集合、RSS / Sitemap、浏览量埋点、AI 摘要。
```

---

文档结束。
