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
import { CourseSectionsService } from './course-sections.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Course Sections')
@Controller()
export class CourseSectionsController {
  constructor(private readonly sectionsService: CourseSectionsService) {}

  @Post('courses/:courseId/sections')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(2, 3)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a section in a course (Teacher owner or Admin)' })
  @ApiResponse({ status: 201, description: 'Section created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not course owner' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async create(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() dto: CreateSectionDto,
    @CurrentUser() user: any,
  ) {
    return this.sectionsService.create(courseId, user, dto);
  }

  @Get('courses/:courseId/sections')
  @ApiOperation({ summary: 'Get all sections for a course' })
  @ApiResponse({ status: 200, description: 'Returns course sections' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async findByCourse(
    @Param('courseId', ParseIntPipe) courseId: number,
  ) {
    return this.sectionsService.findByCourse(courseId);
  }

  @Put('sections/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(2, 3)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a section (Teacher owner or Admin)' })
  @ApiResponse({ status: 200, description: 'Section updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not section owner' })
  @ApiResponse({ status: 404, description: 'Section not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSectionDto,
    @CurrentUser() user: any,
  ) {
    return this.sectionsService.update(id, user, dto);
  }

  @Delete('sections/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(2, 3)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a section (Teacher owner or Admin)' })
  @ApiResponse({ status: 200, description: 'Section deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not section owner' })
  @ApiResponse({ status: 404, description: 'Section not found' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    return this.sectionsService.remove(id, user);
  }
}
