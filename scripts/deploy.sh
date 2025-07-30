#!/bin/bash

set -e  # 脚本遇到错误时中止

# 加载环境变量
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
else
    echo "⚠️  .env file not found, using default values"
fi

echo "➡️ Uploading build output..."

# local test
# rsync -avz --delete apps/web/.next/ ~/code/demo/poetry/apps/web/.next/

rsync -avz --delete apps/web/.next/ $DEPLOY_USER@$DEPLOY_HOST:$DEPLOY_PATH/apps/web/.next/

echo "✅ Upload completed. You can now restart PM2 or nginx if needed."