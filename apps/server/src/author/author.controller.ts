import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { AuthorService } from './author.service';
import { Public } from 'src/common/decorators/public.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RoleEnum } from 'src/common/enums/role.enum';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { PermissionEnum } from 'src/common/enums/permission.enum';

@Controller('authors')
export class AuthorController {
  constructor(private readonly authorService: AuthorService) {}

  @Get()
  @Public()
  async findAll(@Query() query: { name?: string, page?: number, pageSize?: number, all?: boolean }) {
    let { name, page, pageSize, all } = query;
    if (typeof page === 'string') page = parseInt(page, 10);
    if (typeof pageSize === 'string') pageSize = parseInt(pageSize, 10);
    if (typeof page !== 'number' || isNaN(page)) page = 1;
    if (typeof pageSize !== 'number' || isNaN(pageSize)) pageSize = 18;
    return await this.authorService.findAll(name, page, pageSize, all);
  }

  @Get(':id')
  @Public()
  async findOne(@Param('id') id: number) {
    return await this.authorService.findOne(Number(id));
  }

  @Post()
  @Roles(RoleEnum.ADMIN, RoleEnum.USER)
  @Permissions(PermissionEnum.CREATE_AUTHOR)
  async create(@Body() body: { name: string, submitterId: number }) {
    return await this.authorService.create(body.name, body.submitterId);
  }

  @Put(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.USER)
  @Permissions(PermissionEnum.UPDATE_AUTHOR)
  async update(@Param('id') id: number, @Body() body: { name: string }) {
    return await this.authorService.update(id, body.name);
  }

  @Delete(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.USER)
  @Permissions(PermissionEnum.DELETE_AUTHOR)
  async delete(@Param('id') id: number) {
    return await this.authorService.delete(id);
  }
}
