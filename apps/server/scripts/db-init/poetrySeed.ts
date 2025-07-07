import { PrismaClient, PoetryType, PoetrySource, PoetryStatus, Dynasty, Collection } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { POETRY_AUTHOR_MAP } from './constant';

const prisma = new PrismaClient();

export async function poetrySeed(poetryDir: string, files: string[], submitterId: number, nullNameId: number) {
  console.log('Start seed poetry');
  let total = 0, skipped = 0, inserted = 0;

  const collections: Collection[] = [];

  const getContent = (type: string, poetry: any) => {
    if (type === PoetryType.chuCi) {
      return poetry.content;
    } else if (type === PoetryType.lunYu) {
      return poetry.paragraphs;
    } else if (type === PoetryType.shiJing) {
      return poetry.content;
    } else if (type === PoetryType.songCi) {
      return poetry.paragraphs;
    } else if (type === PoetryType.tangShi) {
      return poetry.paragraphs;
    } else if (type === PoetryType.yuanQu) {
      return poetry.paragraphs;
    }
    return poetry.content;
  }

  const getTags = (type: string, poetry: any) => {
    if (type === PoetryType.chuCi) {
      return [poetry.section];
    } else if (type === PoetryType.lunYu) {
      return [poetry.chapter];
    } else if (type === PoetryType.shiJing) {
      return [poetry.chapter, poetry.section];
    } else if (type === PoetryType.songCi) {
      return poetry.tags || [];
    } else if (type === PoetryType.tangShi) {
      return poetry.tags || [];
    } else if (type === PoetryType.yuanQu) {
      return [];
    }
    return poetry.tags || [];
  }

  const authors = await prisma.author.findMany({
    select: { name: true, id: true },
  });

  const getAuthorId = (type: string, poetry: any) => {
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
    return authors.find(a => a.name === author)?.id || nullNameId;
  }

  const getDynasty = (type: string) => {
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

  for (const file of files) {
    const filePath = path.join(poetryDir, file);
    const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!Array.isArray(json)) continue;
    const fileType = path.basename(file, '.json');
    console.log('Start seed poetry: ', fileType);
    for (const item of json) {
      // convert to poetry
      const poetry = {
        title: fileType === PoetryType.lunYu ? item.chapter : item.title,
        content: getContent(fileType, item),
        type: PoetryType[fileType],
        source: PoetrySource.ancientPoem,
        dynasty: getDynasty(fileType),
        submitterId, // root user
        authorId: getAuthorId(fileType, item),
        status: PoetryStatus.approved,
      };
      const tags = getTags(fileType, item);
      if (tags.length > 0) {
        await Promise.all(tags.map(async tag => {
          if (collections.some(c => c.title === tag)) return;
          const collection = {
            title: tag,
            description: tag,
            creatorId: submitterId,
            status: PoetryStatus.approved,
          };
          const newCollection = await prisma.collection.create({ data: collection });
          collections.push(newCollection);
        }));
      }
      // insert or skip
      const exists = await prisma.poem.findFirst({
        where: {
          title: poetry.title,
          authorId: poetry.authorId,
          type: poetry.type,
        },
      });
      if (exists) {
        skipped++;
        continue;
      }
      const newPoem = await prisma.poem.create({ data: poetry });
      await prisma.collectionPoem.createMany({
        data: tags.map(tag => ({
          collectionId: collections.find(c => c.title === tag)?.id,
          poemId: newPoem.id,
        })),
      });
      inserted++;
      total++;
    }
  }
  console.log(`Poetry successfully seeded. Inserted: ${inserted}, Skipped: ${skipped}`);
}