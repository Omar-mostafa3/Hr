import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SystemRole } from '../../employee-profile/enums/employee-profile.enums';
import { ROLE_KEY } from '../Decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<SystemRole[]>(ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are required, allow access
    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // If user is not authenticated, deny access
    if (!user) {
      return false;
    }

    // Enhanced check: Handle users without roles or with empty roles array
    if (!user.roles || !Array.isArray(user.roles) || user.roles.length === 0) {
      // Log warning for debugging purposes
      console.warn(
        `User ${user.email || user.userId || 'unknown'} attempted access but has no roles`
      );
      return false;
    }

    // Check if user has at least one of the required roles
    const hasRequiredRole = requiredRoles.some((role) => user.roles.includes(role));

    if (!hasRequiredRole) {
      console.warn(
        `User with roles [${user.roles.join(
          ', '
        )}] lacks required roles [${requiredRoles.join(', ')}]`
      );
    }

    return hasRequiredRole;
  }
}
