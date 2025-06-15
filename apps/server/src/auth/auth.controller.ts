import { Controller, Post, Body, Res, Req, Put, Get } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express'
import { AuthService } from './auth.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('register')
  @Public()
  async register(@Body() body: { email: string; password: string; name?: string }) {
    return await this.authService.register(body.email, body.password, body.name);
  }

  @Post('login')
  @Public()
  async login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) res: Response
  ) {
    const { user, roles, accessToken, refreshToken } = await this.authService.login(body.email, body.password);

    res.cookie('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 15, // 15 min
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 天
    });

    return {
      user,
      roles,
    };
  }

  @Post('demo/login')
  @Public()
  async demoLogin(
    @Body() body: { email: string; password: string, expiresTime?: number },
    @Res({ passthrough: true }) res: Response
  ) {
    const { user, roles, accessToken } = await this.authService.demoLogin(body.email, body.password, body.expiresTime);

    return {
      token: accessToken,
      user,
      roles,
    };
  }

  @Post('refresh')
  @Public()
  async refreshToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies['refreshToken'];
    const { accessToken } = await this.authService.refresh(token)
    res.cookie('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 15, // 15 min
    });
  }

  @Post('reset/email')
  @Public()
  async sendEmail(@Body() body: { email: string }) {
    return await this.authService.sendEmail(body.email)
  }

  @Put('reset/password')
  @Public()
  async resetPassword(@Body() body: { email: string, password: string, token: string }) {
    return  await this.authService.resetPassword(body.email, body.password, body.token)
  }
}
