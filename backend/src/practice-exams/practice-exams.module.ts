import { Module } from '@nestjs/common';
import { PracticeExamsService } from './practice-exams.service';
import { PracticeExamsController } from './practice-exams.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [PrismaModule, AiModule],
  controllers: [PracticeExamsController],
  providers: [PracticeExamsService],
})
export class PracticeExamsModule {}
