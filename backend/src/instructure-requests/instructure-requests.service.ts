import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInstructorRequestDto } from './dto/create-instructor-request.dto';

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
}
