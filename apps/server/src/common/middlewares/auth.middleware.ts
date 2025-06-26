// src/common/middlewares/auth.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies['token'];
    if (token) {
      try {
        const payload = await this.jwtService.verifyAsync(token);
        req['user'] = { id: payload.sub, roles: payload.roles };
      } catch (e) {
        console.log('auth.middleware:', e);
      }
    }
    
    next();
  }
}