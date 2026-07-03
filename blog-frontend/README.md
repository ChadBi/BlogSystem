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
- 管理后台 `/admin`（需登录，含仪表盘与写作编辑器；导航中不暴露入口，需手动访问 URL）

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

## 管理后台

后台路径为 `/admin`，需要登录密码。在 `.env.local` 中配置：

- `ADMIN_PASSWORD`：登录密码
- `AUTH_SECRET`：HMAC 签名密钥（生成方式：`openssl rand -base64 32`）

未登录访问 `/admin` 会自动重定向到 `/login`。

## Directus 本地后台

```bash
pnpm directus:up
```

后台地址：

```txt
http://localhost:8055
```

管理员账号请通过环境变量配置，参见 `directus-cms/.env.example`。

## 数据来源

默认优先读取 Directus API。若 `.env.local` 中没有配置 `DIRECTUS_URL`，或请求失败，则自动使用 `lib/mock-data.ts` 中的模拟数据，方便先看页面效果。

## 推荐 Directus 集合

详见：

```txt
docs/directus-schema.md
```
