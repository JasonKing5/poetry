import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthorService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    throw new BadRequestException('Email is required');
    return await this.prisma.author.findMany({
      orderBy: { id: 'asc' },
    });
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
