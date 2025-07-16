# 开发阶段
FROM node:20-alpine AS development
WORKDIR /app

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 复制 package.json 和 pnpm-lock.yaml
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./
COPY .npmrc ./
COPY apps/server/package.json ./apps/server/package.json
COPY packages/ ./packages/

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 设置工作目录
WORKDIR /app/apps/server

# 开发模式命令
CMD ["pnpm", "run", "start:dev"]

# 生产阶段
FROM node:20-alpine AS production
WORKDIR /app

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 复制 package.json 和 pnpm-lock.yaml
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./
COPY .npmrc ./
COPY apps/server/package.json ./apps/server/package.json
COPY packages/ ./packages/

# 安装生产依赖
RUN pnpm install --prod --frozen-lockfile

# 复制构建产物
COPY --from=development /app/apps/server/dist ./dist

# 设置工作目录
WORKDIR /app/apps/server

# 生产模式命令
CMD ["node", "dist/main.js"]