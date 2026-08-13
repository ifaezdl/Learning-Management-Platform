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
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { QuizService } from './quiz.service';
import { SubmitQuizDto } from './dto/submit-quiz.dto';

@ApiTags('Student Quiz')
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(1) // ⚠️ set this to your actual "student" Role_Id — teacher used 2, adjust if student isn't 3
@ApiBearerAuth('JWT-auth')
export class StudentQuizController {
  constructor(private readonly quizService: QuizService) {}

  @Get('quizzes/my')
  @ApiOperation({ summary: 'List quizzes available to the logged-in student' })
  async myQuizzes(@CurrentUser() user: any) {
    return this.quizService.listMyQuizzes(user.id);
  }

  @Post('courses/:courseId/quiz/start')
  @ApiOperation({ summary: 'Start (or resume) a quiz attempt' })
  async start(
    @Param('courseId', ParseIntPipe) courseId: number,
    @CurrentUser() user: any,
  ) {
    return this.quizService.startQuiz(courseId, user.id);
  }

  @Post('quiz/attempts/:attemptId/submit')
  @ApiOperation({ summary: 'Submit answers for an attempt' })
  async submit(
    @Param('attemptId', ParseIntPipe) attemptId: number,
    @Body() dto: SubmitQuizDto,
    @CurrentUser() user: any,
  ) {
    return this.quizService.submitQuiz(attemptId, user.id, dto);
  }

  @Get('quiz/attempts/:attemptId/result')
  @ApiOperation({ summary: 'Get the result of a submitted attempt' })
  async result(
    @Param('attemptId', ParseIntPipe) attemptId: number,
    @CurrentUser() user: any,
  ) {
    return this.quizService.getResult(attemptId, user.id);
  }
}
