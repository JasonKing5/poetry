#!/bin/bash

# 初始化DB时，还原默认用户等业务数据
# 所有默认用户角色为user
#
# 使用方法:
# 1. 确保PostgreSQL服务正在运行
# 2. 设置环境变量或修改下面的数据库连接参数
# 3. 执行: chmod +x default-user.sh && ./default-user.sh
#
# 环境变量:
# - DB_HOST: 数据库主机 (默认: localhost)
# - DB_PORT: 数据库端口 (默认: 5432)
# - DB_NAME: 数据库名称 (默认: poetry)
# - DB_USER: 数据库用户 (默认: postgres)
# - PGPASSWORD: 数据库密码

set -e  # 遇到错误立即退出

# 数据库连接参数 (可通过环境变量覆盖)
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-poetry}
DB_USER=${DB_USER:-postgres}

echo "🚀 开始还原默认用户数据..."
echo "📊 数据库连接信息:"
echo "   主机: $DB_HOST"
echo "   端口: $DB_PORT"
echo "   数据库: $DB_NAME"
echo "   用户: $DB_USER"
echo ""

# 检查psql命令是否可用
if ! command -v psql &> /dev/null; then
    echo "❌ 错误: 未找到psql命令，请确保PostgreSQL客户端已安装"
    exit 1
fi

# 测试数据库连接
echo "🔍 测试数据库连接..."
if ! psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" &> /dev/null; then
    echo "❌ 错误: 无法连接到数据库，请检查连接参数和PGPASSWORD环境变量"
    echo "💡 提示: export PGPASSWORD='your_password'"
    exit 1
fi

echo "✅ 数据库连接成功"
echo ""

# 执行SQL脚本
echo "📝 执行SQL脚本..."

psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" << 'EOF'

-- 开始事务
BEGIN;

-- 确保必需的角色存在
INSERT INTO "Role" (id, name, "createdAt", "updatedAt") VALUES
(1, 'admin', '2025-07-22 08:51:49.542', '2025-07-22 08:51:49.542'),
(2, 'user', '2025-07-22 08:51:49.549', '2025-07-22 08:51:49.549')
ON CONFLICT (id) DO NOTHING;

-- 插入默认用户数据 (保持原始ID、密码和时间戳)
INSERT INTO "User" (id, email, name, password, "isDeleted", "createdAt", "updatedAt") VALUES
(2, 'dxin_myw@qq.com', '帝心', '$2b$10$6c9b.16DlOEGwzFuLKVrZ.DhOTiTe3IcffPhN5jZBrOpQDsg8kmXC', false, '2025-07-24 01:08:33.072', '2025-07-24 01:08:33.072'),
(3, '13073764700@163.com', 'wdy', '$2b$10$9.TGDU/ae483ltWMnElnIOsvFG7dDGz97CofI34Wj0ZQvey56NAd6', false, '2025-07-24 02:05:58.353', '2025-07-24 02:05:58.353'),
(4, '494426553@qq.com', 'admin', '$2b$10$q7LfKivbqij.cF6DHSWB3eYD2T.lb6LmmzirG8sCmvkJGcU9QTLim', false, '2025-07-24 05:13:07.418', '2025-07-24 05:13:07.418'),
(1006, '1273063164@qq.com', 'bling88', '$2b$10$wTamKASlg2OGeQFF8ghHje5vXXY3jZDqSvYHCNrxPO44ZSVeNtSJ.', false, '2025-08-19 09:29:00.172', '2025-08-19 09:29:00.172'),
(1007, '3210588408@qq.com', 'QING', '$2b$10$uzGQYypiTyaF16qOjiSDA.ysGD61xrHpF44YpRw76SINxyoT8MJwm', false, '2026-01-05 07:22:17.484', '2026-01-05 07:22:17.484'),
(1008, '1753346018@qq.com', '白凝冰', '$2b$10$WfBR53sy8Z5vl25jdGKvg.ftmBSSS8s26UmZv4Veuvt/2tVvEDQHW', false, '2026-01-09 06:40:23.05', '2026-01-09 06:40:23.05'),
(1009, '2086727530@qq.com', 'sfh', '$2b$10$ReCEZorxmd9V0BPwaZQLHu2OxugbGcvx5hmn5aEzSaAmQhIG/x6Ma', false, '2026-01-09 06:50:31.924', '2026-01-09 06:50:31.924'),
(1010, '3430643103@qq.com', '白凝冰', '$2b$10$47eNRmssS/txFBkoGKt5UO2qO1kNeSSYEIJnzb1JbQ7my2ME57og2', false, '2026-01-09 06:54:04.09', '2026-01-09 06:54:04.09')
ON CONFLICT (email) DO NOTHING;

-- 插入用户角色关联数据 (保持原始ID和时间戳)
INSERT INTO "UserRole" (id, "userId", "roleId", "createdAt", "updatedAt") VALUES
(2, 2, 2, '2025-07-24 01:08:33.082', '2025-07-24 01:08:33.082'),
(4, 3, 2, '2025-07-24 02:05:58.362', '2025-07-24 02:05:58.362'),
(6, 4, 2, '2025-07-24 05:13:07.432', '2025-07-24 05:13:07.432'),
(2010, 1006, 2, '2025-08-19 09:29:00.509', '2025-08-19 09:29:00.509'),
(2012, 1007, 2, '2026-01-05 07:22:17.532', '2026-01-05 07:22:17.532'),
(2014, 1008, 2, '2026-01-09 06:40:23.055', '2026-01-09 06:40:23.055'),
(2016, 1009, 2, '2026-01-09 06:50:31.93', '2026-01-09 06:50:31.93'),
(2018, 1010, 2, '2026-01-09 06:54:04.095', '2026-01-09 06:54:04.095')
ON CONFLICT ("userId", "roleId") DO NOTHING;

-- 插入点赞数据 (需要确保诗词ID 646存在)
INSERT INTO "Like" (id, "userId", "targetType", "poemId", "createdAt")
SELECT 1, 1010, 'POEM', 646, '2026-01-09 06:56:45.67'
WHERE EXISTS (SELECT 1 FROM "Poem" WHERE id = 646)
ON CONFLICT (id) DO NOTHING;

-- 更新序列值以避免ID冲突
SELECT setval('"Role_id_seq"', (SELECT COALESCE(MAX(id), 1) FROM "Role"));
SELECT setval('"User_id_seq"', (SELECT COALESCE(MAX(id), 1) FROM "User"));
SELECT setval('"UserRole_id_seq"', (SELECT COALESCE(MAX(id), 1) FROM "UserRole"));
SELECT setval('"Like_id_seq"', (SELECT COALESCE(MAX(id), 1) FROM "Like"));

-- 提交事务
COMMIT;

-- 显示结果统计
\echo ''
\echo '📊 数据统计:'
SELECT 'Users' as table_name, COUNT(*) as count FROM "User"
UNION ALL
SELECT 'Roles' as table_name, COUNT(*) as count FROM "Role"
UNION ALL
SELECT 'UserRoles' as table_name, COUNT(*) as count FROM "UserRole"
UNION ALL
SELECT 'Likes' as table_name, COUNT(*) as count FROM "Like";

\echo ''
\echo '👥 用户列表:'
SELECT id, email, name, "createdAt" FROM "User" ORDER BY id;

EOF

# 检查SQL执行结果
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 默认用户数据还原完成！"
    echo ""
    echo "🔑 所有用户都保持原始密码哈希值"
    echo "👤 所有用户都分配了user角色"
    echo "❤️  如果诗词ID 646存在，已创建对应的点赞记录"
else
    echo ""
    echo "❌ 脚本执行失败，请检查错误信息"
    exit 1
fi
