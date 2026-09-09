import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<number[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    const roleId = Number(user?.roleId ?? user?.role);

    if (!Number.isInteger(roleId) || !requiredRoles.includes(roleId)) {
      throw new ForbiddenException(
        'نقش حساب کاربری شما اجازه دسترسی به این بخش را نمی‌دهد.',
      );
    }

    return true;
  }
}
