# Shark Tech Blog V1 验收清单

## 功能验收
- [x] Markdown 渲染：ArticleContent 使用 react-markdown，支持 GFM 语法
- [x] 代码高亮：代码块显示语法高亮（highlight.js）
- [x] 封面图处理：PostCard 优先显示 cover 图片，无 cover 时回退图标
- [x] 文章详情页：显示真实封面图（cover 字段），无 cover 时回退默认插画
- [x] Mock 数据回退：无 Directus 时页面正常渲染
  > ⚠️ 注意：`getPostBySlug` 在 Directus 返回空时仍会回退到 mock 数据查找，生产环境应删除此回退或仅在 `NODE_ENV !== 'production'` 时启用（已在 fix-critical-issues-v1 中加 `filter[status][_eq]=published` 防止读取草稿）

## 构建验收
- [x] 构建成功：pnpm build 零错误
- [x] Lint 通过：pnpm lint 无严重错误

## 响应式验收
- [x] 移动端 375px：无横向滚动、无错位
- [x] 平板 768px：网格布局正常
- [x] 桌面 1280px：双栏布局正常

## 部署验收
- [x] 部署文档：提供 Nginx 反代配置和部署指南

---

## 后续修正说明

> 本 V1 验收清单部分项目在初次实施时未真正满足，已在 `fix-critical-issues-v1` spec 中修复。详见 `.trae/specs/fix-critical-issues-v1/checklist.md`。
