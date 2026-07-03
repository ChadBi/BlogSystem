# 前端设计优化方案（design-taste-frontend skill）

## 0. Design Read（设计判读）

> **Reading this as: editorial/blog redesign (preserve mode) for tech-savvy readers, with a retro-pixel/ocean aesthetic language, leaning toward Tailwind v3 + next/font + Phosphor icons + Motion，保留像素边框/ocean/mint 品牌色，淘汰 emoji-as-icon 与 div-mascot 等 AI-tell。**

### Dials
- `DESIGN_VARIANCE: 6`（适度不对称，Hero 改为非居中分栏）
- `MOTION_INTENSITY: 4`（加入入场动画 + 悬停物理，非滚动劫持）
- `VISUAL_DENSITY: 4`（标准间距，卡片呼吸感略增）

### Mode: Redesign - Preserve（保留品牌）
- **保留**：像素边框（2px + 4px 偏移阴影）、ocean/mint/cream 调色板、鲨鱼身份、IA 与路由、ocean-floor 气泡装饰。
- **淘汰**：emoji 充当图标、div 拼接的鲨鱼吉祥物、系统 Inter 字体、纯静态页面、紫色 AI 辉光背景、重复 PixelCard 容器。

---

## 1. Current State Analysis（现状审计）

### 1.1 Brand Tokens（品牌资产）
| Token | 当前值 | 评价 |
|---|---|---|
| 主色 ocean | `#076c96` 蓝色阶 | 保留 |
| 强调色 coral | `#8C6CFF`（实为紫色，命名说谎） | 保留色值但重命名为 `accent`，消除命名/视觉矛盾 |
| mint | `#B5EAD7` | 保留 |
| shell 背景 | `#FFF8E9` 暖米色 | 保留 |
| ink 文字 | `#101828` | 保留 |
| 字体 | 系统 Inter + Courier New | **淘汰** → next/font Geist + Geist Mono |
| 边框风格 | 2px solid + 4px offset shadow | 保留为签名 |
| 圆角 | rounded-2xl / rounded-3xl / rounded-full 混用 | **锁定规则**：卡片 16px、按钮/标签 pill、图 12px |
| Logo | emoji 🦈 + 方框 + 文字 | **重做** → SVG 鲨鱼标 + 文字 |
| 吉祥物 | div 拼接的鲨鱼（SharkMascot.tsx） | **淘汰** → SVG BrandMark |

### 1.2 检出的 AI-Tell（必须修复）
1. **emoji 充当图标**：🦈🐳🐧🦀👁💬💗💜💙⌕✦♟ 遍布全站（违反 §3.D）。
2. **手搓 div 吉祥物**：SharkMascot 用 div 矩形拼鲨鱼（违反 §4.8「手搓装饰 SVG 强烈不鼓励」，div 拼图更差）。
3. **无 next/font**：layout.tsx 未加载字体，依赖系统 Inter（违反 §3.A）。
4. **img 标签**：PostCard/文章页用 `<img>` 而非 `next/image`（ESLint 已警告）。
5. **紫色 AI 辉光背景**：globals.css body 用 `rgba(140,108,255,.12)` 紫色 radial glow（违反 §4.2 LILA RULE）。
6. **Hero 蓝紫渐变**：`from-ocean-700 via-blue-700 to-coral` 落入 AI 渐变套路。
7. **Hero emoji 装饰**：CTA 里的 `✦` `♟`、底部 `💗💜💙` 心形行（违反 §3.D、§9.F 装饰文本条）。
8. **无暗色模式**：纯 light-only（违反 §6.C）。
9. **无动效**：MOTION_INTENSITY 实际为 2，页面全静态（与品牌「探索感」不匹配）。
10. **重复容器**：首页 3 个 PixelCard 同构（stats / tags / code snippet），无视觉变化。
11. **首页 fake code block**：装饰性 Rust 代码片段（落入 §4.8 div-based fake screenshot 边界）。
12. **eyebrow 滥用**：Hero `RETRO × OCEAN × CODE` + 各页 `/ POSTS` 后缀（违反 §4.7 eyebrow restraint）。
13. **无图标库**：package.json 无任何 icon 库，全部用 emoji/字符代替。

### 1.3 现有 Dial 读数
- DESIGN_VARIANCE ≈ 5（基本对称网格，少量 `[1.4fr_.9fr]`）
- MOTION_INTENSITY ≈ 2（仅 hover transition）
- VISUAL_DENSITY ≈ 5（标准间距，卡片密集）

### 1.4 范围
- **in scope**：`/`、`/posts`、`/posts/[slug]`、`/categories`、`/categories/[slug]`、`/archive`、`/friends`、`/about`、`/search`、Header、Footer、PageShell、共享组件（PostCard/PixelCard/TagPill 等）。
- **out of scope**：`/admin` 及 `/api/*`（design-taste skill §13 明确不适用于 dashboard / 数据表格）。

---

## 2. Proposed Changes（分阶段实施）

### Phase A — 基础设施与设计令牌

#### A1. 安装依赖
```bash
npm install motion @phosphor-icons/react
```
- `motion`：动效库（原 Framer Motion，import 自 `motion/react`）。
- `@phosphor-icons/react`：图标库（优先级第一，替换全部 emoji）。
- 字体用 next/font 内置，无需额外包。
- **不引入** GSAP/Three.js（MOTION_INTENSITY=4 不需要 scroll-hijack）。

#### A2. [blog-frontend/app/layout.tsx](file:///d:/Project/BlogSystem/blog-frontend/app/layout.tsx) — 加载字体
- 用 `next/font/google` 加载 Geist（sans）+ GeistMono（mono），设为 CSS 变量 `--font-sans` / `--font-mono`。
- `<html>` 加 `className` 挂载字体变量。
- `<body>` 移除对系统 Inter 的依赖。
- 保留现有 metadata / viewport。

#### A3. [blog-frontend/tailwind.config.ts](file:///d:/Project/BlogSystem/blog-frontend/tailwind.config.ts) — 令牌重构
- `fontFamily.sans` → `['var(--font-sans)', ...]`，`fontFamily.mono` → `['var(--font-mono)', ...]`，删除 `fontFamily.pixel`。
- `colors.coral` 重命名为 `colors.accent`（值不变 `#8C6CFF`），新增 `accent` 的暗色变体 `accent-dark: '#A78BFA'`。
- 新增 `darkMode: 'class'`（或 `'media'`，二选一；选 `'class'` 便于后续手动切换）。
- 圆角锁定：不新增 token，但在组件层统一使用 `rounded-2xl`（卡片）/ `rounded-full`（按钮标签）/ `rounded-xl`（图）。
- `boxShadow.pixel` 保留，新增 `shadow.pixel-sm: '3px 3px 0 #132447'`（轻量版，用于 hover）。

#### A4. [blog-frontend/app/globals.css](file:///d:/Project/BlogSystem/blog-frontend/app/globals.css) — 背景与暗色令牌
- **移除** body 的紫色 + 青色 radial glow（AI tell）。
- **替换为**：纯 `background-color: var(--bg)` + 极淡的 `bg-ocean-grid` 网格（已有 token，更有「retro tech」感）。
- 新增 `:root` 暗色令牌：`--bg: #0b1220`、`--ink: #e5e7eb`、`--line: #1e3a5f`、`--surface: #111827`、`--surface-elevated: #1f2937`。
- 新增 `@media (prefers-color-scheme: dark)` 覆盖 `:root` 令牌。
- `.pixel-card` / `.pixel-border` 改用 `var(--line)` 而非硬编码 `#24406f`，暗色自动跟随。
- `.prose-lite` 文字颜色用 `var(--ink)`，blockquote 用 accent 透明度。
- highlight.js 保留 GitHub light，新增暗色变体（`github-dark`）通过 `@media (prefers-color-scheme: dark)` 切换。

### Phase B — 品牌资产重做

#### B1. 新建 [blog-frontend/components/BrandMark.tsx](file:///d:/Project/BlogSystem/blog-frontend/components/BrandMark.tsx) — SVG 鲨鱼标
- 用 inline `<svg>` 绘制极简几何鲨鱼（三角身体 + 尾鳍 + 圆点眼），单色 `currentColor`，可继承文字色。
- 提供 `size` prop（默认 32），无外部依赖。
- 替代 SharkMascot 的 div 拼图与 Logo 的 emoji。

#### B2. [blog-frontend/components/Logo.tsx](file:///d:/Project/BlogSystem/blog-frontend/components/Logo.tsx) — 重写
- 用 `<BrandMark />` 替换 emoji span，文字用新 sans 字体 + `font-black tracking-tight`。
- 保留方框容器（2px border + offset shadow），但圆角统一为 `rounded-xl`。

#### B3. 删除 [blog-frontend/components/SharkMascot.tsx](file:///d:/Project/BlogSystem/blog-frontend/components/SharkMascot.tsx)
- 全站不再引用后删除。Hero 改用 BrandMark 大尺寸版本。

#### B4. 图标迁移清单（emoji → Phosphor）
| 位置 | 原 emoji | 替换为 |
|---|---|---|
| Logo | 🦈 | BrandMark SVG |
| PostCard iconBySlug | 🦀🐳🐧🫧 | `Code`/`Cube`/`Terminal` 等 Phosphor 图标按分类映射 |
| PostCard 视图数 | 👁 | `Eye` |
| PostCard 评论数 | 💬 | `ChatCircle` |
| 文章页 meta | 👁💬 | 同上 |
| Hero CTA | ✦♟ | 移除装饰符，纯文字 |
| Hero 心形行 | 💗💜💙 | 移除（装饰文本条 tell） |
| Header 搜索按钮 | ⌕ | `MagnifyingGlass` |
| Footer | 💙 | 移除或换 `Heart` 微小尺寸 |

### Phase C — Hero 重做（首页）

#### C1. [blog-frontend/app/page.tsx](file:///d:/Project/BlogSystem/blog-frontend/app/page.tsx) — Hero 区块
- **布局**：保留 `md:grid-cols-[1fr_360px]` 分栏（已是 asymmetric split，符合 VARIANCE=6），但移除居中倾向。
- **背景**：移除 `from-ocean-700 via-blue-700 to-coral` 蓝紫渐变。改为 `bg-ocean-800`（深海蓝实色）+ 保留 `ocean-floor` 气泡装饰（品牌签名）。
- **文字**：
  - eyebrow `RETRO × OCEAN × CODE` 保留（Hero 算 1 个 eyebrow，符合限额），但换 `font-mono`（新 GeistMono）。
  - H2 `Hi! 我是 Shark` → 改为 `Hi, I'm Shark` 或保持中文「你好，我是 Shark」，用 `text-5xl md:text-6xl tracking-tight leading-none`。
  - 副文保留，限 20 词内。
  - CTA 移除 `✦` `♟`，纯文字「最新文章」「关于我」。
  - **移除**底部 `💗💜💙` 心形行（装饰 tell）。
- **吉祥物**：右侧用 `<BrandMark size={240} />` 大尺寸版本，配 `motion` 入场（fade + slight scale，`useReducedMotion` 守护）。
- **动效**：eyebrow/headline/subtext/CTA 用 Motion `initial`/`animate` 级联入场（stagger 0.08s），BrandMark 单独 fade-scale。

#### C2. 首页其余区块重组
- **最新文章 + 右栏**：保留 `[1.4fr_.9fr]` 网格。PixelCard 内部不变，但统一圆角与边框。
- **右栏 2 卡**：stats + tags。移除「人气标签 TOP 8」的 emoji，TagPill 不变。
- **代码片段卡**：**移除**（fake-screenshot tell）。替换为「精选文章」大卡（featured post，横向布局，带封面 + 摘要），用第一篇文章。
- 这样首页布局家族：Hero（split）→ 最新+侧栏（bento-ish）→ Featured（full-width split）→ 共 3 种，满足 §4.7 section-layout-repetition。

### Phase D — 卡片系统与内容页

#### D1. [blog-frontend/components/PostCard.tsx](file:///d:/Project/BlogSystem/blog-frontend/components/PostCard.tsx) — 重写
- 移除 `iconBySlug` emoji map，改为按 `post.category.slug` 映射 Phosphor 图标（backend→`Code`、frontend→`Cube`、ops→`Terminal`、tools→`Wrench`、algorithm→`Graph`、notes→`Note`）。
- `<img>` → `next/image`（`fill` + `sizes`）。
- hover：用 Motion `whileHover={{ y: -4 }}` 替代 CSS `-translate-y-1`（更顺滑，自动照顾 reduced motion）。
- 圆角统一 `rounded-2xl`，边框 `border-2 border-ocean-800/15 dark:border-ocean-400/20`。
- 移除 `👁` `💬`，换 `Eye` `ChatCircle` 图标 + 数字。

#### D2. [blog-frontend/components/PixelCard.tsx](file:///d:/Project/BlogSystem/blog-frontend/components/PixelCard.tsx) — 微调
- 保留 `.pixel-card` 基底，新增 `dark` 变体（暗色下 `bg-surface/80` + `border-line`）。
- 不再加 `className` 拼接，保持简洁。

#### D3. [blog-frontend/app/posts/page.tsx](file:///d:/Project/BlogSystem/blog-frontend/app/posts/page.tsx)
- header 的 `文章 / POSTS` → 单语「文章」（eyebrow restraint，移除冗余英文后缀）。
- 移除 `ocean-floor` 装饰（保留给 Hero 专属，避免重复）。
- 列表网格：首篇做 featured（full-width 横向卡），其余 `md:grid-cols-2 xl:grid-cols-3`。
- 卡片网格加 Motion `whileInView` stagger reveal。

#### D4. [blog-frontend/app/posts/[slug]/page.tsx](file:///d:/Project/BlogSystem/blog-frontend/app/posts/[slug]/page.tsx)
- meta 行 `👁 浏览 · 💬 评论` → Phosphor 图标 + 数字。
- `PostThumb icon="🦀"` → 按分类映射 Phosphor 图标。
- TL;DR 框保留（品牌签名），圆角统一。
- aside「作者信息」的 `🦈` emoji → BrandMark 小尺寸。
- aside 卡片加 Motion 入场。

#### D5. 其余页面统一
- `app/categories/page.tsx`、`app/categories/[slug]/page.tsx`、`app/archive/page.tsx`、`app/friends/page.tsx`、`app/about/page.tsx`、`app/search/page.tsx`：
  - 移除全部 emoji 装饰。
  - 统一 header 样式（无 `/ ENGLISH` 后缀 eyebrow）。
  - 应用暗色令牌。
  - 列表加 Motion `whileInView` reveal。
  - friends 页 avatar 若为 emoji，保留（emoji 作为用户头像内容可接受，非图标装饰）；若是图片 URL 用 `next/image`。

### Phase E — 导航与页脚

#### E1. [blog-frontend/components/Header.tsx](file:///d:/Project/BlogSystem/blog-frontend/components/Header.tsx)
- 搜索按钮 `⌕` → `<MagnifyingGlass size={18} weight="bold" />`。
- 导航链接保留，hover 样式微调（`hover:text-accent` 替代 `hover:text-coral`，因颜色重命名）。
- 暗色下 `bg-shell/88` → `dark:bg-surface/88`。
- 高度保持 `py-3`（约 64px，符合 ≤80px cap）。

#### E2. [blog-frontend/components/Footer.tsx](file:///d:/Project/BlogSystem/blog-frontend/components/Footer.tsx)
- 移除 `💙` emoji，改纯文字或 `<Heart size={12} weight="fill" />` 微图标。
- 加导航链接列（首页/文章/分类/关于），3 列网格。
- 暗色令牌。

#### E3. [blog-frontend/components/PageShell.tsx](file:///d:/Project/BlogSystem/blog-frontend/components/PageShell.tsx)
- `<main>` 加 `dark:bg-[var(--bg)]` 过渡。
- 间距 `py-6` → `py-8`（密度略降）。

### Phase F — 动效层

#### F1. 新建 [blog-frontend/components/Reveal.tsx](file:///d:/Project/BlogSystem/blog-frontend/components/Reveal.tsx)（'use client'）
- 封装 Motion `whileInView` 通用包裹组件，props：`children`、`delay`、`as`。
- 内置 `useReducedMotion` 守护，reduce 时直接渲染静态。
- 用于：卡片网格、section header、aside。

#### F2. Motion 应用点（仅在 motivited 处）
- Hero 入场（hierarchy：引导视线从 eyebrow 到 CTA）。
- 卡片网格 scroll reveal（storytelling：内容逐块呈现）。
- 卡片 hover（feedback：物理感）。
- 按钮 `whileTap={{ scale: 0.98 }}`（feedback）。
- **不加**：marquee、scroll-hijack、parallax（MOTION=4 不需要）。

### Phase G — 暗色模式

#### G1. 令牌验证
- globals.css 已在 A4 定义暗色令牌。
- 各组件用 `dark:` 变体覆盖关键色：`bg-white/70` → `dark:bg-surface/70`、`text-slate-600` → `dark:text-slate-300`、`border-ocean-800/25` → `dark:border-ocean-400/20`。
- 默认跟随 `prefers-color-scheme`（A3 用 `'media'` 更省事，不强制 class）。**决定：`darkMode: 'media'`**，避免引入主题切换按钮（超出本次范围）。
- 暗色下紫色 accent 提亮为 `#A78BFA` 保证对比度。

### Phase H — 预飞检查与验证

#### H1. Pre-Flight Check（§14 矩阵）
逐项核对，重点：
- [ ] 全站无 em-dash `—`（本站中文为主，检查 copy）。
- [ ] 全站无 emoji 充当图标（用户头像 emoji 除外）。
- [ ] 一致 accent 色（紫色）跨所有 section。
- [ ] 圆角三档规则全站一致。
- [ ] Hero ≤ 4 文本元素、CTA 不换行、top padding ≤ pt-24。
- [ ] eyebrow 计数 ≤ ceil(section数/3)。
- [ ] 无 div 拼吉祥物、无 fake screenshot。
- [ ] 所有动画有 `useReducedMotion` 守护。
- [ ] 暗色模式双模式对比度达标。

#### H2. 构建与运行验证
- `npm run build`：编译通过，静态页生成数 ≥ 之前 21。
- `npm run dev`：12 个公开页面 HTTP 200，控制台无 `[directus]` 失败、无字体 404、无图标 404。
- 手动浏览：首页 / 文章详情 / 分类 / 搜索，light + dark 双模式截图自查。
- Lighthouse：LCP < 2.5s（next/image + next/font 应达标）。

---

## 3. Assumptions & Decisions

### 假设
- 用户「优化」意为保留品牌重做执行（非推翻品牌）。若需推翻品牌需用户另行确认。
- Directus 后端数据层不动，仅改前端展示层。
- admin 后台不在本次范围（skill §13 不适用 dashboard）。
- 不引入主题切换 UI，暗色模式跟随系统（降低复杂度）。
- 不引入 GSAP/Three.js（MOTION=4 用 Motion 足够）。

### 决策
1. **保留紫色 accent**：品牌已用紫色（`#8C6CFF`），属有意为之，§4.2 override 路径允许。但重命名 token 为 `accent` 消除「coral 实为紫」的命名谎言，并移除背景紫色辉光（AI tell）。
2. **鲨鱼标用 SVG**：替代 div 拼图与 emoji，符合 §4.8。SVG 为极简几何，单文件无依赖。
3. **暗色用 `media` 非 `class`**：省去切换按钮，符合「不超出范围」原则。
4. **移除首页代码片段卡**：换为 featured 文章卡，消除 fake-screenshot tell 并增加真实内容价值。
5. **字体选 Geist + GeistMono**：§4.1 推荐，避开 Inter 默认。
6. **图标库选 Phosphor**：§3.C 优先级第一，weight 统一 `bold`。
7. **不引入 shadcn/ui**：当前组件简单，引入会过度工程化。

### 非目标（明确不做）
- 不改路由 / IA / SEO meta。
- 不改 Directus schema 或 API。
- 不改 admin 后台。
- 不加主题切换按钮。
- 不加 i18n。
- 不加评论/点赞功能。

---

## 4. 实施顺序与依赖

```
A1 安装依赖
 ├─ A2 字体 (layout.tsx)
 ├─ A3 tailwind 令牌
 └─ A4 globals.css 背景/暗色
      │
      B1 BrandMark SVG
      ├─ B2 Logo 重写
      ├─ B3 删 SharkMascot
      └─ B4 图标迁移（全局 emoji 清理）
           │
           C1 Hero 重做
           └─ C2 首页区块重组
                │
                D1 PostCard 重写
                ├─ D2 PixelCard 微调
                ├─ D3 posts 列表页
                ├─ D4 文章详情页
                └─ D5 其余页面统一
                     │
                     E1 Header
                     ├─ E2 Footer
                     └─ E3 PageShell
                          │
                          F1 Reveal 组件
                          └─ F2 Motion 应用
                               │
                               G1 暗色验证
                               └─ H1/H2 预飞+构建
```

每个 Phase 完成后可独立提交 git，便于回滚。

---

## 5. 验证步骤（最终）

1. `npm run build` 通过，静态页 ≥ 21。
2. `npm run dev` 后访问 12 个公开页面，HTTP 全 200，无控制台错误。
3. light / dark 双模式手动浏览首页 + 文章详情 + 分类页。
4. Pre-Flight 矩阵逐项打勾。
5. 与用户确认效果后，按 Phase 分批 git 提交。
