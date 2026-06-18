export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  count?: number;
};

export type Tag = {
  id: string;
  name: string;
  slug: string;
  color?: string;
  count?: number;
};

export type Post = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  cover?: string;
  status: 'draft' | 'published';
  publishedAt: string;
  category: Category;
  tags: Tag[];
  views: number;
  likes: number;
  comments: number;
};

export type Friend = {
  id: string;
  name: string;
  role: string;
  description: string;
  url: string;
  avatar: string;
  tags: string[];
};
