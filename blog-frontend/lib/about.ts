export type AboutRecord = { intro: string | null; motto: string | null; bio: string | null; skills: string[] | null };
export type About = { intro: string; motto: string; bio: string; skills: string[] };

export const defaultAbout: About = {
  intro: '一名热爱代码的开发者，在像素世界里探索技术与未知。',
  motto: 'DIVE INTO THE OCEAN OF CODE!',
  bio: '你好！我是 Shark，一名计算机科学专业的学生和独立开发者。我热爱编程、探索新技术，也喜欢潜入像素海洋，构建有趣的应用与工具。这里记录了我的学习笔记、项目实践和技术思考。',
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
