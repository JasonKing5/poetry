import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthorService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(name?: string, page: number = 1, pageSize: number = 18, all?: boolean) {
    const where: any = {};
    if (name) where.name = { contains: name };
    if (all) {
      return await this.prisma.author.findMany({
        where,
        orderBy: {
          id: 'asc',
        },
        select: {
          id: true,
          name: true,
        }
      })
    }
    const take = Math.max(1, Math.min(pageSize, 100));
    const skip = Math.max(0, (page - 1) * take);
    return {
      total: await this.prisma.author.count({ where }),
      list: await this.prisma.author.findMany({
        where,
        take,
        skip,
        orderBy: {
          id: 'asc',
        },
        select: {
          id: true,
          name: true,
          description: true,
        }
      }),
    };
  }

  async findOne(id: number) {
    return await this.prisma.author.findUnique({ where: { id } });
  }

  async create(name: string) {
    return await this.prisma.author.create({ data: { name } });
  }

  async update(id: number, name: string) {
    return await this.prisma.author.update({ where: { id }, data: { name } });
  }

  async delete(id: number) {
    return await this.prisma.author.delete({ where: { id } });
  }
}
