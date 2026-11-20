'use server';

import { revalidatePath } from 'next/cache';
import { adminFetch, requireAdminSession } from '@/lib/directus-admin';

export async function saveAbout(form: FormData) {
  const session = await requireAdminSession();
  if (!session.ok) return { error: session.error };
  const field = (name: string) => String(form.get(name) ?? '').trim();
  const intro = field('intro');
  const motto = field('motto');
  const bio = field('bio');
  const skills = field('skills').split(/\r?\n/).map((skill) => skill.trim()).filter(Boolean);
  if (!intro || !bio) return { error: '页面简介和个人介绍不能为空。' };
  if (intro.length > 200 || motto.length > 200 || bio.length > 5000 || skills.length > 50 || skills.some((skill) => skill.length > 50)) {
    return { error: '简介和标语最多 200 字，个人介绍最多 5000 字，技术栈最多 50 项且每项最多 50 字。' };
  }
  const result = await adminFetch('/items/about_settings/1', {
    method: 'PATCH',
    body: JSON.stringify({ intro, motto, bio, skills: [...new Set(skills)] }),
  });
  if (result.error) return { error: '保存失败，请检查 Directus 连接后重试。' };
  revalidatePath('/about');
  return { ok: true };
}
