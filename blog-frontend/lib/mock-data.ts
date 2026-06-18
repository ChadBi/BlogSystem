import type { Category, Friend, Post, Tag } from '@/types/post';

export const categories: Category[] = [
  { id: 'backend', name: '后端开发', slug: 'backend', description: '服务端开发技术、架构设计与最佳实践', icon: '🧱', count: 28 },
  { id: 'frontend', name: '前端开发', slug: 'frontend', description: 'Web 前端技术、框架应用与用户体验', icon: '🧩', count: 19 },
  { id: 'ops', name: '运维部署', slug: 'ops', description: '系统运维、自动化部署与监控工具', icon: '⚙️', count: 14 },
  { id: 'tools', name: '工具资源', slug: 'tools', description: '开发工具、效率软件与实用资源', icon: '🧰', count: 12 },
  { id: 'algorithm', name: '算法与数据结构', slug: 'algorithm', description: '算法学习、数据结构与编程题解', icon: '🧠', count: 9 },
  { id: 'notes', name: '随笔记录', slug: 'notes', description: '技术思考、学习心得与生活随笔', icon: '🐚', count: 7 }
];

export const tags: Tag[] = [
  { id: 'rust', name: 'Rust', slug: 'rust', color: 'purple', count: 28 },
  { id: 'typescript', name: 'TypeScript', slug: 'typescript', color: 'mint', count: 24 },
  { id: 'python', name: 'Python', slug: 'python', color: 'blue', count: 18 },
  { id: 'linux', name: 'Linux', slug: 'linux', color: 'sand', count: 16 },
  { id: 'docker', name: 'Docker', slug: 'docker', color: 'blue', count: 15 },
  { id: 'web', name: 'Web', slug: 'web', color: 'mint', count: 12 },
  { id: 'git', name: 'Git', slug: 'git', color: 'coral', count: 12 },
  { id: 'algorithm', name: '算法', slug: 'algorithm', color: 'purple', count: 9 },
  { id: 'database', name: '数据库', slug: 'database', color: 'sand', count: 7 },
  { id: 'performance', name: '性能优化', slug: 'performance', color: 'coral', count: 6 }
];

const rust = tags[0];
const web = tags[5];
const ts = tags[1];
const docker = tags[4];
const linux = tags[3];
const perf = tags[9];

export const posts: Post[] = [
  {
    id: '1',
    title: '从零实现一个微型 Rust Web 框架',
    slug: 'mini-rust-web-framework',
    summary: '本文带你从一个极简路由器开始，逐步实现请求提取、响应处理和中间件系统。',
    content: `# 从零实现一个微型 Rust Web 框架\n\n> TL;DR：本文实现了一个微型 Rust Web 框架，包含路由、请求提取、响应处理中间件等核心能力。\n\n## 1. 项目结构\n\n我们先定义一个清晰的项目结构。\n\n\`\`\`txt\nmini-rs-web/\n├── Cargo.toml\n└── src/\n    ├── main.rs\n    ├── router.rs\n    ├── handler.rs\n    ├── request.rs\n    └── response.rs\n\`\`\`\n\n## 2. 路由设计\n\n使用 HashMap 保存 METHOD + PATH 到处理函数的映射。\n\n\`\`\`rust\npub struct Router {\n    routes: HashMap<String, Handler>,\n}\n\nimpl Router {\n    pub fn new() -> Self {\n        Self { routes: HashMap::new() }\n    }\n}\n\`\`\`\n\n## 3. 请求处理\n\n请求对象只保留必要字段，方便后续逐步扩展。`,
    cover: '/images/post-rust.svg',
    status: 'published',
    publishedAt: '2024-05-12',
    category: categories[0],
    tags: [rust, web],
    views: 128,
    likes: 128,
    comments: 24
  },
  {
    id: '2',
    title: '用 TypeScript 打造一个代码提示生成器',
    slug: 'typescript-prompt-generator',
    summary: '把常用模板、上下文变量和输出规范统一管理，提升 AI 协作开发效率。',
    content: '# TypeScript 提示词生成器\n\n把提示词拆成角色、目标、约束、输出格式四个层次。',
    cover: '/images/post-ts.svg',
    status: 'published',
    publishedAt: '2024-05-08',
    category: categories[1],
    tags: [ts, web],
    views: 96,
    likes: 96,
    comments: 18
  },
  {
    id: '3',
    title: '容器化部署：Docker 最佳实践',
    slug: 'docker-best-practices',
    summary: '从镜像构建、环境变量、数据卷和日志管理几个角度整理 Docker 部署习惯。',
    content: '# Docker 最佳实践\n\n生产环境中应尽量避免把配置写死在镜像中。',
    cover: '/images/post-docker.svg',
    status: 'published',
    publishedAt: '2024-05-05',
    category: categories[2],
    tags: [docker, linux],
    views: 72,
    likes: 72,
    comments: 16
  },
  {
    id: '4',
    title: '记一次线上性能问题排查',
    slug: 'linux-performance-troubleshooting',
    summary: '使用 top、iotop、日志采样和慢查询定位一次接口抖动问题。',
    content: '# 线上性能问题排查\n\n先观察，再假设，最后验证。',
    cover: '/images/post-linux.svg',
    status: 'published',
    publishedAt: '2024-04-30',
    category: categories[2],
    tags: [linux, perf],
    views: 63,
    likes: 64,
    comments: 12
  },
  {
    id: '5',
    title: 'Axum 框架深度解析',
    slug: 'axum-deep-dive',
    summary: '从源码角度理解 Axum 的 Router、Extractor 与中间件设计。',
    content: '# Axum 框架深度解析\n\nAxum 的设计核心是类型安全与组合式抽象。',
    cover: '/images/post-axum.svg',
    status: 'published',
    publishedAt: '2024-04-18',
    category: categories[0],
    tags: [rust, web],
    views: 96,
    likes: 96,
    comments: 14
  }
];

export const friends: Friend[] = [
  { id: '1', name: 'CodeDiver', role: 'Rustacean 🦀', description: '专注 Rust 和系统编程，喜欢探索底层原理和性能优化。', url: 'https://codediver.dev', avatar: '🧑🏻‍💻', tags: ['Rust', '系统编程', '性能优化'] },
  { id: '2', name: 'ByteFisher', role: '前端工程师', description: '热爱前端开发，关注用户体验和现代化工程。', url: 'https://bytefisher.cn', avatar: '👩🏻‍💻', tags: ['TypeScript', 'Vue', '工程化'] },
  { id: '3', name: 'OceanDev', role: '全栈开发者', description: '在云端与大海之间写代码，构建有趣的产品。', url: 'https://oceandev.io', avatar: '🧑🏼‍🚀', tags: ['Go', 'Docker', '云原生'] },
  { id: '4', name: 'CoralCat', role: '架构工程师 🐱', description: '分布式系统爱好者，喜欢高可用和可扩展的设计。', url: 'https://coralcat.me', avatar: '🐱', tags: ['分布式', '微服务', 'Kubernetes'] },
  { id: '5', name: 'DeepBlue', role: 'AI 工程师 🤖', description: '探索 AI 与大模型的边界，构建智能应用。', url: 'https://deepblue.dev', avatar: '🤖', tags: ['Python', 'LLM', '机器学习'] },
  { id: '6', name: 'NightOwl', role: '独立开发者 🦉', description: '夜深人静时写代码，打造独立小而美的产品。', url: 'https://nightowl.app', avatar: '🦉', tags: ['独立开发', 'SaaS', '产品设计'] }
];
