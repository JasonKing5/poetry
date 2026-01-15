import { PrismaClient, PoetryType, Dynasty } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { POETRY_AUTHOR_MAP } from './constant';

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

export async function authorSeed(poetryDir: string, authorDir: string, authorFiles: string[], poetryFiles: string[], submitterId: number) {
  console.log('Start seed author');

  let NullNameId: number = 0;

  const lunYuAuthor = await prisma.author.findFirst({ where: { name: POETRY_AUTHOR_MAP[PoetryType.lunYu] } });
  if (!lunYuAuthor) {
    await prisma.author.create({ data: { name: POETRY_AUTHOR_MAP[PoetryType.lunYu], dynasty: Dynasty.chunQiu, submitterId } });
  }
  let nullNameAuthor = await prisma.author.findFirst({ where: { name: POETRY_AUTHOR_MAP.noOne } });
  if (!nullNameAuthor) {
    nullNameAuthor = await prisma.author.create({ data: { name: POETRY_AUTHOR_MAP.noOne, dynasty: Dynasty.chunQiu, submitterId } });
  }
  NullNameId = nullNameAuthor.id;

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

  const authorSet = new Set<string>();
  const authors: Record<string, { description: string; dynasty?: Dynasty }> = {};

  for (const file of authorFiles) {
    const filePath = path.join(authorDir, file);
    const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!Array.isArray(json)) continue;

    const fileDynasty = getDynastyFromFileName(file);

    for (const item of json) {
      if (item.name && item.description) {
        authors[item.name] = {
          description: item.description,
          dynasty: fileDynasty,
        };
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
      if (authorName) {
        authorSet.add(authorName);

        if (!authors[authorName]) {
          authors[authorName] = {
            description: '',
            dynasty: poetryDynasty,
          };
        }
        else if (!authors[authorName].dynasty) {
          authors[authorName].dynasty = poetryDynasty;
        }
      }
    }
  }
  const authorsToCreate = Array.from(authorSet).map(name => {
    const authorInfo = authors[name];
    return {
      name,
      description: authorInfo?.description || '',
      dynasty: authorInfo?.dynasty,
      submitterId,
    };
  });
  await prisma.author.createMany({
    data: authorsToCreate,
    skipDuplicates: true,
  });
  const inserted = authorsToCreate.length;
  console.log(`Author successfully seeded. Inserted: ${inserted}`);
  return NullNameId;
}