# 生产环境部署指南

本文档提供 Shark Tech Blog 的完整生产环境部署指南，包括服务器环境要求、项目部署步骤、配置说明和常见问题排查。

## 目录

- [服务器环境要求](#服务器环境要求)
- [项目部署步骤](#项目部署步骤)
- [Directus 生产环境配置](#directus-生产环境配置)
- [Next.js 生产环境配置](#nextjs-生产环境配置)
- [Nginx 配置说明](#nginx-配置说明)
- [SSL 证书配置](#ssl-证书配置)
- [常见问题排查](#常见问题排查)
- [性能优化建议](#性能优化建议)

---

## 服务器环境要求

### 最低配置

- **操作系统**：Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- **CPU**：2 核心
- **内存**：4 GB RAM
- **磁盘**：40 GB SSD
- **网络**：100 Mbps

### 推荐配置

- **操作系统**：Ubuntu 22.04 LTS
- **CPU**：4 核心
- **内存**：8 GB RAM
- **磁盘**：100 GB SSD
- **网络**：1 Gbps

### 软件要求

- **Node.js**：18.x 或 20.x LTS（推荐 20.x）
- **pnpm**：8.x 或更高版本
- **Docker**：24.x 或更高版本
- **Docker Compose**：2.20.x 或更高版本
- **Nginx**：1.24.x 或更高版本
- **Git**：2.30.x 或更高版本

### 安装基础软件

```bash
# 更新系统包
sudo apt update && sudo apt upgrade -y

# 安装 Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 验证 Node.js 版本
node -v  # 应输出 v20.x.x
npm -v   # 应输出 10.x.x

# 安装 pnpm
npm install -g pnpm

# 验证 pnpm 版本
pnpm -v  # 应输出 8.x.x 或更高

# 安装 Docker
curl -fsSL https://get.docker.com | bash
sudo usermod -aG docker $USER

# 安装 Docker Compose（Docker 24+ 已内置 compose 插件）
# 验证：docker compose version

# 安装 Nginx
sudo apt install -y nginx

# 安装 Git
sudo apt install -y git

# 安装 Certbot（用于 SSL 证书）
sudo apt install -y certbot python3-certbot-nginx
```

---

## 项目部署步骤

### 1. 克隆项目

```bash
# 创建应用目录
sudo mkdir -p /var/www
sudo chown $USER:$USER /var/www

# 克隆项目
cd /var/www
git clone https://github.com/your-username/shark-tech-blog.git
cd shark-tech-blog

# 或者如果使用 SSH
git clone git@github.com:your-username/shark-tech-blog.git
```

### 2. 配置环境变量

```bash
# 复制环境变量示例文件
cp .env.example .env

# 编辑 .env 文件
nano .env
```

`.env` 文件内容：

```bash
# Directus 后台地址（生产环境使用 HTTPS）
NEXT_PUBLIC_DIRECTUS_URL=https://cms.example.com

# Directus 静态 Token（可选，用于公开访问）
DIRECTUS_STATIC_TOKEN=your-static-token-here

# 站点 URL
NEXT_PUBLIC_SITE_URL=https://blog.example.com
```

### 3. 安装依赖

```bash
# 安装项目依赖
pnpm install
```

### 4. 构建项目

```bash
# 构建 Next.js 应用
pnpm build
```

构建完成后，会在 `.next` 目录生成生产环境文件。

### 5. 启动 Next.js 应用

#### 方式一：使用 PM2（推荐）

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start pnpm --name "shark-blog" -- start

# 设置开机自启
pm2 startup
pm2 save

# 查看应用状态
pm2 status

# 查看日志
pm2 logs shark-blog
```

#### 方式二：使用 systemd

创建 service 文件：

```bash
sudo nano /etc/systemd/system/shark-blog.service
```

内容：

```ini
[Unit]
Description=Shark Tech Blog Next.js Application
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/shark-tech-blog
ExecStart=/usr/bin/pnpm start
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

启动服务：

```bash
# 重载 systemd
sudo systemctl daemon-reload

# 启动服务
sudo systemctl start shark-blog

# 设置开机自启
sudo systemctl enable shark-blog

# 查看状态
sudo systemctl status shark-blog

# 查看日志
sudo journalctl -u shark-blog -f
```

### 6. 启动 Directus CMS

```bash
# 启动 Directus（使用 Docker Compose）
pnpm directus:up

# 查看容器状态
docker compose ps

# 查看日志
docker compose logs -f directus
```

---

## Directus 生产环境配置

### 1. 修改环境变量

编辑 `docker-compose.yml` 文件：

```bash
nano docker-compose.yml
```

**重要**：修改以下配置项：

```yaml
services:
  directus:
    image: directus/directus:latest
    ports:
      - "8055:8055"
    volumes:
      - ./directus/database:/directus/database
      - ./directus/uploads:/directus/uploads
      - ./directus/extensions:/directus/extensions
    environment:
      # 生成随机 KEY 和 SECRET
      KEY: "your-random-key-here"           # 替换为随机字符串
      SECRET: "your-random-secret-here"     # 替换为随机字符串
      
      # 管理员账号（首次启动后修改）
      ADMIN_EMAIL: "admin@example.com"      # 替换为实际邮箱
      ADMIN_PASSWORD: "your-secure-password" # 替换为强密码（至少 12 位）
      
      # 数据库配置
      DB_CLIENT: "sqlite3"
      DB_FILENAME: "/directus/database/data.db"
      
      # WebSocket 支持
      WEBSOCKETS_ENABLED: "true"
      
      # 生产环境建议配置
      CACHE_ENABLED: "true"                 # 启用缓存
      CACHE_STORE: "memory"                 # 缓存存储方式
      CACHE_TTL: "5m"                       # 缓存时间
      
      # 安全配置
      CORS_ENABLED: "true"                  # 启用 CORS
      CORS_ORIGIN: "https://blog.example.com" # 允许的源
```

### 2. 生成随机密钥

```bash
# 生成随机 KEY
openssl rand -hex 32

# 生成随机 SECRET
openssl rand -hex 64
```

将生成的随机字符串复制到 `docker-compose.yml` 中。

### 3. 重启 Directus

```bash
# 停止并重新启动 Directus
pnpm directus:down
pnpm directus:up

# 查看日志确认启动成功
docker compose logs -f directus
```

### 4. 访问 Directus 后台

访问 `https://cms.example.com/admin`，使用配置的管理员账号登录。

**首次登录后立即修改管理员密码**！

---

## Next.js 生产环境配置

### 1. 启用 standalone 模式（推荐）

编辑 `next.config.mjs`：

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // 启用 standalone 模式
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8055',
        pathname: '/assets/**'
      },
      {
        protocol: 'https',
        hostname: '**',
        pathname: '/assets/**'
      }
    ]
  }
};

export default nextConfig;
```

### 2. 重新构建

```bash
pnpm build
```

构建完成后，会在 `.next/standalone` 目录生成独立的可部署文件。

### 3. 使用 standalone 模式启动

```bash
# 使用 standalone 模式启动
node .next/standalone/server.js

# 或者使用 PM2
pm2 start .next/standalone/server.js --name "shark-blog"
```

standalone 模式的优势：
- 更小的部署体积（不包含 node_modules）
- 更快的启动速度
- 更适合容器化部署

### 4. 环境变量说明

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `NEXT_PUBLIC_DIRECTUS_URL` | Directus 后台地址 | `https://cms.example.com` |
| `DIRECTUS_STATIC_TOKEN` | Directus 静态 Token（可选） | `your-token-here` |
| `NEXT_PUBLIC_SITE_URL` | 站点 URL | `https://blog.example.com` |
| `NODE_ENV` | 运行环境 | `production` |
| `PORT` | 应用端口（默认 3000） | `3000` |
| `HOSTNAME` | 监听地址（默认 localhost） | `0.0.0.0` |

---

## Nginx 配置说明

详细的 Nginx 配置请参考 [Nginx 配置示例](./nginx-config.md)。

### 快速配置步骤

1. 复制配置文件到 Nginx 配置目录：

```bash
sudo cp docs/nginx-config.md /tmp/nginx-config.md
# 或者手动创建配置文件
sudo nano /etc/nginx/conf.d/blog.conf
sudo nano /etc/nginx/conf.d/cms.conf
```

2. 替换配置中的域名：

```bash
# 替换 blog.example.com 为你的实际域名
sudo sed -i 's/blog.example.com/your-blog-domain.com/g' /etc/nginx/conf.d/blog.conf

# 替换 cms.example.com 为你的实际域名
sudo sed -i 's/cms.example.com/your-cms-domain.com/g' /etc/nginx/conf.d/cms.conf
```

3. 测试并重载 Nginx：

```bash
sudo nginx -t
sudo nginx -s reload
```

---

## SSL 证书配置

### 1. 申请 Let's Encrypt 证书

```bash
# 为 blog.example.com 申请证书
sudo certbot --nginx -d blog.example.com

# 为 cms.example.com 申请证书
sudo certbot --nginx -d cms.example.com
```

按照提示操作：
- 输入邮箱地址（用于接收证书过期提醒）
- 同意服务条款
- 选择是否重定向 HTTP 到 HTTPS（推荐选择 2 - Redirect）

### 2. 自动续期

Certbot 会自动设置定时任务续期证书。验证自动续期：

```bash
# 测试续期流程
sudo certbot renew --dry-run

# 查看续期定时任务
sudo systemctl list-timers | grep certbot
```

### 3. 手动续期（如需要）

```bash
sudo certbot renew
sudo nginx -s reload
```

### 4. 证书路径

证书默认存储在：
- `/etc/letsencrypt/live/blog.example.com/fullchain.pem`
- `/etc/letsencrypt/live/blog.example.com/privkey.pem`
- `/etc/letsencrypt/live/cms.example.com/fullchain.pem`
- `/etc/letsencrypt/live/cms.example.com/privkey.pem`

---

## 常见问题排查

### 1. Next.js 应用无法启动

**问题**：`pnpm start` 报错

**排查步骤**：

```bash
# 检查是否已构建
ls -la .next/

# 重新构建
pnpm build

# 检查端口占用
sudo lsof -i :3000

# 查看日志
pm2 logs shark-blog
# 或
sudo journalctl -u shark-blog -f
```

### 2. Directus 无法访问

**问题**：访问 `cms.example.com` 返回 502 Bad Gateway

**排查步骤**：

```bash
# 检查 Docker 容器状态
docker compose ps

# 查看 Directus 日志
docker compose logs directus

# 检查端口监听
sudo netstat -tlnp | grep 8055

# 重启 Directus
pnpm directus:down
pnpm directus:up
```

### 3. Nginx 配置错误

**问题**：`nginx -t` 报错

**排查步骤**：

```bash
# 查看详细错误
sudo nginx -t

# 检查配置文件语法
sudo nano /etc/nginx/conf.d/blog.conf
sudo nano /etc/nginx/conf.d/cms.conf

# 检查文件权限
ls -la /etc/nginx/conf.d/

# 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log
```

### 4. SSL 证书问题

**问题**：浏览器提示证书无效

**排查步骤**：

```bash
# 检查证书是否存在
sudo ls -la /etc/letsencrypt/live/

# 验证证书
sudo certbot certificates

# 手动续期
sudo certbot renew --force-renewal

# 检查 Nginx 配置中的证书路径
sudo grep -r "ssl_certificate" /etc/nginx/
```

### 5. 图片无法加载

**问题**：博客文章中的图片无法显示

**排查步骤**：

1. 检查 `next.config.mjs` 中的 `images.remotePatterns` 配置
2. 确认 Directus URL 正确：`echo $NEXT_PUBLIC_DIRECTUS_URL`
3. 检查 Directus 是否正常运行：`docker compose ps`
4. 查看浏览器控制台错误信息

### 6. 数据库锁定

**问题**：Directus 报错 "database is locked"

**解决方案**：

```bash
# 停止 Directus
pnpm directus:down

# 备份数据库
cp directus/database/data.db directus/database/data.db.backup

# 重启 Directus
pnpm directus:up
```

### 7. 内存不足

**问题**：应用频繁崩溃，日志显示 "Out of memory"

**解决方案**：

```bash
# 增加 Node.js 内存限制
# 编辑 PM2 配置
pm2 delete shark-blog
pm2 start pnpm --name "shark-blog" -- start --node-args="--max-old-space-size=4096"

# 或者使用 systemd，编辑 service 文件
sudo nano /etc/systemd/system/shark-blog.service
# 添加：Environment=NODE_OPTIONS="--max-old-space-size=4096"

sudo systemctl daemon-reload
sudo systemctl restart shark-blog
```

---

## 性能优化建议

### 1. 启用 Next.js 性能优化

在 `next.config.mjs` 中启用实验性功能：

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    optimizePackageImports: ['react-markdown', 'rehype-highlight'],
  },
  images: {
    remotePatterns: [
      // ... 现有配置
    ]
  }
};

export default nextConfig;
```

### 2. 配置 CDN（可选）

如果访问量大，可以考虑使用 CDN 加速静态资源：

1. 将 `.next/static/` 目录上传到 CDN
2. 修改 `next.config.mjs`：

```javascript
const nextConfig = {
  assetPrefix: 'https://cdn.example.com',
  // ... 其他配置
};
```

### 3. 数据库优化

对于生产环境，建议将 SQLite 替换为 PostgreSQL：

```yaml
# docker-compose.yml
services:
  directus:
    environment:
      DB_CLIENT: "pg"
      DB_HOST: "postgres"
      DB_PORT: "5432"
      DB_DATABASE: "directus"
      DB_USER: "directus"
      DB_PASSWORD: "your-password"
  
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: directus
      POSTGRES_USER: directus
      POSTGRES_PASSWORD: your-password
    volumes:
      - ./directus/postgres:/var/lib/postgresql/data
```

### 4. 启用 Redis 缓存

```yaml
# docker-compose.yml
services:
  directus:
    environment:
      CACHE_ENABLED: "true"
      CACHE_STORE: "redis"
      REDIS: "redis://redis:6379"
  
  redis:
    image: redis:7-alpine
    volumes:
      - ./directus/redis:/data
```

### 5. Nginx 优化

```nginx
# 增加 worker 连接数
events {
    worker_connections 4096;
}

# 启用文件缓存
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m;

# 在 location 中使用缓存
location / {
    proxy_cache my_cache;
    proxy_cache_valid 200 60m;
    # ... 其他配置
}
```

### 6. 监控和日志

**使用 PM2 监控**：

```bash
# 安装 PM2 Plus（可选）
pm2 plus

# 或者使用 PM2 监控面板
pm2 monit
```

**配置日志轮转**：

```bash
# 安装 PM2 日志轮转模块
pm2 install pm2-logrotate

# 配置日志轮转
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### 7. 备份策略

**定期备份数据库**：

```bash
# 创建备份脚本
nano /var/www/shark-tech-blog/backup.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/shark-blog"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# 备份 Directus 数据库
cp /var/www/shark-tech-blog/directus/database/data.db $BACKUP_DIR/data_$DATE.db

# 备份上传文件
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /var/www/shark-tech-blog/directus/uploads/

# 删除 30 天前的备份
find $BACKUP_DIR -type f -mtime +30 -delete

echo "Backup completed: $DATE"
```

```bash
# 添加执行权限
chmod +x /var/www/shark-tech-blog/backup.sh

# 添加定时任务（每天凌晨 2 点备份）
crontab -e
# 添加：0 2 * * * /var/www/shark-tech-blog/backup.sh
```

### 8. 安全加固

**防火墙配置**：

```bash
# 启用 UFW 防火墙
sudo ufw enable

# 允许 SSH
sudo ufw allow 22/tcp

# 允许 HTTP 和 HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 查看状态
sudo ufw status
```

**禁用 Directus 公开注册**：

在 Directus 后台 → Settings → Security → 禁用 "Allow Public Registration"

**定期更新**：

```bash
# 更新系统包
sudo apt update && sudo apt upgrade -y

# 更新项目依赖
cd /var/www/shark-tech-blog
pnpm update

# 更新 Docker 镜像
docker compose pull
pnpm directus:down
pnpm directus:up
```

---

## 部署检查清单

部署完成后，请确认以下事项：

- [ ] Node.js 版本 >= 18.x
- [ ] Docker 和 Docker Compose 已安装
- [ ] Nginx 已安装并运行
- [ ] 环境变量 `.env` 已配置
- [ ] Next.js 已构建（`pnpm build`）
- [ ] Next.js 应用已启动（PM2 或 systemd）
- [ ] Directus 容器已启动（`docker compose ps`）
- [ ] SSL 证书已申请并配置
- [ ] Nginx 配置已测试（`nginx -t`）
- [ ] 可以通过 HTTPS 访问博客前台
- [ ] 可以通过 HTTPS 访问 CMS 后台
- [ ] 管理员密码已修改为强密码
- [ ] 备份脚本已配置
- [ ] 防火墙已配置

---

## 相关文档

- [Nginx 配置示例](./nginx-config.md)
- [Directus Schema 文档](./directus-schema.md)
- [技术栈说明](./tech-stack.md)

---

## 获取帮助

如果遇到问题，可以：

1. 查看项目 README.md
2. 查看应用日志：`pm2 logs` 或 `docker compose logs`
3. 查看 Nginx 错误日志：`sudo tail -f /var/log/nginx/error.log`
4. 提交 GitHub Issue
