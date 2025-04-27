import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
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

  // Permissions
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

  // Assign permissions to roles
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

  console.log('Permissions successfully assigned to roles.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
