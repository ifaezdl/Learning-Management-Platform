import { Module } from '@nestjs/common';
import { PracticeExamsService } from './practice-exams.service';
import { PracticeExamsController } from './practice-exams.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PracticeExamsController],
  providers: [PracticeExamsService],
})
export class PracticeExamsModule {}
