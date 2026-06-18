# Shark Tech Blog

一个基于 **Next.js + React + TypeScript + Tailwind CSS + Directus** 的个人技术博客前台原型，视觉风格采用“像素鲨客 / Retro × Ocean × Code”。

## 已包含页面

- 首页 `/`
- 文章列表 `/posts`
- 文章详情 `/posts/[slug]`
- 归档时间线 `/archive`
- 分类与标签 `/categories`
- 搜索结果 `/search`
- 关于我 `/about`
- 好友页 `/friends`
- 写作编辑器原型 `/editor`
- 后台仪表盘原型 `/dashboard`

## 快速启动

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

打开：

```txt
http://localhost:3000
```

## Directus 本地后台

```bash
pnpm directus:up
```

后台地址：

```txt
http://localhost:8055
```

默认账号：

```txt
admin@example.com
admin123456
```

## 数据来源

默认优先读取 Directus API。若 `.env.local` 中没有配置 `NEXT_PUBLIC_DIRECTUS_URL`，或请求失败，则自动使用 `lib/mock-data.ts` 中的模拟数据，方便先看页面效果。

## 推荐 Directus 集合

详见：

```txt
docs/directus-schema.md
```
