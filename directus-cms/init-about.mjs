// Run from blog-frontend: node --env-file=.env ../directus-cms/init-about.mjs
const url = process.env.DIRECTUS_URL || 'http://localhost:8055';
let token;
async function api(path, method = 'GET', data) {
  const response = await fetch(url + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: data === undefined ? undefined : JSON.stringify(data),
  });
  const result = response.status === 204 ? {} : await response.json();
  if (!response.ok) throw new Error(`${method} ${path}: ${result.errors?.[0]?.message ?? response.status}`);
  return result.data;
}
async function main() {
  const auth = await api('/auth/login', 'POST', { email: process.env.DIRECTUS_ADMIN_EMAIL, password: process.env.DIRECTUS_ADMIN_PASSWORD });
  token = auth.access_token;
  const collections = await api('/collections');
  if (!collections.some((item) => item.collection === 'about_settings')) {
    await api('/collections', 'POST', {
      collection: 'about_settings', meta: { hidden: true }, schema: {},
      fields: [{ field: 'id', type: 'integer', schema: { is_primary_key: true, has_auto_increment: true }, meta: { hidden: true } }],
    });
  }
  const fields = await api('/fields/about_settings');
  for (const field of [
    { field: 'intro', type: 'string', schema: { max_length: 200 }, meta: { interface: 'input' } },
    { field: 'motto', type: 'string', schema: { max_length: 200 }, meta: { interface: 'input' } },
    { field: 'bio', type: 'text', meta: { interface: 'input-multiline' } },
    { field: 'skills', type: 'json', meta: { interface: 'input-code' } },
  ]) {
    if (!fields.some((item) => item.field === field.field)) await api('/fields/about_settings', 'POST', field);
  }
  const policies = await api('/policies');
  const policy = policies.find((item) => item.name === '$t:public_label' || item.name === 'public');
  if (!policy) throw new Error('Public policy missing');
  const permissions = await api('/permissions?limit=-1');
  if (!permissions.some((item) => item.policy === policy.id && item.collection === 'about_settings' && item.action === 'read')) {
    await api('/permissions', 'POST', { policy: policy.id, collection: 'about_settings', action: 'read', fields: ['*'], permissions: {} });
  }
  const existing = await api('/items/about_settings?filter[id][_eq]=1');
  if (!existing.length) {
    await api('/items/about_settings', 'POST', {
      id: 1,
      intro: '一名热爱代码的开发者，在像素世界里探索技术与未知。',
      motto: 'DIVE INTO THE OCEAN OF CODE!',
      bio: '你好！我是 Shark，一名计算机科学专业的学生和独立开发者。我热爱编程、探索新技术，也喜欢潜入像素海洋，构建有趣的应用与工具。这里记录了我的学习笔记、项目实践和技术思考。',
      skills: ['Rust', 'TypeScript', 'Python', 'Linux', 'Docker', 'Git', 'Web', 'Nginx', 'SQLite', 'TailwindCSS', 'Vite', 'Markdown'],
    });
  }
  console.log('About settings ready.');
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
