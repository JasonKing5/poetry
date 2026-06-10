import { PrismaClient } from '@prisma/client';
import { userRoleSeed } from './userRoleSeed';
import { poemSeed } from './poem-seed';

const prisma = new PrismaClient();


async function main() {
  console.log('Start seed');
  await userRoleSeed();
  await poemSeed();

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