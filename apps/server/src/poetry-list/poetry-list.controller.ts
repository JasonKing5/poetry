import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Request } from '@nestjs/common';
import { PoetryListService } from './poetry-list.service';
import { CreatePoetryListDto } from './dto/create-poetry-list.dto';
import { UpdatePoetryListDto } from './dto/update-poetry-list.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { PermissionEnum } from 'src/common/enums/permission.enum';
import { RoleEnum } from 'src/common/enums/role.enum';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('poetry-list')
export class PoetryListController {
  constructor(private readonly poetryListService: PoetryListService) {}

  @Post()
  @Roles(RoleEnum.ADMIN, RoleEnum.USER)
  @Permissions(PermissionEnum.CREATE_POETRY_LIST)
  async create(@Body() createPoetryListDto: CreatePoetryListDto) {
    return await this.poetryListService.create(createPoetryListDto);
  }

  @Get()
  @Public()
  async findAll(@Query() query: { page?: number, pageSize?: number, title?: string }, @Request() req: any) {
    const { 
      title, 
      page = 1, 
      pageSize = 20,
    } = query;
    // Parse pagination parameters
    const pageNum = typeof page === 'string' ? parseInt(page, 10) : page;
    const pageSizeNum = typeof pageSize === 'string' ? parseInt(pageSize, 10) : pageSize;
    return await this.poetryListService.findAll(isNaN(pageNum) ? 1 : pageNum, isNaN(pageSizeNum) ? 20 : Math.min(pageSizeNum, 100), title, req.user?.id);
  }

  @Get(':id')
  @Public()
  async findOne(@Param('id') id: string) {
    return await this.poetryListService.findOne(+id);
  }

  @Patch(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.USER)
  @Permissions(PermissionEnum.UPDATE_POETRY_LIST)
  async update(@Param('id') id: string, @Body() updatePoetryListDto: UpdatePoetryListDto) {
    return await this.poetryListService.update(+id, updatePoetryListDto);
  }

  @Delete(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.USER)
  @Permissions(PermissionEnum.DELETE_POETRY_LIST)
  async remove(@Param('id') id: string) {
    return await this.poetryListService.remove(+id);
  }
}
