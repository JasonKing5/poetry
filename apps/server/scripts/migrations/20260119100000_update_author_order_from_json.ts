import { PrismaClient } from '@prisma/client';
import * as fs from 'node:fs';
import * as path from 'node:path';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting migration: Update author order from JSON file with order swapping...');

  // 1. 读取JSON文件
  const jsonFilePath = path.resolve(__dirname, '../../data/migration-data/author.json');
  console.log(`Reading author order data from: ${jsonFilePath}`);

  if (!fs.existsSync(jsonFilePath)) {
    throw new TypeError(`JSON file not found: ${jsonFilePath}`);
  }

  const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));

  if (!Array.isArray(jsonData)) {
    throw new TypeError('JSON data should be an array');
  }

  console.log(`Found ${jsonData.length} authors in JSON file`);

  // 2. 创建作者名称到目标order的映射
  const targetOrders = new Map<string, number>();
  const jsonAuthorNames = new Set<string>();

  for (let i = 0; i < jsonData.length; i++) {
    const authorData = jsonData[i];
    const authorName = authorData.name;
    const orderValue = i + 1; // 从1开始

    if (!authorName) {
      console.log(`Skipping item at index ${i}: missing name field`);
      continue;
    }

    targetOrders.set(authorName, orderValue);
    jsonAuthorNames.add(authorName);
  }

  console.log(`Processing ${targetOrders.size} authors with target orders`);

  // 3. 获取数据库中所有作者
  const allAuthors = await prisma.author.findMany({
    select: {
      id: true,
      name: true,
      order: true,
    },
    orderBy: [{ order: 'asc' }, { id: 'asc' }],
  });

  console.log(`Found ${allAuthors.length} authors in database`);

  // 4. 创建各种映射
  const authorByName = new Map<string, { id: number; name: string; order: number }>();
  const authorById = new Map<number, { id: number; name: string; order: number }>();
  const orderToAuthor = new Map<number, { id: number; name: string; order: number }>();

  for (const author of allAuthors) {
    authorByName.set(author.name, author);
    authorById.set(author.id, author);
    orderToAuthor.set(author.order, author);
  }

  // 5. 计算新的order分配
  const newOrders = new Map<number, number>(); // authorId -> newOrder

  // 首先处理JSON中的作者
  for (const [authorName, targetOrder] of targetOrders.entries()) {
    const author = authorByName.get(authorName);
    if (!author) {
      console.log(`Author not found in database: ${authorName}`);
      continue;
    }

    // 如果目标order已经被占用
    if (orderToAuthor.has(targetOrder) && orderToAuthor.get(targetOrder)!.id !== author.id) {
      const occupyingAuthor = orderToAuthor.get(targetOrder)!;
      const isOccupyingAuthorInJson = jsonAuthorNames.has(occupyingAuthor.name);

      if (isOccupyingAuthorInJson) {
        // 如果占用者也是JSON中的作者，进行交换
        console.log(`Order ${targetOrder} is occupied by JSON author ${occupyingAuthor.name}, swapping with ${authorName}`);

        // 记录交换
        newOrders.set(author.id, targetOrder);
        newOrders.set(occupyingAuthor.id, author.order);

        // 更新order映射
        orderToAuthor.set(targetOrder, author);
        orderToAuthor.set(author.order, occupyingAuthor);
      } else {
        // 如果占用者不是JSON中的作者，将其移到后面的位置
        console.log(`Order ${targetOrder} is occupied by non-JSON author ${occupyingAuthor.name}, moving to available order`);

        // 为JSON作者分配目标order
        newOrders.set(author.id, targetOrder);
        orderToAuthor.delete(author.order);
        orderToAuthor.set(targetOrder, author);

        // 被占用的作者将在第6步中重新分配
        // 这里先移除其原有order映射，后面会重新分配
        orderToAuthor.delete(occupyingAuthor.order);
      }
    } else {
      // 目标order空闲或已经是该作者
      newOrders.set(author.id, targetOrder);
      if (author.order !== targetOrder) {
        orderToAuthor.delete(author.order);
        orderToAuthor.set(targetOrder, author);
      }
    }
  }

  // 6. 处理其他作者（不在JSON中的）
  let nextAvailableOrder = jsonData.length + 1;
  for (const author of allAuthors) {
    if (newOrders.has(author.id)) {
      continue; // 已经处理过
    }

    // 查找可用的order
    while (orderToAuthor.has(nextAvailableOrder)) {
      nextAvailableOrder++;
    }

    if (author.order !== nextAvailableOrder) {
      newOrders.set(author.id, nextAvailableOrder);
      orderToAuthor.delete(author.order);
      orderToAuthor.set(nextAvailableOrder, author);
    }

    nextAvailableOrder++;
  }

  // 7. 执行更新（仅更新需要更改的）
  let updatedCount = 0;
  let skippedCount = 0;

  const updates: Array<{
    where: { id: number };
    data: { order: number };
  }> = [];
  for (const [authorId, newOrder] of newOrders.entries()) {
    const author = authorById.get(authorId)!;
    if (author.order !== newOrder) {
      updates.push({
        where: { id: authorId },
        data: { order: newOrder },
      });
      console.log(`Will update ${author.name}: order ${author.order} -> ${newOrder}`);
    } else {
      skippedCount++;
    }
  }

  // 批量更新
  if (updates.length > 0) {
    console.log(`\nExecuting ${updates.length} updates in transaction...`);
    await prisma.$transaction(
      updates.map(update => prisma.author.update(update))
    );
    updatedCount = updates.length;
  }

  // 8. 输出统计信息
  console.log('\n=== Migration Summary ===');
  console.log(`Total authors in JSON: ${jsonData.length}`);
  console.log(`Total authors in database: ${allAuthors.length}`);
  console.log(`Successfully updated: ${updatedCount}`);
  console.log(`Skipped (no change needed): ${skippedCount}`);
  console.log(`Not found in database: ${jsonData.length - targetOrders.size}`);
  console.log('Migration completed successfully!');
}

export async function run() {
  try {
    await main();
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 允许直接执行脚本
if (require.main === module) {
  (async () => {
    try {
      await run();
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  })();
}