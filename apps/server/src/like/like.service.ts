import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLikeDto } from './dto/create-like.dto';
import { UpdateLikeDto } from './dto/update-like.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { TargetType } from '@prisma/client';

@Injectable()
export class LikeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createLikeDto: CreateLikeDto) {
    console.log('like service createLikeDto', createLikeDto);
    
    // 验证 targetType 是否有效
    if (!Object.values(TargetType).includes(createLikeDto.targetType as TargetType)) {
      throw new Error(`Invalid targetType: ${createLikeDto.targetType}`);
    }

    // 验证用户是否存在
    const user = await this.prisma.user.findUnique({
      where: { id: Number(createLikeDto.userId) },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 验证目标资源是否存在
    const targetId = Number(createLikeDto.targetId);
    const targetType = createLikeDto.targetType as TargetType;

    // 检查是否已经点赞
    const existingLike = await this.findExistingLike(user.id, targetType, targetId);

    if (existingLike) {
      // 如果已经点赞，则取消点赞
      return this.prisma.like.delete({
        where: { id: existingLike.id },
      });
    }

    // 验证目标资源是否存在
    await this.validateTargetExists(targetType, targetId);

    // 创建点赞记录
    const data: any = {
      targetType,
      userId: user.id,
      createdAt: new Date(),
    };

    // 根据目标类型设置对应的 ID 字段
    switch (targetType) {
      case 'POETRY':
        data.poetryId = targetId;
        break;
      case 'LIST':
        data.poetryListId = targetId;
        break;
      case 'COMMENT':
        data.commentId = targetId;
        break;
    }

    return this.prisma.like.create({ data });
  }

  private async findExistingLike(userId: number, targetType: TargetType, targetId: number) {
    const where: any = {
      userId,
      targetType,
    };

    // 根据目标类型设置查询条件
    switch (targetType) {
      case 'POETRY':
        where.poetryId = targetId;
        break;
      case 'LIST':
        where.poetryListId = targetId;
        break;
      case 'COMMENT':
        where.commentId = targetId;
        break;
    }

    return this.prisma.like.findFirst({ where });
  }

  private async validateTargetExists(targetType: TargetType, targetId: number) {
    switch (targetType) {
      case 'POETRY':
        const poetry = await this.prisma.poetry.findUnique({
          where: { id: targetId },
        });
        if (!poetry) {
          throw new NotFoundException('Poetry not found');
        }
        break;
      case 'COMMENT':
        const comment = await this.prisma.comment.findUnique({
          where: { id: targetId },
        });
        if (!comment) {
          throw new NotFoundException('Comment not found');
        }
        break;
      case 'LIST':
        const poetryList = await this.prisma.poetryList.findUnique({
          where: { id: targetId },
        });
        if (!poetryList) {
          throw new NotFoundException('Poetry list not found');
        }
        break;
      default:
        throw new NotFoundException(`Unsupported target type: ${targetType}`);
    }
  }

  async findAll(targetType?: TargetType, targetId?: number, page: number = 1, pageSize: number = 20, userId?: number) {
    const skip = (page - 1) * pageSize;
    const where: any = {};
  
    if (targetType) {
      where.targetType = targetType;
      // 根据目标类型设置对应的 ID 字段
      switch (targetType) {
        case 'POETRY':
          where.poetryId = targetId;
          break;
        case 'LIST':
          where.poetryListId = targetId;
          break;
        case 'COMMENT':
          where.commentId = targetId;
          break;
      }
    }
  
    if (userId) {
      where.userId = userId;
    }
  
    const [items, total] = await Promise.all([
      this.prisma.like.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          user: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.like.count({ where }),
    ]);
  
    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  findOne(id: number) {
    return this.prisma.like.findUnique({ where: { id } });
  }

  update(id: number, updateLikeDto: UpdateLikeDto, userId: number | undefined) {
    if (!Object.values(TargetType).includes(updateLikeDto.targetType as TargetType)) {
      throw new Error(`Invalid targetType: ${updateLikeDto.targetType}`);
    }
    if (!userId) {
      throw new Error('User not found');
    }
    return this.prisma.like.update({ where: { id }, data: {
      ...updateLikeDto,
      targetType: updateLikeDto.targetType as TargetType,
      targetId: Number(updateLikeDto.targetId),
      userId,
    } });
  }

  remove(id: number) {
    return this.prisma.like.delete({ where: { id } });
  }
}
