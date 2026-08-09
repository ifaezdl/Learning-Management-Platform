import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LogoutDto } from './dto/logout.dto';
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}
  async register(registerDto: RegisterDto) {
    console.log(registerDto);
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const existingUser = await this.prisma.users.findFirst({
      where: {
        OR: [{ Email: registerDto.email }, { UserName: registerDto.userName }],
      },
    });
    if (existingUser) {
      throw new ConflictException('Email or Username already exists.');
    }
    console.log('test');
    const user = await this.prisma.users.create({
      data: {
        FirstName: registerDto.firstName,
        LastName: registerDto.lastName,
        UserName: registerDto.userName,
        Email: registerDto.email,
        Mobile: registerDto.mobile,
        PasswordHash: hashedPassword,
        Role_Id: 1,
      },
    });

    return {
      message: 'حساب کاربری با موفقیت ایجاد شد',
      user: {
        id: user.Id,
        firstName: user.FirstName,
        lastName: user.LastName,
        username: user.UserName,
        email: user.Email,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.users.findFirst({
      where: { UserName: loginDto.userName },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }
    if (!user.IsActive) {
      throw new UnauthorizedException('User account is inactive');
    }
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.PasswordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const payload = {
      sub: user.Id,
      username: user.UserName,
      role: user.Role_Id,
    };

    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = randomUUID();

    await this.prisma.refreshTokens.create({
      data: {
        User_Id: user.Id,
        Token: refreshToken,
        ExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.Id,
        firstName: user.FirstName,
        lastName: user.LastName,
        userName: user.UserName,
        email: user.Email,
        roleId: user.Role_Id,
      },
    };
  }
  async refresh(dto: RefreshTokenDto) {
    const token = await this.prisma.refreshTokens.findFirst({
      where: {
        Token: dto.refreshToken,
      },
    });

    if (!token) {
      throw new UnauthorizedException('Invalid refresh Token');
    }
    if (token.RevokedAt) {
      throw new UnauthorizedException('Refresh token revoked');
    }
    if (token.ExpiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }
    const user = await this.prisma.users.findUnique({
      where: {
        Id: token.User_Id,
      },
    });
    if (!user || !user.IsActive) {
      throw new UnauthorizedException();
    }

    await this.prisma.refreshTokens.update({
      where: { Id: token.Id },
      data: { RevokedAt: new Date() },
    });

    const payload = {
      sub: user.Id,
      username: user.UserName,
      role: user.Role_Id,
    };

    const accessToken = await this.jwtService.signAsync(payload);
    const newRefreshToken = randomUUID();

    await this.prisma.refreshTokens.create({
      data: {
        User_Id: user.Id,
        Token: newRefreshToken,
        ExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.Id,
        firstName: user.FirstName,
        lastName: user.LastName,
        userName: user.UserName,
        email: user.Email,
        roleId: user.Role_Id,
      },
    };
  }
  async logout(logoutDto: LogoutDto) {
    const token = await this.prisma.refreshTokens.findFirst({
      where: {
        Token: logoutDto.refreshToken,
      },
    });

    if (!token) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (token.RevokedAt) {
      throw new UnauthorizedException('Refresh token already revoked');
    }

    await this.prisma.refreshTokens.update({
      where: {
        Id: token.Id,
      },
      data: {
        RevokedAt: new Date(),
      },
    });

    return {
      message: 'Logout successful',
    };
  }
}
