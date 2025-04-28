import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RoleEnum } from '../common/enums/role.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(email: string, password: string, name?: string) {
    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }
    if (await this.prisma.user.findUnique({ where: { email } })) {
      throw new BadRequestException('Email already exists');
    }
    if (name && name.length > 20) {
      throw new BadRequestException('Name must be less than 20 characters');
    }
    if (password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters');
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    console.log('register user:', user)

    await this.assignRole(user.id, [RoleEnum.USER]);
    const roles = await this.getUserRoles(user.id);
    return { ...user, roles };
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
    if (!email) {
      throw new BadRequestException('Email is required');
    }
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
    if (!id) {
      throw new BadRequestException('ID is required');
    }
    return await this.prisma.user.findUnique({
      where: { id },
    });
  }
  async update(id: number, email: string | undefined, password: string | undefined, name: string | undefined) {
    if (!id) {
      throw new BadRequestException('ID is required');
    }
    if (email) {
      const user = await this.prisma.user.findUnique({ where: { email } });
      if (user && user.id !== id) {
        throw new BadRequestException('Email already exists');
      }
    }
    if (name && name.length > 20) {
      throw new BadRequestException('Name must be less than 20 characters');
    }
    if (password && password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters');
    }
    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
    return await this.prisma.user.update({
      where: { id },
      data: { email, password: hashedPassword, name },
    });
  }
  async delete(id: number) {
    if (!id) {
      throw new BadRequestException('ID is required');
    }
    const result = await this.prisma.user.delete({
      where: { id },
    });
    await this.prisma.userRole.deleteMany({
      where: { userId: id },
    });
    return result;
  }
}
