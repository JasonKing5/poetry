import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RoleEnum } from '../common/enums/role.enum';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(email: string, password: string, name?: string) {
    return await this.prisma.user.create({
      data: {
        email,
        password,
        name,
      },
    });
  }
  async assignRole(userId: number, roleNames: RoleEnum[]) {
    const roles = await this.prisma.role.findMany({ where: { name: { in: roleNames } } });
    if (roles.length !== roleNames.length) {
      throw new Error('One or more roles not found');
    }

    await this.prisma.userRole.createMany({
      data: roles.map(role => ({
        userId,
        roleId: role.id,
      })),
      skipDuplicates: true,
    });

    return roles;
  }

  async getUserRoles(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user || user.userRoles.length === 0) {
      throw new Error('User has no role assigned');
    }

    return user.userRoles.map(userRole => userRole.role);
  }

  async findOneByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }
  async findAll(email?: string, name?: string) {
    const where: Record<string, any> = {};
    if (email) where.email = email;
    if (name) where.name = name;
    return await this.prisma.user.findMany(
      Object.keys(where).length > 0 ? { where } : undefined
    );
  }
  async findOne(id: number) {
    return await this.prisma.user.findUnique({
      where: { id },
    });
  }
  async update(id: number, email: string | undefined, password: string | undefined, name: string | undefined) {
    return await this.prisma.user.update({
      where: { id },
      data: { email, password, name },
    });
  }
  async delete(id: number) {
    return await this.prisma.user.delete({
      where: { id },
    });
  }
}
