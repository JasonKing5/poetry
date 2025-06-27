import { Injectable } from '@nestjs/common';
import { CreatePoetryListDto } from './dto/create-poetry-list.dto';
import { UpdatePoetryListDto } from './dto/update-poetry-list.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PoetryListService {
  constructor(private readonly prisma: PrismaService) {}

  private SELECT_POETRY_LIST_BASE = {
    id: true,
    title: true,
    creator: {
      select: {
        id: true,
        name: true,
      },
    },
    likes: true,
  };

  private SELECT_POETRY_LIST_FULL = {
    ...this.SELECT_POETRY_LIST_BASE,
    description: true,
    isPublic: true,
    createdAt: true,
    updatedAt: true,
    items: {
      select: {
        poetry: {
          select: {
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
            dynasty: true,
            submitter: {
              select: {
                id: true,
                name: true,
              },
            },
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    },
  };

  create(createPoetryListDto: CreatePoetryListDto) {
    return this.prisma.poetryList.create({
      data: {
        ...createPoetryListDto,
        creatorId: Number(createPoetryListDto.creatorId),
      },
    });
  }

  async findAll(page: number, pageSize: number, title?: string, currentUserId?: number) {
    const where: any = {};
    if (title) where.title = { contains: title };
    // 校正分页参数
    const take = Math.max(1, Math.min(pageSize, 100));
    const skip = Math.max(0, (page - 1) * take);
    const [total, list] = await Promise.all([
      this.prisma.poetryList.count({ where }),
      this.prisma.poetryList.findMany({
        where,
        take,
        skip,
        orderBy: { id: 'asc' },
        select: this.SELECT_POETRY_LIST_BASE,
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

  findOne(id: number) {
    return this.prisma.poetryList.findUnique({ where: { id }, select: this.SELECT_POETRY_LIST_FULL });
  }

  update(id: number, updatePoetryListDto: UpdatePoetryListDto) {
    return this.prisma.poetryList.update({ where: { id }, data: {
      ...updatePoetryListDto,
      creatorId: Number(updatePoetryListDto.creatorId),
    } });
  }

  remove(id: number) {
    return this.prisma.poetryList.delete({ where: { id } });
  }
}
