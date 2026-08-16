import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * EventSource cannot send Authorization headers, so the SSE stream endpoint
 * accepts the JWT via a `token` query parameter (or the classic header).
 */
@Injectable()
export class SseAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    let token: string | undefined = req.query?.token as string | undefined;

    if (!token && req.headers?.authorization) {
      const parts = (req.headers.authorization as string).split(' ');
      if (parts.length === 2) token = parts[1];
    }

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = this.jwtService.verify(token) as {
        sub: number;
        username: string;
        role: number;
      };
      const user = await this.prisma.users.findUnique({
        where: { Id: payload.sub },
        select: {
          Id: true,
          FirstName: true,
          LastName: true,
          UserName: true,
          Email: true,
          Role_Id: true,
          IsActive: true,
          Avatar: true,
        },
      });
      if (!user || !user.IsActive) {
        throw new UnauthorizedException();
      }
      req.user = {
        id: user.Id,
        firstName: user.FirstName,
        lastName: user.LastName,
        userName: user.UserName,
        email: user.Email,
        roleId: user.Role_Id,
        avatar: user.Avatar,
      };
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
