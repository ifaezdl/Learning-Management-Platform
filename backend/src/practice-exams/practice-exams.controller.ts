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
   * Endpoint 2: ایجاد آزمون تمرینی
   * POST /practice-exams/courses/:courseId/generate
   */
  @Post('courses/:courseId/generate')
  @Roles(1) // فقط دانشجو
  @ApiOperation({
    summary: 'ایجاد آزمون تمرینی برای دانشجو',
    description:
      'بر اساس مهارت مشخص‌شده (یا تمام دوره) سوالات تمرینی تولید می‌کند.',
  })
  @ApiQuery({
    name: 'skillTag',
    required: false,
    type: String,
    description: 'برچسب مهارت خاص (اختیاری)',
  })
  @ApiQuery({
    name: 'questionCount',
    required: false,
    type: Number,
    description: 'تعداد سوالات (پیش‌فرض: 5)',
  })
  @ApiResponse({
    status: 200,
    description: 'لیست سوالات برای آزمون تمرینی',
  })
  generatePracticeExam(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Query('skillTag') skillTag?: string,
    @Query('questionCount') questionCount?: string,
    @CurrentUser() user?: any,
  ) {
    return this.practiceExamsService.generatePracticeExam(
      user.id,
      courseId,
      skillTag,
      questionCount ? Number(questionCount) : 5,
    );
  }

  /**
   * Endpoint 3: ثبت نتیجه آزمون تمرینی
   * POST /practice-exams/courses/:courseId/submit
   */
  @Post('courses/:courseId/submit')
  @Roles(1) // فقط دانشجو
  @ApiOperation({
    summary: 'ثبت نتیجه آزمون تمرینی',
  })
  @ApiQuery({
    name: 'skillTag',
    required: false,
    type: String,
    description: 'برچسب مهارت (اختیاری)',
  })
  @ApiResponse({
    status: 200,
    description: 'نتیجه آزمون تمرینی',
  })
  submitPracticeExam(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body()
    body: {
      answers: { questionId: number; choiceId: number }[];
    },
    @Query('skillTag') skillTag?: string,
    @CurrentUser() user?: any,
  ) {
    return this.practiceExamsService.submitPracticeExam(
      user.id,
      courseId,
      body.answers,
      skillTag,
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
