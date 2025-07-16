# 开发阶段
FROM node:20-alpine AS development
WORKDIR /app

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 复制 package.json 和 pnpm-lock.yaml
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./
COPY .npmrc ./
COPY apps/web/package.json ./apps/web/package.json
COPY packages/ ./packages/

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 设置工作目录
WORKDIR /app/apps/web

# 开发模式命令
CMD ["pnpm", "dev"]

# 生产阶段
FROM node:20-alpine AS builder
WORKDIR /app

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 复制 package.json 和 pnpm-lock.yaml
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./
COPY .npmrc ./
COPY apps/web/package.json ./apps/web/package.json
COPY packages/ ./packages/

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建应用
WORKDIR /app/apps/web
RUN pnpm build

# 生产阶段
FROM node:20-alpine AS production
WORKDIR /app

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 复制 package.json 和 pnpm-lock.yaml
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./
COPY .npmrc ./
COPY apps/web/package.json ./apps/web/package.json

# 安装生产依赖
RUN pnpm install --prod --frozen-lockfile

# 复制构建产物
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static

# 设置工作目录
WORKDIR /app

# 生产模式命令
CMD ["node", "apps/web/server.js"]