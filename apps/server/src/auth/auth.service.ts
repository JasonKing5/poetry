import { Injectable } from '@nestjs/common';
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
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userService.create(email, hashedPassword, name);
    const roles = await this.userService.assignRole(user.id, [RoleEnum.USER]);
    return this.generateJwt(user, roles);
  }

  async login(email: string, password: string) {
    const user = await this.userService.findOneByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error('Invalid credentials');
    }
    const roles = await this.userService.getUserRoles(user.id);
    return this.generateJwt(user, roles);
  }

  private generateJwt(user: User, roles: any[]) {
    const payload: JwtPayload = {
      email: user.email,
      sub: user.id,
      roles: roles.map(r => r.name),
      permissions: roles.flatMap(r => r.permissions.map(p => p.name)),
    };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }
}
