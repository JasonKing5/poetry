import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query } from '@nestjs/common';
import { LikeService } from './like.service';
import { CreateLikeDto } from './dto/create-like.dto';
import { UpdateLikeDto } from './dto/update-like.dto';
import { Request } from 'express';
import { TargetType, User } from '@prisma/client';

@Controller('likes')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Post()
  create(@Body() createLikeDto: CreateLikeDto) {
    console.log('createLikeDto', createLikeDto);
    return this.likeService.create(createLikeDto);
  }

  @Get()
  findAll(@Query() query: { targetType?: string, targetId?: string, currentUser?: boolean, page?: number, pageSize?: number, userId?: number }) {
    let { page, pageSize, userId } = query;
    if (typeof page === 'string') page = parseInt(page, 10);
    if (typeof pageSize === 'string') pageSize = parseInt(pageSize, 10);
    if (typeof page !== 'number' || isNaN(page)) page = 1;
    if (typeof pageSize !== 'number' || isNaN(pageSize)) pageSize = 20;
    return this.likeService.findAll(query.targetType as TargetType, Number(query.targetId), Number(page), Number(pageSize), Number(userId));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.likeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLikeDto: UpdateLikeDto, @Query() query: { userId?: number }) {
    return this.likeService.update(+id, updateLikeDto, Number(query.userId));
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.likeService.remove(+id);
  }
}
