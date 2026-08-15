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
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { SaveLearningOutcomesDto } from './dto/save-learning-outcomes.dto';
import { SavePrerequisitesDto } from './dto/save-prerequisites.dto';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { BrowseCoursesDto } from './dto/browsw-course.dto';

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(2, 3)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new course (Teacher or Admin)' })
  @ApiResponse({ status: 201, description: 'Course created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Teacher role required',
  })
  async create(@Body() dto: CreateCourseDto, @CurrentUser() user: any) {
    return this.coursesService.create(dto, user.id);
  }

  @Get('browse')
  @ApiOperation({
    summary: 'Browse published courses with search, filters and pagination',
  })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'categoryId', required: false, type: Number })
  @ApiQuery({ name: 'levelId', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated published courses',
  })
  async browse(@Query() dto: BrowseCoursesDto) {
    return this.coursesService.browse(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all published courses' })
  @ApiResponse({ status: 200, description: 'Returns all published courses' })
  async findAll() {
    return this.coursesService.findAll();
  }

  @Get('my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(2)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current teacher courses' })
  @ApiResponse({ status: 200, description: 'Returns teacher courses' })
  async getMyCourses(@CurrentUser() user: any) {
    return this.coursesService.findByTeacher(user.id);
  }

  @Get('enrolled')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get enrolled courses for the current logged-in student',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the enrolled courses for the current user',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getEnrolledCourses(@CurrentUser() user: any) {
    return this.coursesService.findEnrolledByStudent(user.id);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(3)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary:
      'Get all courses (published & unpublished) with filters and pagination (Admin only)',
  })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'categoryId', required: false, type: Number })
  @ApiQuery({ name: 'levelId', required: false, type: Number })
  @ApiQuery({ name: 'teacherId', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated courses',
  })
  async browseAdmin(@Query() dto: BrowseCoursesDto) {
    return this.coursesService.browseAdmin(dto);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get a course by ID' })
  @ApiResponse({ status: 200, description: 'Returns the course' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    return this.coursesService.findOne(id, user?.id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(2, 3)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a course (Teacher owner or Admin)' })
  @ApiResponse({ status: 200, description: 'Course updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not course owner' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCourseDto,
    @CurrentUser() user: any,
  ) {
    return this.coursesService.update(id, user, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(2, 3)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a course (Teacher owner or Admin)' })
  @ApiResponse({ status: 200, description: 'Course deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not course owner' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    return this.coursesService.remove(id, user);
  }

  @Put(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(2, 3)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Publish a course (Teacher owner or Admin)' })
  @ApiResponse({ status: 200, description: 'Course published successfully' })
  @ApiResponse({
    status: 400,
    description: 'Course must have sections and lessons',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Not course owner' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async publish(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    return this.coursesService.publish(id, user);
  }

  @Get(':id/learning-outcomes')
  getLearningOutcomes(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.getLearningOutcomes(id);
  }

  @Put(':id/learning-outcomes')
  saveLearningOutcomes(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SaveLearningOutcomesDto,
  ) {
    return this.coursesService.saveLearningOutcomes(id, dto);
  }

  @Get(':id/prerequisites')
  getPrerequisites(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.getPrerequisites(id);
  }

  @Put(':id/prerequisites')
  savePrerequisites(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SavePrerequisitesDto,
  ) {
    return this.coursesService.savePrerequisites(id, dto);
  }
  @Get(':id/students')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(2)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary:
      'Get enrolled students with progress and exam results for a course (Teacher owner only)',
  })
  @ApiResponse({ status: 200, description: 'Returns the students list' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not course owner' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async getStudents(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    return this.coursesService.getStudents(id, user.id);
  }
  @Get('my/enrollments-report')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(2)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get enrollment counts per course for the current teacher',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns enrollment counts per course',
  })
  async getEnrollmentsReport(@CurrentUser() user: any) {
    return this.coursesService.getEnrollmentsByCourse(user.id);
  }
}
