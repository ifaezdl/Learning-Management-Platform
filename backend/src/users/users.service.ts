import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { unlink } from 'fs/promises';
import { join } from 'path';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

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
        Mobile: true,
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
      Mobile: user.Mobile,
      Role_Id: user.Role_Id,
      IsActive: user.IsActive,
      CreatedAt: user.CreatedAt,
      RequestId:
        user.InstructorRequests_InstructorRequests_User_IdToUsers[0]?.Id ??
        null,
      RequestStatus:
        user.InstructorRequests_InstructorRequests_User_IdToUsers[0]?.Status ??
        null,
    }));
  }

  async createUser(dto: CreateUserDto) {
    const existing = await this.prisma.users.findFirst({
      where: {
        OR: [
          { Email: dto.email },
          { UserName: dto.userName },
          { Mobile: dto.mobile },
        ],
      },
    });

    if (existing) {
      throw new ConflictException(
        'ایمیل، نام کاربری یا شماره موبایل قبلاً ثبت شده است.',
      );
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.users.create({
      data: {
        FirstName: dto.firstName,
        LastName: dto.lastName,
        UserName: dto.userName,
        Email: dto.email,
        Mobile: dto.mobile,
        PasswordHash: hashedPassword,
        Role_Id: dto.roleId,
      },
      select: {
        Id: true,
        FirstName: true,
        LastName: true,
        UserName: true,
        Email: true,
        Mobile: true,
        Role_Id: true,
        IsActive: true,
        CreatedAt: true,
      },
    });

    return {
      message: 'کاربر با موفقیت ایجاد شد',
      user,
    };
  }

  async updateUser(id: number, dto: UpdateUserDto) {
    const user = await this.prisma.users.findUnique({ where: { Id: id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const duplicate = await this.prisma.users.findFirst({
      where: {
        Id: { not: id },
        OR: [
          dto.email ? { Email: dto.email } : undefined,
          dto.userName ? { UserName: dto.userName } : undefined,
          dto.mobile ? { Mobile: dto.mobile } : undefined,
        ].filter(Boolean) as any,
      },
    });

    if (duplicate) {
      throw new ConflictException(
        'ایمیل، نام کاربری یا شماره موبایل قبلاً ثبت شده است.',
      );
    }

    const data: Prisma.UsersUpdateInput = {
      FirstName: dto.firstName,
      LastName: dto.lastName,
      UserName: dto.userName,
      Email: dto.email,
      Mobile: dto.mobile,
      Roles: dto.roleId ? { connect: { Id: dto.roleId } } : undefined,
      IsActive: dto.isActive,
      UpdatedAt: new Date(),
    };

    if (dto.password) {
      data.PasswordHash = await bcrypt.hash(dto.password, 10);
    }

    const updated = await this.prisma.users.update({
      where: { Id: id },
      data,
      select: {
        Id: true,
        FirstName: true,
        LastName: true,
        UserName: true,
        Email: true,
        Mobile: true,
        Role_Id: true,
        IsActive: true,
        CreatedAt: true,
      },
    });

    return {
      message: 'اطلاعات کاربر با موفقیت به‌روزرسانی شد',
      user: updated,
    };
  }

  async removeUser(id: number) {
    const user = await this.prisma.users.findUnique({ where: { Id: id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // پاک‌سازی داده‌های وابسته‌ای که متعلق به خود کاربر است
    await this.prisma.refreshTokens.deleteMany({ where: { User_Id: id } });
    await this.prisma.carts.deleteMany({ where: { User_Id: id } });

    try {
      await this.prisma.users.delete({ where: { Id: id } });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2003'
      ) {
        throw new BadRequestException(
          'امکان حذف کاربر وجود ندارد؛ این کاربر دارای سوابق آموزشی، خرید یا گواهی است.',
        );
      }
      throw err;
    }

    return {
      message: 'کاربر با موفقیت حذف شد',
    };
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
  async updateAvatar(userId: number, file: Express.Multer.File) {
    if (!file) {
      throw new NotFoundException('Avatar file not provided');
    }

    const avatarPath = `/uploads/profile/${userId}/${file.filename}`;

    const updatedUser = await this.prisma.users.update({
      where: {
        Id: userId,
      },
      data: {
        Avatar: avatarPath,
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
      message: 'Avatar uploaded successfully.',
      user: updatedUser,
    };
  }

  async deleteAvatar(userId: number) {
    const user = await this.prisma.users.findUnique({
      where: { Id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.Avatar) {
      throw new NotFoundException('No avatar to delete');
    }

    // user.Avatar is stored like "/uploads/profile/1026/avatar-....jpg"
    const filePath = join(process.cwd(), user.Avatar);

    try {
      await unlink(filePath);
    } catch (err) {
      // اگر فایل روی دیسک وجود نداشت، صرفاً ادامه بده و رکورد دیتابیس را پاک کن
      console.warn(`Could not delete avatar file: ${filePath}`, err.message);
    }

    const updatedUser = await this.prisma.users.update({
      where: { Id: userId },
      data: {
        Avatar: null,
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
      message: 'Avatar deleted successfully.',
      user: updatedUser,
    };
  }
}
