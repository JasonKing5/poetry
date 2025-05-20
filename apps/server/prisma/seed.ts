import { PrismaClient, PoetryType, PoetrySource, PoetryStatus, Dynasty } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const POETRY_AUTHOR_MAP = {
  noOne: '无名氏',
  lunYu: '孔子',
};

let NullNameId: number = 0;

async function authorSeed(submitterId: number) {
  console.log('Start seed author');
  const poetryDir = path.resolve(__dirname, '../data/chinese-poetry');
  const files = fs.readdirSync(poetryDir).filter(f => f.endsWith('.json'));

  const authorDir = path.resolve(__dirname, '../data/chinese-poetry-authors');
  const authoreFiles = fs.readdirSync(authorDir).filter(f => f.endsWith('.json'));

  const lunYuAuthor = await prisma.author.findFirst({ where: { name: POETRY_AUTHOR_MAP[PoetryType.lunYu] } });
  if (!lunYuAuthor) {
    await prisma.author.create({ data: { name: POETRY_AUTHOR_MAP[PoetryType.lunYu] } });
  }
  let nullNameAuthor = await prisma.author.findFirst({ where: { name: POETRY_AUTHOR_MAP.noOne } });
  if (!nullNameAuthor) {
    nullNameAuthor = await prisma.author.create({ data: { name: POETRY_AUTHOR_MAP.noOne } });
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

  for (const file of authoreFiles) {
    const filePath = path.join(authorDir, file);
    const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!Array.isArray(json)) continue;
    for (const item of json) {
      if (item.name && item.description) {
        authors[item.name] = item.description;
      }
    }
  }

  for (const file of files) {
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
  const authorsToCreate = Array.from(authorSet).map(name => ({ name, description: authors[name] || '' }));
  await prisma.author.createMany({
    data: authorsToCreate,
    skipDuplicates: true,
  });
  const inserted = authorsToCreate.length;
  console.log(`Author successfully seeded. Inserted: ${inserted}`);
}

async function poetrySeed(submitterId: number) {
  console.log('Start seed poetry');
  const poetryDir = path.resolve(__dirname, '../data/chinese-poetry');
  const files = fs.readdirSync(poetryDir).filter(f => f.endsWith('.json'));
  let total = 0, skipped = 0, inserted = 0;

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
    return authors.find(a => a.name === author)?.id || NullNameId;
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
        tags: getTags(fileType, item),
        source: PoetrySource.ancientPoetry,
        dynasty: getDynasty(fileType),
        submitterId, // root user
        authorId: getAuthorId(fileType, item),
        status: PoetryStatus.approved,
      };
      // insert or skip
      const exists = await prisma.poetry.findFirst({
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
      await prisma.poetry.create({ data: poetry });
      inserted++;
      total++;
    }
  }
  console.log(`Poetry successfully seeded. Inserted: ${inserted}, Skipped: ${skipped}`);
}

async function main() {
  console.log('Start seed');
  
  console.log('Start seed role')
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: { name: 'admin' },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: { name: 'user' },
  });

  console.log('Start seed permission')
  const createUserPermission = await prisma.permission.upsert({
    where: { name: 'createUser' },
    update: {},
    create: { name: 'createUser' },
  });

  const deleteUserPermission = await prisma.permission.upsert({
    where: { name: 'deleteUser' },
    update: {},
    create: { name: 'deleteUser' },
  });

  const updateUserPermission = await prisma.permission.upsert({
    where: { name: 'updateUser' },
    update: {},
    create: { name: 'updateUser' },
  });

  const viewDetailUserPermission = await prisma.permission.upsert({
    where: { name: 'viewDetailUser' },
    update: {},
    create: { name: 'viewDetailUser' },
  });

  const viewUserPermission = await prisma.permission.upsert({
    where: { name: 'viewUser' },
    update: {},
    create: { name: 'viewUser' },
  });

  console.log('Start seed role permission')
  await prisma.rolePermission.createMany({
    data: [
      { roleId: adminRole.id, permissionId: createUserPermission.id },
      { roleId: adminRole.id, permissionId: deleteUserPermission.id },
      { roleId: adminRole.id, permissionId: updateUserPermission.id },
      { roleId: adminRole.id, permissionId: viewDetailUserPermission.id },
      { roleId: adminRole.id, permissionId: viewUserPermission.id },
    ],
    skipDuplicates: true,
  });

  await prisma.rolePermission.createMany({
    data: [
      { roleId: userRole.id, permissionId: updateUserPermission.id },
      { roleId: userRole.id, permissionId: viewDetailUserPermission.id },
    ],
    skipDuplicates: true,
  });

  console.log('Start seed root user')
  const rootUser = await prisma.user.upsert({
    where: { email: 'root@example.com' },
    update: {},
    create: {
      email: 'root@example.com',
      name: 'root',
      password: await bcrypt.hash('123456', 10),
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: { userId: rootUser.id, roleId: adminRole.id },
    },
    update: {},
    create: {
      userId: rootUser.id,
      roleId: adminRole.id,
    },
  });

  console.log('Roles and permissions successfully seeded.');

  await authorSeed(rootUser.id);

  await poetrySeed(rootUser.id);

  console.log('All successfully seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
