import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async findById(id: number) {
    const user = await this.prisma.users.findUnique({
      where: { Id: id },
      select: {
        Id: true,
        FirstName: true,
        LastName: true,
        UserName: true,
        Email: true,
        Mobile: true,
        Role_Id: true,
        Sex_Id: true,
        IsActive: true,
        Avatar: true,
        CreatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
  //Sex_Id needed to be adedd on Model
  async findAll() {
    const users = await this.prisma.users.findMany({
      select: {
        Id: true,
        FirstName: true,
        LastName: true,
        UserName: true,
        Email: true,
        Role_Id: true,
        IsActive: true,
        CreatedAt: true,
        InstructorRequests_InstructorRequests_User_IdToUsers: {
          orderBy: { CreatedAt: 'desc' },
          take: 1,
          select: {
            Id: true,
            Status: true,
          },
        },
      },
    });

    return users.map((user) => ({
      Id: user.Id,
      FirstName: user.FirstName,
      LastName: user.LastName,
      UserName: user.UserName,
      Email: user.Email,
      Role_Id: user.Role_Id,
      IsActive: user.IsActive,
      CreatedAt: user.CreatedAt,
      RequestId: user.InstructorRequests_InstructorRequests_User_IdToUsers[0]?.Id ?? null,
      RequestStatus: user.InstructorRequests_InstructorRequests_User_IdToUsers[0]?.Status ?? null,
    }));
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const user = await this.prisma.users.findUnique({
      where: {
        Id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const duplicate = await this.prisma.users.findFirst({
      where: {
        Id: {
          not: userId,
        },
        OR: [
          dto.userName
            ? {
              UserName: dto.userName,
            }
            : undefined,

          dto.email
            ? {
              Email: dto.email,
            }
            : undefined,

          dto.mobile
            ? {
              Mobile: dto.mobile,
            }
            : undefined,
        ].filter(Boolean) as any,
      },
    });

    if (duplicate) {
      throw new ConflictException('Username, Email or Mobile already exists.');
    }

    const updatedUser = await this.prisma.users.update({
      where: {
        Id: userId,
      },
      data: {
        FirstName: dto.firstName,
        LastName: dto.lastName,
        UserName: dto.userName,
        Email: dto.email,
        Mobile: dto.mobile,
        Sex_Id: dto.sexId,
        Avatar: dto.avatar,
        UpdatedAt: new Date(),
      },
      select: {
        Id: true,
        FirstName: true,
        LastName: true,
        UserName: true,
        Email: true,
        Mobile: true,
        Avatar: true,
        Sex_Id: true,
        Role_Id: true,
      },
    });

    return {
      message: 'Profile updated successfully.',
      user: updatedUser,
    };
  }
  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.prisma.users.findUnique({
      where: {
        Id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordCorrect = await bcrypt.compare(
      dto.currentPassword,
      user.PasswordHash,
    );

    if (!isPasswordCorrect) {
      throw new UnauthorizedException('Current password is incorrect.');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.users.update({
      where: {
        Id: userId,
      },
      data: {
        PasswordHash: hashedPassword,
        UpdatedAt: new Date(),
      },
    });

    return {
      message: 'Password changed successfully.',
    };
  }
}
