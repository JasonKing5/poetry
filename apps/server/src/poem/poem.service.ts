import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Dynasty, PoetrySource, PoetryStatus, PoetryType } from '@prisma/client';
import axios from 'axios';

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
    source: true,
    status: true,
    dynasty: true,
    content: true,
    submitter: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
    likes: true,
    createdAt: true,
    updatedAt: true,
  };

  private SELECT_POETRY_FULL = {
    ...this.SELECT_POETRY_BASE,
  };

  /**
   * 分页查询诗词
   * @param title 标题
   * @param author 作者
   * @param type 类型
   * @param status 状态
   * @param submitter 提交人
   * @param dynasty 朝代
   * @param page 当前页码（从1开始）
   * @param pageSize 每页条数
   */
  async findAll(
    title?: string, 
    type?: PoetryType, 
    source?: string, 
    dynasty?: Dynasty, 
    submitter?: number, 
    author?: string, 
    status?: PoetryStatus, 
    page: number = 1, 
    pageSize: number = 20,
    currentUserId?: number
  ) {
    const where: any = {};
    if (type) where.type = type;
    if (title) where.title = { contains: title };
    if (status) where.status = status;
    if (source) where.status = source;
    if (submitter) where.submitterId = submitter;
    if (dynasty) where.dynasty = dynasty;
    if (author) where.authorId = parseInt(author);
    // 校正分页参数
    const take = Math.max(1, Math.min(pageSize, 100));
    const skip = Math.max(0, (page - 1) * take);
    const [total, list] = await Promise.all([
      this.prisma.poem.count({ where }),
      this.prisma.poem.findMany({
        where,
        take,
        skip,
        orderBy: { id: 'asc' },
        select: this.SELECT_POETRY_BASE,
      }),
    ]);

    const isLiked = (likes: any) => likes.some((like: any) => like.userId === currentUserId);

    // Format response
    const formattedList = list.map(poetry => ({
      ...poetry,
      likes: {
        count: poetry.likes.length || 0,
        isLiked: isLiked(poetry.likes),
      }
    }));

    return {
      total,
      list: formattedList,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  async search(input: string, limit: number = 10) {
    const res = await axios.post(`${process.env.EMBEDDING_SERVER_URL}/embed`, { text: input });
    const inputVector = res?.data?.embedding || [];

    if (!inputVector.length) {
      throw new Error('Failed to generate embedding for the input text');
    }

    console.log('search service inputVector: ', inputVector.length);
    console.log('search service limit: ', limit, typeof limit);

    // Convert the input vector to a PostgreSQL array string
    const pgVector = `[${inputVector.join(',')}]`;

    const poems = await this.prisma.$queryRaw`
      SELECT
        p.id,
        p.title,
        a.name as author,
        p.dynasty,
        p.content,
        p.embedding <=> ${pgVector}::vector as distance
      FROM "Poem" p
      LEFT JOIN "Author" a ON p."authorId" = a.id
      WHERE p.embedding IS NOT NULL
      ORDER BY distance
      LIMIT ${limit}
    `;

    console.log('search service poems: ', poems);

    return poems;
  }

  async findPoems(poemIds: number[]) {
    return await this.prisma.poem.findMany({
      where: { id: { in: poemIds } },
      select: this.SELECT_POETRY_BASE,
    });
  }

  async findOne(id: number) {
    return await this.prisma.poem.findUnique({
      where: { id },
      select: this.SELECT_POETRY_FULL,
    });
  }

  async create(title: string, authorId: number, type: PoetryType, tags: string[], source: PoetrySource, status: PoetryStatus, dynasty: Dynasty, submitterId: number) {
    return await this.prisma.poem.create({
      data: {
        title,
        authorId,
        type,
        source,
        status,
        dynasty,
        submitterId,
      },
    });
  }

  async update(id: number, title: string, authorId: number, tags: string[]) {
    return await this.prisma.poem.update({
      where: { id },
      data: {
        title,
        authorId,
      },
    });
  }

  async delete(id: number) {
    return await this.prisma.poem.delete({
      where: { id },
    });
  }
}
