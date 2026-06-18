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
| tags | many-to-many | 标签 |
| views | integer | 浏览量 |
| likes | integer | 点赞数 |

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
| avatar | file | 头像 |
| tags | json | 标签数组 |

## API 权限

第一版建议开放只读权限：

- posts：只允许读取 `status = published` 的文章；
- categories / tags / friends：允许公开读取；
- files：允许公开读取文章封面和插图。
