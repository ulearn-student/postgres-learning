# 职位看板 · Amazon 运营数据平台

一个基于 Node.js + PostgreSQL + Docker 的全栈项目，实现职位数据的爬取、存储、查询和可视化展示。

---

## 🛠 技术栈

| 层级 | 技术 |
|---|---|
| 运行环境 | Node.js v18+ |
| Web 框架 | Express |
| 数据库 | PostgreSQL 16 |
| ORM | Prisma 5 |
| 容器化 | Docker + Docker Compose |
| 前端 | 原生 HTML / CSS / JavaScript |

---

## 📁 项目结构

```
postgres-learning/
├── docker-compose.yml          # Docker 容器配置
├── init-scripts/               # 数据库初始化 SQL
│   ├── 01-init.sql             # 创建基础表（users/products/orders）
│   └── 02-jobs.sql             # 创建职位表（jobs/amazon_sales）
├── backups/                    # 数据库备份目录
└── node-app/                   # Node.js 应用
    ├── public/
    │   └── index.html          # 职位看板前端页面
    ├── prisma/
    │   └── schema.prisma       # Prisma 数据模型
    ├── db.js                   # 数据库连接池
    ├── transaction.js          # 事务工具函数
    ├── server.js               # Express HTTP 服务器
    ├── userRepository.js       # 用户数据访问层
    ├── job-scraper.js          # 职位爬虫脚本
    ├── reload-jobs.js          # 职位数据重置脚本
    ├── insert-sales.js         # 销售数据插入脚本
    ├── .env                    # 环境变量（不提交 Git）
    ├── .env.example            # 环境变量模板
    └── package.json
```

---

## ⚡ 快速启动

### 前置要求

- [Node.js](https://nodejs.org/) v18 或以上
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### 1. 启动数据库

```bash
# 进入项目根目录
cd postgres-learning

# 启动 PostgreSQL + pgAdmin 容器
docker compose up -d

# 确认容器正常运行（my-postgres 显示 healthy）
docker compose ps
```

### 2. 配置环境变量

```bash
cd node-app

# 复制模板文件
cp .env.example .env

# 编辑 .env，填入你的配置
```

`.env` 内容：

```
DB_HOST=127.0.0.1
DB_PORT=5433
DB_USER=postgres
DB_PASSWORD=你的密码
DB_NAME=shop_db
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:你的密码@127.0.0.1:5433/shop_db?schema=public
```

### 3. 安装依赖

```bash
npm install
```

### 4. 插入测试数据

```bash
# 插入职位数据
node reload-jobs.js

# 插入销售数据
node insert-sales.js
```

### 5. 启动服务器

```bash
node server.js
```

浏览器打开：

```
http://localhost:3000
```

---

## 🗄️ 数据库表结构

### users（用户表）

| 字段 | 类型 | 说明 |
|---|---|---|
| id | BIGSERIAL | 主键，自增 |
| username | VARCHAR(50) | 用户名，唯一 |
| email | VARCHAR(100) | 邮箱，唯一 |
| password_hash | VARCHAR(255) | 密码哈希 |
| age | INT | 年龄 |
| created_at | TIMESTAMPTZ | 创建时间 |

### products（商品表）

| 字段 | 类型 | 说明 |
|---|---|---|
| id | BIGSERIAL | 主键，自增 |
| name | VARCHAR(255) | 商品名称 |
| price | DECIMAL(10,2) | 价格 |
| stock | INT | 库存数量 |
| description | TEXT | 商品描述 |

### orders（订单表）

| 字段 | 类型 | 说明 |
|---|---|---|
| id | BIGSERIAL | 主键，自增 |
| user_id | BIGINT | 外键 → users.id |
| product_id | BIGINT | 外键 → products.id |
| quantity | INT | 购买数量 |
| total | DECIMAL(10,2) | 订单总金额 |
| status | VARCHAR(20) | pending/paid/completed/cancelled |

### jobs（职位表）

| 字段 | 类型 | 说明 |
|---|---|---|
| id | BIGSERIAL | 主键，自增 |
| title | TEXT | 职位名称 |
| company | TEXT | 公司名称 |
| salary_text | TEXT | 薪资原文（如 10k-18k） |
| salary_min | INT | 薪资下限（千） |
| salary_max | INT | 薪资上限（千） |
| city | TEXT | 城市 |
| district | TEXT | 区域 |
| experience | TEXT | 经验要求 |
| education | TEXT | 学历要求 |
| company_size | TEXT | 公司规模 |
| company_type | TEXT | 公司类型 |
| company_stage | TEXT | 融资阶段 |
| tags | TEXT[] | 福利标签数组 |
| description | TEXT | 职位描述 |
| url | TEXT | 职位链接（唯一） |

### amazon_sales（销售数据表）

| 字段 | 类型 | 说明 |
|---|---|---|
| id | BIGSERIAL | 主键，自增 |
| asin | VARCHAR(10) | 亚马逊商品编号 |
| product_name | TEXT | 商品名称 |
| category | TEXT | 类目 |
| units_sold | INT | 销量 |
| revenue | DECIMAL(10,2) | 收入 |
| sale_date | DATE | 销售日期 |

---

## 🌐 API 接口

### 职位相关

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/jobs` | 获取职位列表（支持搜索、筛选、分页） |
| GET | `/api/jobs/stats` | 获取统计数据（总数、城市数、平均薪资） |
| GET | `/api/jobs/cities` | 获取所有城市列表 |

`GET /api/jobs` 支持的查询参数：

```
search    搜索关键词（职位名、公司名、描述）
city      城市筛选
minSalary 薪资下限筛选
sortBy    排序字段（created_at / salary_max / salary_min）
page      页码（默认 1）
pageSize  每页数量（默认 20）
```

### 用户相关

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/users` | 获取用户列表（支持分页和搜索） |
| GET | `/api/users/:id` | 获取单个用户 |
| POST | `/api/users` | 创建用户 |
| PUT | `/api/users/:id` | 更新用户 |
| DELETE | `/api/users/:id` | 删除用户 |

### 订单相关

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/orders` | 创建订单（包含事务：检查库存→创建订单→扣减库存） |

### 系统

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/health` | 健康检查，返回数据库连接状态和连接池信息 |

---

## 🔧 数据库管理工具

| 工具 | 地址 | 账号 |
|---|---|---|
| pgAdmin（浏览器） | http://localhost:5050 | admin@admin.com / admin123 |
| DBeaver（桌面软件） | 连接 127.0.0.1:5433 | postgres / 你的密码 |
| Prisma Studio | `npx prisma studio` → http://localhost:5555 | 无需账号 |

---

## 📌 注意事项

> **端口说明**：本机已安装 PostgreSQL 占用了默认的 5432 端口，Docker 容器改用 **5433** 端口映射。所有连接配置请使用 5433。

> **密码说明**：数据库密码以容器内实际设置为准。如连接失败，执行以下命令重置密码：
> ```bash
> docker exec -it my-postgres psql -U postgres -c "ALTER USER postgres WITH PASSWORD '新密码';"
> ```

> **中文编码**：在 Windows 上创建包含中文的 JS/SQL 文件时，务必保存为 **UTF-8** 编码，推荐使用 VS Code 编辑文件。

---

## 📚 学习路径

```
阶段 1  Docker + PostgreSQL 环境搭建     ✅ 完成
阶段 2  PostgreSQL 基础语法和特性        ✅ 完成
阶段 3  Node.js 连接数据库 + API 开发    ✅ 完成
阶段 4  并发控制（锁、事务隔离）         ⬜ 进行中
阶段 5  备份与恢复（pg_dump、PITR）      ⬜ 待开始
```
