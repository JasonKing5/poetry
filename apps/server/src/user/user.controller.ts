import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RoleEnum } from 'src/common/enums/role.enum';


@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles(RoleEnum.ADMIN)
  async create(@Body() body: { email: string; password: string; name?: string }) {
    return await this.userService.create(body.email, body.password, body.name);
  }

  @Get('/email/:email')
  @Roles(RoleEnum.ADMIN)
  async findOneByEmail(@Param('email') email: string) {
    return await this.userService.findOneByEmail(email);
  }

  @Get()
  @Roles(RoleEnum.ADMIN)
  async findAll(@Query() query: { email?: string, name?: string }) {
    return await this.userService.findAll(query.email, query.name);
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.userService.findOne(Number(id));
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() body: { email?: string; password?: string; name?: string }) {
    return await this.userService.update(Number(id), body.email, body.password, body.name);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return await this.userService.delete(id);
  }
}
