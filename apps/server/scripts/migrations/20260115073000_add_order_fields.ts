import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting order fields initialization...');

  // 初始化Author表的order字段
  console.log('Initializing Author order fields...');
  const authors = await prisma.author.findMany({
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    select: { id: true },
  });

  for (let i = 0; i < authors.length; i++) {
    await prisma.author.update({
      where: { id: authors[i].id },
      data: { order: i + 1 }, // 从1开始
    });
  }
  console.log(`Updated ${authors.length} authors`);

  // 初始化Poem表的order字段
  console.log('Initializing Poem order fields...');
  const poems = await prisma.poem.findMany({
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    select: { id: true },
  });

  for (let i = 0; i < poems.length; i++) {
    await prisma.poem.update({
      where: { id: poems[i].id },
      data: { order: i + 1 }, // 从1开始
    });
  }
  console.log(`Updated ${poems.length} poems`);

  // 初始化Collection表的order字段
  console.log('Initializing Collection order fields...');
  const collections = await prisma.collection.findMany({
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    select: { id: true },
  });

  for (let i = 0; i < collections.length; i++) {
    await prisma.collection.update({
      where: { id: collections[i].id },
      data: { order: i + 1 }, // 从1开始
    });
  }
  console.log(`Updated ${collections.length} collections`);

  console.log('Order fields initialization completed successfully!');
}

export async function run() {
  try {
    await main();
  } catch (error) {
    console.error('Order initialization migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 允许直接执行脚本
if (require.main === module) {
  run().catch(console.error);
}