import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInstructorRequestDto } from './dto/create-instructor-request.dto';
import { GetInstructorRequestsDto } from './dto/get-instructor-requests.dto';

@Injectable()
export class InstructorRequestsService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: number,
    dto: CreateInstructorRequestDto,
    resume?: Express.Multer.File,
  ) {
    const existingRequest = await this.prisma.instructorRequests.findFirst({
      where: {
        User_Id: userId,
        Status: 'Pending',
      },
    });

    if (existingRequest) {
      throw new BadRequestException('شما در حال حاضر درخواست فعالی دارید .');
    }

    const resumeUrl = resume
      ? `/uploads/resumes/${resume.filename}`
      : (dto.resumeUrl ?? null);

    await this.prisma.instructorRequests.create({
      data: {
        User_Id: userId,
        Description: dto.description,
        ResumeUrl: resumeUrl,
      },
    });

    return {
      message: 'درخواست شما با موفقیت ارسال شد .',
    };
  }
  async approve(id: number) {
    const request = await this.prisma.instructorRequests.findUnique({
      where: { Id: id },
    });

    if (!request) {
      throw new NotFoundException('Instructor request not found.');
    }

    if (request.Status !== 'Pending') {
      throw new BadRequestException('Request is not pending.');
    }

    await this.prisma.$transaction([
      this.prisma.instructorRequests.update({
        where: { Id: id },
        data: {
          Status: 'Approved',
          ReviewedAt: new Date(),
        },
      }),
      this.prisma.users.update({
        where: { Id: request.User_Id },
        data: { Role_Id: 2 },
      }),
    ]);

    return { message: 'Request approved. User is now an instructor.' };
  }

  async reject(id: number) {
    const request = await this.prisma.instructorRequests.findUnique({
      where: { Id: id },
    });

    if (!request) {
      throw new NotFoundException('Instructor request not found.');
    }

    if (request.Status !== 'Pending') {
      throw new BadRequestException('Request is not pending.');
    }

    await this.prisma.instructorRequests.update({
      where: { Id: id },
      data: {
        Status: 'Rejected',
        ReviewedAt: new Date(),
      },
    });

    return { message: 'Request rejected.' };
  }
  async findAll(query: GetInstructorRequestsDto) {
    const page = Number(query.page) || 1;
    const pageSize = Number(query.pageSize) || 10;
    const status = query.status || 'Pending';
    const search = query.search?.trim();

    const where: any = {
      Status: status,
      ...(search
        ? {
            Users_InstructorRequests_User_IdToUsers: {
              OR: [
                { FirstName: { contains: search } },
                { LastName: { contains: search } },
                { UserName: { contains: search } },
                { Email: { contains: search } },
              ],
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.instructorRequests.findMany({
        where,
        orderBy: { CreatedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          Id: true,
          Status: true,
          Description: true,
          ResumeUrl: true,
          CreatedAt: true,
          Users_InstructorRequests_User_IdToUsers: {
            select: {
              Id: true,
              FirstName: true,
              LastName: true,
              UserName: true,
              Email: true,
              Avatar: true,
            },
          },
        },
      }),
      this.prisma.instructorRequests.count({ where }),
    ]);

    return {
      data: items.map((item) => ({
        RequestId: item.Id,
        Status: item.Status,
        Description: item.Description,
        ResumeUrl: item.ResumeUrl,
        CreatedAt: item.CreatedAt,
        User: item.Users_InstructorRequests_User_IdToUsers,
      })),
      total,
      page,
      pageSize,
    };
  }
}
