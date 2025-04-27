import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesPermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('No user found in request.');
    }

    if (requiredRoles && requiredRoles.length > 0) {
      const hasRole = user.roles?.some((role: any) => requiredRoles.includes(role.name));
      if (!hasRole) {
        throw new ForbiddenException('Insufficient role permissions.');
      }
    }

    if (requiredPermissions && requiredPermissions.length > 0) {
      const userPermissions = user.roles?.flatMap((role: any) => role.permissions?.map((p: any) => p.name)) || [];
      const hasPermission = requiredPermissions.every(p => userPermissions.includes(p));
      if (!hasPermission) {
        throw new ForbiddenException('Insufficient action permissions.');
      }
    }

    return true;
  }
}