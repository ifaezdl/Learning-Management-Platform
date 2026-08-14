import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { UpdateLessonProgressDto } from './dto/update-lesson-progress.dto';

@Injectable()
export class LessonsService {
  constructor(private prisma: PrismaService) {}

  private async verifySectionOwnership(sectionId: number, userId: number) {
    const section = await this.prisma.courseSections.findUnique({
      where: { Id: sectionId },
      include: { Courses: true },
    });
    if (!section) {
      throw new NotFoundException('Section not found');
    }
    if (section.Courses.Teacher_Id !== userId) {
      throw new ForbiddenException('You can only manage your own lessons');
    }
    return section;
  }

  private async verifyLessonOwnership(lessonId: number, userId: number) {
    const lesson = await this.prisma.lessons.findUnique({
      where: { Id: lessonId },
      include: { Courses: true },
    });
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }
    if (lesson.Courses.Teacher_Id !== userId) {
      throw new ForbiddenException('You can only manage your own lessons');
    }
    return lesson;
  }

  async create(sectionId: number, userId: number, dto: CreateLessonDto) {
    const section = await this.verifySectionOwnership(sectionId, userId);

    const maxOrder = await this.prisma.lessons.findFirst({
      where: { Section_Id: sectionId },
      orderBy: { SortOrder: 'desc' },
      select: { SortOrder: true },
    });

    const sortOrder = dto.displayOrder ?? (maxOrder?.SortOrder ?? 0) + 1;

    return this.prisma.lessons.create({
      data: {
        Title: dto.title,
        Description: dto.description || null,
        VideoUrl: dto.videoUrl || null,
        VideoType: dto.videoType,
        DurationMinutes: dto.durationMinutes || null,
        SortOrder: sortOrder,
        IsFreePreview: dto.isFreePreview ?? false,
        Course_Id: section.Course_Id,
        Section_Id: sectionId,
      },
      include: {
        LessonFiles: true,
      },
    });
  }

  async findBySection(sectionId: number) {
    const section = await this.prisma.courseSections.findUnique({
      where: { Id: sectionId },
    });
    if (!section) {
      throw new NotFoundException('Section not found');
    }

    return this.prisma.lessons.findMany({
      where: { Section_Id: sectionId },
      orderBy: { SortOrder: 'asc' },
      include: {
        LessonFiles: true,
      },
    });
  }

  async update(id: number, userId: number, dto: UpdateLessonDto) {
    await this.verifyLessonOwnership(id, userId);

    const data: any = {};

    if (dto.title !== undefined) data.Title = dto.title;
    if (dto.description !== undefined) data.Description = dto.description;
    if (dto.videoUrl !== undefined) data.VideoUrl = dto.videoUrl;
    if (dto.videoType !== undefined) data.VideoType = dto.videoType;
    if (dto.durationMinutes !== undefined)
      data.DurationMinutes = dto.durationMinutes;
    if (dto.displayOrder !== undefined) data.SortOrder = dto.displayOrder;
    if (dto.isFreePreview !== undefined) data.IsFreePreview = dto.isFreePreview;

    return this.prisma.lessons.update({
      where: { Id: id },
      data,
      include: {
        LessonFiles: true,
      },
    });
  }

  async remove(id: number, userId: number) {
    await this.verifyLessonOwnership(id, userId);

    await this.prisma.lessons.delete({ where: { Id: id } });
    return { message: 'Lesson deleted successfully' };
  }
  async findOne(id: number) {
    const lesson = await this.prisma.lessons.findUnique({
      where: { Id: id },
      include: {
        LessonFiles: true,
      },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    return lesson;
  }
  async updateProgress(
    lessonId: number,
    userId: number,
    dto: UpdateLessonProgressDto,
  ) {
    const lesson = await this.prisma.lessons.findUnique({
      where: { Id: lessonId },
    });
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    return this.prisma.courseProgress.upsert({
      where: {
        Lesson_Id_Student_Id: {
          Lesson_Id: lessonId,
          Student_Id: userId,
        },
      },
      update: {
        IsCompleted: dto.isCompleted,
        CompletedAt: dto.isCompleted ? new Date() : null,
      },
      create: {
        Course_Id: lesson.Course_Id,
        Lesson_Id: lessonId,
        Student_Id: userId,
        IsCompleted: dto.isCompleted,
        CompletedAt: dto.isCompleted ? new Date() : null,
      },
    });
  }
}
