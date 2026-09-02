import { Module } from '@nestjs/common';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { PrismaModule } from '../prisma/prisma.module';
import { StudentQuizController } from './student-quiz.controller';
import { RecommendationsModule } from '../recommendations/recommendations.module';

@Module({
  imports: [PrismaModule, RecommendationsModule],
  controllers: [StudentQuizController, QuizController],
  providers: [QuizService],
  exports: [QuizService],
})
export class QuizModule { }