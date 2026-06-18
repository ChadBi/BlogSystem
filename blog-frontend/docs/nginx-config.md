# Nginx 反向代理配置示例

本文档提供完整的 Nginx 配置示例，用于将 `blog.example.com` 反向代理到 Next.js 应用（端口 3000），将 `cms.example.com` 反向代理到 Directus CMS（端口 8055）。

## 完整配置示例

```nginx
# 全局配置
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    # 基础配置
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # 日志格式
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;
    
    # 性能优化
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    
    # Gzip 压缩配置
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss 
               application/rss+xml application/atom+xml image/svg+xml;
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # 包含站点配置
    include /etc/nginx/conf.d/*.conf;
}
```

## blog.example.com - Next.js 博客前台

```nginx
# /etc/nginx/conf.d/blog.conf

# HTTP 重定向到 HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name blog.example.com;
    
    # Let's Encrypt 验证
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    # 其他请求重定向到 HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS 配置
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name blog.example.com;
    
    # SSL 证书配置（Let's Encrypt）
    ssl_certificate /etc/letsencrypt/live/blog.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/blog.example.com/privkey.pem;
    
    # SSL 优化
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;
    
    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;
    
    # 反向代理到 Next.js（端口 3000）
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        
        # 保留客户端真实信息
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 超时配置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # 缓冲配置
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
    }
    
    # Next.js 静态资源缓存
    location /_next/static/ {
        proxy_pass http://localhost:3000/_next/static/;
        
        # 静态资源长期缓存（1 年）
        expires 1y;
        add_header Cache-Control "public, immutable";
        
        # 启用 Gzip
        gzip_static on;
    }
    
    # 图片资源缓存
    location ~* \.(jpg|jpeg|png|gif|ico|svg|webp)$ {
        proxy_pass http://localhost:3000;
        expires 30d;
        add_header Cache-Control "public";
    }
    
    # 字体资源缓存
    location ~* \.(woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # 禁止访问隐藏文件
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    # 访问日志
    access_log /var/log/nginx/blog.access.log;
    error_log /var/log/nginx/blog.error.log;
}
```

## cms.example.com - Directus CMS 后台

```nginx
# /etc/nginx/conf.d/cms.conf

# HTTP 重定向到 HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name cms.example.com;
    
    # Let's Encrypt 验证
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS 配置
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name cms.example.com;
    
    # SSL 证书配置（Let's Encrypt）
    ssl_certificate /etc/letsencrypt/live/cms.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cms.example.com/privkey.pem;
    
    # SSL 优化（同上）
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;
    
    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;
    
    # 反向代理到 Directus（端口 8055）
    location / {
        proxy_pass http://localhost:8055;
        proxy_http_version 1.1;
        
        # 保留客户端真实信息
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 超时配置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # 缓冲配置
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
    }
    
    # Directus 上传文件缓存
    location /assets/ {
        proxy_pass http://localhost:8055/assets/;
        expires 30d;
        add_header Cache-Control "public";
    }
    
    # 禁止访问隐藏文件
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    # 访问日志
    access_log /var/log/nginx/cms.access.log;
    error_log /var/log/nginx/cms.error.log;
}
```

## 配置说明

### 1. SSL/HTTPS 配置

- 使用 Let's Encrypt 免费证书
- 自动将 HTTP 请求重定向到 HTTPS
- 启用 TLS 1.2 和 TLS 1.3
- 配置 OCSP Stapling 提升性能

### 2. 静态资源缓存

- `/_next/static/` - Next.js 构建产物，缓存 1 年
- 图片资源（jpg, png, gif 等）- 缓存 30 天
- 字体资源（woff, woff2 等）- 缓存 1 年
- Directus 上传文件 - 缓存 30 天

### 3. Gzip 压缩

- 压缩文本类资源（CSS, JS, JSON, XML 等）
- 压缩级别 6（平衡压缩率和 CPU 消耗）
- 启用 `gzip_static` 优先使用预压缩文件

### 4. 安全配置

- X-Frame-Options: 防止点击劫持
- X-Content-Type-Options: 防止 MIME 类型嗅探
- X-XSS-Protection: 启用 XSS 过滤
- 禁止访问隐藏文件（如 .env, .git）

### 5. 性能优化

- 启用 HTTP/2
- 配置 keepalive 连接
- 优化代理缓冲
- 启用 sendfile 和 tcp_nopush

## 测试配置

```bash
# 测试 Nginx 配置语法
sudo nginx -t

# 重载 Nginx 配置
sudo nginx -s reload

# 查看 Nginx 状态
sudo systemctl status nginx
```

## 注意事项

1. **替换域名**：将 `blog.example.com` 和 `cms.example.com` 替换为实际域名
2. **SSL 证书路径**：确保证书路径与实际 Let's Encrypt 证书路径一致
3. **防火墙配置**：确保开放 80 和 443 端口
4. **DNS 配置**：确保域名 A 记录指向服务器 IP
5. **Next.js standalone 模式**：生产环境建议使用 `output: 'standalone'` 模式构建

## 相关文档

- [生产环境部署指南](./deployment-guide.md)
- [Directus Schema 文档](./directus-schema.md)
- [技术栈说明](./tech-stack.md)
