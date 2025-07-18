FROM node:20-alpine AS production
WORKDIR /app

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 复制所有文件
COPY . .

# 安装依赖并构建
RUN pnpm install --frozen-lockfile
RUN pnpm -r --filter \"./packages/*\" build

# 只生成 Prisma 客户端，不执行迁移
RUN cd apps/server && pnpm run db:generate
RUN cd apps/server && pnpm run build

# 安装 pg_isready 工具
RUN apk add --no-cache postgresql-client

# 复制启动脚本并设置执行权限
COPY apps/server/start.sh /app/start.sh
RUN chmod +x /app/start.sh

# 生产模式命令
CMD ["/app/start.sh"]