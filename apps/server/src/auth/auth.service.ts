import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './jwt.strategy';
import { RoleEnum } from '../common/enums/role.enum';
import { User } from 'generated/prisma';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async register(email: string, password: string, name?: string) {
    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }
    if (email && email.length > 100) {
      throw new BadRequestException('Email must be less than 100 characters')
    }
    if (name && name.length > 20) {
      throw new BadRequestException('Name must be less than 20 characters');
    }
    if (password.length > 20) {
      throw new BadRequestException('Password must less than 20 characters');
    }
    if (password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters');
    }
    if (await this.userService.findOneByEmail(email)) {
      throw new BadRequestException('Email already exists');
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userService.create(email, hashedPassword, name);
    await this.userService.assignRole(user.id, [RoleEnum.USER]);
    const roles = await this.userService.getUserRoles(user.id);
    const { password: dbPassword, ...reset } = user;
    return { ...reset, roles };
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
    const { password: dbPassword, ...reset } = user;
    const userId = user.id;
    return {
      user: reset,
      accessToken: this.generateJwt(userId, roles)
    };
  }

  async sendEmail(email: string) {
    if (!email) {
      throw new BadRequestException('Email and password are required');
    }

    const user = await this.userService.findOneByEmail(email)
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const roles = await this.userService.getUserRoles(user.id);
    const resetToken = this.generateJwt(user.id, roles);

    return await this.mailService.sendResetPasswordEmail(email, resetToken)
  }

  async resetPassword(email: string, password: string, token: string) {
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    
    const decoded = this.jwtService.verify(token)
    const verifyUser = await this.userService.findOne(decoded.id);
    if (!verifyUser) {
      throw new UnauthorizedException('Token is invalid or expired')
    }
    
    await this.userService.update(user.id, user.email, password, user.name as string | undefined);
  }

  private generateJwt(id: number, roles: any[]) {
    const payload: JwtPayload = {
      sub: id,
      roles: roles.map(r => r.name),
      permissions: roles.flatMap(r => r.rolePermissions.map(p => p.permission.name)),
    };
    const accessToken = this.jwtService.sign(payload);
    return accessToken;
  }
}
