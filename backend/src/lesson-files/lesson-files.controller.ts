import {
  Controller,
  Post,
  Get,
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
import { LessonFilesService } from './lesson-files.service';
import { CreateLessonFileDto } from './dto/create-lesson-file.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Lesson Files')
@Controller()
export class LessonFilesController {
  constructor(private readonly lessonFilesService: LessonFilesService) {}

  @Post('lessons/:lessonId/files')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(2, 3)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Add a file to a lesson (Teacher owner or Admin)',
  })
  @ApiResponse({ status: 201, description: 'File added successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not lesson owner' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  async create(
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @Body() dto: CreateLessonFileDto,
    @CurrentUser() user: any,
  ) {
    return this.lessonFilesService.create(lessonId, user, dto);
  }

  @Get('lessons/:lessonId/files')
  @ApiOperation({ summary: 'Get all files for a lesson' })
  @ApiResponse({ status: 200, description: 'Returns lesson files' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  async findByLesson(@Param('lessonId', ParseIntPipe) lessonId: number) {
    return this.lessonFilesService.findByLesson(lessonId);
  }

  @Delete('lesson-files/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(2, 3)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete a lesson file (Teacher owner or Admin)',
  })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not file owner' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    return this.lessonFilesService.remove(id, user);
  }
}
