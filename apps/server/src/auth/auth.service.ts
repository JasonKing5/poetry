import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './jwt.strategy';
import { RoleEnum } from '../common/enums/role.enum';
import { User } from 'generated/prisma';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(email: string, password: string, name?: string) {
    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }
    if (await this.userService.findOneByEmail(email)) {
      throw new BadRequestException('Email already exists');
    }
    if (name && name.length > 20) {
      throw new BadRequestException('Name must be less than 20 characters');
    }
    if (password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters');
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userService.create(email, hashedPassword, name);
    await this.userService.assignRole(user.id, [RoleEnum.USER]);
    const roles = await this.userService.getUserRoles(user.id);
    return this.generateJwt(user, roles);
  }

  async login(email: string, password: string) {
    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }
    if (password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters');
    }

    const user = await this.userService.findOneByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Email or password is incorrect');
    }
    const roles = await this.userService.getUserRoles(user.id);
    return this.generateJwt(user, roles);
  }

  private generateJwt(user: User, roles: any[]) {
    const payload: JwtPayload = {
      email: user.email,
      sub: user.id,
      roles: roles.map(r => r.name),
      permissions: roles.flatMap(r => r.rolePermissions.map(p => p.permission.name)),
    };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }
}
