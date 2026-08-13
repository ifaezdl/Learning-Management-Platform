import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { InstructorRequestsService } from './instructure-requests.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateInstructorRequestDto } from './dto/create-instructor-request.dto';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

@Controller('instructor-requests')
export class InstructorRequestsController {
  constructor(
    private readonly instructorRequestsService: InstructorRequestsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('resume', {
      storage: diskStorage({
        destination: './uploads/resumes',
        filename: (req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: (req, file, cb) => {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          return cb(
            new BadRequestException(
              'Only PDF, DOC, or DOCX files are allowed.',
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  create(
    @CurrentUser() user: any,
    @Body() dto: CreateInstructorRequestDto,
    @UploadedFile() resume?: Express.Multer.File,
  ) {
    return this.instructorRequestsService.create(user.id, dto, resume);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(3)
  @Put(':id/approve')
  approve(@Param('id', ParseIntPipe) id: number) {
    return this.instructorRequestsService.approve(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(3)
  @Put(':id/reject')
  reject(@Param('id', ParseIntPipe) id: number) {
    return this.instructorRequestsService.reject(id);
  }
}
