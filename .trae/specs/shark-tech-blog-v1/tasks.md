# Shark Tech Blog V1 实施任务清单

## Phase 0: 环境准备
- [x] 安装前端依赖 (pnpm install)
- [x] 验证构建成功 (pnpm build)

## Phase 1: Markdown 渲染升级
- [x] 安装 react-markdown、remark-gfm、rehype-highlight、highlight.js
- [x] 重写 ArticleContent.tsx 使用 react-markdown
- [x] 添加代码高亮样式到 globals.css

## Phase 2: 封面图处理优化
- [x] 修改 PostCard 支持显示封面图（优先 cover 字段，回退图标）
- [x] 修改文章详情页显示真实封面图

## Phase 3: 部署文档
- [x] 创建 Nginx 反代配置示例
- [x] 创建生产环境部署指南

## Phase 4: 验证
- [x] 执行 pnpm build 确认无错误
- [x] 执行 pnpm lint 确认无警告

---

## 后续修正（fix-critical-issues-v1）

> 以下 Spec 条目在本 V1 实施中未真正满足，已由 `fix-critical-issues-v1` spec 修复：
>
> - 「按分类筛选文章」（点击分类跳转详情页）→ 已新增 `/categories/[slug]` 路由
> - 「同分类相关文章推荐」→ 已改为按 `category.slug` 过滤
> - 「TOP 8 热门标签」→ 已改为按文章数降序排序
> - 「StatsGrid 真实统计数据」→ 已改为从 `getPosts` 动态聚合
> - 「文章详情页展示分类信息」→ 已在 header 展示分类链接
> - 「移动端导航」→ 已新增 MobileNav 汉堡菜单
> - 「页面 metadata」→ 已为所有页面补齐 metadata / generateMetadata
>
> 详见 `.trae/specs/fix-critical-issues-v1/`
