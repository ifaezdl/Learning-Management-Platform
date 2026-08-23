import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { GenerateQuizDto } from './dto/generate-quiz.dto';

/**
 * کنترلر مدیریت آزمون‌ها برای مدرس/ادمین.
 *
 * طراحی چندآزمونی (مشابه CourseSections):
 *   GET    /courses/:courseId/quizzes       → لیست همه آزمون‌های دوره
 *   POST   /courses/:courseId/quizzes       → ایجاد آزمون جدید
 *   GET    /quizzes/:quizId                 → جزئیات کامل + بانک سوالات
 *   PUT    /quizzes/:quizId                 → ویرایش تنظیمات و/یا بانک سوالات
 *   PUT    /quizzes/:quizId/publish         → toggle انتشار
 *   DELETE /quizzes/:quizId                 → حذف (با قانون حفاظت از داده)
 *   POST   /quizzes/:quizId/generate        → تولید سوال با AI (preview)
 */
@ApiTags('Quiz (Instructor)')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(2, 3) // مدرس یا ادمین
@ApiBearerAuth('JWT-auth')
@Controller()
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  // ── Course-scoped ────────────────────────────────────────────────────────────

  @Get('courses/:courseId/quizzes')
  @ApiOperation({
    summary: 'لیست خلاصه همه آزمون‌های یک دوره (مدرس مالک یا ادمین)',
  })
  @ApiResponse({ status: 200, description: 'آرایه‌ای از آزمون‌های دوره با تعداد سوال و شرکت‌کننده' })
  @ApiResponse({ status: 403, description: 'دسترسی غیرمجاز — مالک دوره نیستید' })
  @ApiResponse({ status: 404, description: 'دوره یافت نشد' })
  async listByCourse(
    @Param('courseId', ParseIntPipe) courseId: number,
    @CurrentUser() user: any,
  ) {
    return this.quizService.listQuizzesByCourse(courseId, user);
  }

  @Post('courses/:courseId/quizzes')
  @ApiOperation({
    summary: 'ایجاد آزمون جدید برای دوره — همیشه رکورد جدید (نه جایگزینی)',
  })
  @ApiResponse({ status: 201, description: 'آزمون با موفقیت ایجاد شد' })
  @ApiResponse({ status: 403, description: 'دسترسی غیرمجاز' })
  @ApiResponse({ status: 404, description: 'دوره یافت نشد' })
  async create(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() dto: CreateQuizDto,
    @CurrentUser() user: any,
  ) {
    return this.quizService.createQuiz(courseId, user, dto);
  }

  // ── Quiz-scoped ──────────────────────────────────────────────────────────────

  @Get('quizzes/:quizId')
  @ApiOperation({
    summary: 'جزئیات کامل آزمون + بانک سوالات (برای فرم ویرایش)',
  })
  @ApiResponse({ status: 200, description: 'اطلاعات کامل آزمون' })
  @ApiResponse({ status: 403, description: 'دسترسی غیرمجاز' })
  @ApiResponse({ status: 404, description: 'آزمون یافت نشد' })
  async getById(
    @Param('quizId', ParseIntPipe) quizId: number,
    @CurrentUser() user: any,
  ) {
    return this.quizService.getQuizById(quizId, user);
  }

  @Put('quizzes/:quizId')
  @ApiOperation({
    summary:
      'ویرایش تنظیمات و/یا بانک سوالات آزمون — سایر آزمون‌های دوره دست‌نخورده می‌مانند',
  })
  @ApiResponse({ status: 200, description: 'آزمون با موفقیت به‌روز شد' })
  @ApiResponse({ status: 400, description: 'داده نامعتبر' })
  @ApiResponse({ status: 403, description: 'دسترسی غیرمجاز' })
  @ApiResponse({ status: 404, description: 'آزمون یافت نشد' })
  async update(
    @Param('quizId', ParseIntPipe) quizId: number,
    @Body() dto: UpdateQuizDto,
    @CurrentUser() user: any,
  ) {
    return this.quizService.updateQuiz(quizId, user, dto);
  }

  @Put('quizzes/:quizId/publish')
  @ApiOperation({ summary: 'Toggle وضعیت انتشار آزمون' })
  @ApiResponse({ status: 200, description: 'وضعیت انتشار تغییر کرد' })
  @ApiResponse({ status: 403, description: 'دسترسی غیرمجاز' })
  @ApiResponse({ status: 404, description: 'آزمون یافت نشد' })
  async publish(
    @Param('quizId', ParseIntPipe) quizId: number,
    @CurrentUser() user: any,
  ) {
    return this.quizService.publishQuiz(quizId, user);
  }

  @Delete('quizzes/:quizId')
  @ApiOperation({
    summary:
      'حذف آزمون — اگر شرکت‌کننده داشته باشد، فقط غیرفعال می‌شود (حفاظت از تاریخچه یادگیری)',
  })
  @ApiResponse({ status: 200, description: 'آزمون با موفقیت حذف شد' })
  @ApiResponse({
    status: 400,
    description: 'آزمون دارای شرکت‌کننده است — غیرفعال‌سازی انجام شد',
  })
  @ApiResponse({ status: 403, description: 'دسترسی غیرمجاز' })
  @ApiResponse({ status: 404, description: 'آزمون یافت نشد' })
  async remove(
    @Param('quizId', ParseIntPipe) quizId: number,
    @CurrentUser() user: any,
  ) {
    return this.quizService.deleteQuiz(quizId, user);
  }

  @Post('quizzes/:quizId/generate')
  @ApiOperation({
    summary: 'تولید سوال با AI برای آزمون خاص (preview — ذخیره نمی‌شود)',
  })
  @ApiResponse({ status: 201, description: 'سوالات تولیدشده (آرایه JSON)' })
  @ApiResponse({ status: 400, description: 'خطا در سرویس AI' })
  @ApiResponse({ status: 403, description: 'دسترسی غیرمجاز' })
  @ApiResponse({ status: 404, description: 'آزمون یافت نشد' })
  async generate(
    @Param('quizId', ParseIntPipe) quizId: number,
    @Body() dto: GenerateQuizDto,
    @CurrentUser() user: any,
  ) {
    return this.quizService.generateQuestions(quizId, user, dto);
  }
}
