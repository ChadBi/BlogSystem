# Directus 数据模型建议

## posts

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| title | string | 文章标题 |
| slug | string | URL 标识 |
| summary | text | 文章摘要 |
| content | text | Markdown / 富文本正文 |
| cover | file | 封面图 |
| status | string | draft / published |
| published_at | datetime | 发布时间 |
| category | many-to-one | 所属分类 |
| tag_links | many-to-many | 通过 posts_tags 关联多个标签 |
| tags | legacy | 旧版单标签字段，迁移后使用 tag_links |
| views | integer | 浏览量 |
| likes | integer | 点赞数 |
| comments | integer | 评论数 |
| date_created | timestamp | Directus 自动生成的创建时间，作为 `published_at` 的回退（见 `lib/directus.ts` normalizePost） |

现有 Directus 环境完成初始化后，在 `blog-frontend` 目录执行以下命令，创建多标签关联并迁移旧标签。脚本可重复执行。

```powershell
node --env-file=.env ../directus-cms/migrate-post-tags.mjs
```

## categories

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| name | string | 分类名称 |
| slug | string | URL 标识 |
| description | text | 分类说明 |
| icon | string | 图标名 |

## tags

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| name | string | 标签名称 |
| slug | string | URL 标识 |
| color | string | 标签颜色 |

## friends

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| name | string | 友链名称 |
| role | string | 角色/方向 |
| description | text | 简介 |
| url | string | 链接 |
| avatar | file | 头像。若为 file 类型，前端需拼接 `${DIRECTUS_URL}/assets/${fileId}`（TODO：当前 `lib/directus.ts` 的 `getFriends` 未做此转换，直接返回原始字段，需后续补齐） |
| tags | json | 标签数组 |

## API 权限

第一版建议开放只读权限：

- posts：只允许读取 `status = published` 的文章；
- categories / tags / friends：允许公开读取；
- files：允许公开读取文章封面和插图。

## about_settings

关于我页面的简介、标语、个人介绍和技术栈保存在 Directus 的 `about_settings` 中。初始化新环境时，在 `blog-frontend` 目录执行：

```powershell
node --env-file=.env ../directus-cms/init-about.mjs
```

脚本可以重复执行，已有设置会保留。文章数和访问量由文章数据计算。
