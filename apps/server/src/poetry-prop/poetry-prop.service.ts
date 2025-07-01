import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PoetryPropService {
  constructor(private readonly prisma: PrismaService) {}

  private lunarResult = null as any;

  async findAllAuthor() {
    const authors = await this.prisma.poem.findMany({
      select: {
        authorId: true
      },
      distinct: ['authorId']
    });
    return authors.map(author => author.authorId).filter(Boolean);
  }

  async findAllType() {
    const types = await this.prisma.poem.findMany({
      select: {
        type: true
      },
      distinct: ['type']
    });
    return types.map(type => type.type).filter(Boolean);
  }

  async findAllTags() {
    // const tags = await this.prisma.poem.findMany({
    //   select: {
    //     tags: true
    //   },
    //   distinct: ['tags']
    // });
    // return Array.from(new Set(tags.flatMap((tag: { tags: string[] }) => tag.tags).filter(Boolean)));
    return [];
  }

  async findLunar() {
    if (this.lunarResult !== null && new Date(this.lunarResult?.gregoriandate).toLocaleDateString() === new Date().toLocaleDateString()) {
      return this.lunarResult;
    }
    const lunar = await fetch(`https://apis.tianapi.com/lunar/index?key=${process.env.TIAN_API_KEY}`);
    const lunarData = await lunar.json();
    this.lunarResult = lunarData.result;
    return lunarData.result;
  }
}
