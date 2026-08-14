import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CoursesService } from './courses/courses.service';
import { Roles } from './auth/decorators/roles.decorator';
import { CurrentUser } from './auth/decorators/current-user.decorator';
import { RolesGuard } from './auth/guards/roles.guard';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@ApiTags('Instructor Dashboard')
@Controller('api/instructor/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(2) // instructor
@ApiBearerAuth('JWT-auth')
export class InstructorDashboardController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get('summary')
  @ApiOperation({
    summary: 'Instructor dashboard stats: total students, published courses, total courses',
  })
  async summary(@CurrentUser() user: any) {
    const stats = await this.coursesService.getInstructorStats(user.id);
    return stats;
  }
}
