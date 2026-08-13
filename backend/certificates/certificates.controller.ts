import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CertificatesService } from './certificates.service';

@ApiTags('Certificates')
@Controller('certificates')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(1) // student
@ApiBearerAuth('JWT-auth')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Get('my')
  @ApiOperation({ summary: "List the logged-in student's certificates" })
  myCertificates(@CurrentUser() user: any) {
    return this.certificatesService.myCertificates(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single certificate' })
  getOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.certificatesService.getOne(id, user.id);
  }
}
