import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Query, Request } from '@nestjs/common';
import { PoetryService } from './poetry.service';
import { Public } from 'src/common/decorators/public.decorator';
import { Dynasty, PoetrySource, PoetryStatus, PoetryType } from '@prisma/client';
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
    @Query() query: { 
      title?: string, 
      type?: PoetryType, 
      tags?: string[], 
      source?: string, 
      dynasty?: Dynasty, 
      submitter?: number, 
      author?: string, 
      status?: PoetryStatus, 
      page?: number | string, 
      pageSize?: number | string 
      currentUserId?: number
    },
    @Request() req: any
  ) {
    const { 
      title, 
      type, 
      tags, 
      source, 
      dynasty, 
      submitter, 
      author, 
      status, 
      page = 1, 
      pageSize = 20,
      currentUserId 
    } = query;

    // Parse pagination parameters
    const pageNum = typeof page === 'string' ? parseInt(page, 10) : page;
    const pageSizeNum = typeof pageSize === 'string' ? parseInt(pageSize, 10) : pageSize;
    
    return await this.poetryService.findAll(
      title, 
      type, 
      tags, 
      source, 
      dynasty, 
      submitter, 
      author, 
      status, 
      isNaN(pageNum) ? 1 : pageNum, 
      isNaN(pageSizeNum) ? 20 : Math.min(pageSizeNum, 100),
      Number(currentUserId)
    );
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
  async create(@Body() body: { title: string, authorId: number, type: PoetryType, tags: string[], source: PoetrySource, status: PoetryStatus, dynasty: Dynasty, submitterId: number }) {
    return await this.poetryService.create(body.title, Number(body.authorId), body.type, body.tags, body.source = PoetrySource.systemUser, body.status = PoetryStatus.pending, body.dynasty, Number(body.submitterId));
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
