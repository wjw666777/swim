# CRM System Cloudflare API Deployment Guide

## Overview

This guide will help you migrate your CRM system from localStorage to Cloudflare Workers and KV storage.

## Prerequisites

1. Cloudflare account
2. Node.js and npm installed
3. Wrangler CLI tool installed

## Installation Steps

### 1. Install Wrangler CLI

```bash
npm install -g wrangler
```

### 2. 登录Cloudflare

```bash
wrangler login
```

### 3. 创建KV命名空间

```bash
# 创建生产环境KV命名空间
wrangler kv:namespace create "CRM_KV"

# 创建预览环境KV命名空间
wrangler kv:namespace create "CRM_KV" --preview
```

### 4. 更新配置文件

编辑 `wrangler.toml` 文件，将KV命名空间ID替换为实际值：

```toml
name = "crm-api-worker"
main = "cloudflare-worker.js"
compatibility_date = "2024-01-01"

[[kv_namespaces]]
binding = "CRM_KV"
id = "your-actual-kv-namespace-id"  # 替换为步骤3中获得的ID
preview_id = "your-actual-preview-kv-namespace-id"  # 替换为预览环境ID

[vars]
ENVIRONMENT = "production"
```

### 5. 部署Worker

```bash
wrangler deploy
```

### 6. 更新前端配置

编辑 `index.html` 文件中的API配置：

```javascript
const API_CONFIG = {
    baseUrl: 'https://your-worker-name.your-subdomain.workers.dev', // 替换为实际的Worker URL
    endpoints: {
        data: '/api/crm/data',
        company: '/api/crm/company'
    }
};
```

## API接口说明

### 获取所有CRM数据
- **URL**: `GET /api/crm/data`
- **响应**: JSON数组，包含所有企业数据

### 保存所有CRM数据
- **URL**: `POST /api/crm/data`
- **请求体**: JSON数组，包含所有企业数据
- **响应**: 成功状态和时间戳

### 获取单个企业数据
- **URL**: `GET /api/crm/company/{id}`
- **响应**: 单个企业的JSON对象

### 更新单个企业数据
- **URL**: `PUT /api/crm/company/{id}`
- **请求体**: 包含更新字段的JSON对象
- **响应**: 更新后的企业数据

### 健康检查
- **URL**: `GET /api/health`
- **响应**: 服务状态和时间戳

## 功能特性

### 1. 数据持久化
- 使用Cloudflare KV存储，数据全球分布
- 自动备份到localStorage作为降级方案

### 2. 错误处理
- API请求失败时自动降级到localStorage
- 用户友好的错误提示

### 3. 加载状态
- 显示加载动画，提升用户体验
- 异步操作不阻塞界面

### 4. 性能优化
- 单个企业更新使用PUT请求，避免全量更新
- 支持CORS，可从任何域名访问

## 数据迁移

首次部署后，现有的localStorage数据会自动迁移到Cloudflare KV存储。

## 监控和调试

### 查看Worker日志
```bash
wrangler tail
```

### 查看KV存储内容
```bash
wrangler kv:key list --binding=CRM_KV
wrangler kv:key get --binding=CRM_KV "crmData"
```

## 故障排除

### 1. CORS错误
确保Worker正确设置了CORS头部，已在代码中包含。

### 2. KV存储访问错误
检查wrangler.toml中的KV命名空间ID是否正确。

### 3. API请求失败
检查前端API_CONFIG中的baseUrl是否正确。

## 成本估算

- Cloudflare Workers: 免费套餐包含100,000次请求/天
- KV存储: 免费套餐包含100,000次读取和1,000次写入/天
- 对于中小型CRM系统，通常在免费额度内

## 安全建议

1. 考虑添加API密钥认证
2. 实施请求频率限制
3. 定期备份KV存储数据

## 支持

如有问题，请查看Cloudflare Workers文档或联系技术支持。