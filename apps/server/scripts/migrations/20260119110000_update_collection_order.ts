import { PrismaClient } from '@prisma/client';
import * as fs from 'node:fs';
import * as path from 'node:path';

const prisma = new PrismaClient();

// 提取年级数字和册次信息
interface GradeCollectionInfo {
  id: number;
  title: string;
  currentOrder: number;
  poemCount: number;
  gradeNumber: number; // 年级数字，如1, 2, 3
  volume: string; // 册次：上、下、全等
  volumeOrder: number; // 册次排序值：上=1，下=2，全=3，其他=4
}

// 中文数字到阿拉伯数字的映射
const chineseNumberMap: { [key: string]: number } = {
  '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10,
  '十一': 11, '十二': 12, '十三': 13, '十四': 14, '十五': 15, '十六': 16, '十七': 17, '十八': 18, '十九': 19, '二十': 20
};

// 检查是否为年级集合并提取信息
function parseGradeCollection(title: string): { gradeNumber: number; volume: string; volumeOrder: number } | null {
  // 多种匹配模式：
  // 1. 阿拉伯数字+年级+册次，例如：一年级上册、三年级下册、五年级全一册
  // 2. 中文数字+年级+册次，例如：一年级上册、三年级下册
  // 3. 可能没有"册"字，例如：一年级上、三年级下

  // 模式1：阿拉伯数字
  const arabicPattern = /(\d+)\s*年级\s*([\u4e00-\u9fa5]*)(?:册)?/;
  // 模式2：中文数字
  const chinesePattern = /([\u4e00-\u9fa5]+)\s*年级\s*([\u4e00-\u9fa5]*)(?:册)?/;

  let match = title.match(arabicPattern);
  let gradeNumber: number | null = null;
  let volume = '';

  if (match) {
    gradeNumber = parseInt(match[1], 10);
    volume = match[2] || '';
  } else {
    match = title.match(chinesePattern);
    if (match) {
      const chineseNum = match[1];
      gradeNumber = chineseNumberMap[chineseNum] || null;
      volume = match[2] || '';
    }
  }

  if (!gradeNumber || gradeNumber < 1 || gradeNumber > 12) {
    return null; // 不是有效的年级（1-12）
  }

  // 确定册次排序
  let volumeOrder = 4; // 默认
  if (volume.includes('上') || volume.includes('第一') || volume.includes('上卷')) {
    volumeOrder = 1;
  } else if (volume.includes('下') || volume.includes('第二') || volume.includes('下卷')) {
    volumeOrder = 2;
  } else if (volume.includes('全') || volume.includes('完整') || volume.includes('全一册')) {
    volumeOrder = 3;
  } else if (volume === '') {
    volumeOrder = 0; // 没有册次信息，放在最前
  }

  return { gradeNumber, volume, volumeOrder };
}

async function main() {
  console.log('Starting migration: Update collection order with priority rules...');

  // 1. 获取所有collection及其诗词数量
  console.log('Fetching all collections with poem counts...');
  const collections = await prisma.collection.findMany({
    where: {
      isDeleted: false,
    },
    select: {
      id: true,
      title: true,
      order: true,
      _count: {
        select: {
          collectionPoems: true,
        },
      },
    },
    orderBy: [{ order: 'asc' }, { id: 'asc' }],
  });

  console.log(`Found ${collections.length} collections in database`);

  // 2. 分类处理
  const gradeCollections: GradeCollectionInfo[] = [];
  const otherCollections: Array<{
    id: number;
    title: string;
    currentOrder: number;
    poemCount: number;
  }> = [];

  for (const collection of collections) {
    const poemCount = collection._count.collectionPoems;
    const collectionInfo = {
      id: collection.id,
      title: collection.title,
      currentOrder: collection.order,
      poemCount,
    };

    const gradeInfo = parseGradeCollection(collection.title);
    if (gradeInfo) {
      gradeCollections.push({
        ...collectionInfo,
        gradeNumber: gradeInfo.gradeNumber,
        volume: gradeInfo.volume,
        volumeOrder: gradeInfo.volumeOrder,
      });
    } else {
      otherCollections.push(collectionInfo);
    }
  }

  console.log(`Found ${gradeCollections.length} grade-related collections`);
  console.log(`Found ${otherCollections.length} other collections`);

  // 3. 排序年级集合
  // 先按年级数字升序，再按册次排序，最后按原order排序
  gradeCollections.sort((a, b) => {
    if (a.gradeNumber !== b.gradeNumber) {
      return a.gradeNumber - b.gradeNumber;
    }
    if (a.volumeOrder !== b.volumeOrder) {
      return a.volumeOrder - b.volumeOrder;
    }
    // 册次相同，按册次名称的自然顺序（上、下、全）
    const volumeOrderMap: { [key: string]: number } = { '上': 1, '下': 2, '全': 3 };
    const aVolOrder = volumeOrderMap[a.volume] || 4;
    const bVolOrder = volumeOrderMap[b.volume] || 4;
    if (aVolOrder !== bVolOrder) {
      return aVolOrder - bVolOrder;
    }
    return a.currentOrder - b.currentOrder;
  });

  // 4. 排序其他集合（按诗词数量降序）
  otherCollections.sort((a, b) => {
    // 优先诗词数量多的
    if (b.poemCount !== a.poemCount) {
      return b.poemCount - a.poemCount;
    }
    // 其次按原order排序
    return a.currentOrder - b.currentOrder;
  });

  // 5. 分配新的order值
  const updates: Array<{
    where: { id: number };
    data: { order: number };
  }> = [];

  let currentOrder = 1;

  // 5.1 年级集合在前
  console.log('\nGrade collections order:');
  for (const collection of gradeCollections) {
    if (collection.currentOrder !== currentOrder) {
      updates.push({
        where: { id: collection.id },
        data: { order: currentOrder },
      });
    }
    console.log(`  ${collection.title} (grade ${collection.gradeNumber}, ${collection.volume}) -> order ${currentOrder}`);
    currentOrder++;
  }

  // 5.2 诗词数量多的集合在中间
  console.log('\nTop collections by poem count:');
  const topCollections = otherCollections.slice(0, Math.min(20, otherCollections.length)); // 取前20个或全部

  for (const collection of topCollections) {
    if (collection.currentOrder !== currentOrder) {
      updates.push({
        where: { id: collection.id },
        data: { order: currentOrder },
      });
    }
    console.log(`  ${collection.title} (${collection.poemCount} poems) -> order ${currentOrder}`);
    currentOrder++;
  }

  // 5.3 剩余集合在后面
  const remainingCollections = otherCollections.slice(topCollections.length);
  console.log(`\nRemaining ${remainingCollections.length} collections:`);

  for (const collection of remainingCollections) {
    if (collection.currentOrder !== currentOrder) {
      updates.push({
        where: { id: collection.id },
        data: { order: currentOrder },
      });
    }
    currentOrder++;
  }

  // 6. 执行更新
  if (updates.length > 0) {
    console.log(`\nExecuting ${updates.length} order updates in transaction...`);
    await prisma.$transaction(
      updates.map(update => prisma.collection.update(update))
    );
    console.log(`Successfully updated ${updates.length} collections`);
  } else {
    console.log('No order changes needed');
  }

  // 7. 输出统计信息
  console.log('\n=== Migration Summary ===');
  console.log(`Total collections processed: ${collections.length}`);
  console.log(`Grade collections: ${gradeCollections.length}`);
  console.log(`Top collections by poem count: ${topCollections.length}`);
  console.log(`Remaining collections: ${remainingCollections.length}`);
  console.log(`Collections updated: ${updates.length}`);
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