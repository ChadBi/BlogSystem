# Shark Tech Blog · 关键问题修复 Spec

## Why

基于《项目问题分析报告》发现 13 项严重问题与 29 项中等问题，涉及安全漏洞、Spec 违规、生产可用性缺失、SEO 缺失等。本 Spec 聚焦最关键的修复项，使项目达到「可安全上线」的最低标准，并补齐 Spec 中承诺但未实现的核心功能。

## What Changes

### 安全与配置
- 移除仓库中硬编码的 Directus 弱密码（`admin123456`、`blog_password`），改为环境变量引用
- 删除误导性的 `blog-frontend/docker-compose.yml`
- 补齐 `directus-cms/docker-compose.yml` 的 `KEY`/`ADMIN_*`/`CORS`/`restart` 配置
- 重命名 `docker-compose copy.yml` 为 `docker-compose.postgres.yml`，固定版本号
- 补齐 `.gitignore` 忽略 `directus-cms/postgres-data/`、`blog-frontend/directus/`
- 修复 `getPostBySlug` 的 slug 注入与 status 过滤缺失（防越权读草稿）
- `NEXT_PUBLIC_DIRECTUS_URL` 改为 `DIRECTUS_URL`（去掉公开前缀），加 `server-only`

### 可观测性与 SEO
- `fetchDirectus` 失败时记录 `console.error`，区分原因
- 所有子页面补齐 `metadata`，文章详情页用 `generateMetadata`
- `app/layout.tsx` 补齐 `metadataBase` / `openGraph` / `robots` / `viewport`
- 使用 `NEXT_PUBLIC_SITE_URL`（已在 .env.example 声明但零引用）

### Spec 合规
- 新增 `/categories/[slug]` 路由，分类卡片改为 `<Link>` 跳转
- 文章详情页「相关文章」按同分类过滤
- 文章详情页 header 展示分类链接
- 首页「TOP 8 标签」按文章数降序排序
- `StatsGrid` 与 dashboard 统计数据改为从 `getPosts` 动态聚合

### 移动端与体验
- `PageShell` 改为响应式双列布局（lg 以上才双列）
- `Header` 补齐移动端汉堡菜单
- 修复 `Sidebar` 中 JSX 文本 `\n` 字面量问题
- 引入 `highlight.js/styles/github-dark.css`
- 统一使用 `next/link` 的 `Link`（替换 `<a>`）
- 修复 `Hero` 的 emoji（🐾 → 🦈）
- `Footer` 年份动态化

### 文档一致性
- 删除重复的 `docs/技术栈.md`
- 修正 `README.md` 目录名大小写与结构图
- 补齐 `blog-frontend/docs/directus-schema.md` 的 `comments`/`date_created` 字段
- 修正 `tasks.md`/`checklist.md` 中过度乐观的完成状态

## Impact

- Affected specs: `shark-tech-blog-v1`（修正其未真正满足的验收项）
- Affected code:
  - `blog-frontend/lib/directus.ts` — 安全、可观测性、分页
  - `blog-frontend/app/layout.tsx` 及所有子页面 — metadata
  - `blog-frontend/app/categories/[slug]/page.tsx` — 新增路由（**BREAKING**：补齐 Spec 承诺）
  - `blog-frontend/app/posts/[slug]/page.tsx` — 相关文章、分类展示
  - `blog-frontend/app/page.tsx` — TOP 标签排序、StatsGrid 动态化
  - `blog-frontend/components/PageShell.tsx`、`Header.tsx`、`Sidebar.tsx`、`Hero.tsx`、`Footer.tsx`、`ArticleContent.tsx` — 移动端与体验
  - `blog-frontend/next.config.mjs` — `images.remotePatterns` 收紧
  - `blog-frontend/.env.example` — 变量重命名
  - `directus-cms/docker-compose.yml` — 补齐配置
  - `.gitignore` — 补齐忽略项
  - `README.md`、`docs/` — 文档一致性

## ADDED Requirements

### Requirement: 分类详情页路由

系统 SHALL 提供 `/categories/[slug]` 路由，展示指定分类下的所有已发布文章。

#### Scenario: 用户点击分类卡片跳转
- **WHEN** 用户在 `/categories` 页面点击某个分类卡片
- **THEN** 跳转到 `/categories/[slug]`，展示该分类下的所有文章

#### Scenario: 访问不存在的分类
- **WHEN** 用户访问不存在的分类 slug
- **THEN** 返回 404

### Requirement: 移动端导航

系统 SHALL 在移动端提供可访问的导航菜单。

#### Scenario: 移动端汉堡菜单
- **WHEN** 用户在 < 768px 屏幕下点击汉堡按钮
- **THEN** 展开导航抽屉，包含所有页面入口与搜索框

### Requirement: Directus 失败可观测

系统 SHALL 在 Directus API 调用失败时记录错误日志，便于线上问题定位。

#### Scenario: Directus 5xx 错误
- **WHEN** Directus 返回 5xx 状态码
- **THEN** 控制台输出 `console.error` 含状态码与请求路径，再回退 mock

#### Scenario: 网络异常
- **WHEN** fetch 抛出网络异常
- **THEN** 控制台输出异常信息，再回退 mock

### Requirement: 文章详情页分类展示

系统 SHALL 在文章详情页展示文章所属分类，并提供分类页跳转链接。

#### Scenario: 展示分类链接
- **WHEN** 用户访问 `/posts/[slug]`
- **THEN** 文章 header 展示分类名，点击跳转到 `/categories/[slug]`

## MODIFIED Requirements

### Requirement: 文章详情页

系统 SHALL 提供文章详情页面，展示文章完整内容、元信息（含分类）、相关文章（同分类）。

#### Scenario: 展示文章详情
- **WHEN** 用户访问 `/posts/[slug]` 页面
- **THEN** 展示文章标题、封面图、正文内容、标签、**分类信息**

#### Scenario: 展示相关文章
- **WHEN** 文章详情页加载
- **THEN** 展示**同分类下**的其他文章推荐（最多 3 篇）

### Requirement: 分类页面

系统 SHALL 提供分类列表页面，展示所有分类及其下的文章数；点击分类跳转到分类详情页。

#### Scenario: 展示分类列表
- **WHEN** 用户访问 `/categories` 页面
- **THEN** 展示所有分类卡片，包含分类名称、描述、图标、文章数量

#### Scenario: 按分类筛选文章
- **WHEN** 用户点击某个分类
- **THEN** 跳转到 `/categories/[slug]`，展示该分类下的所有文章

### Requirement: 首页展示

系统 SHALL 在首页展示 Hero 区域、最新文章列表、**真实**统计数据、**按热度排序**的 TOP 8 标签。

#### Scenario: 首页展示统计数据
- **WHEN** 用户访问首页
- **THEN** 展示从 `getPosts` 动态聚合的文章数、总浏览量、总点赞数、总评论数

#### Scenario: 首页展示热门标签
- **WHEN** 用户访问首页
- **THEN** 展示按文章数降序排列的 TOP 8 标签

### Requirement: Directus 数据访问层

系统 SHALL 实现安全的 Directus API 封装，仅在服务端使用，slug 查询做编码与 status 过滤。

#### Scenario: 服务端独占
- **WHEN** 任何前端代码 import directus 数据层
- **THEN** 通过 `server-only` 标记阻止客户端 bundle

#### Scenario: slug 查询安全
- **WHEN** 调用 `getPostBySlug(slug)`
- **THEN** slug 经 `encodeURIComponent` 编码，查询附加 `filter[status][_eq]=published`

### Requirement: 页面元数据

系统 SHALL 为每个页面导出 `metadata` 或 `generateMetadata`，文章详情页生成 SEO 友好的元数据。

#### Scenario: 子页面有独立标题
- **WHEN** 用户访问 `/posts`、`/archive`、`/categories` 等子页面
- **THEN** 浏览器标签页显示对应页面标题，不退化为首页标题

#### Scenario: 文章详情页动态元数据
- **WHEN** 用户访问 `/posts/[slug]`
- **THEN** 页面 title 为文章标题，description 为文章摘要，含 openGraph 配置

### Requirement: Directus 容器配置

系统 SHALL 提供生产可用的 Directus docker-compose 配置，所有敏感字段通过环境变量注入。

#### Scenario: 启动 Directus
- **WHEN** 执行 `cd directus-cms && docker compose up -d`
- **THEN** Directus 容器使用 `${DIRECTUS_KEY}`/`${DIRECTUS_SECRET}`/`${ADMIN_EMAIL}`/`${ADMIN_PASSWORD}` 等环境变量启动

#### Scenario: 跨域访问
- **WHEN** 前端从不同域名访问 Directus API
- **THEN** CORS 配置允许来自 `NEXT_PUBLIC_SITE_URL` 的请求

## REMOVED Requirements

### Requirement: blog-frontend 内嵌 Directus 容器

**Reason**: `blog-frontend/docker-compose.yml` 误导用户，与 `directus-cms/docker-compose.yml` 重复且配置冲突。
**Migration**: 删除该文件，`package.json` 的 `directus:up`/`directus:down` 脚本改为指向 `directus-cms/`。
