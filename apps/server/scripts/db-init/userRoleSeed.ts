import { PrismaClient, PoetryType, PoetrySource, PoetryStatus, Dynasty } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import { POETRY_AUTHOR_MAP } from './constant';


const prisma = new PrismaClient();

export async function userRoleSeed() {
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

  console.log('Start seed poetry list permission')
  const createPoetryListPermission = await prisma.permission.upsert({
    where: { name: 'createPoetryList' },
    update: {},
    create: { name: 'createPoetryList' },
  });

  const updatePoetryListPermission = await prisma.permission.upsert({
    where: { name: 'updatePoetryList' },
    update: {},
    create: { name: 'updatePoetryList' },
  });

  const deletePoetryListPermission = await prisma.permission.upsert({
    where: { name: 'deletePoetryList' },
    update: {},
    create: { name: 'deletePoetryList' },
  });

  console.log('Start seed role permission')
  await prisma.rolePermission.createMany({
    data: [
      { roleId: adminRole.id, permissionId: createUserPermission.id },
      { roleId: adminRole.id, permissionId: deleteUserPermission.id },
      { roleId: adminRole.id, permissionId: updateUserPermission.id },
      { roleId: adminRole.id, permissionId: viewDetailUserPermission.id },
      { roleId: adminRole.id, permissionId: viewUserPermission.id },
      { roleId: adminRole.id, permissionId: createPoetryListPermission.id },
      { roleId: adminRole.id, permissionId: updatePoetryListPermission.id },
      { roleId: adminRole.id, permissionId: deletePoetryListPermission.id },
    ],
    skipDuplicates: true,
  });

  await prisma.rolePermission.createMany({
    data: [
      { roleId: userRole.id, permissionId: updateUserPermission.id },
      { roleId: userRole.id, permissionId: viewDetailUserPermission.id },
      { roleId: userRole.id, permissionId: createPoetryListPermission.id },
      { roleId: userRole.id, permissionId: updatePoetryListPermission.id },
      { roleId: userRole.id, permissionId: deletePoetryListPermission.id },
    ],
    skipDuplicates: true,
  });

  console.log('Start seed root user')
  const rootEmail = process.env.ROOT_EMAIL || 'root@example.com';
  const rootPassword = process.env.ROOT_PASSWORD || '123456';
  
  const rootUser = await prisma.user.upsert({
    where: { email: rootEmail },
    update: {},
    create: {
      email: rootEmail,
      name: 'root',
      password: await bcrypt.hash(rootPassword, 10),
    },
  });
  
  console.log(`Root user created/updated with email: ${rootEmail}`);

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
  return rootUser;
}
