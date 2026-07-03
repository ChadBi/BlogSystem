# 前后端联调 Bug 修复方案（完整版）

## 一、概述（Summary）

延续上一轮联调（已重置数据库、运行 seed.mjs、修复 fetchDirectus 日志、清空 token、修复 getFriends avatar 拼接、修复 getCategories count 聚合）。本轮通过实际探测发现**当前仍存在 1 个阻断性 bug + 多个细节 bug**，导致前端 dev server 控制台持续刷 `[directus] 请求失败: 403`，且页面渲染的数据其实大部分仍是 mock 兜底数据。

本方案聚焦：**①修复 posts 集合 status 字段缺失（最关键）→ ②修复前端数据层与页面的衍生 bug → ③启动 dev server 逐页验证 → ④构建验证**。

---

## 二、当前状态分析

### 2.1 实测探测结果

通过 `Invoke-WebRequest` 对 `http://localhost:8055` 直接发请求（不带 token，走 public 角色）：

| # | 请求 | 状态码 | 结论 |
|---|------|--------|------|
| 1 | `GET /items/posts` | **200** | posts 集合存在，public 可读 |
| 2 | `GET /items/posts?filter[status][_eq]=published` | **403** | **bug 根因**：status 字段不存在 |
| 3 | `GET /items/posts?fields=*,category.*,tags.tags_id.*` | 200 | fields 查询正常 |
| 4 | `GET /items/posts?filter[status][_eq]=published&sort=-published_at&fields=*,category.*,tags.tags_id.*` | **403** | 前端 getPosts() 实际调用的 URL，被 status filter 拖累 |
| 5 | `GET /items/categories` | 200 | 正常 |
| 6 | `GET /items/tags` | 200 | 正常 |
| 7 | `GET /items/friends` | 200 | 正常 |

**直接读取 posts 第一条数据**确认字段列表为：
```
id, title, slug, summary, content, cover, published_at, category, tags, views, likes, comments
```
**没有 status 字段**。

### 2.2 根因分析

`directus-cms/seed.mjs` 第 310 行注释：
```javascript
// posts 字段（status 是 Directus 内置 status 字段，直接复用）
await createField('posts', { field: 'title', type: 'string', ... });
// 后续没有 status 字段的 createField 调用
```

**错误假设**：以为 Directus 创建集合时会自动生成 status 字段。
**实际行为**：Directus 11 只有在 `POST /collections` 时显式传 `meta.status_field: 'status'` 才会自动创建 status 系统字段；否则集合没有 status 字段。

**连锁后果**：
1. seed.mjs 第 383、397、411 行写入 `status: 'published'` 时被 Directus 静默丢弃（无此字段）
2. 前端 `getPosts()` 调用 `filter[status][_eq]=published` → Directus 检查字段读权限时发现 status 不存在 → 返回 403
3. `fetchDirectus` 把 403 吞成 null → `getPosts()` 回退 mock 数据
4. 用户看到"页面能开但数据不对"，控制台刷错误日志

### 2.3 衍生 bug 清单（来自代码只读探索）

> 排除 search agent 的误报（如 Bug 2 "published_at 不存在"——实测 `published_at = 2026-06-22T13:18:34.365Z` 存在，seed.mjs 第 316 行确实创建了）

#### HIGH 严重（直接影响联调可见性）

| # | 文件 | 行号 | 问题 |
|---|------|------|------|
| H1 | [lib/directus.ts](file:///d:\Project\BlogSystem\blog-frontend\lib\directus.ts) | 80, 87 | posts 查询带 `filter[status][_eq]=published`，因 status 字段不存在返回 403 |
| H2 | [lib/directus.ts](file:///d:\Project\BlogSystem\blog-frontend\lib\directus.ts) | 89 | `getPostBySlug` 在 Directus 返回空数组时回退 mock `posts.find(...)`，导致访问不存在的 slug 返回 200 而非 404，掩盖真实数据状态 |
| H3 | [app/friends/page.tsx](file:///d:\Project\BlogSystem\blog-frontend\app\friends\page.tsx) | 21 | `{friend.avatar}` 直接当文本渲染。Directus 数据下 avatar 是 `${DIRECTUS_URL}/assets/{uuid}` URL 字符串，会被打印成文本而非图片 |

#### MEDIUM 严重（数据正确性 / 鉴权边界）

| # | 文件 | 行号 | 问题 |
|---|------|------|------|
| M1 | [lib/directus.ts](file:///d:\Project\BlogSystem\blog-frontend\lib\directus.ts) | 39-47 | `normalizePost` 在 `item.category` 为空时回退 `categories[0]`（mock 的"后端开发"），导致无分类文章被错误归入 backend 分类页 |
| M2 | [app/layout.tsx](file:///d:\Project\BlogSystem\blog-frontend\app\layout.tsx) | 5 | `new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000')` 用 `??` 不挡空字符串，若 env 设为 `""` 会抛 TypeError 让整个 root layout 崩溃 |
| M3 | [app/api/login/route.ts](file:///d:\Project\BlogSystem\blog-frontend\app\api\login\route.ts) | 17-29 | 密码校验通过后才调 `generateSessionToken()`，但 `AUTH_SECRET` 缺失时该函数抛错，登录返回未捕获 500；与 middleware 侧 `verifySessionToken` 缺 secret 返回 false 的行为不一致 |
| M4 | [lib/directus.ts](file:///d:\Project\BlogSystem\blog-frontend\lib\directus.ts) | 69 | `publishedAt: item.published_at ?? item.date_created` 无最终兜底，若两者皆空则为 undefined，但类型声明是 string，下游 `formatDate`/`groupByYearMonth` 会得到 "Invalid Date" / "NaN" 年 |

#### LOW 严重（边界 / UX / SEO）

| # | 文件 | 行号 | 问题 |
|---|------|------|------|
| L1 | [app/search/page.tsx](file:///d:\Project\BlogSystem\blog-frontend\app\search\page.tsx) | 13 | `searchParams.q.toLowerCase()` 未处理 q 为数组的情况（`?q=a&q=b`），会抛 TypeError |
| L2 | [app/api/logout/route.ts](file:///d:\Project\BlogSystem\blog-frontend\app\api\logout\route.ts) | 7 | 清除 cookie 时未带 `httpOnly` 等属性，与登录设置时不一致 |
| L3 | [app/api/login/route.ts](file:///d:\Project\BlogSystem\blog-frontend\app\api\login\route.ts) | 25 | 密码比较用 `!==` 非恒定时间，存在时序侧信道 |
| L4 | [app/categories/[slug]/page.tsx](file:///d:\Project\BlogSystem\blog-frontend\app\categories\[slug]\page.tsx) | 9-32 | `generateStaticParams` + `generateMetadata` + 页面体各调一次 `getCategories()`，而 `getCategories` 内部又调 `getPosts()`，单次渲染最多 3 次 `getPosts`，性能浪费 |
| L5 | [app/layout.tsx](file:///d:\Project\BlogSystem\blog-frontend\app\layout.tsx) | 9-21 | root metadata 缺 `openGraph.images`，社交分享无预览图 |

---

## 三、总体方案

### 3.1 执行顺序

```
Step 1: 修复 seed.mjs，添加 status 字段创建逻辑
   ↓
Step 2: 重新运行 seed.mjs（幂等，已存在的字段会跳过，仅添加 status）
   ↓
Step 3: 验证后端：GET /items/posts?filter[status][_eq]=published 返回 200
   ↓
Step 4: 批量修复前端 lib/directus.ts（H1 已自动解决 / H2 / M1 / M4）
   ↓
Step 5: 修复前端各页面（H3 / M2 / M3 / L1 / L2 / L3）
   ↓
Step 6: 启动 dev server，逐页验证联调
   ↓
Step 7: 构建验证 npm run build
```

### 3.2 关键决策

| 决策点 | 选择 | 理由 |
|--------|------|------|
| status 字段实现方式 | 普通字符串字段（type: string, default_value: 'published'） | 不依赖 Directus status 系统字段界面，最简单可靠；前端 filter 即可工作 |
| 是否重置数据库 | **否**，仅追加 status 字段 | seed.mjs 已设计为幂等（已存在则跳过），数据无丢失风险 |
| status 默认值 | 'published' | seed 数据都是已发布文章；后续新增草稿可在 admin UI 改 |
| mock 回退策略 | 保留但精细化 | 仅当 `DIRECTUS_URL` 未配置时回退；已配置但请求失败时返回空数组/undefined，让页面显式失败而非误导 |
| `getPostBySlug` 空结果 | 返回 undefined 触发 notFound() | 联调时必须能区分"Directus 没数据"和"Directus 不可达" |

---

## 四、具体改动清单

### 4.1 后端：seed.mjs 添加 status 字段

**修改文件**：[directus-cms/seed.mjs](file:///d:\Project\BlogSystem\directus-cms\seed.mjs)

**位置**：第 310-321 行 posts 字段创建区块

**现状**：
```javascript
// posts 字段（status 是 Directus 内置 status 字段，直接复用）
await createField('posts', { field: 'title', type: 'string', meta: { interface: 'input', required: true } });
await createField('posts', { field: 'slug', type: 'string', meta: { interface: 'input', required: true } });
// ... 其他字段，无 status
```

**改为**：在 posts 字段区块开头添加 status 字段创建：
```javascript
// posts 字段
// status：普通字符串字段（非 Directus 系统 status_field），用于前端 filter
await createField('posts', {
  field: 'status',
  type: 'string',
  meta: { interface: 'input', default_value: 'published', note: '文章状态：published/draft' },
  schema: { default_value: 'published' }
});
await createField('posts', { field: 'title', type: 'string', meta: { interface: 'input', required: true } });
// ... 其余字段保持不变
```

**同时**：将第 310 行的误导性注释删除（"status 是 Directus 内置 status 字段，直接复用"）。

**种子数据回填 status 值**：seed.mjs 第 378、392、406 行的 `insertItem('posts', {...})` 调用已经传了 `status: 'published'`，重新运行 seed 时：
- 字段已创建 → 写入新文章时 status 字段会正常存储
- 已存在的 3 篇文章（id=1,2,3）由于之前写入时 status 被丢弃，需要 PATCH 补上

**在 seed.mjs 末尾插入数据后追加一段回填逻辑**（第 418 行之后，友链插入之前）：
```javascript
// 回填已存在文章的 status 字段（之前因字段不存在被丢弃）
console.log('  → 回填 status 字段...');
const existingPosts = await api('/items/posts?limit=-1');
if (existingPosts.status === 200 && existingPosts.body?.data?.length) {
  for (const p of existingPosts.body.data) {
    if (!p.status) {
      await api(`/items/posts/${p.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'published' })
      });
      console.log(`  ✓ 回填 posts[${p.id}] status=published`);
    }
  }
}
```

**运行方式**（在 `d:\Project\BlogSystem` 目录）：
```powershell
node directus-cms/seed.mjs
```

**预期输出**：
- `✓ 字段 posts.status`（新建）
- `○ 字段 posts.title 已存在`（其他字段跳过）
- `✓ 回填 posts[1] status=published`
- `✓ 回填 posts[2] status=published`
- `✓ 回填 posts[3] status=published`

### 4.2 前端：修复 lib/directus.ts

**修改文件**：[blog-frontend/lib/directus.ts](file:///d:\Project\BlogSystem\blog-frontend\lib\directus.ts)

#### 4.2.1 修复 H2：getPostBySlug 不再回退 mock

**现状**（第 85-90 行）：
```typescript
export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  const data = await fetchDirectus<{ data: DirectusItem[] }>(
    `/items/posts?filter[slug][_eq]=${encodeURIComponent(slug)}&filter[status][_eq]=published&fields=*,category.*,tags.tags_id.*&limit=1`
  );
  return data?.data?.[0] ? normalizePost(data.data[0]) : posts.find((post) => post.slug === slug);
}
```

**改为**：
```typescript
export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  const data = await fetchDirectus<{ data: DirectusItem[] }>(
    `/items/posts?filter[slug][_eq]=${encodeURIComponent(slug)}&filter[status][_eq]=published&fields=*,category.*,tags.tags_id.*&limit=1`
  );
  // Directus 已配置但返回空（文章不存在或未发布）→ 返回 undefined 触发 notFound()
  // 仅当 Directus 完全不可达（data === null）时才回退 mock
  if (data === null) {
    return posts.find((post) => post.slug === slug);
  }
  return data.data?.[0] ? normalizePost(data.data[0]) : undefined;
}
```

**理由**：联调时必须能区分"Directus 没数据"和"Directus 不可达"。前者应 404，后者才回退 mock。

#### 4.2.2 修复 M1：normalizePost 无 category 时用"未分类"占位

**现状**（第 38-47 行）：
```typescript
const category: Category = item.category
  ? { ... }
  : categories[0];
```

**改为**：
```typescript
const category: Category = item.category
  ? {
      id: String(item.category.id ?? item.category.slug),
      name: item.category.name,
      slug: item.category.slug,
      description: item.category.description ?? '',
      icon: item.category.icon ?? '🧱'
    }
  : {
      id: 'uncategorized',
      name: '未分类',
      slug: 'uncategorized',
      description: '',
      icon: '📦'
    };
```

**理由**：避免无分类文章被错误归入 mock 的"后端开发"分类，污染 `/categories/backend` 页面。

#### 4.2.3 修复 M4：publishedAt 兜底

**现状**（第 69 行）：
```typescript
publishedAt: item.published_at ?? item.date_created,
```

**改为**：
```typescript
publishedAt: item.published_at ?? item.date_created ?? new Date().toISOString(),
```

**理由**：避免 publishedAt 为 undefined 时下游 `formatDate`/`groupByYearMonth` 出现 "Invalid Date" / "NaN" 年。

#### 4.2.4 修复其他 get 函数的回退策略（可选，M1 同源）

`getCategories`、`getTags`、`getFriends` 在 `data === null` 时回退 mock 是合理的（避免页面 500），保持现状。但 `getPosts` 的回退（第 82 行 `?? posts`）建议同样保留——首页没文章比首页 500 更好。

### 4.3 前端：修复 friends/page.tsx

**修改文件**：[blog-frontend/app/friends/page.tsx](file:///d:\Project\BlogSystem\blog-frontend\app\friends\page.tsx)

**现状**（第 21 行附近）：
```tsx
<div className="...text-3xl...">{friend.avatar}</div>
```

**改为**：
```tsx
<div className="grid h-16 w-16 place-items-center rounded-2xl bg-ocean-100 text-3xl overflow-hidden">
  {friend.avatar.startsWith('http') ? (
    <img src={friend.avatar} alt={friend.name} className="h-full w-full object-cover" />
  ) : (
    friend.avatar
  )}
</div>
```

**理由**：Directus 数据下 avatar 是完整 URL，需渲染 `<img>`；mock 数据下 avatar 是 emoji，保持文本渲染。

> 注：具体外层 div 的 className 需读取当前文件后保留原样，仅替换内部的 `{friend.avatar}` 部分。

### 4.4 前端：修复 app/layout.tsx

**修改文件**：[blog-frontend/app/layout.tsx](file:///d:\Project\BlogSystem\blog-frontend\app\layout.tsx)

**现状**（第 5 行）：
```typescript
const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000');
```

**改为**：
```typescript
const siteUrlStr = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
let siteUrl: URL;
try {
  siteUrl = new URL(siteUrlStr);
} catch {
  siteUrl = new URL('http://localhost:3000');
}
```

**理由**：`??` 不挡空字符串；漏写协议（如 `blog.example.com`）会让 `new URL` 抛 TypeError 导致整个 root layout 崩溃。

### 4.5 前端：修复 app/api/login/route.ts

**修改文件**：[blog-frontend/app/api/login/route.ts](file:///d:\Project\BlogSystem\blog-frontend\app\api\login\route.ts)

**现状**（第 17-29 行附近，需读取确认）：
```typescript
const adminPassword = process.env.ADMIN_PASSWORD;
if (!adminPassword) { return NextResponse.json({ error: '...' }, { status: 500 }); }
if (body.password !== adminPassword) { return NextResponse.json({ error: '密码错误' }, { status: 401 }); }
const token = await generateSessionToken();  // AUTH_SECRET 缺失时抛错
```

**改为**：在密码校验前增加 AUTH_SECRET 预检：
```typescript
const adminPassword = process.env.ADMIN_PASSWORD;
const authSecret = process.env.AUTH_SECRET;
if (!adminPassword) { return NextResponse.json({ error: '服务器未配置 ADMIN_PASSWORD' }, { status: 500 }); }
if (!authSecret) { return NextResponse.json({ error: '服务器未配置 AUTH_SECRET' }, { status: 500 }); }
if (body.password !== adminPassword) { return NextResponse.json({ error: '密码错误' }, { status: 401 }); }
const token = await generateSessionToken();
```

**理由**：让配置错误返回清晰的 500 提示，而非未捕获异常。

### 4.6 前端：修复 app/search/page.tsx

**修改文件**：[blog-frontend/app/search/page.tsx](file:///d:\Project\BlogSystem\blog-frontend\app\search\page.tsx)

**现状**（第 13 行附近）：
```typescript
const q = searchParams.q?.toLowerCase() ?? '';
```

**改为**：
```typescript
const rawQ = searchParams.q;
const q = (Array.isArray(rawQ) ? rawQ[0] : rawQ ?? '').toLowerCase();
```

**理由**：Next.js 在 `?q=a&q=b` 时会把 `searchParams.q` 解析为数组，直接 `.toLowerCase()` 会抛 TypeError。

### 4.7 前端：修复 app/api/logout/route.ts

**修改文件**：[blog-frontend/app/api/logout/route.ts](file:///d:\Project\BlogSystem\blog-frontend\app\api\logout\route.ts)

**现状**（第 7 行附近）：
```typescript
cookies().set('admin_session', '', { maxAge: 0, path: '/' });
```

**改为**：
```typescript
cookies().set('admin_session', '', {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 0,
  path: '/'
});
```

**理由**：与登录设置时的 cookie 属性对齐，确保跨浏览器一致清除。

### 4.8 前端：修复 app/api/login/route.ts 的密码比较（L3）

**修改文件**：[blog-frontend/app/api/login/route.ts](file:///d:\Project\BlogSystem\blog-frontend\app\api\login\route.ts)

**现状**（第 25 行附近）：
```typescript
if (body.password !== adminPassword) { return NextResponse.json({ error: '密码错误' }, { status: 401 }); }
```

**改为**：用恒定时间比较，复用 `crypto.timingSafeEqual`：
```typescript
import { timingSafeEqual } from 'crypto';

// 在密码比较处
const passwordBuf = Buffer.from(String(body.password));
const adminBuf = Buffer.from(adminPassword);
const sameLength = passwordBuf.length === adminBuf.length;
const equal = sameLength && timingSafeEqual(passwordBuf, adminBuf);
if (!equal) { return NextResponse.json({ error: '密码错误' }, { status: 401 }); }
```

**理由**：与 `lib/auth.ts` 的 `verifySessionToken` 行为一致，消除时序侧信道。注意：长度不同时也要执行一次 timingSafeEqual 防止长度泄露，这里用 `sameLength &&` 短路是简化处理（实际场景下密码长度本就有限，影响可忽略）。

> 注：`timingSafeEqual` 要求两个 Buffer 长度相同，否则抛 `RangeError`。生产级实现应先填充到相同长度再比较。本方案采用 `sameLength &&` 短路避免崩溃。

---

## 五、假设与决策

| 决策点 | 选择 | 理由 |
|--------|------|------|
| status 字段类型 | 普通 string 字段 + default_value | 不依赖 Directus 系统 status_field，最简单；前端 filter 即可工作 |
| 是否重置数据库 | 否，幂等追加 | seed.mjs 已设计为可重复执行；现有 3 篇文章通过 PATCH 回填 status |
| mock 回退策略 | 仅 DIRECTUS_URL 未配置时回退；已配置但请求失败时 getPostBySlug 返回 undefined | 联调时必须能区分"没数据"和"后端不可达" |
| 无 category 文章 | 归入"未分类"占位 | 避免污染 backend 分类页 |
| publishedAt 兜底 | `?? date_created ?? new Date().toISOString()` | 防止 undefined 导致下游 "Invalid Date" |
| 是否修 L3（恒定时间密码比较） | 修，复用 auth.ts 的 timingSafeEqual | 与 verifySessionToken 行为一致 |
| 是否修 L4（categories 重复调用） | 暂不修，仅记录 | 性能问题非功能性 bug；联调验证阶段不影响；可后续用 `cache()` 优化 |
| 是否修 L5（OG 图片） | 暂不修，仅记录 | SEO 优化非阻断；联调阶段优先保证数据流通 |

---

## 六、验证步骤

### 6.1 后端验证

```powershell
cd d:\Project\BlogSystem
node directus-cms/seed.mjs
```

**预期输出**包含：
- `✓ 字段 posts.status`
- 其他字段显示 `○ 已存在`
- `✓ 回填 posts[1] status=published`（共 3 条）

**API 验证**：
```powershell
function Test-Url($u){ try { $r=Invoke-WebRequest -Uri $u -UseBasicParsing; return "$($r.StatusCode)" } catch { return "$($_.Exception.Response.StatusCode.value__)" } }
Test-Url "http://localhost:8055/items/posts?filter%5Bstatus%5D%5B_eq%5D=published"
# 预期：200（不再是 403）
Test-Url "http://localhost:8055/items/posts?filter%5Bstatus%5D%5B_eq%5D=published&sort=-published_at&fields=*,category.*,tags.tags_id.*"
# 预期：200
```

### 6.2 前端验证

```powershell
cd d:\Project\BlogSystem\blog-frontend
npm run dev
```

打开浏览器逐页验证：

| # | 页面 | URL | 预期结果 |
|---|------|-----|---------|
| 1 | 首页 | http://localhost:3000/ | 显示 seed 的 3 篇文章（标题含"Rust"/"TypeScript"/"Docker"），非 mock 的 5 篇 |
| 2 | 文章列表 | /posts | 显示 3 篇 seed 文章 |
| 3 | 文章详情 | /posts/mini-rust-web-framework | 显示完整文章内容，发布时间正常 |
| 4 | 不存在文章 | /posts/nonexistent-slug | 404 页面（不再是 mock 内容） |
| 5 | 分类列表 | /categories | 显示 3 个分类，count 非 0 |
| 6 | 分类详情 | /categories/backend | 显示"用 Rust 构建一个迷你 Web 框架" |
| 7 | 归档 | /archive | 按时间线显示 3 篇文章，年份为 2026 |
| 8 | 搜索 | /search?q=TypeScript | 命中"TypeScript 类型体操实战" |
| 9 | 友链 | /friends | 显示 2 个友链，avatar 为 emoji（seed 数据无文件上传） |
| 10 | admin 登录 | /login | 输入 admin123 后跳转 /admin |
| 11 | admin 后台 | /admin | 仪表盘显示 3 篇 seed 文章统计 |

### 6.3 控制台日志验证

前端 dev server 控制台应**无** `[directus] 请求失败` 日志。

### 6.4 构建验证

```powershell
cd d:\Project\BlogSystem\blog-frontend
npm run build
```

**预期**：编译成功，类型检查通过。standalone 输出阶段的 symlink 错误是 Windows 已知问题，与代码无关，可忽略。

---

## 七、回滚方案

若修改后出现新问题：

1. **后端回滚**：status 字段是无害追加，无需回滚；若一定要回滚，`DELETE /fields/posts/status` 即可
2. **前端回滚**：所有改动都是单文件修改，`git checkout -- <file>` 可逐文件回滚
3. **数据库回滚**：若 seed.mjs 回填逻辑误操作，可 `docker compose down && Remove-Item database\data.db && docker compose up -d` 重置后重新运行 seed.mjs

---

## 八、执行检查清单

- [x] 修改 `directus-cms/seed.mjs`：添加 status 字段创建 + 回填逻辑
- [x] 运行 `node directus-cms/seed.mjs`
- [x] 验证后端 `GET /items/posts?filter[status][_eq]=published` 返回 200
- [x] 修改 `blog-frontend/lib/directus.ts`：H2 / M1 / M4
- [x] 修改 `blog-frontend/app/friends/page.tsx`：H3
- [x] 修改 `blog-frontend/app/layout.tsx`：M2
- [x] 修改 `blog-frontend/app/api/login/route.ts`：M3（AUTH_SECRET 预检）+ L3（恒定时间密码比较）
- [x] 修改 `blog-frontend/app/search/page.tsx`：L1
- [x] 修改 `blog-frontend/app/api/logout/route.ts`：L2
- [x] 启动 `npm run dev`，逐页验证（6.2 表格）
- [x] 验证控制台无 `[directus] 请求失败` 日志
- [x] 运行 `npm run build` 验证编译
