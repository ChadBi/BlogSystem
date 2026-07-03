# 关键问题修复任务清单

## Phase 1: 安全与配置（必须先做，阻塞后续）

- [x]Task 1: 移除硬编码密码并修复 docker-compose 配置
  - [x]SubTask 1.1: 重写 `directus-cms/docker-compose.yml`，补齐 KEY/ADMIN_*/CORS/restart，所有敏感字段改为 `${VAR}` 引用，端口绑 `127.0.0.1`
  - [x]SubTask 1.2: 创建 `directus-cms/.env.example`，列出所有环境变量及说明
  - [x]SubTask 1.3: 重命名 `directus-cms/docker-compose copy.yml` 为 `directus-cms/docker-compose.postgres.yml`，固定 directus 版本号，password 改环境变量
  - [x]SubTask 1.4: 删除 `blog-frontend/docker-compose.yml`
  - [x]SubTask 1.5: 修改 `blog-frontend/package.json` 的 `directus:up`/`directus:down` 脚本指向 `../directus-cms/`
  - [x]SubTask 1.6: 删除 `blog-frontend/README.md:47-48` 中的明文密码说明
  - [x]SubTask 1.7: 补齐 `.gitignore`：添加 `directus-cms/postgres-data/`、`blog-frontend/directus/`、`directus-cms/.env`

- [x]Task 2: 修复 Directus 数据层安全与可观测性
  - [x]SubTask 2.1: 在 `blog-frontend/lib/directus.ts` 顶部加 `import 'server-only';`
  - [x]SubTask 2.2: 将 `NEXT_PUBLIC_DIRECTUS_URL` 重命名为 `DIRECTUS_URL`（同步更新 `.env.example`）
  - [x]SubTask 2.3: `getPostBySlug` 加 `encodeURIComponent(slug)` 与 `&filter[status][_eq]=published`、`&limit=1`
  - [x]SubTask 2.4: `fetchDirectus` 失败分支补 `console.error`，区分 `!DIRECTUS_URL`/`!res.ok`（含状态码）/`catch`（含 err.message）
  - [x]SubTask 2.5: 显式 `return await res.json();` 以便正确捕获解析错误

- [x]Task 3: 收紧 next.config.mjs 的 images.remotePatterns
  - [x]SubTask 3.1: 从 `process.env.DIRECTUS_URL` 解析 hostname 注入 `images.remotePatterns`，去掉 `hostname: '**'` 通配
  - [x]SubTask 3.2: 启用 `output: 'standalone'`（与部署文档一致）

## Phase 2: Spec 合规功能补齐

- [x]Task 4: 新增分类详情页路由
  - [x]SubTask 4.1: 创建 `blog-frontend/app/categories/[slug]/page.tsx`，调用 `getCategories` + `getPosts`，按 slug 过滤展示该分类下文章，不存在则 `notFound()`
  - [x]SubTask 4.2: 导出 `generateStaticParams` 与 `generateMetadata`
  - [x]SubTask 4.3: 修改 `blog-frontend/app/categories/page.tsx`，分类卡片用 `<Link>` 包裹跳转到 `/categories/[slug]`

- [x] Task 5: 文章详情页补齐分类与相关文章
  - [x]SubTask 5.1: 修改 `blog-frontend/app/posts/[slug]/page.tsx`，在 header 区域展示分类名并链接到 `/categories/[slug]`
  - [x]SubTask 5.2: 相关文章改为 `posts.filter(p => p.slug !== post.slug && p.category?.slug === post.category?.slug).slice(0, 3)`
  - [x]SubTask 5.3: 相关文章链接由 `<a>` 改为 `<Link>`

- [x]Task 6: 首页 TOP 标签按热度排序
  - [x]SubTask 6.1: 修改 `blog-frontend/lib/directus.ts` 的 `getTags`，若 Directus 不返回 count，则用 `getPosts` 在服务端聚合每个 tag 的文章数
  - [x]SubTask 6.2: 修改 `blog-frontend/app/page.tsx`，标签按 count 降序取前 8

- [x] Task 7: StatsGrid 数据动态化
  - [x]SubTask 7.1: 修改 `blog-frontend/components/StatsGrid.tsx`，props 改为接收真实统计数据
  - [x]SubTask 7.2: 修改 `blog-frontend/app/page.tsx`，从 `getPosts` 聚合文章数、总浏览量、总点赞、总评论传给 StatsGrid
  - [x] SubTask 7.3: ~~修改 `blog-frontend/app/dashboard/page.tsx`~~（已合并到 `/admin`，聚合逻辑抽到 `lib/stats.ts` 复用）

## Phase 3: SEO 与元数据

- [x]Task 8: 补齐根 layout metadata
  - [x]SubTask 8.1: 修改 `blog-frontend/app/layout.tsx`，添加 `metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000')`
  - [Task 8.2] 添加 openGraph、twitter、robots 默认配置
  - [x]SubTask 8.3: 导出 `viewport`（含 themeColor）

- [x] Task 9: 各子页面导出 metadata
  - [x] SubTask 9.1: 为 `posts/page.tsx`、`archive/page.tsx`、`categories/page.tsx`、`friends/page.tsx`、`about/page.tsx`、`search/page.tsx`、`admin/page.tsx` 各导出 `export const metadata: Metadata`（dashboard/editor 已合并到 admin）
  - [x]SubTask 9.2: 为 `posts/[slug]/page.tsx` 与 `categories/[slug]/page.tsx` 导出 `generateMetadata`

## Phase 4: 移动端与体验修复

- [x] Task 10: PageShell 响应式双列布局
  - [x]SubTask 10.1: 修改 `blog-frontend/components/PageShell.tsx`，去掉 inline `gridTemplateColumns`，改用 Tailwind 响应式类（默认单列，`lg:grid-cols-[280px_1fr]`）
  - [x]SubTask 10.2: Sidebar 在 `< lg` 断点隐藏（或改为页面顶部折叠块），不影响主内容

- [x]Task 11: Header 移动端汉堡菜单
  - [x]SubTask 11.1: 创建 `blog-frontend/components/MobileNav.tsx`（client component），含 hamburger 按钮与抽屉
  - [x]SubTask 11.2: 修改 `blog-frontend/components/Header.tsx`，在 `< md` 断点显示 `<MobileNav />`
  - [x]SubTask 11.3: 搜索表单加 `role="search"` 与 `aria-label`

- [x] Task 12: 修复组件小问题
  - [x] SubTask 12.1: ~~修改 `blog-frontend/components/Sidebar.tsx:37`~~（Sidebar 已删除，合并到顶部 Header 导航）
  - [x]SubTask 12.2: 修改 `blog-frontend/components/ArticleContent.tsx`，顶部 `import 'highlight.js/styles/github-dark.css';`
  - [x]SubTask 12.3: 修改 `blog-frontend/components/Hero.tsx:10`，🐾 改为 🦈
  - [x]SubTask 12.4: 修改 `blog-frontend/components/Footer.tsx:4`，`© 2024` 改为 `© {new Date().getFullYear()}`
  - [x] SubTask 12.5: ~~修改 `blog-frontend/app/editor/page.tsx:13`~~（editor 已合并到 `/admin` 编辑器）
  - [x]SubTask 12.6: 修改 `blog-frontend/app/page.tsx:21`，`<a href="/posts">` 改为 `<Link href="/posts">`

## Phase 5: 文档一致性

- [x] Task 13: 清理重复文档
  - [x]SubTask 13.1: 删除 `docs/技术栈.md`（保留 `blog-frontend/docs/tech-stack.md`），清理聊天残留
  - [x]SubTask 13.2: 修正 `blog-frontend/docs/directus-schema.md`，补 `comments`、`date_created` 字段
  - [x]SubTask 13.3: 修正 `README.md`，目录名 `blog-system/` 改为 `BlogSystem`，补全结构图，补环境变量表
  - [x]SubTask 13.4: 修正 `docs/project-plan.md` 的 V1 验收清单（与实际状态对齐）
  - [x]SubTask 13.5: 在 `docs/个人博客第一版重构实施文档.md` 顶部加「历史规划文档，与实际实现有出入」警告

- [x] Task 14: 修正 spec 状态文档
  - [x]SubTask 14.1: 修正 `.trae/specs/shark-tech-blog-v1/tasks.md`，将「按分类筛选文章」「同分类相关文章」标记为未完成或迁移到本 spec
  - [x]SubTask 14.2: 修正 `.trae/specs/shark-tech-blog-v1/checklist.md`，将「Mock 数据回退：无 Directus 时页面正常渲染」加注生产环境风险说明

## Phase 6: 验证

- [x] Task 15: 构建与 lint 验证
  - [x]SubTask 15.1: 执行 `pnpm build` 确认零错误
  - [x]SubTask 15.2: 执行 `pnpm lint` 确认无新增警告
  - [x]SubTask 15.3: 验证 docker-compose 配置语法 `docker compose -f directus-cms/docker-compose.yml config`

# Task Dependencies

- Task 2、Task 3 必须在 Task 1 之后（环境变量名统一后才能改代码）
- Task 4、Task 5、Task 6、Task 7 可并行（独立页面/逻辑）
- Task 8、Task 9 可并行（仅元数据）
- Task 10、Task 11 可并行（移动端布局）
- Task 12 可与任何 Phase 并行（独立小修复）
- Task 13、Task 14 必须在所有代码修改完成后
- Task 15 必须最后执行
