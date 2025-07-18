# 生产阶段
FROM node:20-alpine AS production
WORKDIR /app

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 复制所有文件
COPY . .

# 安装生产依赖
RUN pnpm install --frozen-lockfile
RUN pnpm -r --filter \"./packages/*\" build

RUN cd apps/server && pnpm run db:generate
RUN cd apps/web && pnpm run build

RUN cp -r apps/web/.next/static apps/web/.next/standalone/apps/web/.next/static
RUN cp -r apps/web/public apps/web/.next/standalone/apps/web/public

# 生产模式命令
CMD ["node", "apps/web/.next/standalone/apps/web/server.js"]
