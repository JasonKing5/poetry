import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { PoetryService } from './poetry.service';
import { Public } from 'src/common/decorators/public.decorator';
import { Dynasty, PoetryType } from '@prisma/client';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RoleEnum } from 'src/common/enums/role.enum';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { PermissionEnum } from 'src/common/enums/permission.enum';

@Controller('poetry')
export class PoetryController {
  constructor(private readonly poetryService: PoetryService) {}

  @Get()
  @Public()
  async findAll(
    @Query() query: { title?: string, author?: string, type?: string, tags?: string[], page?: number, pageSize?: number }
  ) {
    let { title, author, type, tags, page, pageSize } = query;
    if (typeof page === 'string') page = parseInt(page, 10);
    if (typeof pageSize === 'string') pageSize = parseInt(pageSize, 10);
    if (typeof page !== 'number' || isNaN(page)) page = 1;
    if (typeof pageSize !== 'number' || isNaN(pageSize)) pageSize = 20;
    return await this.poetryService.findAll(title, author, type, tags, page, pageSize);
  }

  @Get('/:id')
  @Public()
  async findOne(@Param('id') id: number) {
    if (!id) {
      throw new BadRequestException('ID is required');
    }
    if (isNaN(Number(id))) {
      throw new BadRequestException('Invalid ID');
    }
    return await this.poetryService.findOne(Number(id));
  }

  @Post()
  @Roles(RoleEnum.ADMIN, RoleEnum.USER)
  @Permissions(PermissionEnum.CREATE_POETRY)
  async create(@Body() body: { title: string, authorId: number, type: PoetryType, tags: string[], dynasty: Dynasty }) {
    return await this.poetryService.create(body.title, Number(body.authorId), body.type, body.tags, body.dynasty);
  }

  @Put(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.USER)
  @Permissions(PermissionEnum.UPDATE_POETRY)
  async update(@Param('id') id: number, @Body() body: { title: string, authorId: number, tags: string[], dynasty: Dynasty }) {
    return await this.poetryService.update(id, body.title, Number(body.authorId), body.tags);
  }

  @Delete(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.USER)
  @Permissions(PermissionEnum.DELETE_POETRY)
  async delete(@Param('id') id: number) {
    return await this.poetryService.delete(id);
  }
}
