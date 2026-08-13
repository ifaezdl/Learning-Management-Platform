import { Module } from '@nestjs/common';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { PrismaModule } from '../prisma/prisma.module';
import { StudentQuizController } from './student-quiz.controller';

@Module({
  imports: [PrismaModule],
  controllers: [QuizController, StudentQuizController],
  providers: [QuizService],
})
export class QuizModule {}
