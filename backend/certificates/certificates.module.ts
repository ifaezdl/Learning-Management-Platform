import { Module } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { CertificatesController } from './certificates.controller';
import { PrismaModule } from '../src/prisma/prisma.module';
import { AnalyticsModule } from '../src/analytics/analytics.module';

@Module({
  imports: [PrismaModule, AnalyticsModule],
  providers: [CertificatesService],
  controllers: [CertificatesController],
  exports: [CertificatesService],
})
export class CertificatesModule { }
