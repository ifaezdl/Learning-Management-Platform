import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PracticeExamsService } from './practice-exams.service';

@ApiTags('Practice Exams')
@Controller('practice-exams')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class PracticeExamsController {
  constructor(private readonly practiceExamsService: PracticeExamsService) {}

  /**
   * Endpoint 1: دریافت مهارت‌های ضعیف دانشجو برای هر دوره
   * GET /practice-exams/weak-skills
   */
  @Get('weak-skills')
  @Roles(1) // فقط دانشجو
  @ApiOperation({
    summary: 'دریافت مهارت‌های ضعیف دانشجو به تفکیک دوره',
    description:
      'اگر دانشجو در آزمون اصلی شرکت کرده باشد، مهارت‌های ضعیف رو میدهد. در غیر این صورت، تمام مهارت‌های دوره برای تمرین پیشنهاد می‌شود.',
  })
  @ApiResponse({
    status: 200,
    description: 'لیست دوره‌ها با مهارت‌های ضعیف',
  })
  getWeakSkills(@CurrentUser() user: any) {
    return this.practiceExamsService.getWeakSkillsByCoursesForStudent(user.id);
  }

  /**
   * Endpoint 2: ایجاد آزمون تمرینی با تولید سوالات از طریق هوش مصنوعی
   * POST /practice-exams/courses/:courseId/generate
   *
   * تولید سوالات برای آزمون تمرینی استفاده می‌کند از مدل هوش مصنوعی Qwen3-4B.
   * هر سوال یک برچسب مهارت دارد که بخشی از نوآوری این پروژه است.
   */
  @Post('courses/:courseId/generate')
  @Roles(1) // فقط دانشجو
  @ApiOperation({
    summary: 'ایجاد آزمون تمرینی با تولید سوالات از AI',
    description:
      'تولید سوالات تمرینی برای دانشجو با استفاده از مدل هوش مصنوعی Qwen3-4B. ' +
      'سوالات با برچسب مهارت برای تمرین هدفمند تولید می‌شوند. ' +
      'اگر مهارت خاص انتخاب شود، سوالات فقط برای آن مهارت تولید می‌شوند.',
  })
  @ApiQuery({
    name: 'skillTag',
    required: false,
    type: String,
    description:
      'برچسب مهارت خاص برای تمرین (اختیاری). ' +
      'مثال: "حلقه‌های تکرار"، "مدیریت حافظه". ' +
      'اگر داده نشود، سوالات کلی دوره تولید می‌شوند.',
  })
  @ApiQuery({
    name: 'questionCount',
    required: false,
    type: Number,
    description: 'تعداد سوالات (پیش‌فرض: 10، حداکثر: 20)',
  })
  @ApiResponse({
    status: 200,
    description: 'آرایه سوالات تولید شده با برچسب‌های مهارت',
  })
  @ApiResponse({
    status: 400,
    description: 'خطا در تولید سوالات یا اعتبارسنجی',
  })
  @ApiResponse({
    status: 403,
    description: 'دانشجو در این دوره ثبت‌نام نکرده است',
  })
  generatePracticeExam(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Query('skillTag') skillTag?: string,
    @Query('questionCount') questionCount?: string,
    @CurrentUser() user?: any,
  ) {
    let count = questionCount ? Number(questionCount) : 10;
    
    // تحدید تعداد سوالات
    if (count < 1) count = 1;
    if (count > 20) count = 20;

    return this.practiceExamsService.generatePracticeExam(
      user.id,
      courseId,
      skillTag?.trim(),
      count,
    );
  }

  /**
   * Endpoint 3: ثبت نتیجه آزمون تمرینی
   * POST /practice-exams/courses/:courseId/submit
   *
   * پذیرش پاسخ‌های دانشجو برای سوالات تمرینی (توسط AI یا پایگاه داده).
   * برای سوالات توسط AI: questionId منفی، choiceId شامل شاخص گزینه صحیح.
   */
  @Post('courses/:courseId/submit')
  @Roles(1) // فقط دانشجو
  @ApiOperation({
    summary: 'ثبت نتیجه آزمون تمرینی',
    description:
      'ثبت پاسخ‌های دانشجو برای آزمون تمرینی تولید شده. ' +
      'سوالات توسط AI تولید شده با ID منفی و سوالات پایگاه داده با ID مثبت شناسایی می‌شوند.',
  })
  @ApiQuery({
    name: 'skillTag',
    required: false,
    type: String,
    description: 'برچسب مهارت (اختیاری)',
  })
  @ApiResponse({
    status: 200,
    description: 'نتیجه آزمون تمرینی شامل امتیاز، درصد و وضعیت قبولی',
  })
  @ApiResponse({
    status: 400,
    description: 'خطا در پردازش پاسخ‌ها',
  })
  submitPracticeExam(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body()
    body: {
      answers: Array<{
        questionId: number;
        choiceId: number;
        questionText?: string;
        correctChoiceIndex?: number;
        choices?: Array<{id: number; text: string; choiceIndex: number}>;
      }>;
    },
    @Query('skillTag') skillTag?: string,
    @CurrentUser() user?: any,
  ) {
    if (!body.answers || body.answers.length === 0) {
      throw new Error('لطفا حداقل یک پاسخ ارسال کنید');
    }

    return this.practiceExamsService.submitPracticeExam(
      user.id,
      courseId,
      body.answers,
      skillTag?.trim(),
    );
  }

  /**
   * Endpoint 4: دریافت لیست تمام نتایج تمرینی
   * GET /practice-exams/results
   */
  @Get('results')
  @Roles(1) // فقط دانشجو
  @ApiOperation({
    summary: 'دریافت لیست نتایج آزمون‌های تمرینی',
    description:
      'لیست تمام آزمون‌های تمرینی که دانشجو شرکت کرده است. ' +
      'هر نتیجه شامل امتیاز، درصد، برچسب مهارت و تاریخ ثبت است.',
  })
  @ApiQuery({
    name: 'courseId',
    required: false,
    type: Number,
    description: 'فیلتر بر اساس دوره (اختیاری)',
  })
  @ApiResponse({
    status: 200,
    description: 'لیست نتایج آزمون‌های تمرینی',
  })
  getPracticeExamResults(
    @Query('courseId') courseId?: string,
    @CurrentUser() user?: any,
  ) {
    return this.practiceExamsService.getPracticeExamResults(
      user.id,
      courseId ? Number(courseId) : undefined,
    );
  }

  /**
   * Endpoint 5: دریافت تفاصیل یک نتیجه تمرینی
   * GET /practice-exams/results/:resultId
   */
  @Get('results/:resultId')
  @Roles(1) // فقط دانشجو
  @ApiOperation({
    summary: 'دریافت تفاصیل یک آزمون تمرینی',
  })
  @ApiResponse({
    status: 200,
    description: 'تفاصیل کامل نتیجه شامل اطلاعات هر سوال',
  })
  getPracticeExamResultDetails(
    @Param('resultId', ParseIntPipe) resultId: number,
    @CurrentUser() user?: any,
  ) {
    return this.practiceExamsService.getPracticeExamResultDetails(
      resultId,
      user.id,
    );
  }

  /**
   * Endpoint 6: مقایسه پیشرفت - درصد بهبود نسبت به آخرین آزمون
   * GET /practice-exams/courses/:courseId/progress-comparison
   */
  @Get('courses/:courseId/progress-comparison')
  @Roles(1) // فقط دانشجو
  @ApiOperation({
    summary: 'مقایسه پیشرفت دانشجو در آزمون‌های تمرینی',
    description: 'درصد بهبود یا کاهش نسبت به آخرین آزمون',
  })
  @ApiQuery({
    name: 'skillTag',
    required: false,
    type: String,
    description: 'برچسب مهارت (اختیاری)',
  })
  @ApiResponse({
    status: 200,
    description: 'مقایسه پیشرفت',
  })
  comparePracticeExamProgress(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Query('skillTag') skillTag?: string,
    @CurrentUser() user?: any,
  ) {
    return this.practiceExamsService.comparePracticeExamProgress(
      user.id,
      courseId,
      skillTag,
    );
  }
}
