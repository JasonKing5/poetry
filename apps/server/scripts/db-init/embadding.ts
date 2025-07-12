import { PrismaClient } from '@prisma/client';
import { Dynasty } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

// 配置
const BATCH_SIZE = 50; // 每批处理的诗词数量
const MAX_RETRIES = 3; // 最大重试次数
const RETRY_DELAY = 2000; // 重试延迟(毫秒)

// 延迟函数
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 获取所有需要embedding的诗词总数
async function getPoemsCountForEmbedding() {
  return await prisma.poem.count({
    where: {
      isDeleted: false,
    },
  });
}

// 分页获取需要embedding的诗词
async function getPoemsForEmbeddingBatch(skip: number, take: number) {
  return await prisma.poem.findMany({
    select: {
      id: true,
      title: true,
      author: {
        select: {
          name: true,
        },
      },
      dynasty: true,
      content: true,
    },
    where: {
      isDeleted: false,
    },
    skip,
    take,
    orderBy: {
      id: 'asc',
    },
  });
}

async function embedPoems(poems: {id: number, title: string, author: {name: string} | null, dynasty: Dynasty, content: string[]}[]) {
  // const texts = poems.map(p => `${p.title ?? ''}${p.author?.name ?? ''}${p.dynasty ?? ''}`);
  const texts = poems.map(p => `${p.title ?? ''}${p.author?.name ?? ''}${p.dynasty ?? ''}${p.content.join('')}`);
  console.log('texts: ', texts.length, typeof texts[0], texts?.map(text => text?.slice(0, 10)), );

  const res  = await axios.post(`${process.env.EMBEDDING_SERVER_URL}/embed-batch`, { texts });
  const embeddings = res?.data?.embeddings || [];
  console.log('embeddings: ', embeddings.length, embeddings?.[0]?.length);

  return embeddings;
}

export const embedPoemsSeed = async function () {
  console.log('开始初始化诗词embedding服务...');
  
  try {
    console.log('开始获取需要处理的诗词总数...');
    
    // 获取需要处理的诗词总数
    const totalPoems = await getPoemsCountForEmbedding();
    console.log(`共找到 ${totalPoems} 首需要处理的诗词`);

    if (totalPoems === 0) {
      console.log('没有需要处理的诗词');
      return;
    }

    // 批量处理
    let successCount = 0;
    let failCount = 0;
    let processedCount = 0;
    
    while (processedCount < totalPoems) {
      // 获取当前批次数据
      const batchPoems = await getPoemsForEmbeddingBatch(processedCount, Math.min(BATCH_SIZE, totalPoems - processedCount));
      if (batchPoems.length === 0) break;
      
      const batchStart = processedCount + 1;
      const batchEnd = Math.min(processedCount + batchPoems.length, totalPoems);
      
      console.log(`\n=== 正在处理第 ${batchStart}-${batchEnd} 首 ===`);
      
      let retryCount = 0;
      let success = false;
      
      // 重试机制
      while (retryCount <= MAX_RETRIES && !success) {
        try {
          if (retryCount > 0) {
            console.log(`第 ${retryCount} 次重试...`);
            await delay(RETRY_DELAY * retryCount);
          }
          
          // 处理当前批次
          const embeddings = await embedPoems(batchPoems.map(p => ({
            id: p.id,
            title: p.title,
            dynasty: p.dynasty,
            content: p.content,
            author: p.author,
          })));
          success = true;
          successCount += batchPoems.length;

          // 更新处理状态
          for (let i = 0; i < batchPoems.length; i++) {
            const poem = batchPoems[i];
            const embedding = embeddings[i];
            
            // 使用参数化查询，确保数组正确传递
            await prisma.$executeRaw`
              UPDATE "Poem" 
              SET embedding = ${embedding}::float[]
              WHERE id = ${poem.id}
            `;
          }
          
          console.log(`✅ 第 ${batchStart}-${batchEnd} 首处理成功`);
          
        } catch (error) {
          retryCount++;
          
          if (retryCount > MAX_RETRIES) {
            console.error(`❌ 第 ${batchStart}-${batchEnd} 首处理失败，已达到最大重试次数:`, error);
            failCount += batchPoems.length;
          } else {
            console.warn(`⚠️  第 ${batchStart}-${batchEnd} 首处理失败，准备重试 (${retryCount}/${MAX_RETRIES}):`, error.message);
          }
        }
      }
      
      // 更新已处理数量
      processedCount += batchPoems.length;
      
      // 显示进度
      const progress = (processedCount / totalPoems * 100).toFixed(2);
      console.log(`进度: ${progress}% (${processedCount}/${totalPoems})`);
    }
    
    // 输出总结
    console.log('\n=== 处理完成 ===');
    console.log(`成功: ${successCount} 首`);
    console.log(`失败: ${failCount} 首`);
    
  } catch (error) {
    console.error('处理过程中出现未捕获的错误:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}
