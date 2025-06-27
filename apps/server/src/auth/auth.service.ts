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
    
    const user = await this.userService.create(email, password, name);
    await this.userService.assignRole(user.id, [RoleEnum.USER]);
    const roles = await this.userService.getUserRoles(user.id);
    const { password: dbPassword, ...reset } = user;
    return { user: reset, roles };
  }

  async login(email: string, password: string) {
    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }
    if (password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters');
    }

    const user = await this.userService.findOneByEmailWithPassword(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new BadRequestException('Email or password is incorrect');
    }
    const roles = await this.userService.getUserRoles(user.id);
    const { password: dbPassword, ...reset } = user;
    const userId = user.id;

    const accessToken = this.generateAccessToken(user.id, roles);
    const refreshToken = this.generateRefreshToken(user.id);

    return {
      user: reset,
      roles,
      accessToken,
      refreshToken,
    };
  }

  async demoLogin(email: string, password: string, expiresTime?: number) {
    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }
    if (password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters');
    }

    const user = await this.userService.findOneByEmailWithPassword(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new BadRequestException('Email or password is incorrect');
    }
    const roles = await this.userService.getUserRoles(user.id);
    const { password: dbPassword, ...reset } = user;
    const userId = user.id;

    const accessToken = this.generateAccessToken(user.id, roles, expiresTime);

    return {
      user: reset,
      roles,
      accessToken,
    };
  }

  async refresh(token: string) {
    if (!token) {
      throw new BadRequestException('No refresh token found');
    }
    const payload = this.jwtService.verify(token, {
      secret: process.env.JWT_REFRESH_SECRET,
    });
    const accessToken = this.generateAccessToken(payload.sub, []); // 这里你也可以重新查角色
    return {
      accessToken,
    };
  }

  async sendEmail(email: string) {
    if (!email) {
      throw new BadRequestException('Email is required');
    }
    console.log('sendEmail:', email)

    const user = await this.userService.findOneByEmail(email)
    console.log('sendEmail:', 2)
    if (!user) {
      console.log('sendEmail:', 3)
      throw new UnauthorizedException('User not found');
    }
    console.log('sendEmail:', 4)

    const roles = await this.userService.getUserRoles(user.id);
    const resetToken = this.generateAccessToken(user.id, roles);
    console.log('sendEmail:', 5)

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
    
    await this.userService.updatePassword(verifyUser.id, password);
  }

  private generateAccessToken(id: number, roles: any[], expiresTime?: number) {
    const payload: JwtPayload = {
      sub: id,
      roles: roles.map(r => r.name),
      permissions: roles.flatMap(r => r.rolePermissions.map(p => p.permission.name)),
    };
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: expiresTime ? expiresTime : '1m',
    });
  }
  
  private generateRefreshToken(id: number) {
    return this.jwtService.sign({ sub: id }, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });
  }
}
