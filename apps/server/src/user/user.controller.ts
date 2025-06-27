import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { PermissionEnum } from 'src/common/enums/permission.enum';
import { RoleEnum } from 'src/common/enums/role.enum';
import { Public } from 'src/common/decorators/public.decorator';


@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles(RoleEnum.ADMIN)
  @Permissions(PermissionEnum.CREATE_USER)
  async create(@Body() body: { email: string; password: string; name?: string }) {
    return await this.userService.create(body.email, body.password, body.name);
  }

  @Get()
  // @Roles(RoleEnum.ADMIN)
  // @Permissions(PermissionEnum.VIEW_USER)
  async findAll(@Query() query: { email?: string, name?: string }) {
    return await this.userService.findAll(query.email, query.name);
  }

  @Get(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.USER)
  @Permissions(PermissionEnum.VIEW_DETAIL_USER)
  async findOne(@Param('id') id: number) {
    return await this.userService.findOne(Number(id));
  }

  @Put(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.USER)
  @Permissions(PermissionEnum.UPDATE_USER)
  async update(@Param('id') id: number, @Body() body: { email?: string; name?: string }) {
    return await this.userService.update(Number(id), body.email, body.name);
  }

  @Delete(':id')
  @Roles(RoleEnum.ADMIN, RoleEnum.USER)
  @Permissions(PermissionEnum.DELETE_USER)
  async delete(@Param('id') id: number) {
    return await this.userService.delete(id);
  }
}
