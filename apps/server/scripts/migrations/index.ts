import * as fs from 'node:fs';
import * as path from 'node:path';

async function runMigrations() {
  console.log('Starting data migrations...\n');

  const migrationsDir = __dirname;

  // 获取所有迁移脚本文件（排除index.ts）
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.ts') && file !== 'index.ts')
    .sort((a, b) => a.localeCompare(b)); // 按文件名排序以确保执行顺序

  console.log(`Found ${migrationFiles.length} migration scripts:`);
  migrationFiles.forEach(file => console.log(`  - ${file}`));

  for (const file of migrationFiles) {
    const filePath = path.join(migrationsDir, file);
    const migrationName = path.basename(file, '.ts');

    console.log(`\n=== Running migration: ${migrationName} ===`);

    try {
      // 动态导入迁移脚本
      // 注意：迁移脚本可能在导入时立即执行（如果有顶层调用）
      // 或者导出run/main函数需要手动调用
      const migration = await import(filePath);

      // 如果脚本导出了run函数，调用它
      if (typeof migration.run === 'function') {
        await migration.run();
        console.log(`✓ Migration ${migrationName} completed via run()`);
      }
      // 如果脚本导出了main函数，调用它
      else if (typeof migration.main === 'function') {
        await migration.main();
        console.log(`✓ Migration ${migrationName} completed via main()`);
      }
      // 如果脚本没有导出函数，但导入了就执行了（如add-dynasty-to-authors.ts）
      else {
        console.log(`✓ Migration ${migrationName} executed (self-running script)`);
      }

    } catch (error) {
      console.error(`✗ Migration ${migrationName} failed:`, error);
      console.error('Stopping migration process due to error.');
      process.exit(1);
    }
  }

  console.log('\n=== All data migrations completed successfully ===');
}

// 执行所有迁移
runMigrations()
  .catch(error => {
    console.error('Fatal error during migration process:', error);
    process.exit(1);
  });