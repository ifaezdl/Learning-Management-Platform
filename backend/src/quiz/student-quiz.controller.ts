import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { QuizService } from './quiz.service';
import { SubmitQuizDto } from './dto/submit-quiz.dto';

/**
 * Endpoints سمت دانشجو — تغییر مهم:
 *   POST /quizzes/:quizId/start  (قبلاً: POST /courses/:courseId/quiz/start)
 * سایر endpointها بدون تغییر.
 */
@ApiTags('Student Quiz')
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(1)
@ApiBearerAuth('JWT-auth')
export class StudentQuizController {
  constructor(private readonly quizService: QuizService) {}

  @Get('quizzes/my')
  @ApiOperation({ summary: 'لیست آزمون‌های موجود برای دانشجوی وارد شده' })
  @ApiResponse({ status: 200, description: 'آرایه‌ای از آزمون‌های دوره‌های ثبت‌نامی' })
  async myQuizzes(@CurrentUser() user: any) {
    return this.quizService.listMyQuizzes(user.id);
  }

  /**
   * شروع آزمون — حالا با quizId به‌جای courseId.
   * دانشجو از صفحه لیست آزمون‌ها (quizId را می‌داند) شروع می‌کند.
   */
  @Post('quizzes/:quizId/start')
  @ApiOperation({ summary: 'شروع (یا ادامه) یک attempt روی آزمون خاص' })
  @ApiResponse({ status: 201, description: 'داده‌های attempt و سوالات' })
  @ApiResponse({ status: 400, description: 'آزمون هنوز شروع نشده یا تمام شده' })
  @ApiResponse({ status: 403, description: 'در دوره ثبت‌نام نشده‌اید' })
  @ApiResponse({ status: 404, description: 'آزمون یافت نشد' })
  async start(
    @Param('quizId', ParseIntPipe) quizId: number,
    @CurrentUser() user: any,
  ) {
    return this.quizService.startQuiz(quizId, user.id);
  }

  @Post('quiz/attempts/:attemptId/submit')
  @ApiOperation({ summary: 'ثبت پاسخ‌ها برای یک attempt' })
  @ApiResponse({ status: 201, description: 'نتیجه آزمون' })
  async submit(
    @Param('attemptId', ParseIntPipe) attemptId: number,
    @Body() dto: SubmitQuizDto,
    @CurrentUser() user: any,
  ) {
    return this.quizService.submitQuiz(attemptId, user.id, dto);
  }

  @Get('quiz/attempts/:attemptId/result')
  @ApiOperation({ summary: 'دریافت نتیجه یک attempt ثبت‌شده' })
  @ApiResponse({ status: 200, description: 'نتیجه آزمون' })
  async result(
    @Param('attemptId', ParseIntPipe) attemptId: number,
    @CurrentUser() user: any,
  ) {
    return this.quizService.getResult(attemptId, user.id);
  }
}
