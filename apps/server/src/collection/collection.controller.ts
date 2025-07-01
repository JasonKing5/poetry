import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Request } from '@nestjs/common';
import { CollectionService } from './collection.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { PermissionEnum } from 'src/common/enums/permission.enum';
import { RoleEnum } from 'src/common/enums/role.enum';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('collection')
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @Post()
  @Roles(RoleEnum.ADMIN, RoleEnum.USER)
  @Permissions(PermissionEnum.CREATE_POETRY_LIST)
  async create(@Body() createCollectionDto: CreateCollectionDto) {
    return await this.collectionService.create(createCollectionDto);
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
    return await this.collectionService.findAll(isNaN(pageNum) ? 1 : pageNum, isNaN(pageSizeNum) ? 20 : Math.min(pageSizeNum, 100), title, req.user?.id);
  }

  @Get(':id')
  @Public()
  async findOne(@Param('id') id: string) {
    return await this.collectionService.findOne(+id);
  }

  @Patch(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.USER)
  @Permissions(PermissionEnum.UPDATE_POETRY_LIST)
  async update(@Param('id') id: string, @Body() updateCollectionDto: UpdateCollectionDto) {
    return await this.collectionService.update(+id, updateCollectionDto);
  }

  @Delete(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.USER)
  @Permissions(PermissionEnum.DELETE_POETRY_LIST)
  async remove(@Param('id') id: string) {
    return await this.collectionService.remove(+id);
  }
}
