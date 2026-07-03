// Directus 初始化脚本：创建集合/字段/关系/权限/种子数据
// 零依赖，仅用 Node 18+ 内置 fetch
// 运行方式：node directus-cms/seed.mjs

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// 解析 .env 文件（简单实现，不引入 dotenv）
function loadEnv() {
  const envPath = resolve(__dirname, '.env');
  const content = readFileSync(envPath, 'utf-8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    env[key] = value;
  }
  return env;
}

const env = loadEnv();
const DIRECTUS_URL = env.DIRECTUS_PUBLIC_URL || 'http://localhost:8055';
const ADMIN_EMAIL = env.ADMIN_EMAIL;
const ADMIN_PASSWORD = env.ADMIN_PASSWORD;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('❌ ADMIN_EMAIL 或 ADMIN_PASSWORD 未在 .env 中配置');
  process.exit(1);
}

let TOKEN = null;

async function api(path, options = {}) {
  const url = `${DIRECTUS_URL}${path}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;
  const res = await fetch(url, { ...options, headers });
  const text = await res.text();
  let body;
  try { body = text ? JSON.parse(text) : {}; } catch { body = { raw: text }; }
  return { status: res.status, body };
}

async function login() {
  console.log('→ 登录 admin 账号...');
  const { status, body } = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
  });
  if (status !== 200 || !body?.data?.access_token) {
    console.error('❌ 登录失败:', status, JSON.stringify(body));
    process.exit(1);
  }
  TOKEN = body.data.access_token;
  console.log('✓ 登录成功，token 已获取');
}

// 获取或创建 public 角色及其关联的 policy（Directus 11 权限挂在 policy 上）
async function getPublicRoleAndPolicy() {
  // Directus 11 自带一个 public policy（name 为 $t:public_label），先查 policy
  let policyId = null;
  let roleId = null;

  // 查 public policy
  const policyRes = await api('/policies?filter[name][_eq]=$t:public_label');
  if (policyRes.status === 200 && policyRes.body?.data?.length) {
    policyId = policyRes.body.data[0].id;
    console.log(`✓ 找到内置 public policy: ${policyId}`);
  }

  // 查 public role（名称可能是 public 或 $t:public_label）
  const roleRes = await api('/roles?filter[name][_eq]=public');
  if (roleRes.status === 200 && roleRes.body?.data?.length) {
    roleId = roleRes.body.data[0].id;
    console.log(`✓ 找到 public role: ${roleId}`);
  } else {
    // 兜底：查所有 role 找 public 的
    const allRoles = await api('/roles');
    if (allRoles.status === 200) {
      const pub = allRoles.body.data.find((r) => r.name === 'public' || r.name === '$t:public_label');
      if (pub) {
        roleId = pub.id;
        console.log(`✓ 找到 public role (兜底查询): ${roleId}`);
      }
    }
  }

  // 如果 role 不存在，创建
  if (!roleId) {
    console.log('→ public role 不存在，创建中...');
    const { status: s, body: b } = await api('/roles', {
      method: 'POST',
      body: JSON.stringify({
        name: 'public',
        icon: 'public',
        description: '未登录访客角色',
        public: true
      })
    });
    if (s === 200 && b?.data?.id) {
      roleId = b.data.id;
      console.log(`✓ public role 已创建: ${roleId}`);
    } else {
      console.error('❌ 创建 public role 失败:', s, JSON.stringify(b));
      process.exit(1);
    }
  }

  // 如果 policy 不存在，创建并关联到 role
  if (!policyId) {
    console.log('→ public policy 不存在，创建中...');
    const { status: s, body: b } = await api('/policies', {
      method: 'POST',
      body: JSON.stringify({
        name: 'public',
        icon: 'public',
        description: '未登录访客策略',
        app_access: false,
        admin_access: false
      })
    });
    if (s === 200 && b?.data?.id) {
      policyId = b.data.id;
      console.log(`✓ public policy 已创建: ${policyId}`);
    } else {
      console.error('❌ 创建 public policy 失败:', s, JSON.stringify(b));
      process.exit(1);
    }
  }

  return { roleId, policyId };
}

// 创建集合（若已存在则跳过）
async function createCollection(collection) {
  console.log(`→ 创建集合 ${collection.collection}...`);
  const { status, body } = await api('/collections', {
    method: 'POST',
    body: JSON.stringify(collection)
  });
  if (status === 200) {
    console.log(`✓ 集合 ${collection.collection} 已创建`);
    return true;
  }
  // 已存在
  if (status === 400 && JSON.stringify(body).includes('already exists')) {
    console.log(`○ 集合 ${collection.collection} 已存在，跳过`);
    return false;
  }
  console.error(`❌ 创建集合 ${collection.collection} 失败:`, status, JSON.stringify(body));
  process.exit(1);
}

// 添加字段
async function createField(collection, field) {
  const { status, body } = await api(`/fields/${collection}`, {
    method: 'POST',
    body: JSON.stringify(field)
  });
  if (status === 200) {
    console.log(`  ✓ 字段 ${collection}.${field.field}`);
    return;
  }
  // 字段已存在
  if (status === 400 && JSON.stringify(body).includes('already exists')) {
    console.log(`  ○ 字段 ${collection}.${field.field} 已存在`);
    return;
  }
  console.error(`  ❌ 字段 ${collection}.${field.field} 失败:`, status, JSON.stringify(body));
  process.exit(1);
}

// 创建关系
async function createRelation(relation) {
  const { status, body } = await api('/relations', {
    method: 'POST',
    body: JSON.stringify(relation)
  });
  if (status === 200) {
    console.log(`✓ 关系 ${relation.collection}.${relation.field} → ${relation.related_collection}`);
    return;
  }
  const bodyStr = JSON.stringify(body);
  // 已存在的几种错误消息
  if (status === 400 && (bodyStr.includes('already exists') || bodyStr.includes('already has an associated relationship'))) {
    console.log(`○ 关系 ${relation.collection}.${relation.field} 已存在，跳过`);
    return;
  }
  console.error(`❌ 关系失败:`, status, bodyStr);
  process.exit(1);
}

// 设置 public 策略权限（Directus 11 权限挂在 policy 上，不是 role）
async function setPublicPermission(policyId, permission) {
  // 确保 permissions 字段存在（Directus 11 要求）
  const perm = { permissions: {}, ...permission };
  // 先查是否已有（用 JSON filter 格式，避免 Node fetch 编码方括号）
  const filter = JSON.stringify({ policy: { _eq: policyId }, collection: { _eq: perm.collection }, action: { _eq: perm.action } });
  const queryPath = `/permissions?filter=${encodeURIComponent(filter)}`;
  const queryResult = await api(queryPath);
  let existingId = null;
  if (queryResult.status === 200 && queryResult.body?.data?.length) {
    existingId = queryResult.body.data[0].id;
  }
  if (existingId) {
    // PATCH 时不传 policy（不可修改外键）
    const { status: s, body: b } = await api(`/permissions/${existingId}`, {
      method: 'PATCH',
      body: JSON.stringify(perm)
    });
    if (s === 200) {
      console.log(`✓ 权限 ${perm.collection}.${perm.action} (public, 已更新)`);
      return;
    }
    console.error(`❌ 权限 ${perm.collection}.${perm.action} PATCH 失败:`, s, JSON.stringify(b));
    process.exit(1);
  } else {
    // POST 时传 policy
    const { status: s, body: b } = await api('/permissions', {
      method: 'POST',
      body: JSON.stringify({ ...perm, policy: policyId })
    });
    if (s === 200) {
      console.log(`✓ 权限 ${perm.collection}.${perm.action} (public, 新建)`);
      return;
    }
    console.error(`❌ 权限 ${perm.collection}.${perm.action} POST 失败:`, s, JSON.stringify(b));
    process.exit(1);
  }
}

// 插入数据（若 slug 已存在则跳过）
async function insertItem(collection, item, uniqueField = 'slug') {
  // 查重
  const { status, body } = await api(`/items/${collection}?filter[${uniqueField}][_eq]=${item[uniqueField]}&limit=1`);
  if (status === 200 && body?.data?.length) {
    console.log(`  ○ ${collection} "${item[uniqueField]}" 已存在，跳过`);
    return body.data[0].id;
  }
  const { status: s, body: b } = await api(`/items/${collection}`, {
    method: 'POST',
    body: JSON.stringify(item)
  });
  if (s === 200) {
    console.log(`  ✓ ${collection} "${item[uniqueField]}" 已插入`);
    return b.data.id;
  }
  console.error(`  ❌ ${collection} "${item[uniqueField]}" 失败:`, s, JSON.stringify(b));
  process.exit(1);
}

async function main() {
  console.log('========================================');
  console.log('Directus 初始化脚本');
  console.log(`URL: ${DIRECTUS_URL}`);
  console.log('========================================\n');

  await login();
  const { roleId: publicRoleId, policyId: publicPolicyId } = await getPublicRoleAndPolicy();
  console.log(`✓ public role: ${publicRoleId}, policy: ${publicPolicyId}\n`);

  // ========== 1. 创建集合 ==========
  console.log('【1/6】创建集合...');

  await createCollection({
    collection: 'categories',
    meta: { icon: 'label', note: '文章分类' },
    schema: { name: 'categories' }
  });

  await createCollection({
    collection: 'tags',
    meta: { icon: 'local_offer', note: '标签' },
    schema: { name: 'tags' }
  });

  await createCollection({
    collection: 'posts',
    meta: { icon: 'article', note: '文章' },
    schema: { name: 'posts' }
  });

  await createCollection({
    collection: 'friends',
    meta: { icon: 'group', note: '友链' },
    schema: { name: 'friends' }
  });

  // ========== 2. 添加字段 ==========
  console.log('\n【2/6】添加字段...');

  // categories 字段（Directus 自动创建 id，需补 name/slug/description/icon）
  await createField('categories', { field: 'name', type: 'string', meta: { interface: 'input', required: true } });
  await createField('categories', { field: 'slug', type: 'string', meta: { interface: 'input', required: true } });
  await createField('categories', { field: 'description', type: 'text', meta: { interface: 'input-multiline' } });
  await createField('categories', { field: 'icon', type: 'string', meta: { interface: 'input' } });

  // tags 字段
  await createField('tags', { field: 'name', type: 'string', meta: { interface: 'input', required: true } });
  await createField('tags', { field: 'slug', type: 'string', meta: { interface: 'input', required: true } });
  await createField('tags', { field: 'color', type: 'string', meta: { interface: 'input' } });

  // posts 字段
  // status：普通字符串字段（非 Directus 系统 status_field），用于前端 filter[status][_eq]=published
  await createField('posts', {
    field: 'status',
    type: 'string',
    meta: { interface: 'input', default_value: 'published', note: '文章状态：published/draft' },
    schema: { default_value: 'published' }
  });
  await createField('posts', { field: 'title', type: 'string', meta: { interface: 'input', required: true } });
  await createField('posts', { field: 'slug', type: 'string', meta: { interface: 'input', required: true } });
  await createField('posts', { field: 'summary', type: 'text', meta: { interface: 'input-multiline' } });
  await createField('posts', { field: 'content', type: 'text', meta: { interface: 'input-rich-text-md' } });
  await createField('posts', { field: 'cover', type: 'uuid', meta: { interface: 'file-image', special: ['file'] } });
  await createField('posts', { field: 'published_at', type: 'timestamp', meta: { interface: 'datetime' } });
  await createField('posts', { field: 'category', type: 'integer', meta: { interface: 'select-dropdown-m2o' } });
  await createField('posts', { field: 'tags', type: 'json', meta: { interface: 'list-m2m', special: ['m2m'] } });
  await createField('posts', { field: 'views', type: 'integer', meta: { interface: 'input', default_value: 0 }, schema: { default: 0 } });
  await createField('posts', { field: 'likes', type: 'integer', meta: { interface: 'input', default_value: 0 }, schema: { default: 0 } });
  await createField('posts', { field: 'comments', type: 'integer', meta: { interface: 'input', default_value: 0 }, schema: { default: 0 } });

  // friends 字段
  await createField('friends', { field: 'name', type: 'string', meta: { interface: 'input', required: true } });
  await createField('friends', { field: 'role', type: 'string', meta: { interface: 'input' } });
  await createField('friends', { field: 'description', type: 'text', meta: { interface: 'input-multiline' } });
  await createField('friends', { field: 'url', type: 'string', meta: { interface: 'input' } });
  await createField('friends', { field: 'avatar', type: 'uuid', meta: { interface: 'file-image', special: ['file'] } });
  await createField('friends', { field: 'tags', type: 'json', meta: { interface: 'tags' } });

  // ========== 3. 创建关系 ==========
  console.log('\n【3/6】创建关系...');

  // posts → categories (M2O)
  await createRelation({
    collection: 'posts',
    field: 'category',
    related_collection: 'categories',
    meta: { sort_field: null },
    schema: { on_delete: 'SET NULL' }
  });

  // posts ↔ tags (M2M)，Directus 会自动创建中间集合 posts_tags
  await createRelation({
    collection: 'posts',
    field: 'tags',
    related_collection: 'tags',
    meta: { sort_field: null },
    schema: { on_delete: 'SET NULL' }
  });

  // ========== 4. 设置 public 权限 ==========
  console.log('\n【4/6】设置 public 角色权限...');

  await setPublicPermission(publicPolicyId, { collection: 'categories', action: 'read', fields: ['*'] });
  await setPublicPermission(publicPolicyId, { collection: 'tags', action: 'read', fields: ['*'] });
  // posts：前端查询已带 filter[status][_eq]=published，此处不再设 API 层限制
  // （Directus 11 限制通过 API 设置自定义权限规则，如需限制请在 Admin UI 手动配置）
  await setPublicPermission(publicPolicyId, { collection: 'posts', action: 'read', fields: ['*'] });
  await setPublicPermission(publicPolicyId, { collection: 'friends', action: 'read', fields: ['*'] });

  // ========== 5. 插入种子数据 ==========
  console.log('\n【5/6】插入种子数据...');

  console.log('  → 分类...');
  const catBackend = await insertItem('categories', { name: '后端开发', slug: 'backend', description: '服务端、数据库、架构', icon: '🔧' });
  const catFrontend = await insertItem('categories', { name: '前端开发', slug: 'frontend', description: 'UI、交互、性能', icon: '🎨' });
  const catOps = await insertItem('categories', { name: '运维部署', slug: 'ops', description: 'Docker、CI/CD、监控', icon: '🚀' });

  console.log('  → 标签...');
  const tagRust = await insertItem('tags', { name: 'Rust', slug: 'rust', color: '#dea584' });
  const tagTs = await insertItem('tags', { name: 'TypeScript', slug: 'typescript', color: '#3178c6' });
  const tagDocker = await insertItem('tags', { name: 'Docker', slug: 'docker', color: '#2496ed' });
  const tagLinux = await insertItem('tags', { name: 'Linux', slug: 'linux', color: '#fcc624' });
  const tagNext = await insertItem('tags', { name: 'Next.js', slug: 'nextjs', color: '#000000' });

  console.log('  → 文章...');
  await insertItem('posts', {
    title: '用 Rust 构建一个迷你 Web 框架',
    slug: 'mini-rust-web-framework',
    summary: '从零实现一个支持路由、中间件、JSON 响应的 Rust Web 框架，理解 axum/actix 的底层原理。',
    content: '# 用 Rust 构建一个迷你 Web 框架\n\n## 为什么自己造轮子\n\n理解底层原理是成为高级工程师的必经之路。本文从 TCP 监听开始，逐步实现路由匹配、中间件链、JSON 序列化。\n\n## 第一步：监听 TCP\n\n```rust\nuse std::net::TcpListener;\n\nlet listener = TcpListener::bind("127.0.0.1:8080")?;\nfor stream in listener.incoming() {\n    handle(stream?);\n}\n```\n\n## 第二步：解析 HTTP 请求\n\n从字节流中解析出 method、path、headers。\n\n## 第三步：路由匹配\n\n用简单的 HashMap<String, Handler> 即可。\n\n## 总结\n\n一个 200 行的 Web 框架就完成了。',
    status: 'published',
    published_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    category: catBackend,
    tags: [tagRust],
    views: 128,
    likes: 24,
    comments: 5
  });

  await insertItem('posts', {
    title: 'TypeScript 类型体操实战',
    slug: 'typescript-prompt-generator',
    summary: '通过 10 个实用类型体操练习，掌握条件类型、映射类型、模板字面量类型。',
    content: '# TypeScript 类型体操实战\n\n## 条件类型\n\n```ts\ntype IsString<T> = T extends string ? true : false;\n```\n\n## 映射类型\n\n```ts\ntype Readonly<T> = { readonly [P in keyof T]: T[P] };\n```\n\n## 模板字面量类型\n\n```ts\ntype EventName = `on${Capitalize<string>}`;\n```\n\n## 实战：实现 DeepPartial\n\n```ts\ntype DeepPartial<T> = {\n  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];\n};\n```\n\n坚持练习，类型系统会成为你的得力助手。',
    status: 'published',
    published_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    category: catFrontend,
    tags: [tagTs, tagNext],
    views: 256,
    likes: 48,
    comments: 12
  });

  await insertItem('posts', {
    title: 'Docker 最佳实践 2026',
    slug: 'docker-best-practices',
    summary: '多阶段构建、镜像瘦身、BuildKit 缓存、安全加固，生产环境 Dockerfile 的 12 条准则。',
    content: '# Docker 最佳实践 2026\n\n## 1. 多阶段构建\n\n```dockerfile\nFROM node:20 AS builder\nCOPY . .\nRUN npm ci && npm run build\n\nFROM node:20-alpine\nCOPY --from=builder /app/.next /app/.next\n```\n\n## 2. 使用 .dockerignore\n\n排除 node_modules、.git、.env。\n\n## 3. 非 root 用户运行\n\n```dockerfile\nUSER node\n```\n\n## 4. 健康检查\n\n```dockerfile\nHEALTHCHECK CMD curl -f http://localhost:3000/api/health || exit 1\n```\n\n遵循这些实践，镜像可以从 1GB 瘦身到 150MB。',
    status: 'published',
    published_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    category: catOps,
    tags: [tagDocker, tagLinux],
    views: 89,
    likes: 15,
    comments: 3
  });

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

  console.log('  → 友链...');
  await insertItem('friends', {
    name: '阮一峰',
    role: '技术博主',
    description: '科技爱好者周刊作者',
    url: 'https://www.ruanyifeng.com',
    avatar: '📚',
    tags: ['博客', '周刊']
  }, 'name');
  await insertItem('friends', {
    name: '尾鱼',
    role: '独立开发者',
    description: '前端工程师，热爱开源',
    url: 'https://example.com',
    avatar: '🐟',
    tags: ['前端', '开源']
  }, 'name');

  // ========== 6. 完成 ==========
  console.log('\n【6/6】初始化完成！');
  console.log('\n========================================');
  console.log('✅ 所有集合、字段、关系、权限、种子数据已就绪');
  console.log('   public 角色可读 categories/tags/posts(published)/friends');
  console.log('   可访问 http://localhost:3000 验证前端联调');
  console.log('========================================');
}

main().catch((err) => {
  console.error('\n💥 脚本异常:', err);
  process.exit(1);
});
