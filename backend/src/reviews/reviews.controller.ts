import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, UpdateReviewDto } from './dto/review.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  /**
   * ایجاد نظر جدید برای یک دوره
   */
  @Post('courses/:courseId')
  @UseGuards(JwtAuthGuard)
  @Roles(1) // فقط دانشجویان
  @ApiOperation({
    summary: 'ایجاد نظر جدید برای دوره',
    description: 'دانشجویان می‌توانند برای دوره‌هایی که خریده‌اند نظر بدهند',
  })
  @ApiParam({
    name: 'courseId',
    description: 'شناسهٔ دوره',
    type: Number,
  })
  @ApiResponse({
    status: 201,
    description: 'نظر با موفقیت ایجاد شد',
  })
  async createReview(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() dto: CreateReviewDto,
    @CurrentUser() user: any,
  ) {
    return this.reviewsService.createReview(user.id, courseId, dto);
  }

  /**
   * ویرایش نظر موجود
   */
  @Put(':reviewId')
  @UseGuards(JwtAuthGuard)
  @Roles(1) // فقط دانشجویان
  @ApiOperation({
    summary: 'ویرایش نظر',
    description: 'فقط نویسندهٔ نظر می‌تواند ویرایش کند',
  })
  @ApiParam({
    name: 'reviewId',
    description: 'شناسهٔ نظر',
    type: Number,
  })
  async updateReview(
    @Param('reviewId', ParseIntPipe) reviewId: number,
    @Body() dto: UpdateReviewDto,
    @CurrentUser() user: any,
  ) {
    return this.reviewsService.updateReview(user.id, reviewId, dto);
  }

  /**
   * حذف نظر
   */
  @Delete(':reviewId')
  @UseGuards(JwtAuthGuard)
  @Roles(1) // فقط دانشجویان
  @ApiOperation({
    summary: 'حذف نظر',
    description: 'فقط نویسندهٔ نظر می‌تواند حذف کند',
  })
  @ApiParam({
    name: 'reviewId',
    description: 'شناسهٔ نظر',
    type: Number,
  })
  async deleteReview(
    @Param('reviewId', ParseIntPipe) reviewId: number,
    @CurrentUser() user: any,
  ) {
    return this.reviewsService.deleteReview(user.id, reviewId);
  }

  /**
   * نمایش تمام نظرات تایید‌شدهٔ یک دوره
   */
  @Get('courses/:courseId')
  @ApiOperation({
    summary: 'دریافت نظرات یک دوره',
    description: 'نمایش تمام نظرات تایید‌شدهٔ یک دوره با صفحه‌بندی',
  })
  @ApiParam({
    name: 'courseId',
    description: 'شناسهٔ دوره',
    type: Number,
  })
  async getCourseReviews(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const pageSizeNum = pageSize ? parseInt(pageSize) : 10;
    return this.reviewsService.getCourseReviews(
      courseId,
      pageNum,
      pageSizeNum,
    );
  }

  /**
   * نمایش نظر شخصی دانشجو برای یک دوره
   */
  @Get('courses/:courseId/my-review')
  @UseGuards(JwtAuthGuard)
  @Roles(1)
  @ApiOperation({
    summary: 'نمایش نظر شخصی برای یک دوره',
    description: 'اگر دانشجو قبلاً برای این دوره نظر داده باشد، نظر را نشان می‌دهد',
  })
  @ApiParam({
    name: 'courseId',
    description: 'شناسهٔ دوره',
    type: Number,
  })
  async getMyReview(
    @Param('courseId', ParseIntPipe) courseId: number,
    @CurrentUser() user: any,
  ) {
    return this.reviewsService.getMyReview(user.id, courseId);
  }

  /**
   * نمایش تمام نظرات خود دانشجو
   */
  @Get('my-reviews')
  @UseGuards(JwtAuthGuard)
  @Roles(1)
  @ApiOperation({
    summary: 'دریافت تمام نظرات شخصی',
    description: 'نمایش تمام نظرات ثبت‌شدهٔ دانشجو',
  })
  async getMyReviews(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @CurrentUser() user?: any,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const pageSizeNum = pageSize ? parseInt(pageSize) : 10;
    return this.reviewsService.getMyReviews(
      user.id,
      pageNum,
      pageSizeNum,
    );
  }
}
