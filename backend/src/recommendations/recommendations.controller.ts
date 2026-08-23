import {
  Controller,
  Get,
  Post,
  Param,
  ParseIntPipe,
  UseGuards,
  Body,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RecommendationsService } from './recommendations.service';
import { RefreshRecommendationsDto } from './dto/refresh-recommendations.dto';

@ApiTags('Recommendations')
@Controller('recommendations')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
  ) {}

  // ---------------------------------------------------------------------------
  // Endpoint 1: لیست پیشنهادهای فعال دانشجوی جاری
  // ---------------------------------------------------------------------------
  @Get('students/me')
  @Roles(1)
  @ApiOperation({
    summary: 'دریافت دوره‌های پیشنهادی برای دانشجوی جاری',
    description:
      'اگر کش معتبر موجود باشد، از کش برمی‌گرداند، در غیر این صورت محاسبه جدید انجام می‌شود.',
  })
  @ApiResponse({
    status: 200,
    description: 'لیست دوره‌های پیشنهادی به همراه امتیاز و توضیح',
  })
  getMyRecommendations(@CurrentUser() user: any) {
    return this.recommendationsService.getRecommendations(user.id, user);
  }

  // ---------------------------------------------------------------------------
  // Endpoint 2: محاسبه مجدد پیشنهادها
  // ---------------------------------------------------------------------------
  @Post('refresh')
  @Roles(1)
  @ApiOperation({
    summary: 'محاسبه مجدد پیشنهادها',
    description:
      'برای زمانی که دانشجو دوره جدیدی را تمام کرده یا آزمون داده و می‌خواهد پیشنهادهای به‌روز دریافت کند.',
  })
  @ApiResponse({
    status: 200,
    description: 'پیشنهادها با موفقیت به‌روزرسانی شدند',
  })
  async refreshRecommendations(
    @CurrentUser() user: any,
    @Body() dto: RefreshRecommendationsDto,
  ) {
    await this.recommendationsService.refresh(user.id, dto.topN ?? 5);
    return { message: 'پیشنهادها با موفقیت به‌روزرسانی شدند.' };
  }

  // ---------------------------------------------------------------------------
  // Endpoint 3: علاقه‌مند نیستم (Dismiss)
  // ---------------------------------------------------------------------------
  @Post(':id/dismiss')
  @Roles(1)
  @ApiOperation({
    summary: 'علاقه‌مند نیستم — حذف یک پیشنهاد از لیست فعال',
  })
  @ApiParam({ name: 'id', description: 'شناسه رکورد پیشنهاد' })
  @ApiResponse({
    status: 200,
    description: 'وضعیت پیشنهاد به Dismissed تغییر یافت',
  })
  async dismissRecommendation(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    await this.recommendationsService.dismiss(id, user);
    return { message: 'پیشنهاد با موفقیت حذف شد.' };
  }

  // ---------------------------------------------------------------------------
  // Endpoint 4: تاریخچه پیشنهادها + نرخ تبدیل
  // ---------------------------------------------------------------------------
  @Get('students/:studentId/history')
  @Roles(1, 3)
  @ApiOperation({
    summary: 'تاریخچه پیشنهادها و آمار نرخ تبدیل به ثبت‌نام',
    description:
      'دانشجو می‌تواند تاریخچه خودش را ببیند، ادمین می‌تواند همه دانشجویان را ببیند.',
  })
  @ApiParam({ name: 'studentId', description: 'شناسه دانشجو' })
  @ApiResponse({
    status: 200,
    description: 'تاریخچه پیشنهادها و آمار کلی',
  })
  getRecommendationHistory(
    @Param('studentId', ParseIntPipe) studentId: number,
    @CurrentUser() user: any,
  ) {
    return this.recommendationsService.getHistory(studentId, user);
  }
}
