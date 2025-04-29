import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { AuthorService } from './author.service';
import { Public } from 'src/common/decorators/public.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RoleEnum } from 'src/common/enums/role.enum';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { PermissionEnum } from 'src/common/enums/permission.enum';

@Controller('author')
export class AuthorController {
  constructor(private readonly authorService: AuthorService) {}

  @Get()
  @Public()
  async findAll() {
    return await this.authorService.findAll();
  }

  @Get(':id')
  @Public()
  async findOne(@Param('id') id: number) {
    return await this.authorService.findOne(Number(id));
  }

  @Post()
  @Roles(RoleEnum.ADMIN, RoleEnum.USER)
  @Permissions(PermissionEnum.CREATE_AUTHOR)
  async create(@Body() body: { name: string }) {
    return await this.authorService.create(body.name);
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
