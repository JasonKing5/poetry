
## 👉 项目初始化脚本说明：项目名 ifs，开启 Docker，使用 TurboRepo 架构，包含：
- apps/web: Next.js + Tailwind + React Query + Axios + react-hook-form + Zod
- apps/docs: 文档站（可选）
- packages/ui: 可共享的 UI 组件包
- Docker 支持一键启动

## Step 1: 初始化 TurboRepo 项目结构（更正）
pnpm dlx create-turbo@latest ifs
cd ifs

## ✅ 脚手架会自动生成以下内容：
- apps/web: Next.js + Tailwind 项目
- apps/docs: 文档站（可选）
- packages/ui: 可共享的 UI 组件包
- turbo.json: 包含默认任务配置（build, lint, check-types, dev 等）

## Step 2: 创建 NestJS 服务（更正为官方推荐方式）
pnpm add -g @nestjs/cli
nest new apps/server

## ✅ 注意：将生成的 Nest 项目路径设为 apps/server，以符合 monorepo 结构

## Step 3: 安装前端依赖（Web）
cd apps/web
pnpm add axios @tanstack/react-query react-hook-form zod

## Step 4: 安装后端依赖（Server）
cd ../../apps/server
pnpm add @nestjs/config @nestjs/jwt @nestjs/passport passport passport-jwt prisma @prisma/client
pnpm add -D prisma

## Step 5: 初始化 Prisma 配置
npx prisma init

## Step 6: 初始化 Docker 支持
cd ../..
touch docker-compose.yml
```
version: '3.8'
services:
  db:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: ifs_db
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  server:
    build:
      context: ./apps/server
    ports:
      - "3001:3000"
    depends_on:
      - db
    environment:
      DATABASE_URL: postgres://postgres:postgres@db:5432/ifs_db
    volumes:
      - ./apps/server:/app

  web:
    build:
      context: ./apps/web
    ports:
      - "3000:3000"
    volumes:
      - ./apps/web:/app

volumes:
  pgdata:
```

## ✅ 项目 scaffold 完成，可执行操作：
- 运行 `pnpm install` 确保所有依赖安装
- 使用 `pnpm dev` 启动 Web 服务（可配合 concurrently 一起运行 Server）
- 使用 `docker-compose up` 一键启动 PostgreSQL + Server + Web

## 🔧 后续建议：
- 配置 Prisma schema 与数据库模型
- 实现用户注册 / 登录 / 鉴权模块
- 配置 RBAC 权限模块
- 封装 API 请求并实现前端登录页面

## 📁 项目目录结构说明
### WEB
├── apps/
│   └── web/
│       ├── app/                    # Next.js 13+ App Router
│       │   ├── layout.tsx         # 应用根布局
│       │   ├── page.tsx           # 首页
│       │   └── (auth)/            # 登录/注册页面分组
│       │       ├── login/page.tsx
│       │       └── register/page.tsx
│       ├── components/
│       │   ├── layout/            # Layout 组件
│       │   ├── ui/                # 通用 UI 封装 (Button, Input...)
│       │   └── form/              # 封装 react-hook-form + Zod 表单控件
│       ├── hooks/
│       │   ├── useAuth.ts         # 获取当前用户 useAuth()
│       │   ├── useHasPermission.ts# 权限判断 hook
│       │   └── useZustandStore.ts # Zustand 状态管理封装
│       ├── lib/
│       │   ├── api.ts             # axios 实例封装
│       │   ├── request.ts         # React Query 用法封装
│       │   └── texts.ts           # 文案集中管理 TEXTS.xxx
│       ├── services/
│       │   └── auth.service.ts    # 登录注册请求封装
│       ├── store/
│       │   └── user.ts            # Zustand 用户状态管理
│       ├── types/
│       │   └── index.ts           # 全局类型定义
│       ├── middlewares/
│       │   └── route-guard.ts     # 页面路由守卫（如登录校验）
│       ├── locales/               # 文案/国际化预备（结构保留）
│       │   └── en.json
│       ├── styles/
│       │   └── globals.css        # 全局样式
│       └── utils/
│           └── helpers.ts         # 工具函数
├── packages/
│   └── common/                    # 公共包：类型、常量、枚举、工具函数
│       ├── src/
│       │   ├── enums/
│       │   │   ├── poetry.ts      # POETRY_TYPE_MAP 等
│       │   │   └── status.ts
│       │   ├── types/
│       │   │   └── user.ts        # 公共用户类型等
│       │   ├── constants/
│       │   │   └── texts.ts       # TEXTS 定义
│       │   └── index.ts           # 统一导出
│       ├── tsconfig.json
│       └── package.json