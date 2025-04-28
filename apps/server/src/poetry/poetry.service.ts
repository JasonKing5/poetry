import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PoetryService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 分页查询诗词
   * @param title 标题
   * @param author 作者
   * @param type 类型
   * @param tags 标签数组
   * @param page 当前页码（从1开始）
   * @param pageSize 每页条数
   */
  async findAll(title?: string, author?: string, type?: string, tags?: string[], page: number = 1, pageSize: number = 20) {
    const where: any = {};
    if (type) where.type = type;
    if (title) where.title = title;
    if (author) where.author = author;
    if (tags && tags.length > 0) {
      where.tags = { hasSome: tags };
    }
    // 校正分页参数
    const take = Math.max(1, Math.min(pageSize, 100));
    const skip = Math.max(0, (page - 1) * take);
    return await this.prisma.poetry.findMany({
      where,
      take,
      skip,
      orderBy: {
        id: 'asc',
      },
      select: {
        id: true,
        title: true,
        author: true,
        type: true,
        tags: true,
        source: true,
        createdAt: true,
        updatedAt: true,
      }
    });
  }

  async findOne(id: number) {
    return await this.prisma.poetry.findUnique({
      where: { id },
    });
  }
}
