import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Dynasty, PoetrySource, PoetryStatus, PoetryType } from '@prisma/client';

@Injectable()
export class PoetryService {
  constructor(private readonly prisma: PrismaService) {}

  private SELECT_POETRY_BASE = {
    id: true,
    title: true,
    author: {
      select: {
        id: true,
        name: true,
      },
    },
    type: true,
    tags: true,
    source: true,
    status: true,
    dynasty: true,
    submitter: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
    createdAt: true,
    updatedAt: true,
  };

  private SELECT_POETRY_FULL = {
    ...this.SELECT_POETRY_BASE,
    content: true,
  };

  /**
   * 分页查询诗词
   * @param title 标题
   * @param author 作者
   * @param type 类型
   * @param tags 标签数组
   * @param status 状态
   * @param submitter 提交人
   * @param dynasty 朝代
   * @param page 当前页码（从1开始）
   * @param pageSize 每页条数
   */
  async findAll(title?: string, type?: PoetryType, tags?: string[], source?: string, dynasty?: Dynasty, submitter?: number, author?: string, status?: PoetryStatus, page: number = 1, pageSize: number = 20) {
    const where: any = {};
    if (type) where.type = type;
    if (title) where.title = { contains: title };
    if (status) where.status = status;
    if (source) where.status = source;
    if (submitter) where.submitterId = submitter;
    if (dynasty) where.dynasty = dynasty;
    if (author) where.authorId = parseInt(author);
    if (tags && tags.length > 0) {
      if (typeof tags === 'string') tags = [tags];
      where.tags = { hasSome: tags };
    }
    // 校正分页参数
    const take = Math.max(1, Math.min(pageSize, 100));
    const skip = Math.max(0, (page - 1) * take);
    return {
      total: await this.prisma.poetry.count({ where }),
      list: await this.prisma.poetry.findMany({
        where,
        take,
        skip,
        orderBy: {
          id: 'asc',
        },
        select: this.SELECT_POETRY_FULL,
      }),
    };
  }

  async findOne(id: number) {
    return await this.prisma.poetry.findUnique({
      where: { id },
      select: this.SELECT_POETRY_FULL,
    });
  }

  async create(title: string, authorId: number, type: PoetryType, tags: string[], source: PoetrySource, status: PoetryStatus, dynasty: Dynasty, submitterId: number) {
    return await this.prisma.poetry.create({
      data: {
        title,
        authorId,
        type,
        tags,
        source,
        status,
        dynasty,
        submitterId,
      },
    });
  }

  async update(id: number, title: string, authorId: number, tags: string[]) {
    return await this.prisma.poetry.update({
      where: { id },
      data: {
        title,
        authorId,
        tags,
      },
    });
  }

  async delete(id: number) {
    return await this.prisma.poetry.delete({
      where: { id },
    });
  }
}
