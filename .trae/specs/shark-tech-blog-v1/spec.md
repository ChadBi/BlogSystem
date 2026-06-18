# Shark Tech Blog V1 实施规范

## Why
需要实现一个具有"像素鲨客 / Retro × Ocean × Code"视觉风格的个人技术博客，让作者可以在 Directus 后台管理内容，读者在 Next.js 前台浏览文章，实现完整的内容发布闭环。

## What Changes
- 创建完整的 Next.js 14 前端应用，包含首页、文章列表、文章详情、分类、归档、搜索、好友、关于等页面
- 实现 Directus API 数据层，支持从 CMS 读取文章、分类、标签、好友数据
- 实现 Mock 数据回退机制，当 Directus 不可用时仍能展示完整页面
- 实现像素风 + 海洋配色的视觉设计系统
- 实现 Markdown 内容渲染（基础支持）
- 实现响应式布局，支持移动端访问

## Impact
- Affected specs: 无（首次实施）
- Affected code: 
  - `blog-frontend/` - Next.js 前端应用
  - `directus-cms/` - Directus CMS 配置
  - `docs/` - 项目文档

## Requirements

### Requirement: 项目环境配置
系统 SHALL 提供完整的项目环境配置，包括 Next.js 项目初始化、依赖安装、环境变量配置。

#### Scenario: 开发者可以启动前端项目
- **WHEN** 开发者执行 `pnpm install && pnpm dev`
- **THEN** 项目成功启动，可以访问 `http://localhost:3000`

#### Scenario: 开发者可以启动 Directus
- **WHEN** 开发者执行 `cd directus-cms && docker compose up -d`
- **THEN** Directus 容器成功运行在 `http://localhost:8055`

### Requirement: 数据层实现
系统 SHALL 实现统一的数据访问层，封装 Directus API 调用，并在 API 不可用时回退到 Mock 数据。

#### Scenario: 从 Directus 获取文章列表
- **WHEN** 配置了 `NEXT_PUBLIC_DIRECTUS_URL` 且 Directus 服务可用
- **THEN** 系统从 Directus API 获取已发布的文章列表

#### Scenario: Directus 不可用时回退到 Mock 数据
- **WHEN** `NEXT_PUBLIC_DIRECTUS_URL` 未配置或 Directus 服务不可用
- **THEN** 系统自动使用 `lib/mock-data.ts` 中的模拟数据

#### Scenario: 数据类型一致性
- **WHEN** 从 Directus 或 Mock 数据获取数据
- **THEN** 返回的数据结构符合 `types/post.ts` 中定义的类型

### Requirement: 首页展示
系统 SHALL 在首页展示 Hero 区域、最新文章列表、个人统计数据、热门标签和代码片段。

#### Scenario: 首页展示最新文章
- **WHEN** 用户访问首页
- **THEN** 展示最新的 4 篇文章（紧凑模式）

#### Scenario: 首页展示统计数据
- **WHEN** 用户访问首页
- **THEN** 展示文章数、总访问量、获赞总数、评论总数

#### Scenario: 首页展示热门标签
- **WHEN** 用户访问首页
- **THEN** 展示 TOP 8 热门标签

### Requirement: 文章列表页
系统 SHALL 提供文章列表页面，以网格布局展示所有已发布的文章。

#### Scenario: 展示所有文章
- **WHEN** 用户访问 `/posts` 页面
- **THEN** 以网格布局展示所有已发布的文章卡片

#### Scenario: 文章卡片展示完整信息
- **WHEN** 文章卡片渲染
- **THEN** 展示文章标题、摘要、标签、发布日期、浏览量

### Requirement: 文章详情页
系统 SHALL 提供文章详情页面，展示文章完整内容、元信息和相关文章。

#### Scenario: 展示文章详情
- **WHEN** 用户访问 `/posts/[slug]` 页面
- **THEN** 展示文章标题、封面图、正文内容、标签、分类信息

#### Scenario: Markdown 内容渲染
- **WHEN** 文章正文包含 Markdown 格式
- **THEN** 正确渲染标题、段落、代码块、引用等基础 Markdown 元素

#### Scenario: 展示相关文章
- **WHEN** 文章详情页加载
- **THEN** 展示同分类下的其他文章推荐

### Requirement: 分类页面
系统 SHALL 提供分类页面，展示所有分类及其下的文章。

#### Scenario: 展示分类列表
- **WHEN** 用户访问 `/categories` 页面
- **THEN** 展示所有分类卡片，包含分类名称、描述、图标、文章数量

#### Scenario: 按分类筛选文章
- **WHEN** 用户点击某个分类
- **THEN** 展示该分类下的所有文章

### Requirement: 归档页面
系统 SHALL 提供归档页面，按年份和月份分组展示文章时间线。

#### Scenario: 按时间分组展示文章
- **WHEN** 用户访问 `/archive` 页面
- **THEN** 按年份和月份分组展示所有文章，形成时间线视图

### Requirement: 搜索功能
系统 SHALL 提供前端搜索功能，支持按标题、摘要、标签搜索文章。

#### Scenario: 关键词搜索文章
- **WHEN** 用户在搜索框输入关键词
- **THEN** 实时过滤并展示匹配的文章（匹配标题、摘要、标签）

### Requirement: 好友页面
系统 SHALL 提供好友页面，展示友链卡片。

#### Scenario: 展示好友列表
- **WHEN** 用户访问 `/friends` 页面
- **THEN** 展示所有好友卡片，包含头像、名称、角色、描述、链接

### Requirement: 关于页面
系统 SHALL 提供关于页面，展示作者个人信息。

#### Scenario: 展示关于信息
- **WHEN** 用户访问 `/about` 页面
- **THEN** 展示作者介绍、技能标签、联系方式等信息

### Requirement: 视觉设计系统
系统 SHALL 实现统一的像素风 + 海洋配色视觉设计。

#### Scenario: 使用统一的设计令牌
- **WHEN** 渲染任何页面组件
- **THEN** 使用 `ocean`、`coral`、`sand`、`mint` 等主题色，像素风边框和阴影

#### Scenario: 响应式布局
- **WHEN** 在不同设备尺寸下访问
- **THEN** 移动端（375px）、平板（768px）、桌面（1280px）均正常显示，无横向滚动

### Requirement: 封面图处理
系统 SHALL 正确处理文章封面图，支持 Directus 图片、本地图片和默认回退。

#### Scenario: 展示 Directus 封面图
- **WHEN** 文章有 Directus 封面图 ID
- **THEN** 通过 `${DIRECTUS_URL}/assets/${fileId}` 加载并展示图片

#### Scenario: 展示本地封面图
- **WHEN** 文章有本地图片路径（如 `/images/post-rust.svg`）
- **THEN** 从 `public/images/` 加载并展示图片

#### Scenario: 无封面图时回退
- **WHEN** 文章没有封面图
- **THEN** 展示默认的像素风插画或图标

### Requirement: Directus 数据模型配置
系统 SHALL 提供 Directus 数据模型的配置指南和示例数据。

#### Scenario: 创建数据集合
- **WHEN** 按照文档配置 Directus
- **THEN** 成功创建 `posts`、`categories`、`tags`、`friends` 集合

#### Scenario: 配置 Public 权限
- **WHEN** 配置 Directus 访问控制
- **THEN** Public 角色可以读取已发布的文章、分类、标签、好友数据

#### Scenario: 创建示例数据
- **WHEN** 初始化 Directus 数据
- **THEN** 至少创建 3 个分类、5 个标签、5 篇示例文章、6 个好友链接
