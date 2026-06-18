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
