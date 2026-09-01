import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto, UpdateReviewDto } from './dto/review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  /**
   * ایجاد نظر جدید برای یک دوره
   * فقط دانشجویانی که دوره را خریداری کرده‌اند می‌توانند نظر بدهند
   */
  async createReview(
    studentId: number,
    courseId: number,
    dto: CreateReviewDto,
  ) {
    // بررسی اینکه دانشجو این دوره را خریداری کرده
    const enrollment = await this.prisma.enrollments.findFirst({
      where: {
        Student_Id: studentId,
        Course_Id: courseId,
      },
    });

    if (!enrollment) {
      throw new BadRequestException('شما این دوره را خریداری نکرده‌اید');
    }

    // بررسی اینکه آیا قبلاً نظری ثبت کرده
    const existingReview = await this.prisma.reviews.findFirst({
      where: {
        User_Id: studentId,
        Course_Id: courseId,
      },
    });

    if (existingReview) {
      throw new BadRequestException('شما قبلاً برای این دوره نظر داده‌اید');
    }

    // اعتبارسنجی رتینگ
    if (dto.Rating < 1 || dto.Rating > 5) {
      throw new BadRequestException('رتینگ باید بین ۱ تا ۵ باشد');
    }

    // ایجاد نظر
    const review = await this.prisma.reviews.create({
      data: {
        User_Id: studentId,
        Course_Id: courseId,
        Rating: dto.Rating,
        Comment: dto.Comment || null,
        IsApproved: true, // پیش‌فرض: تایید شده (می‌تونید اینو تغیر بدی)
      },
      include: {
        Users: {
          select: {
            Id: true,
            FirstName: true,
            LastName: true,
            Avatar: true,
          },
        },
      },
    });

    // به‌روزرسانی میانگین رتینگ دوره
    await this.updateCourseAverageRating(courseId);

    return this.formatReviewResponse(review);
  }

  /**
   * ویرایش نظر موجود
   * فقط نویسندهٔ نظر می‌تواند ویرایش کند
   */
  async updateReview(
    studentId: number,
    reviewId: number,
    dto: UpdateReviewDto,
  ) {
    // یافتن نظر
    const review = await this.prisma.reviews.findUnique({
      where: { Id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('نظر یافت نشد');
    }

    // بررسی مالکیت
    if (review.User_Id !== studentId) {
      throw new ForbiddenException('شما این نظر را ویرایش نمی‌توانید');
    }

    // اعتبارسنجی رتینگ
    if (dto.Rating && (dto.Rating < 1 || dto.Rating > 5)) {
      throw new BadRequestException('رتینگ باید بین ۱ تا ۵ باشد');
    }

    // ویرایش نظر
    const updatedReview = await this.prisma.reviews.update({
      where: { Id: reviewId },
      data: {
        Rating: dto.Rating ?? review.Rating,
        Comment: dto.Comment !== undefined ? dto.Comment : review.Comment,
      },
      include: {
        Users: {
          select: {
            Id: true,
            FirstName: true,
            LastName: true,
            Avatar: true,
          },
        },
      },
    });

    // به‌روزرسانی میانگین رتینگ دوره
    await this.updateCourseAverageRating(review.Course_Id);

    return this.formatReviewResponse(updatedReview);
  }

  /**
   * حذف نظر
   * فقط نویسندهٔ نظر می‌تواند حذف کند
   */
  async deleteReview(studentId: number, reviewId: number) {
    // یافتن نظر
    const review = await this.prisma.reviews.findUnique({
      where: { Id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('نظر یافت نشد');
    }

    // بررسی مالکیت
    if (review.User_Id !== studentId) {
      throw new ForbiddenException('شما این نظر را حذف نمی‌توانید');
    }

    const courseId = review.Course_Id;

    // حذف نظر
    await this.prisma.reviews.delete({
      where: { Id: reviewId },
    });

    // به‌روزرسانی میانگین رتینگ دوره
    await this.updateCourseAverageRating(courseId);

    return { message: 'نظر با موفقیت حذف شد' };
  }

  /**
   * نمایش تمام نظرات یک دوره (تایید‌شده)
   */
  async getCourseReviews(courseId: number, page = 1, pageSize = 10) {
    // بررسی وجود دوره
    const course = await this.prisma.courses.findUnique({
      where: { Id: courseId },
    });

    if (!course) {
      throw new NotFoundException('دوره یافت نشد');
    }

    const skip = (page - 1) * pageSize;

    // دریافت نظرات تایید‌شدهٔ دوره
    const reviews = await this.prisma.reviews.findMany({
      where: {
        Course_Id: courseId,
        IsApproved: true,
      },
      include: {
        Users: {
          select: {
            Id: true,
            FirstName: true,
            LastName: true,
            Avatar: true,
          },
        },
      },
      orderBy: { CreatedAt: 'desc' },
      skip,
      take: pageSize,
    });

    const total = await this.prisma.reviews.count({
      where: {
        Course_Id: courseId,
        IsApproved: true,
      },
    });

    return {
      reviews: reviews.map((r) => this.formatReviewResponse(r)),
      pagination: {
        page,
        pageSize,
        total,
        pages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * نمایش نظرات خود دانشجو برای یک دوره
   */
  async getMyReview(studentId: number, courseId: number) {
    const review = await this.prisma.reviews.findFirst({
      where: {
        User_Id: studentId,
        Course_Id: courseId,
      },
      include: {
        Users: {
          select: {
            Id: true,
            FirstName: true,
            LastName: true,
            Avatar: true,
          },
        },
      },
    });

    if (!review) {
      return null;
    }

    return this.formatReviewResponse(review);
  }

  /**
   * نمایش تمام نظرات دانشجو (کاربر خود)
   */
  async getMyReviews(studentId: number, page = 1, pageSize = 10) {
    const skip = (page - 1) * pageSize;

    const reviews = await this.prisma.reviews.findMany({
      where: { User_Id: studentId },
      include: {
        Users: {
          select: {
            Id: true,
            FirstName: true,
            LastName: true,
            Avatar: true,
          },
        },
        Courses: {
          select: {
            Id: true,
            Title: true,
            Thumbnail: true,
          },
        },
      },
      orderBy: { CreatedAt: 'desc' },
      skip,
      take: pageSize,
    });

    const total = await this.prisma.reviews.count({
      where: { User_Id: studentId },
    });

    return {
      reviews: reviews.map((r) => this.formatReviewResponse(r)),
      pagination: {
        page,
        pageSize,
        total,
        pages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * محاسبهٔ خودکار میانگین رتینگ دوره
   */
  private async updateCourseAverageRating(courseId: number) {
    // محاسبهٔ میانگین رتینگ‌های تایید‌شده
    const result = await this.prisma.reviews.aggregate({
      where: {
        Course_Id: courseId,
        IsApproved: true,
      },
      _avg: {
        Rating: true,
      },
    });

    const averageRating = result._avg.Rating ?? 0;

    // به‌روزرسانی دوره
    await this.prisma.courses.update({
      where: { Id: courseId },
      data: {
        AverageRating: averageRating,
      },
    });
  }

  /**
   * فرمت‌کردن پاسخ نظر برای API
   */
  private formatReviewResponse(review: any) {
    return {
      id: review.Id,
      userId: review.User_Id,
      courseId: review.Course_Id,
      rating: review.Rating,
      comment: review.Comment,
      isApproved: review.IsApproved,
      createdAt: review.CreatedAt,
      user: review.Users ? {
        id: review.Users.Id,
        firstName: review.Users.FirstName,
        lastName: review.Users.LastName,
        avatar: review.Users.Avatar,
      } : null,
      course: review.Courses ? {
        id: review.Courses.Id,
        title: review.Courses.Title,
        thumbnail: review.Courses.Thumbnail,
      } : null,
    };
  }
}
