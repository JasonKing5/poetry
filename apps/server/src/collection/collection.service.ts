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
    order: true,
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
    // items: {
    //   select: {
    //     poem: {
    //       select: {
    //         id: true,
    //         title: true,
    //         author: {
    //           select: {
    //             id: true,
    //             name: true,
    //           },
    //         },
    //         type: true,
    //         source: true,
    //         dynasty: true,
    //         submitter: {
    //           select: {
    //             id: true,
    //             name: true,
    //           },
    //         },
    //         createdAt: true,
    //         updatedAt: true,
    //       },
    //     },
    //   },
    // },
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
    const where: any = {
      isDeleted: false,
      collectionPoems: {
        some: {} // 只查询有诗词的合集
      }
    };
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
        orderBy: [
          { order: 'asc' },
          { id: 'asc' },
        ],
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

  async findPoems(id: number) {
    const poemIds = await this.prisma.collectionPoem.findMany({ where: { collectionId: id }, select: { poemId: true }, orderBy: { order: 'asc' } });
    return poemIds?.map(item => item.poemId) || [];
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

  async moveUp(id: number) {
    const current = await this.prisma.collection.findUnique({ where: { id } });
    if (!current) throw new Error('Collection not found');

    const previous = await this.prisma.collection.findFirst({
      where: {
        order: { lt: current.order },
        isDeleted: false,
      },
      orderBy: { order: 'desc' },
    });

    if (!previous) return current;

    await this.prisma.$transaction([
      this.prisma.collection.update({
        where: { id: current.id },
        data: { order: previous.order },
      }),
      this.prisma.collection.update({
        where: { id: previous.id },
        data: { order: current.order },
      }),
    ]);

    return await this.prisma.collection.findUnique({ where: { id } });
  }

  async moveDown(id: number) {
    const current = await this.prisma.collection.findUnique({ where: { id } });
    if (!current) throw new Error('Collection not found');

    const next = await this.prisma.collection.findFirst({
      where: {
        order: { gt: current.order },
        isDeleted: false,
      },
      orderBy: { order: 'asc' },
    });

    if (!next) return current;

    await this.prisma.$transaction([
      this.prisma.collection.update({
        where: { id: current.id },
        data: { order: next.order },
      }),
      this.prisma.collection.update({
        where: { id: next.id },
        data: { order: current.order },
      }),
    ]);

    return await this.prisma.collection.findUnique({ where: { id } });
  }

  async moveToTop(id: number) {
    const current = await this.prisma.collection.findUnique({ where: { id } });
    if (!current) throw new Error('Collection not found');

    const minCollection = await this.prisma.collection.findFirst({
      where: { isDeleted: false },
      orderBy: { order: 'asc' },
    });

    if (!minCollection || minCollection.id === current.id) return current;

    if (current.order > minCollection.order) {
      await this.prisma.collection.updateMany({
        where: {
          order: { lt: current.order },
          isDeleted: false,
        },
        data: { order: { increment: 1 } },
      });

      await this.prisma.collection.update({
        where: { id },
        data: { order: minCollection.order },
      });
    }

    return await this.prisma.collection.findUnique({ where: { id } });
  }

  async moveToBottom(id: number) {
    const current = await this.prisma.collection.findUnique({ where: { id } });
    if (!current) throw new Error('Collection not found');

    const maxCollection = await this.prisma.collection.findFirst({
      where: { isDeleted: false },
      orderBy: { order: 'desc' },
    });

    if (!maxCollection || maxCollection.id === current.id) return current;

    if (current.order < maxCollection.order) {
      await this.prisma.collection.updateMany({
        where: {
          order: { gt: current.order },
          isDeleted: false,
        },
        data: { order: { decrement: 1 } },
      });

      await this.prisma.collection.update({
        where: { id },
        data: { order: maxCollection.order },
      });
    }

    return await this.prisma.collection.findUnique({ where: { id } });
  }
}
