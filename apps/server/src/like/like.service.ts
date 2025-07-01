import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateLikeDto } from './dto/create-like.dto';
import { UpdateLikeDto } from './dto/update-like.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { TargetType } from '@prisma/client';

@Injectable()
export class LikeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createLikeDto: CreateLikeDto, userId: number) {
    console.log('like service createLikeDto', createLikeDto);
    
    // 验证 targetType 是否有效
    if (!Object.values(TargetType).includes(createLikeDto.targetType as TargetType)) {
      throw new BadRequestException(`Invalid targetType: ${createLikeDto.targetType}`);
    }

    // 验证用户是否存在
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
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
      case 'POEM':
        data.poetryId = targetId;
        break;
      case 'COLLECTION':
        data.collectionId = targetId;
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
      case 'POEM':
        where.poetryId = targetId;
        break;
      case 'COLLECTION':
        where.collectionId = targetId;
        break;
      case 'COMMENT':
        where.commentId = targetId;
        break;
    }

    return this.prisma.like.findFirst({ where });
  }

  private async validateTargetExists(targetType: TargetType, targetId: number) {
    switch (targetType) {
      case 'POEM':
        const poem = await this.prisma.poem.findUnique({
          where: { id: targetId },
        });
        if (!poem) {
          throw new NotFoundException('Poem not found');
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
      case 'COLLECTION':
        const collection = await this.prisma.collection.findUnique({
          where: { id: targetId },
        });
        if (!collection) {
          throw new NotFoundException('Collection not found');
        }
        break;
      default:
        throw new NotFoundException(`Unsupported target type: ${targetType}`);
    }
  }

  async findAll(targetType?: TargetType, targetId?: number, page: number = 1, pageSize: number = 20, userId?: number, currentUser?: boolean) {
    const skip = (page - 1) * pageSize;
    const where: any = {};
  
    if (targetType) {
      where.targetType = targetType;
      // 根据目标类型设置对应的 ID 字段
      if (targetId) {
        switch (targetType) {
          case 'POEM':
            where.poetryId = targetId;
            break;
          case 'COLLECTION':
            where.collectionId = targetId;
            break;
          case 'COMMENT':
            where.commentId = targetId;
            break;
        }
      }
    }
  
    if (!userId) {
      return {
        list: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0,
      };
    }

    if (currentUser) {
      where.userId = userId;
    }

    const [list, total] = await Promise.all([
      this.prisma.like.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          poem: {
            select: {
              id: true,
              title: true,
              authorId: true,
              dynasty: true,
              author: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.like.count({ where }),
    ]);
  
    return {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  findOne(id: number) {
    return this.prisma.like.findUnique({ where: { id } });
  }

  async update(id: number, updateLikeDto: UpdateLikeDto, userId: number | undefined) {
    if (!Object.values(TargetType).includes(updateLikeDto.targetType as TargetType)) {
      throw new Error(`Invalid targetType: ${updateLikeDto.targetType}`);
    }
    if (!userId) {
      throw new Error('User not found');
    }
  
    // Prepare the update data
    const updateData: any = {
      targetType: updateLikeDto.targetType as TargetType,
      userId,
    };
  
    // Set the appropriate ID field based on target type
    const targetId = Number(updateLikeDto.targetId);
    switch (updateLikeDto.targetType) {
      case 'POETRY':
        updateData.poetryId = targetId;
        break;
      case 'LIST':
        updateData.poetryListId = targetId;
        break;
      case 'COMMENT':
        updateData.commentId = targetId;
        break;
      default:
        throw new Error(`Unsupported target type: ${updateLikeDto.targetType}`);
    }
  
    // First, get the existing like to ensure it exists
    const existingLike = await this.prisma.like.findUnique({
      where: { id },
    });
  
    if (!existingLike) {
      throw new NotFoundException(`Like with ID ${id} not found`);
    }
  
    // Check if a like with the new target already exists
    const existingLikeForTarget = await this.findExistingLike(
      userId,
      updateData.targetType,
      targetId
    );
  
    if (existingLikeForTarget && existingLikeForTarget.id !== id) {
      throw new BadRequestException('You have already liked this target');
    }
  
    // Update the like
    return this.prisma.like.update({
      where: { id },
      data: updateData,
    });
  }

  remove(id: number) {
    return this.prisma.like.delete({ where: { id } });
  }
}
