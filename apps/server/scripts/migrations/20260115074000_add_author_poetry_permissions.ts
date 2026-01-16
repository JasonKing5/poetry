import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  console.log('Adding missing author and poetry permissions...');

  // 创建缺失的权限
  console.log('Creating author permissions...');
  const createAuthorPermission = await prisma.permission.upsert({
    where: { name: 'createAuthor' },
    update: {},
    create: { name: 'createAuthor' },
  });

  const deleteAuthorPermission = await prisma.permission.upsert({
    where: { name: 'deleteAuthor' },
    update: {},
    create: { name: 'deleteAuthor' },
  });

  const updateAuthorPermission = await prisma.permission.upsert({
    where: { name: 'updateAuthor' },
    update: {},
    create: { name: 'updateAuthor' },
  });

  const viewDetailAuthorPermission = await prisma.permission.upsert({
    where: { name: 'viewDetailAuthor' },
    update: {},
    create: { name: 'viewDetailAuthor' },
  });

  const viewAuthorPermission = await prisma.permission.upsert({
    where: { name: 'viewAuthor' },
    update: {},
    create: { name: 'viewAuthor' },
  });

  console.log('Creating poetry permissions...');
  const createPoetryPermission = await prisma.permission.upsert({
    where: { name: 'createPoetry' },
    update: {},
    create: { name: 'createPoetry' },
  });

  const deletePoetryPermission = await prisma.permission.upsert({
    where: { name: 'deletePoetry' },
    update: {},
    create: { name: 'deletePoetry' },
  });

  const updatePoetryPermission = await prisma.permission.upsert({
    where: { name: 'updatePoetry' },
    update: {},
    create: { name: 'updatePoetry' },
  });

  const viewDetailPoetryPermission = await prisma.permission.upsert({
    where: { name: 'viewDetailPoetry' },
    update: {},
    create: { name: 'viewDetailPoetry' },
  });

  const viewPoetryPermission = await prisma.permission.upsert({
    where: { name: 'viewPoetry' },
    update: {},
    create: { name: 'viewPoetry' },
  });

  // 获取admin角色
  const adminRole = await prisma.role.findUnique({
    where: { name: 'admin' },
  });

  if (!adminRole) {
    throw new Error('Admin role not found');
  }

  // 为admin角色分配权限
  console.log('Assigning permissions to admin role...');
  await prisma.rolePermission.createMany({
    data: [
      // Author permissions
      { roleId: adminRole.id, permissionId: createAuthorPermission.id },
      { roleId: adminRole.id, permissionId: deleteAuthorPermission.id },
      { roleId: adminRole.id, permissionId: updateAuthorPermission.id },
      { roleId: adminRole.id, permissionId: viewDetailAuthorPermission.id },
      { roleId: adminRole.id, permissionId: viewAuthorPermission.id },
      // Poetry permissions
      { roleId: adminRole.id, permissionId: createPoetryPermission.id },
      { roleId: adminRole.id, permissionId: deletePoetryPermission.id },
      { roleId: adminRole.id, permissionId: updatePoetryPermission.id },
      { roleId: adminRole.id, permissionId: viewDetailPoetryPermission.id },
      { roleId: adminRole.id, permissionId: viewPoetryPermission.id },
    ],
    skipDuplicates: true,
  });

  console.log('Author and poetry permissions added successfully!');
}

export { run };