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
import { GenerateQuizDto } from './dto/generate-quiz.dto';
import { SaveQuizDto } from './dto/save-quiz.dto';

@ApiTags('Quiz')
@Controller('courses/:courseId/quiz')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(2, 3)
@ApiBearerAuth('JWT-auth')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Get()
  @ApiOperation({ summary: 'Get the quiz (with bank questions) for a course' })
  async getQuiz(
    @Param('courseId', ParseIntPipe) courseId: number,
    @CurrentUser() user: any,
  ) {
    return this.quizService.getQuiz(courseId, user);
  }

  @Post('generate')
  @ApiOperation({ summary: 'Generate quiz questions via AI (not saved yet)' })
  async generate(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() dto: GenerateQuizDto,
    @CurrentUser() user: any,
  ) {
    return this.quizService.generateQuestions(courseId, user, dto);
  }

  @Post()
  @ApiOperation({ summary: 'Save/replace the quiz for a course' })
  async save(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() dto: SaveQuizDto,
    @CurrentUser() user: any,
  ) {
    return this.quizService.saveQuiz(courseId, user, dto);
  }
}
