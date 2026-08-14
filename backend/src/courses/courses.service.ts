import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { BrowseCoursesDto } from './dto/browsw-course.dto';
import { SaveLearningOutcomesDto } from './dto/save-learning-outcomes.dto';
import { SavePrerequisitesDto } from './dto/save-prerequisites.dto';
@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private async ensureUniqueSlug(slug: string): Promise<string> {
    const existing = await this.prisma.courses.findUnique({
      where: { Slug: slug },
    });
    if (existing) {
      return `${slug}-${Date.now()}`;
    }
    return slug;
  }

  private async verifyOwnership(courseId: number, userId: number) {
    const course = await this.prisma.courses.findUnique({
      where: { Id: courseId },
    });
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    if (course.Teacher_Id !== userId) {
      throw new ForbiddenException('You can only manage your own courses');
    }
    return course;
  }

  private courseInclude() {
    return {
      Category: true,
      Level: true,
    };
  }

  async create(dto: CreateCourseDto, userId: number) {
    const slug = await this.ensureUniqueSlug(this.generateSlug(dto.title));

    return this.prisma.courses.create({
      data: {
        Title: dto.title,
        ShortDescription: dto.shortDescription || null,
        Description: dto.description || null,
        Price: dto.price,
        DiscountPrice: dto.discountPrice || null,
        CategoryId: dto.categoryId,
        Level_Id: dto.levelId || null,
        DurationMinutes: dto.durationMinutes || null,
        Thumbnail: dto.thumbnail || null,
        Teacher_Id: userId,
        Slug: slug,
        IsPublished: false,
        AverageRating: 0,
      },
      include: this.courseInclude(),
    });
  }

  async findAll() {
    return this.prisma.courses.findMany({
      where: { IsPublished: true },
      include: {
        ...this.courseInclude(),
        Users: {
          select: {
            Id: true,
            FirstName: true,
            LastName: true,
          },
        },
      },
      orderBy: { CreatedAt: 'desc' },
    });
  }
  async browse(dto: BrowseCoursesDto) {
    let orderBy: any = {
      CreatedAt: 'desc',
    };

    switch (dto.sortBy) {
      case 'priceAsc':
        orderBy = { Price: 'asc' };
        break;

      case 'priceDesc':
        orderBy = { Price: 'desc' };
        break;

      case 'newest':
      default:
        orderBy = { CreatedAt: 'desc' };
        break;
    }

    const page = dto.page ?? 1;
    const pageSize = dto.pageSize ?? 12;

    const where: any = {
      IsPublished: true,
    };

    if (dto.search) {
      where.Title = {
        contains: dto.search,
        // mode: 'insensitive', // Uncomment if your Prisma/SQL Server version supports it
      };
    }

    if (dto.categoryId) {
      where.CategoryId = dto.categoryId;
    }

    if (dto.levelId) {
      where.Level_Id = dto.levelId;
    }

    const totalItems = await this.prisma.courses.count({
      where,
    });

    const courses = await this.prisma.courses.findMany({
      where,
      include: {
        ...this.courseInclude(),
        Users: {
          select: {
            Id: true,
            FirstName: true,
            LastName: true,
          },
        },
      },
      orderBy, // <-- Don't forget this comma
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      data: courses,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
      },
    };
  }
  async findByTeacher(teacherId: number) {
    return this.prisma.courses.findMany({
      where: { Teacher_Id: teacherId },
      orderBy: { CreatedAt: 'desc' },
      select: {
        Id: true,
        Title: true,
        Thumbnail: true,
        Price: true,
        DiscountPrice: true,
        IsPublished: true,
        CreatedAt: true,
        AverageRating: true,
        Slug: true,
        ShortDescription: true,
        Category: {
          select: {
            Id: true,
            Title: true,
          },
        },
        Level: {
          select: {
            Id: true,
            LevelName: true,
          },
        },
      },
    });
  }
  async findEnrolledByStudent(studentId: number) {
    const enrollments = await this.prisma.enrollments.findMany({
      where: { Student_Id: studentId },
      select: { Course_Id: true, EnrollmentDate: true, Status: true },
      orderBy: { EnrollmentDate: 'desc' },
    });

    if (enrollments.length === 0) {
      return [];
    }

    const courseIds = enrollments.map((e) => e.Course_Id);

    const courses = await this.prisma.courses.findMany({
      where: { Id: { in: courseIds } },
      include: {
        ...this.courseInclude(),
        Users: {
          select: {
            Id: true,
            FirstName: true,
            LastName: true,
          },
        },
      },
    });

    const enrollmentMap = new Map(enrollments.map((e) => [e.Course_Id, e]));

    // Preserve enrollment order (most recent first) rather than the
    // findMany's default ordering, since courses came back keyed by Id.
    return courseIds
      .map((id) => {
        const course = courses.find((c) => c.Id === id);
        const enrollment = enrollmentMap.get(id);
        return course
          ? {
              ...course,
              enrollmentDate: enrollment?.EnrollmentDate ?? null,
              enrollmentStatus: enrollment?.Status ?? null,
            }
          : null;
      })
      .filter(Boolean);
  }
  async findOne(id: number, userId?: number) {
    const course = await this.prisma.courses.findUnique({
      where: { Id: id },
      include: {
        ...this.courseInclude(),

        Users: {
          select: {
            Id: true,
            FirstName: true,
            LastName: true,
          },
        },

        CourseSections: {
          orderBy: {
            DisplayOrder: 'asc',
          },
          include: {
            Lessons: {
              orderBy: {
                SortOrder: 'asc',
              },
            },
          },
        },
        CourseLearningOutcomes: {
          orderBy: { DisplayOrder: 'asc' },
        },
        CoursePrequisties: {
          orderBy: { DisplayOrder: 'asc' },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    let isEnrolled = false;

    if (userId) {
      const enrollment = await this.prisma.enrollments.findFirst({
        where: {
          Course_Id: id,
          Student_Id: userId,
        },
      });
      isEnrolled = !!enrollment;
    }

    return {
      ...course,
      isEnrolled,
    };
  }

  async update(id: number, userId: number, dto: UpdateCourseDto) {
    await this.verifyOwnership(id, userId);

    const data: any = { UpdatedAt: new Date() };
    if (dto.title !== undefined) {
      data.Title = dto.title;
      data.Slug = await this.ensureUniqueSlug(this.generateSlug(dto.title));
    }
    if (dto.shortDescription !== undefined)
      data.ShortDescription = dto.shortDescription;
    if (dto.description !== undefined) data.Description = dto.description;
    if (dto.price !== undefined) data.Price = dto.price;
    if (dto.discountPrice !== undefined) data.DiscountPrice = dto.discountPrice;
    if (dto.categoryId !== undefined) data.CategoryId = dto.categoryId;
    if (dto.levelId !== undefined) data.Level_Id = dto.levelId;
    if (dto.durationMinutes !== undefined)
      data.DurationMinutes = dto.durationMinutes;
    if (dto.thumbnail !== undefined) data.Thumbnail = dto.thumbnail;

    return this.prisma.courses.update({
      where: { Id: id },
      data,
      include: this.courseInclude(),
    });
  }

  async remove(id: number, userId: number) {
    await this.verifyOwnership(id, userId);

    await this.prisma.courses.delete({ where: { Id: id } });
    return { message: 'Course deleted successfully' };
  }

  async publish(id: number, userId: number) {
    const course = await this.verifyOwnership(id, userId);

    if (course.IsPublished) {
      throw new BadRequestException('Course is already published');
    }

    const sectionCount = await this.prisma.courseSections.count({
      where: { Course_Id: id },
    });

    if (sectionCount === 0) {
      throw new BadRequestException(
        'Course must have at least one section to be published',
      );
    }

    const lessonCount = await this.prisma.lessons.count({
      where: { Course_Id: id },
    });

    if (lessonCount === 0) {
      throw new BadRequestException(
        'Course must have at least one lesson to be published',
      );
    }

    return this.prisma.courses.update({
      where: { Id: id },
      data: { IsPublished: true, UpdatedAt: new Date() },
      include: this.courseInclude(),
    });
  }
  async saveLearningOutcomes(courseId: number, dto: SaveLearningOutcomesDto) {
    const course = await this.prisma.courses.findUnique({
      where: {
        Id: courseId,
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    await this.prisma.courseLearningOutcomes.deleteMany({
      where: {
        Course_Id: courseId,
      },
    });

    const items = dto.items.map((x) => x.trim()).filter((x) => x.length > 0);

    if (items.length > 0) {
      await this.prisma.courseLearningOutcomes.createMany({
        data: items.map((title, index) => ({
          Course_Id: courseId,
          Title: title,
          DisplayOrder: index + 1,
        })),
      });
    }

    return this.getLearningOutcomes(courseId);
  }

  async getLearningOutcomes(courseId: number) {
    return this.prisma.courseLearningOutcomes.findMany({
      where: {
        Course_Id: courseId,
      },
      orderBy: {
        DisplayOrder: 'asc',
      },
    });
  }
  async savePrerequisites(courseId: number, dto: SavePrerequisitesDto) {
    const course = await this.prisma.courses.findUnique({
      where: {
        Id: courseId,
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    await this.prisma.coursePrequisties.deleteMany({
      where: {
        Course_ID: courseId,
      },
    });

    const items = dto.items.map((x) => x.trim()).filter((x) => x.length > 0);

    if (items.length > 0) {
      await this.prisma.coursePrequisties.createMany({
        data: items.map((title, index) => ({
          Course_ID: courseId,
          Title: title,
          DisplayOrder: index + 1,
        })),
      });
    }

    return this.getPrerequisites(courseId);
  }

  async getPrerequisites(courseId: number) {
    return this.prisma.coursePrequisties.findMany({
      where: {
        Course_ID: courseId,
      },
      orderBy: {
        DisplayOrder: 'asc',
      },
    });
  }

  async getInstructorStats(teacherId: number) {
    const [totalCourses, publishedCourses, enrollments] = await Promise.all([
      this.prisma.courses.count({
        where: { Teacher_Id: teacherId },
      }),
      this.prisma.courses.count({
        where: { Teacher_Id: teacherId, IsPublished: true },
      }),
      this.prisma.enrollments.findMany({
        where: {
          Courses: { Teacher_Id: teacherId },
        },
        select: { Student_Id: true },
      }),
    ]);

    const uniqueStudents = new Set(enrollments.map((e) => e.Student_Id));

    return {
      totalStudents: uniqueStudents.size,
      publishedCourses,
      totalCourses,
    };
  }
}
