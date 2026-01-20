import { PrismaClient } from '@prisma/client';
import * as fs from 'node:fs';
import * as path from 'node:path';

const prisma = new PrismaClient();

interface TopPoemData {
  title: string;
  author: string;
}

// 从数据库中获取补充诗词
async function getSupplementalPoems(count: number): Promise<TopPoemData[]> {
  console.log(`Fetching ${count} supplemental poems from database...`);

  // 首先尝试获取有"唐诗三百首"标签的诗词
  const poemsWithTags = await prisma.poem.findMany({
    where: {
      isDeleted: false,
      collectionPoems: {
        some: {
          collection: {
            title: {
              in: ['唐诗三百首', '宋词三百首', '经典', '名篇'],
            },
          },
        },
      },
    },
    select: {
      id: true,
      title: true,
      author: {
        select: {
          name: true,
        },
      },
    },
    take: count,
    orderBy: [{ order: 'asc' }, { id: 'asc' }],
  });

  // 如果不够，再获取其他诗词
  let supplementalPoems: TopPoemData[] = poemsWithTags.map(poem => ({
    title: poem.title,
    author: poem.author?.name || '未知',
  }));

  if (supplementalPoems.length < count) {
    const remaining = count - supplementalPoems.length;
    console.log(`Need ${remaining} more poems, fetching random poems...`);

    const additionalPoems = await prisma.poem.findMany({
      where: {
        isDeleted: false,
        id: {
          notIn: poemsWithTags.map(p => p.id),
        },
      },
      select: {
        id: true,
        title: true,
        author: {
          select: {
            name: true,
          },
        },
      },
      take: remaining,
      orderBy: [{ order: 'asc' }, { id: 'asc' }],
    });

    supplementalPoems = [
      ...supplementalPoems,
      ...additionalPoems.map(poem => ({
        title: poem.title,
        author: poem.author?.name || '未知',
      })),
    ];
  }

  return supplementalPoems;
}

async function main() {
  console.log('Starting migration: Update poem order for top 250 recommended poems...');

  // 1. 读取top250诗词JSON文件
  const jsonFilePath = path.resolve(__dirname, '../../data/migration-data/top250_poems.json');
  console.log(`Reading top 250 poems data from: ${jsonFilePath}`);

  if (!fs.existsSync(jsonFilePath)) {
    throw new TypeError(`JSON file not found: ${jsonFilePath}`);
  }

  const jsonData: TopPoemData[] = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));

  if (!Array.isArray(jsonData)) {
    throw new TypeError('JSON data should be an array');
  }

  console.log(`Found ${jsonData.length} recommended poems in JSON file`);

  // 确保有250首诗词
  let finalPoemList = [...jsonData];

  if (finalPoemList.length < 250) {
    console.warn(`Warning: Only ${finalPoemList.length} poems found in JSON, expected 250`);
    console.log('Will supplement with poems from database...');

    // 从数据库中获取补充诗词（优先选择有"唐诗三百首"标签的）
    const supplementalPoems = await getSupplementalPoems(250 - finalPoemList.length);
    finalPoemList = [...finalPoemList, ...supplementalPoems];

    console.log(`Added ${supplementalPoems.length} supplemental poems`);
  } else if (finalPoemList.length > 250) {
    console.warn(`Warning: ${finalPoemList.length} poems found, using first 250`);
    finalPoemList.length = 250; // 只取前250首
  }

  // 2. 获取数据库中所有诗词
  console.log('Fetching all poems from database...');
  const allPoems = await prisma.poem.findMany({
    where: {
      isDeleted: false,
    },
    select: {
      id: true,
      title: true,
      order: true,
      author: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: [{ order: 'asc' }, { id: 'asc' }],
  });

  console.log(`Found ${allPoems.length} poems in database`);

  // 3. 创建各种映射
  const poemById = new Map<number, typeof allPoems[0]>();
  const poemByTitleAndAuthor = new Map<string, typeof allPoems[0]>();
  const orderToPoem = new Map<number, typeof allPoems[0]>();

  for (const poem of allPoems) {
    poemById.set(poem.id, poem);
    const key = `${poem.title}|${poem.author?.name || ''}`;
    poemByTitleAndAuthor.set(key, poem);
    orderToPoem.set(poem.order, poem);
  }

  // 4. 匹配JSON中的诗词
  const matchedPoems: Array<{
    poem: typeof allPoems[0];
    targetOrder: number;
    jsonIndex: number;
  }> = [];
  const notFoundPoems: TopPoemData[] = [];

  for (let i = 0; i < finalPoemList.length; i++) {
    const poemData = finalPoemList[i];
    const key = `${poemData.title}|${poemData.author}`;
    const poem = poemByTitleAndAuthor.get(key);

    if (poem) {
      matchedPoems.push({
        poem,
        targetOrder: i + 1, // 从1开始
        jsonIndex: i,
      });
    } else {
      notFoundPoems.push(poemData);
    }
  }

  console.log(`\nMatched ${matchedPoems.length} poems from JSON`);
  console.log(`Not found in database: ${notFoundPoems.length}`);

  if (notFoundPoems.length > 0) {
    console.log('\nNot found poems (first 10):');
    notFoundPoems.slice(0, 10).forEach((poem, idx) => {
      console.log(`  ${idx + 1}. ${poem.title} - ${poem.author}`);
    });
    if (notFoundPoems.length > 10) {
      console.log(`  ... and ${notFoundPoems.length - 10} more`);
    }
  }

  // 5. 计算新的order分配
  const newOrders = new Map<number, number>(); // poemId -> newOrder
  const processedPoemIds = new Set<number>();

  // 5.1 首先处理匹配的top250诗词
  console.log('\nProcessing top 250 poems order assignment:');
  for (const { poem, targetOrder } of matchedPoems) {
    // 如果目标order已经被占用
    if (orderToPoem.has(targetOrder) && orderToPoem.get(targetOrder)!.id !== poem.id) {
      const occupyingPoem = orderToPoem.get(targetOrder)!;

      // 如果占用者也是top250诗词，进行交换
      const isOccupyingInTop250 = matchedPoems.some(mp => mp.poem.id === occupyingPoem.id);

      if (isOccupyingInTop250) {
        // 找到占用者在top250中的目标order
        const occupyingMatch = matchedPoems.find(mp => mp.poem.id === occupyingPoem.id);
        if (occupyingMatch) {
          console.log(`Order ${targetOrder} is occupied by top250 poem ${occupyingPoem.title}, swapping with ${poem.title}`);

          // 记录交换
          newOrders.set(poem.id, targetOrder);
          newOrders.set(occupyingPoem.id, occupyingMatch.targetOrder);

          // 更新order映射
          orderToPoem.set(targetOrder, poem);
          orderToPoem.set(occupyingMatch.targetOrder, occupyingPoem);

          processedPoemIds.add(poem.id);
          processedPoemIds.add(occupyingPoem.id);
        }
      } else {
        // 占用者不是top250诗词，将其移到后面的位置
        console.log(`Order ${targetOrder} is occupied by non-top250 poem ${occupyingPoem.title}, moving to available order`);

        // 为top250诗词分配目标order
        newOrders.set(poem.id, targetOrder);
        orderToPoem.delete(poem.order);
        orderToPoem.set(targetOrder, poem);

        // 被占用的诗词将在第5.2步中重新分配
        // 这里先移除其原有order映射，后面会重新分配
        orderToPoem.delete(occupyingPoem.order);

        processedPoemIds.add(poem.id);
      }
    } else {
      // 目标order空闲或已经是该诗词
      if (poem.order !== targetOrder) {
        newOrders.set(poem.id, targetOrder);
        orderToPoem.delete(poem.order);
        orderToPoem.set(targetOrder, poem);
        processedPoemIds.add(poem.id);
      }
    }
  }

  // 5.2 处理其他诗词（不在top250中的）
  console.log('\nProcessing remaining poems...');
  let nextAvailableOrder = jsonData.length + 1; // 从251开始

  for (const poem of allPoems) {
    if (processedPoemIds.has(poem.id)) {
      continue; // 已经处理过
    }

    // 查找可用的order
    while (orderToPoem.has(nextAvailableOrder)) {
      nextAvailableOrder++;
    }

    if (poem.order !== nextAvailableOrder) {
      newOrders.set(poem.id, nextAvailableOrder);
      orderToPoem.delete(poem.order);
      orderToPoem.set(nextAvailableOrder, poem);
    }

    nextAvailableOrder++;
  }

  // 6. 执行更新（仅更新需要更改的）
  const updates: Array<{
    where: { id: number };
    data: { order: number };
  }> = [];
  let updatedCount = 0;
  let skippedCount = 0;

  for (const [poemId, newOrder] of newOrders.entries()) {
    const poem = poemById.get(poemId)!;
    if (poem.order !== newOrder) {
      updates.push({
        where: { id: poemId },
        data: { order: newOrder },
      });
      console.log(`Will update ${poem.title} (${poem.author?.name}): order ${poem.order} -> ${newOrder}`);
      updatedCount++;
    } else {
      skippedCount++;
    }
  }

  // 批量更新
  if (updates.length > 0) {
    console.log(`\nExecuting ${updates.length} updates in transaction...`);
    await prisma.$transaction(
      updates.map(update => prisma.poem.update(update))
    );
    console.log(`Successfully updated ${updates.length} poems`);
  } else {
    console.log('No order changes needed');
  }

  // 7. 输出统计信息
  console.log('\n=== Migration Summary ===');
  console.log(`Total poems in JSON: ${jsonData.length}`);
  console.log(`Total poems in database: ${allPoems.length}`);
  console.log(`Matched poems: ${matchedPoems.length}`);
  console.log(`Not found poems: ${notFoundPoems.length}`);
  console.log(`Poems updated: ${updatedCount}`);
  console.log(`Poems skipped (no change needed): ${skippedCount}`);

  // 显示top250诗词的最终order
  console.log('\nTop 250 poems final order (first 20):');
  const top250Final = matchedPoems
    .map(mp => ({
      title: mp.poem.title,
      author: mp.poem.author?.name || 'Unknown',
      oldOrder: mp.poem.order,
      newOrder: newOrders.get(mp.poem.id) || mp.poem.order,
    }))
    .sort((a, b) => a.newOrder - b.newOrder)
    .slice(0, 20);

  top250Final.forEach((poem, idx) => {
    console.log(`  ${poem.newOrder}. ${poem.title} - ${poem.author} (was ${poem.oldOrder})`);
  });

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