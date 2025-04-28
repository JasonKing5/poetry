import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  async register(@Body() body: { email: string; password: string; name?: string }) {
    return await this.authService.register(body.email, body.password, body.name);
  }

  @Post('login')
  @Public()
  async login(@Body() body: { email: string; password: string }) {
    return await this.authService.login(body.email, body.password);
  }

  @Post('email/reset')
  @Public()
  async sendEmail(@Body() body: { email: string }) {
    return await this.authService.sendEmail(body.email)
  }

  @Post('reset')
  @Public()
  async resetPassword(@Body() body: { email: string, password: string, token: string }) {
    return  await this.authService.resetPassword(body.email, body.password, body.token)
  }
}
