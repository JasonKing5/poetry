import { Injectable } from '@nestjs/common';
import { CreateLikeDto } from './dto/create-like.dto';
import { UpdateLikeDto } from './dto/update-like.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { TargetType } from '@prisma/client';

@Injectable()
export class LikeService {
  constructor(private readonly prisma: PrismaService) {}

  create(createLikeDto: CreateLikeDto, userId: number | undefined) {
    console.log(createLikeDto);
    console.log(userId);
    if (!Object.values(TargetType).includes(createLikeDto.targetType as TargetType)) {
      throw new Error(`Invalid targetType: ${createLikeDto.targetType}`);
    }
    if (!userId) {
      throw new Error('User not found');
    }
    return this.prisma.like.create({ data: {
      ...createLikeDto,
      targetType: createLikeDto.targetType as TargetType,
      targetId: Number(createLikeDto.targetId),
      userId,
    } });
  }

  findAll(targetType?: TargetType, targetId?: number, page: number = 1, pageSize: number = 20, userId?: number) {
    const where: Record<string, any> = {};
    if (targetType) where.targetType = targetType;
    if (targetId) where.targetId = targetId;
    if (userId) where.userId = userId;
    // 校正分页参数
    const take = Math.max(1, Math.min(pageSize, 100));
    const skip = Math.max(0, (page - 1) * take);
    return this.prisma.like.findMany({ where, skip, take, orderBy: { id: 'asc' } });
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
