import { PrismaClient, PoetryType, Dynasty } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { POETRY_AUTHOR_MAP } from '../db-init/constant';

const prisma = new PrismaClient();

function getDynastyFromFileName(fileName: string): Dynasty {
  const lowerFileName = fileName.toLowerCase();

  if (lowerFileName.includes('song')) {
    return Dynasty.song;
  } else if (lowerFileName.includes('tang')) {
    return Dynasty.tang;
  }
  return Dynasty.chunQiu;
}

function getDynastyFromPoetryType(type: string): Dynasty {
  if (type === PoetryType.shiJing) {
    return Dynasty.chunQiu;
  } else if (type === PoetryType.lunYu) {
    return Dynasty.chunQiu;
  } else if (type === PoetryType.chuCi) {
    return Dynasty.zhanGuo;
  } else if (type === PoetryType.songCi) {
    return Dynasty.song;
  } else if (type === PoetryType.tangShi) {
    return Dynasty.tang;
  } else if (type === PoetryType.yuanQu) {
    return Dynasty.yuan;
  }
  return Dynasty.chunQiu;
}

async function main() {
  console.log('Starting migration: Add dynasty to existing authors...');

  // 获取作者数据文件目录
  const authorDir = path.resolve(__dirname, '../../data/chinese-poetry-authors');
  const authorFiles = fs.readdirSync(authorDir).filter(f => f.endsWith('.json'));

  const poetryDir = path.resolve(__dirname, '../../data/chinese-poetry');
  const poetryFiles = fs.readdirSync(poetryDir).filter(f => f.endsWith('.json'));

  console.log(`Found ${authorFiles.length} author data files`);

  // 构建作者名到朝代的映射
  const getAuthorName = (type: string, poetry: any) => {
    let author = poetry.author;
    if (type === PoetryType.chuCi) {
      author = poetry.author;
    } else if (type === PoetryType.lunYu) {
      author = POETRY_AUTHOR_MAP.lunYu;
    } else if (type === PoetryType.shiJing) {
      author = POETRY_AUTHOR_MAP.noOne;
    } else if (type === PoetryType.songCi) {
      author = poetry.author;
    } else if (type === PoetryType.tangShi) {
      author = poetry.author;
    } else if (type === PoetryType.yuanQu) {
      author = poetry.author;
    }
    return author;
  }

  const authorDynasty: Record<string, Dynasty> = {};

  for (const file of authorFiles) {
    const filePath = path.join(authorDir, file);
    const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!Array.isArray(json)) continue;

    const fileDynasty = getDynastyFromFileName(file);

    for (const item of json) {
      if (item.name) {
        authorDynasty[item.name] = fileDynasty;
      }
    }
  }

  for (const file of poetryFiles) {
    const filePath = path.join(poetryDir, file);
    const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!Array.isArray(json)) continue;
    const fileType = path.basename(file, '.json');
    console.log('Start seed poetry: ', fileType);

    const poetryDynasty = getDynastyFromPoetryType(fileType);

    for (const item of json) {
      const authorName = getAuthorName(fileType, item);
      if (authorName && !authorDynasty[authorName]) {
        authorDynasty[authorName] = poetryDynasty;
      }
    }
  }

  console.log(`Built dynasty map for ${Object.keys(authorDynasty).length} authors from data files`);

  // 查询数据库中的所有作者
  const dbAuthors = await prisma.author.findMany({
    select: {
      id: true,
      name: true,
      dynasty: true,
    },
  });

  console.log(`Found ${dbAuthors.length} dbAuthors in database`);

  // 需要更新的作者列表
  const authorsToUpdate = dbAuthors.filter(author => {
    // 只更新没有朝代或者朝代为空/未设置的作者
    return !author.dynasty;
  });

  console.log(`Found ${authorsToUpdate.length} authors without dynasty`);

  let updatedCount = 0;
  let skippedCount = 0;

  // 更新每个作者的朝代
  for (const author of authorsToUpdate) {
    const dynasty = authorDynasty[author.name];

    if (dynasty) {
      await prisma.author.update({
        where: { id: author.id },
        data: { dynasty },
      });
      updatedCount++;
      console.log(`Updated author: ${author.name} -> ${dynasty}`);
    } else {
      console.log(`Skipped author: ${author.name} (no dynasty info)`);
      skippedCount++;
    }
  }

  console.log(`\nMigration completed:`);
  console.log(`- Updated: ${updatedCount} authors`);
  console.log(`- Skipped: ${skippedCount} authors (no dynasty info)`);
  console.log(`- Total processed: ${authorsToUpdate.length} authors`);
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

// 导出main函数以便直接调用
export { main };