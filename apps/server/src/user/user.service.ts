import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

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
