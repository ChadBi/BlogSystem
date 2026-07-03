# 关键问题修复验收清单

## 安全与配置
- [x] 仓库中无硬编码密码（grep `admin123456`、`blog_password` 无命中）
- [x] `blog-frontend/docker-compose.yml` 已删除
- [x] `directus-cms/docker-compose.yml` 含 KEY、ADMIN_EMAIL、ADMIN_PASSWORD、CORS_ENABLED、CORS_ORIGIN、restart: unless-stopped
- [x] `directus-cms/docker-compose.yml` 端口绑 `127.0.0.1:8055:8055`
- [x] `directus-cms/docker-compose copy.yml` 已重命名为 `docker-compose.postgres.yml`
- [x] `directus-cms/.env.example` 存在并文档化所有变量
- [x] `.gitignore` 含 `directus-cms/postgres-data/`、`blog-frontend/directus/`、`directus-cms/.env`
- [x] `package.json` 的 `directus:up`/`directus:down` 脚本指向 `../directus-cms/`
- [x] `README.md` 不含明文密码

## 数据层安全
- [x] `blog-frontend/lib/directus.ts` 顶部含 `import 'server-only';`
- [x] 使用 `DIRECTUS_URL`（无 `NEXT_PUBLIC_` 前缀）
- [x] `.env.example` 同步更新为 `DIRECTUS_URL=`
- [x] `getPostBySlug` 含 `encodeURIComponent(slug)`
- [x] `getPostBySlug` 含 `&filter[status][_eq]=published`
- [x] `getPostBySlug` 含 `&limit=1`
- [x] `fetchDirectus` 在 `!res.ok` 分支记录 `console.error` 含状态码
- [x] `fetchDirectus` 在 catch 分支记录 `console.error` 含 err.message

## next.config
- [x] `images.remotePatterns` 的 hostname 来自 `process.env.DIRECTUS_URL` 解析，无 `**` 通配
- [x] `output: 'standalone'` 已启用

## Spec 合规：分类详情页
- [x] `blog-frontend/app/categories/[slug]/page.tsx` 存在
- [x] 该页展示指定分类下的所有文章
- [x] 不存在的 slug 返回 404
- [x] 该页导出 `generateStaticParams` 与 `generateMetadata`
- [x] `/categories` 页面的分类卡片用 `<Link>` 跳转

## Spec 合规：文章详情页
- [x] 文章详情页 header 展示分类名
- [x] 分类名链接到 `/categories/[slug]`
- [x] 相关文章按 `p.category?.slug === post.category?.slug` 过滤
- [x] 相关文章链接用 `<Link>`

## Spec 合规：首页 TOP 标签
- [x] `getTags` 返回的标签含 count（聚合自 posts）
- [x] 首页标签按 count 降序取前 8
- [x] 不再按 `sort=name` 字母序

## Spec 合规：StatsGrid 动态化
- [x] `StatsGrid` 接收 props 而非硬编码
- [x] 首页 StatsGrid 数据来自 `getPosts` 聚合
- [x] dashboard 与 StatsGrid 使用相同聚合逻辑（`lib/stats.ts`）
- [x] 文章数不再出现 28 与 24 不一致

## SEO 与元数据
- [x] `app/layout.tsx` 含 `metadataBase`
- [x] `app/layout.tsx` 含 openGraph、twitter、robots 默认配置
- [x] `app/layout.tsx` 导出 `viewport`（含 themeColor）
- [x] 所有子页面（posts/archive/categories/friends/about/search/admin）导出 `metadata`（dashboard/editor 已合并到 admin）
- [x] `posts/[slug]/page.tsx` 导出 `generateMetadata`
- [x] `categories/[slug]/page.tsx` 导出 `generateMetadata`

## 移动端
- [x] `PageShell` 在 `< lg` 断点为单列布局
- [x] `PageShell` 在 `lg+` 断点为 `280px 1fr` 双列
- [x] `Header` 在 `< md` 断点显示 hamburger 按钮
- [x] 点击 hamburger 展开导航抽屉，含所有页面入口
- [x] 搜索表单含 `role="search"` 与 `aria-label`

## 组件小修复
- [x] ~~`Sidebar.tsx:37` 引号文本渲染~~（Sidebar 已删除，合并到 Header 导航）
- [x] `ArticleContent.tsx` 含 `import 'highlight.js/styles/github-dark.css';`
- [x] `Hero.tsx:10` emoji 为 🦈（非 🐾）
- [x] `Footer.tsx:4` 年份为 `{new Date().getFullYear()}`
- [x] `app/editor/page.tsx:13` placeholder 用表达式形式
- [x] `app/page.tsx:21` 用 `<Link>` 而非 `<a>`

## 文档一致性
- [x] `docs/技术栈.md` 已删除
- [x] `blog-frontend/docs/directus-schema.md` 含 `comments` 字段
- [x] `blog-frontend/docs/directus-schema.md` 含 `date_created` 字段
- [x] `README.md` 目录名为 `BlogSystem`
- [x] `README.md` 结构图含 `lib/`、`types/`、`public/`、`docs/`
- [x] `README.md` 含环境变量表
- [x] `docs/个人博客第一版重构实施文档.md` 顶部有历史文档警告
- [x] `.trae/specs/shark-tech-blog-v1/tasks.md` 与本 spec 状态对齐
- [x] `.trae/specs/shark-tech-blog-v1/checklist.md` 加注生产环境风险说明

## 构建验证
- [x] `pnpm build` 成功，零错误
- [x] `pnpm lint` 无新增警告
- [x] `docker compose -f directus-cms/docker-compose.yml config` 语法验证通过
