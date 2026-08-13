import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CertificatesService } from './certificates.service';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../src/auth/guards/roles.guard';
import { Roles } from '../src/auth/decorators/roles.decorator';
import { CurrentUser } from '../src/auth/decorators/current-user.decorator';

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
