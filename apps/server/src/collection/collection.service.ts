import { Injectable } from '@nestjs/common';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CollectionService {
  constructor(private readonly prisma: PrismaService) {}

  private SELECT_COLLECTION_BASE = {
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

  private SELECT_COLLECTION_FULL = {
    ...this.SELECT_COLLECTION_BASE,
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

  create(createCollectionDto: CreateCollectionDto) {
    return this.prisma.collection.create({
      data: {
        ...createCollectionDto,
        creatorId: Number(createCollectionDto.creatorId),
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
      this.prisma.collection.count({ where }),
      this.prisma.collection.findMany({
        where,
        take,
        skip,
        orderBy: { id: 'asc' },
        select: this.SELECT_COLLECTION_BASE,
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
    return this.prisma.collection.findUnique({ where: { id }, select: this.SELECT_COLLECTION_FULL });
  }

  update(id: number, updateCollectionDto: UpdateCollectionDto) {
    return this.prisma.collection.update({ where: { id }, data: {
      ...updateCollectionDto,
      creatorId: Number(updateCollectionDto.creatorId),
    } });
  }

  remove(id: number) {
    return this.prisma.collection.delete({ where: { id } });
  }
}
