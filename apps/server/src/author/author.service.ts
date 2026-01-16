import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Dynasty } from '@prisma/client';

@Injectable()
export class AuthorService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(name?: string, page: number = 1, pageSize: number = 18, all?: boolean, dynasty?: Dynasty) {
    const where: any = {};
    if (name) where.name = { contains: name };
    if (dynasty) where.dynasty = dynasty;
    if (all) {
      return await this.prisma.author.findMany({
        where,
        orderBy: [
          { order: 'asc' },
          { id: 'asc' },
        ],
        select: {
          id: true,
          name: true,
          dynasty: true,
          order: true,
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
        orderBy: [
          { order: 'asc' },
          { id: 'asc' },
        ],
        select: {
          id: true,
          name: true,
          description: true,
          dynasty: true,
          order: true,
        }
      }),
    };
  }

  async findOne(id: number) {
    return await this.prisma.author.findUnique({ where: { id } });
  }

  async create(name: string, submitterId: number) {
    return await this.prisma.author.create({ data: { name, submitterId } });
  }

  async update(id: number, name: string) {
    return await this.prisma.author.update({ where: { id }, data: { name } });
  }

  async delete(id: number) {
    return await this.prisma.author.delete({ where: { id } });
  }

  async moveUp(id: number) {
    const current = await this.prisma.author.findUnique({ where: { id } });
    if (!current) throw new Error('Author not found');

    // 找到前一个author（order小于当前order中最大的）
    const previous = await this.prisma.author.findFirst({
      where: {
        order: { lt: current.order },
        isDeleted: false,
      },
      orderBy: { order: 'desc' },
    });

    if (!previous) return current; // 已经在最前面

    // 交换order
    await this.prisma.$transaction([
      this.prisma.author.update({
        where: { id: current.id },
        data: { order: previous.order },
      }),
      this.prisma.author.update({
        where: { id: previous.id },
        data: { order: current.order },
      }),
    ]);

    return await this.prisma.author.findUnique({ where: { id } });
  }

  async moveDown(id: number) {
    const current = await this.prisma.author.findUnique({ where: { id } });
    if (!current) throw new Error('Author not found');

    // 找到后一个author（order大于当前order中最小的）
    const next = await this.prisma.author.findFirst({
      where: {
        order: { gt: current.order },
        isDeleted: false,
      },
      orderBy: { order: 'asc' },
    });

    if (!next) return current; // 已经在最后面

    // 交换order
    await this.prisma.$transaction([
      this.prisma.author.update({
        where: { id: current.id },
        data: { order: next.order },
      }),
      this.prisma.author.update({
        where: { id: next.id },
        data: { order: current.order },
      }),
    ]);

    return await this.prisma.author.findUnique({ where: { id } });
  }

  async moveToTop(id: number) {
    const current = await this.prisma.author.findUnique({ where: { id } });
    if (!current) throw new Error('Author not found');

    // 找到最小的order
    const minAuthor = await this.prisma.author.findFirst({
      where: { isDeleted: false },
      orderBy: { order: 'asc' },
    });

    if (!minAuthor || minAuthor.id === current.id) return current;

    // 如果当前不是最小，将当前设为最小，其他order加1
    if (current.order > minAuthor.order) {
      // 将所有order小于当前order的作者order加1
      await this.prisma.author.updateMany({
        where: {
          order: { lt: current.order },
          isDeleted: false,
        },
        data: { order: { increment: 1 } },
      });

      // 将当前作者设为最小order
      await this.prisma.author.update({
        where: { id },
        data: { order: minAuthor.order },
      });
    }

    return await this.prisma.author.findUnique({ where: { id } });
  }

  async moveToBottom(id: number) {
    const current = await this.prisma.author.findUnique({ where: { id } });
    if (!current) throw new Error('Author not found');

    // 找到最大的order
    const maxAuthor = await this.prisma.author.findFirst({
      where: { isDeleted: false },
      orderBy: { order: 'desc' },
    });

    if (!maxAuthor || maxAuthor.id === current.id) return current;

    // 如果当前不是最大，将当前设为最大，其他order减1
    if (current.order < maxAuthor.order) {
      // 将所有order大于当前order的作者order减1
      await this.prisma.author.updateMany({
        where: {
          order: { gt: current.order },
          isDeleted: false,
        },
        data: { order: { decrement: 1 } },
      });

      // 将当前作者设为最大order
      await this.prisma.author.update({
        where: { id },
        data: { order: maxAuthor.order },
      });
    }

    return await this.prisma.author.findUnique({ where: { id } });
  }
}
