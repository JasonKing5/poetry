import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { userRoleSeed } from './userRoleSeed';
import { authorSeed } from './authorSeed';
import { poetrySeed } from './poetrySeed';
import { embedPoemsSeed } from './embadding';

const prisma = new PrismaClient();

const BASE_DIR = path.resolve(__dirname, '../../data');

async function main() {
  console.log('Start seed');

  console.log('Start load poetry data');
  const poetryDir = path.resolve(BASE_DIR, 'chinese-poetry');
  const files = fs.readdirSync(poetryDir).filter(f => f.endsWith('.json'));

  console.log('Start load author data');
  const authorDir = path.resolve(BASE_DIR, 'chinese-poetry-authors');
  const authorFiles = fs.readdirSync(authorDir).filter(f => f.endsWith('.json'));

  const rootUser = await userRoleSeed();

  const nullNameId = await authorSeed(poetryDir, authorDir, authorFiles, files, rootUser.id);

  await poetrySeed(poetryDir, files, rootUser.id, nullNameId);

  // await embedPoemsSeed();

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