import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AnalyticsService } from './analytics.service';

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  // -------------------------------------------------------------------------
  // Endpoint 1: skill breakdown for one attempt
  // Accessible by the student who owns the attempt, or the course instructor, or admin
  // -------------------------------------------------------------------------
  @Get('attempts/:attemptId/skills')
  @Roles(1, 2, 3)
  @ApiOperation({
    summary:
      'Skill gap breakdown for a specific quiz attempt (student owner, instructor, or admin)',
  })
  @ApiResponse({
    status: 200,
    description:
      'Returns per-skill correct/total/percentage, sorted weakest first',
  })
  getAttemptSkills(
    @Param('attemptId', ParseIntPipe) attemptId: number,
    @CurrentUser() user: any,
  ) {
    return this.analyticsService.getAttemptSkills(attemptId, user);
  }

  // -------------------------------------------------------------------------
  // Endpoint 2: aggregated skill profile for the logged-in student
  // -------------------------------------------------------------------------
  @Get('students/me/skills')
  @Roles(1)
  @ApiOperation({
    summary:
      "Aggregated skill profile across all the student's quiz attempts (optional courseId filter)",
  })
  @ApiQuery({ name: 'courseId', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Returns per-skill stats aggregated across all attempts',
  })
  getMySkills(
    @CurrentUser() user: any,
    @Query('courseId') courseId?: string,
  ) {
    return this.analyticsService.getMySkillProfile(
      user.id,
      courseId ? Number(courseId) : undefined,
    );
  }

  // -------------------------------------------------------------------------
  // Endpoint 3: progress trend over time for the logged-in student
  // -------------------------------------------------------------------------
  @Get('students/me/progress-trend')
  @Roles(1)
  @ApiOperation({
    summary:
      "Student's quiz score trend and course completion trend over time (optional courseId filter)",
  })
  @ApiQuery({ name: 'courseId', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Returns quizScores[] and courseCompletion[] time series',
  })
  getProgressTrend(
    @CurrentUser() user: any,
    @Query('courseId') courseId?: string,
  ) {
    return this.analyticsService.getProgressTrend(
      user.id,
      courseId ? Number(courseId) : undefined,
    );
  }

  // -------------------------------------------------------------------------
  // Endpoint 4: class-wide skill overview for a course (instructor / admin)
  // -------------------------------------------------------------------------
  @Get('courses/:courseId/skills-overview')
  @Roles(2, 3)
  @ApiOperation({
    summary:
      'Class-wide skill weakness overview for a course (instructor owner or admin)',
  })
  @ApiResponse({
    status: 200,
    description:
      'Returns per-skill stats aggregated across all enrolled students',
  })
  getCourseSkillsOverview(
    @Param('courseId', ParseIntPipe) courseId: number,
    @CurrentUser() user: any,
  ) {
    return this.analyticsService.getCourseSkillsOverview(courseId, user);
  }

  // -------------------------------------------------------------------------
  // Endpoint 5: per-student analytics for a course (instructor / admin)
  // -------------------------------------------------------------------------
  @Get('courses/:courseId/students')
  @Roles(2, 3)
  @ApiOperation({
    summary:
      'Per-student progress + skill breakdown for a course (instructor owner or admin)',
  })
  @ApiResponse({
    status: 200,
    description:
      'Returns each enrolled student with progressPercent, quizScorePercent, isPassed, and skillBreakdown[]',
  })
  getCourseStudentAnalytics(
    @Param('courseId', ParseIntPipe) courseId: number,
    @CurrentUser() user: any,
  ) {
    return this.analyticsService.getCourseStudentAnalytics(courseId, user);
  }

  // -------------------------------------------------------------------------
  // Endpoint 6: روند یادگیری یک دانشجو (برای مدرس / ادمین / خود دانشجو)
  // -------------------------------------------------------------------------
  @Get('students/:studentId/trend')
  @Roles(1, 2, 3)
  @ApiOperation({
    summary: 'تحلیل روند یادگیری یک دانشجو (صعودی/نزولی/ثابت)',
    description:
      'بر اساس رگرسیون خطی روی نمرات آزمون‌ها، وضعیت روند را مشخص می‌کند.',
  })
  @ApiQuery({ name: 'courseId', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'وضعیت روند (status) و شیب (slope) به همراه توضیح',
  })
  async getStudentTrend(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Query('courseId') courseId: string | undefined,
    @CurrentUser() user: any,
  ) {
    return this.analyticsService.getStudentTrend(
      studentId,
      user,
      courseId ? Number(courseId) : undefined,
    );
  }

  // -------------------------------------------------------------------------
  // Endpoint 7: روند همه دانشجویان یک دوره (برای مدرس / ادمین)
  // -------------------------------------------------------------------------
  @Get('courses/:courseId/trend-overview')
  @Roles(2, 3)
  @ApiOperation({
    summary: 'خلاصه روند یادگیری تمام دانشجویان یک دوره',
    description:
      'لیست دانشجویان دوره به همراه وضعیت روند و شیب، مرتب از نزولی‌ترین به صعودی‌ترین.',
  })
  @ApiResponse({
    status: 200,
    description:
      'آرایه دانشجویان با studentId, name, trendStatus, slope, quizScores[]',
  })
  async getCourseTrendOverview(
    @Param('courseId', ParseIntPipe) courseId: number,
    @CurrentUser() user: any,
  ) {
    return this.analyticsService.getCourseTrendOverview(courseId, user);
  }
}
