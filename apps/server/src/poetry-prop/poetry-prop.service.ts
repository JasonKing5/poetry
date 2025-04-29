import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PoetryPropService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllAuthor() {
    const authors = await this.prisma.poetry.findMany({
      select: {
        authorId: true
      },
      distinct: ['authorId']
    });
    return authors.map(author => author.authorId).filter(Boolean);
  }

  async findAllType() {
    const types = await this.prisma.poetry.findMany({
      select: {
        type: true
      },
      distinct: ['type']
    });
    return types.map(type => type.type).filter(Boolean);
  }

  async findAllTags() {
    const tags = await this.prisma.poetry.findMany({
      select: {
        tags: true
      },
      distinct: ['tags']
    });
    return Array.from(new Set(tags.flatMap((tag: { tags: string[] }) => tag.tags).filter(Boolean)));
  }
}
