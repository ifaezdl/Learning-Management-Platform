import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CertificatesService } from '../certificates/certificates.service';
import { QuizService } from './quiz/quiz.service';
import { CoursesService } from './courses/courses.service';
import { Roles } from './auth/decorators/roles.decorator';
import { CurrentUser } from './auth/decorators/current-user.decorator';
import { RolesGuard } from './auth/guards/roles.guard';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@ApiTags('Student Dashboard')
@Controller('api/student/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(1) // student
@ApiBearerAuth('JWT-auth')
export class StudentDashboardController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly quizService: QuizService,
    private readonly certificatesService: CertificatesService,
  ) {}

  @Get('summary')
  @ApiOperation({
    summary: 'Dashboard counts + in-progress quiz for the student',
  })
  async summary(@CurrentUser() user: any) {
    const [enrolled, quizzes, certificates, inProgress] = await Promise.all([
      this.coursesService.findEnrolledByStudent(user.id),
      this.quizService.listMyQuizzes(user.id),
      this.certificatesService.myCertificates(user.id),
      this.quizService.getInProgressAttempt(user.id),
    ]);

    return {
      enrolledCount: enrolled.length,
      availableQuizzesCount: quizzes.filter(
        (q) => q.status === 'available' && !q.attempted,
      ).length,
      certificatesCount: certificates.length,
      inProgressAttempt: inProgress,
    };
  }
}
