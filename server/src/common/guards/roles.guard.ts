import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  private logger = new Logger('RolesGuard');

  constructor(private reflector: Reflector) {}

  canActivate(context) {
    const requiredRoles = this.reflector.getAllAndOverride('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No roles required
    }
    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      this.logger.warn('RolesGuard: No user attached to request');
      throw new ForbiddenException('Access denied');
    }
    const hasRole = requiredRoles.some((role) => user.role === role);
    if (!hasRole) {
      this.logger.warn(`User ${user.email} with role ${user.role} attempted to access route requiring [${requiredRoles}]`);
      throw new ForbiddenException('Insufficient permissions');
    }
    return true;
  }
}