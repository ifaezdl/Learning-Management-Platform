import {
  Controller,
  Post,
  Get,
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
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { UpdateLessonProgressDto } from './dto/update-lesson-progress.dto';

import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { EnrollmentGuard } from '../auth/guards/enrollment.guard';

@ApiTags('Lessons')
@Controller()
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post('sections/:sectionId/lessons')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(2, 3)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create a lesson in a section (Teacher owner or Admin)',
  })
  @ApiResponse({ status: 201, description: 'Lesson created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not section owner' })
  @ApiResponse({ status: 404, description: 'Section not found' })
  async create(
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Body() dto: CreateLessonDto,
    @CurrentUser() user: any,
  ) {
    return this.lessonsService.create(sectionId, user, dto);
  }

  @Get('sections/:sectionId/lessons')
  @ApiOperation({ summary: 'Get all lessons for a section' })
  @ApiResponse({ status: 200, description: 'Returns section lessons' })
  @ApiResponse({ status: 404, description: 'Section not found' })
  async findBySection(@Param('sectionId', ParseIntPipe) sectionId: number) {
    return this.lessonsService.findBySection(sectionId);
  }

  @Put('lessons/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(2, 3)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a lesson (Teacher owner or Admin)' })
  @ApiResponse({ status: 200, description: 'Lesson updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not lesson owner' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLessonDto,
    @CurrentUser() user: any,
  ) {
    return this.lessonsService.update(id, user, dto);
  }

  @Delete('lessons/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(2, 3)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a lesson (Teacher owner or Admin)' })
  @ApiResponse({ status: 200, description: 'Lesson deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not lesson owner' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    return this.lessonsService.remove(id, user);
  }
  @Get('lessons/:lessonId')
  @UseGuards(JwtAuthGuard, EnrollmentGuard)
  getLessonContent(@Param('lessonId', ParseIntPipe) lessonId: number) {
    console.log('=== LESSON CONTROLLER ===', lessonId);
    return this.lessonsService.findOne(lessonId);
  }
  @Put('lessons/:lessonId/progress')
  @UseGuards(JwtAuthGuard, EnrollmentGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Mark a lesson complete/incomplete for the current student',
  })
  @ApiResponse({ status: 200, description: 'Progress updated' })
  @ApiResponse({ status: 403, description: 'Forbidden - not enrolled' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  async updateProgress(
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @Body() dto: UpdateLessonProgressDto,
    @CurrentUser() user: any,
  ) {
    return this.lessonsService.updateProgress(lessonId, user.id, dto);
  }
}
