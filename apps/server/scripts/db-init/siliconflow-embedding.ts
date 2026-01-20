import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Dynasty } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

// 配置
const BATCH_SIZE = 32; // 每批处理的诗词数量（SiliconFlow API最大批次限制为32）
const MAX_RETRIES = 3; // 最大重试次数
const RETRY_DELAY = 2000; // 重试延迟(毫秒)

// 速率限制配置
const MAX_REQUESTS_PER_MINUTE = 2000; // SiliconFlow API每分钟请求限制
const MAX_TOKENS_PER_MINUTE = 500000; // SiliconFlow API每分钟token限制
const BATCH_DELAY_MS = 2000; // 批次间保守延迟（2秒）
const MIN_REQUEST_INTERVAL_MS = 30; // 请求间最小时间间隔（60000ms ÷ 2000）

// 速率限制状态跟踪
let totalTokensUsed = 0;
let requestCount = 0;
let rateLimitWindowStart = Date.now();

// 延迟函数
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 速率限制函数
async function enforceRateLimits(tokensUsed: number): Promise<void> {
  const now = Date.now();
  const windowElapsed = now - rateLimitWindowStart;

  // 如果仍在同一分钟窗口内
  if (windowElapsed < 60000) {
    // 检查请求限制
    if (requestCount >= MAX_REQUESTS_PER_MINUTE) {
      const waitTime = 60000 - windowElapsed;
      console.log(`⚠️  请求限制达到 (${requestCount}/${MAX_REQUESTS_PER_MINUTE}), 等待 ${waitTime}ms...`);
      await delay(waitTime);
      // 等待后重置计数器
      totalTokensUsed = tokensUsed;
      requestCount = 1;
      return;
    }

    // 检查token限制
    if (totalTokensUsed + tokensUsed > MAX_TOKENS_PER_MINUTE) {
      const waitTime = 60000 - windowElapsed;
      console.log(`⚠️  Token限制接近 (${totalTokensUsed + tokensUsed}/${MAX_TOKENS_PER_MINUTE}), 等待 ${waitTime}ms...`);
      await delay(waitTime);
      // 等待后重置计数器
      totalTokensUsed = tokensUsed;
      requestCount = 1;
      return;
    }

    // 批次间添加保守延迟
    if (BATCH_DELAY_MS > 0) {
      await delay(BATCH_DELAY_MS);
    }
  } else {
    // 新的分钟窗口，重置计数器
    totalTokensUsed = 0;
    requestCount = 0;
    rateLimitWindowStart = now;

    // 仍然添加保守延迟
    if (BATCH_DELAY_MS > 0) {
      await delay(BATCH_DELAY_MS);
    }
  }

  // 更新计数器
  totalTokensUsed += tokensUsed;
  requestCount++;
}

// 解析命令行参数
function parseArgs() {
  const args = process.argv.slice(2);
  const options: { limit?: number } = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--limit' && i + 1 < args.length) {
      const limit = parseInt(args[i + 1], 10);
      if (!isNaN(limit) && limit > 0) {
        options.limit = limit;
        i++; // 跳过下一个参数
      }
    }
  }

  return options;
}

// 获取需要embedding的诗词总数（考虑数量限制）
async function getPoemsCountForEmbedding(limit?: number) {
  const total = await prisma.poem.count({
    where: {
      isDeleted: false,
    },
  });

  // 如果有数量限制，返回实际总数和限制中的较小值
  return limit ? Math.min(total, limit) : total;
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

// 截断文本以确保不超过token限制（BAAI/bge-large-zh-v1.5模型支持512个token）
function truncateText(text: string, maxChars: number = 450): string {
  if (text.length <= maxChars) {
    return text;
  }
  const truncated = text.substring(0, maxChars);
  console.warn(`文本过长已截断: ${text.length}字符 -> ${maxChars}字符`);
  return truncated;
}

async function embedPoems(poems: {id: number, title: string, author: {name: string} | null, dynasty: Dynasty, content: string[]}[]): Promise<{embeddings: number[][], tokensUsed: number}> {
  // 构建输入文本：标题 + 作者 + 朝代 + 内容
  const texts = poems.map(p => {
    const fullText = `${p.title ?? ''}${p.author?.name ?? ''}${p.dynasty ?? ''}${p.content.join('')}`;
    return truncateText(fullText, 450);
  });

  console.log(`准备向SiliconFlow API发送 ${texts.length} 个文本进行嵌入`);
  // 显示第一个文本的长度作为参考
  if (texts.length > 0) {
    console.log(`第一个文本长度: ${texts[0].length}字符 (共 ${texts.length} 个文本)`);
  }

  const apiKey = process.env.SILICONFLOW_API_KEY;
  const baseUrl = process.env.SILICONFLOW_API_URL || 'https://api.siliconflow.cn/v1';

  if (!apiKey) {
    throw new Error('SILICONFLOW_API_KEY 环境变量未设置');
  }

  try {
    const response = await axios.post(
      `${baseUrl}/embeddings`,
      {
        model: 'BAAI/bge-large-zh-v1.5',
        input: texts,
        encoding_format: 'float'
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30秒超时
      }
    );

    // 检查响应格式
    if (!response.data || !Array.isArray(response.data.data)) {
      throw new Error(`API响应格式无效: ${JSON.stringify(response.data)}`);
    }

    // 提取嵌入向量
    const embeddings = response.data.data.map((item: any) => {
      if (!item.embedding || !Array.isArray(item.embedding)) {
        throw new Error(`嵌入向量格式无效: ${JSON.stringify(item)}`);
      }
      return item.embedding;
    });

    console.log(`成功获取 ${embeddings.length} 个嵌入向量，维度: ${embeddings[0]?.length || '未知'}`);

    // 记录并存储使用情况
    const tokensUsed = response.data.usage?.prompt_tokens || 0;
    if (response.data.usage) {
      console.log(`Token使用情况: 提示token=${tokensUsed}, 总token=${response.data.usage.total_tokens}`);
    }

    return { embeddings, tokensUsed };
  } catch (error: any) {
    if (error.response) {
      // 请求已发送，服务器响应状态码超出2xx范围
      console.error(`API错误响应: ${error.response.status}`, error.response.data);
      throw new Error(`SiliconFlow API错误: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      // 请求已发送但未收到响应
      console.error('未收到API响应', error.message);
      throw new Error('无法连接到SiliconFlow API: ' + error.message);
    } else {
      // 设置请求时发生错误
      console.error('请求配置错误', error.message);
      throw error;
    }
  }
}

async function main() {
  console.log('开始使用SiliconFlow API进行诗词嵌入...');

  const options = parseArgs();
  if (options.limit) {
    console.log(`运行选项: 限制处理 ${options.limit} 首诗词`);
  } else {
    console.log('运行选项: 处理所有诗词');
  }

  try {
    console.log('开始获取需要处理的诗词总数...');

    // 获取需要处理的诗词总数（考虑数量限制）
    const totalPoems = await getPoemsCountForEmbedding(options.limit);
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
      const batchSize = Math.min(BATCH_SIZE, totalPoems - processedCount);
      const batchPoems = await getPoemsForEmbeddingBatch(processedCount, batchSize);
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
          const result = await embedPoems(batchPoems.map(p => ({
            id: p.id,
            title: p.title,
            dynasty: p.dynasty,
            content: p.content,
            author: p.author,
          })));

          const embeddings = result.embeddings;
          const tokensUsed = result.tokensUsed;

          success = true;
          successCount += batchPoems.length;

          // 强制执行速率限制
          await enforceRateLimits(tokensUsed);

          // 检查向量维度
          const targetDimension = 1024;
          const firstEmbeddingDim = embeddings[0]?.length;
          if (firstEmbeddingDim && firstEmbeddingDim !== targetDimension) {
            if (firstEmbeddingDim > targetDimension) {
              console.warn(`警告：向量维度 ${firstEmbeddingDim} > 数据库schema维度 ${targetDimension}，将截断到 ${targetDimension} 维`);
            } else {
              console.warn(`警告：向量维度 ${firstEmbeddingDim} < 数据库schema维度 ${targetDimension}，将填充到 ${targetDimension} 维`);
            }
          }

          // 更新处理状态
          for (let i = 0; i < batchPoems.length; i++) {
            const poem = batchPoems[i];
            let embedding = embeddings[i];

            // 检查并调整向量维度以匹配数据库schema (1024维)
            if (embedding.length !== targetDimension) {
              if (embedding.length > targetDimension) {
                embedding = embedding.slice(0, targetDimension);
              } else if (embedding.length < targetDimension) {
                const padded = new Array(targetDimension).fill(0);
                embedding.forEach((val: number, idx: number) => padded[idx] = val);
                embedding = padded;
              }
            }

            // 使用参数化查询，确保数组正确传递
            await prisma.$executeRaw`
              UPDATE "Poem"
              SET embedding = ${embedding}::float[]
              WHERE id = ${poem.id}
            `;
          }

          console.log(`✅ 第 ${batchStart}-${batchEnd} 首处理成功`);

        } catch (error: any) {
          retryCount++;

          // 检查速率限制错误
          if (error.response?.status === 429) {
            console.warn(`⚠️  速率限制超出，增加延迟...`);
            // 速率限制的指数退避
            const backoffDelay = Math.min(RETRY_DELAY * Math.pow(2, retryCount), 60000);
            console.log(`等待 ${backoffDelay}ms 后重试...`);
            await delay(backoffDelay);
            continue; // 继续重试循环
          }

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

// 执行主函数
main();