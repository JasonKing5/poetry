import { CanActivate, ExecutionContext, Injectable, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class RolesPermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector, private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const req = context.switchToHttp().getRequest();
    let user = req.user;
    if (!user) {
      let token = req.cookies?.token;
      if (!token) {
        const authHeader = req.headers['authorization'] || req.headers['Authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          throw new UnauthorizedException('Token is invalid or expired');
        }
        token = authHeader.replace('Bearer ', '').trim();
      }
      try {
        user = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
        req.user = user;
      } catch (e) {
        throw new UnauthorizedException('Token is invalid or expired');
      }
    }

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (requiredRoles && requiredRoles.length > 0) {
      const hasRole = user.roles?.some((role: any) => requiredRoles.includes(role));
      if (!hasRole) {
        throw new ForbiddenException('Insufficient role permissions.');
      }
    }

    if (requiredPermissions && requiredPermissions.length > 0) {
      const userPermissions = user.permissions || [];
      const hasPermission = requiredPermissions.every(p => userPermissions.includes(p));
      if (!hasPermission) {
        throw new ForbiddenException('Insufficient action permissions.');
      }
    }

    return true;
  }
}