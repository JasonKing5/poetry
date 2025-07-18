#!/bin/sh

# 等待数据库就绪
until pg_isready -h postgres -U postgres; do
  echo "Waiting for PostgreSQL..."
  sleep 1
done

# 运行数据库迁移
cd /app/apps/server && pnpm run db:push
cd /app/apps/server && pnpm run db:init

# 启动应用
exec node /app/apps/server/dist/src/main.js
