import { PrismaClient, PoetryType } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { POETRY_AUTHOR_MAP } from './constant';

const prisma = new PrismaClient();

export async function authorSeed(poetryDir: string, authorDir: string, authorFiles: string[], poetryFiles: string[], submitterId: number) {
  console.log('Start seed author');

  let NullNameId: number = 0;

  const lunYuAuthor = await prisma.author.findFirst({ where: { name: POETRY_AUTHOR_MAP[PoetryType.lunYu] } });
  if (!lunYuAuthor) {
    await prisma.author.create({ data: { name: POETRY_AUTHOR_MAP[PoetryType.lunYu], submitterId } });
  }
  let nullNameAuthor = await prisma.author.findFirst({ where: { name: POETRY_AUTHOR_MAP.noOne } });
  if (!nullNameAuthor) {
    nullNameAuthor = await prisma.author.create({ data: { name: POETRY_AUTHOR_MAP.noOne, submitterId } });
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
  const authors: Record<string, string> = {};

  for (const file of authorFiles) {
    const filePath = path.join(authorDir, file);
    const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!Array.isArray(json)) continue;
    for (const item of json) {
      if (item.name && item.description) {
        authors[item.name] = item.description;
      }
    }
  }

  for (const file of poetryFiles) {
    const filePath = path.join(poetryDir, file);
    const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!Array.isArray(json)) continue;
    const fileType = path.basename(file, '.json');
    console.log('Start seed poetry: ', fileType);
    for (const item of json) {
      const authorName = getAuthorName(fileType, item);
      if (authorName) {
        authorSet.add(authorName);
      }
    }
  }
  const authorsToCreate = Array.from(authorSet).map(name => ({ name, description: authors[name] || '', submitterId }));
  await prisma.author.createMany({
    data: authorsToCreate,
    skipDuplicates: true,
  });
  const inserted = authorsToCreate.length;
  console.log(`Author successfully seeded. Inserted: ${inserted}`);
  return NullNameId;
}