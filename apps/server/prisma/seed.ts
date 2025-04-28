import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const POETRY_TYPEs = {
  chu_ci: 'chu_ci',
  lun_yu: 'lun_yu',
  shi_jing: 'shi_jing',
  song_ci: 'song_ci',
  tang_shi: 'tang_shi',
  yuan_qu: 'yuan_qu',
};

const POETRY_TYPE_MAP = {
  'chu_ci': '楚辞',
  'lun_yu': '论语',
  'shi_jing': '诗经',
  'song_ci': '宋词',
  'tang_shi': '唐诗',
  'yuan_qu': '元曲',
};

async function poetrySeed() {
  console.log('Start seed poetry');
  const poetryDir = path.resolve(__dirname, '../data/chinese-poetry');
  const files = fs.readdirSync(poetryDir).filter(f => f.endsWith('.json'));
  let total = 0, skipped = 0, inserted = 0;

  const getContent = (type: string, poetry: any) => {
    if (type === POETRY_TYPEs.chu_ci) {
      return poetry.content;
    } else if (type === POETRY_TYPEs.lun_yu) {
      return poetry.paragraphs;
    } else if (type === POETRY_TYPEs.shi_jing) {
      return poetry.content;
    } else if (type === POETRY_TYPEs.song_ci) {
      return poetry.paragraphs;
    } else if (type === POETRY_TYPEs.tang_shi) {
      return poetry.paragraphs;
    } else if (type === POETRY_TYPEs.yuan_qu) {
      return poetry.paragraphs;
    }
    return poetry.content;
  }

  const getTags = (type: string, poetry: any) => {
    if (type === POETRY_TYPEs.chu_ci) {
      return [poetry.section];
    } else if (type === POETRY_TYPEs.lun_yu) {
      return [poetry.chapter];
    } else if (type === POETRY_TYPEs.shi_jing) {
      return [poetry.chapter, poetry.section];
    } else if (type === POETRY_TYPEs.song_ci) {
      return poetry.tags || [];
    } else if (type === POETRY_TYPEs.tang_shi) {
      return poetry.tags || [];
    } else if (type === POETRY_TYPEs.yuan_qu) {
      return [poetry.dynasty];
    }
    return poetry.tags || [];
  }

  const getAuthor = (type: string, poetry: any) => {
    if (type === POETRY_TYPEs.chu_ci) {
      return poetry.author;
    } else if (type === POETRY_TYPEs.lun_yu) {
      return '孔子';
    } else if (type === POETRY_TYPEs.shi_jing) {
      return '';
    } else if (type === POETRY_TYPEs.song_ci) {
      return poetry.author;
    } else if (type === POETRY_TYPEs.tang_shi) {
      return poetry.author;
    } else if (type === POETRY_TYPEs.yuan_qu) {
      return poetry.author;
    }
    return poetry.author;
  }

  for (const file of files) {
    const filePath = path.join(poetryDir, file);
    const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!Array.isArray(json)) continue;
    const source = 1; // 1: 诗词库, 2: 用户
    const fileType = path.basename(file, '.json');
    console.log('Start seed poetry: ', fileType);
    for (const item of json) {
      // convert to poetry
      const poetry = {
        title: fileType === POETRY_TYPEs.lun_yu ? item.chapter : item.title,
        content: getContent(fileType, item),
        author: getAuthor(fileType, item),
        type: POETRY_TYPE_MAP[fileType],
        tags: getTags(fileType, item),
        source,
      };
      // insert or skip
      const exists = await prisma.poetry.findFirst({
        where: {
          title: poetry.title,
          author: poetry.author,
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

  await poetrySeed();

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
