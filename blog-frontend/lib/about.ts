export type AboutRecord = { intro: string | null; motto: string | null; bio: string | null; skills: string[] | null };
export type About = { intro: string; motto: string; bio: string; skills: string[] };

export const defaultAbout: About = {
  intro: 'Chai_na · JNU / CS Student',
  motto: '用一行行代码，记录自己的学习旅程。',
  bio: '你好，我是 Chai_na，一名计算机科学专业的学生。我把这里当作自己的技术自留地，记录学习中的踩坑和收获，分享数据与算法的学习心得，偶尔也会写些生活感悟。',
  skills: ['Rust', 'TypeScript', 'Python', 'Linux', 'Docker', 'Git', 'Web', 'Nginx', 'SQLite', 'TailwindCSS', 'Vite', 'Markdown'],
};

export function normalizeAbout(record: AboutRecord): About {
  return {
    intro: record.intro ?? '',
    motto: record.motto ?? '',
    bio: record.bio ?? '',
    skills: Array.isArray(record.skills) ? record.skills.filter((skill): skill is string => typeof skill === 'string') : [],
  };
}

export async function getAbout(): Promise<About> {
  if (!process.env.DIRECTUS_URL) return defaultAbout;
  try {
    const response = await fetch(`${process.env.DIRECTUS_URL}/items/about_settings/1`, {
      headers: process.env.DIRECTUS_STATIC_TOKEN ? { Authorization: `Bearer ${process.env.DIRECTUS_STATIC_TOKEN}` } : {},
      cache: 'no-store',
    });
    if (!response.ok) throw new Error(`Directus returned ${response.status}`);
    const result = await response.json();
    return normalizeAbout(result.data);
  } catch (error) {
    console.error('[about] 无法读取设置', error);
    return defaultAbout;
  }
}
