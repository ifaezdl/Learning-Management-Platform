import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { InstructorRequestsModule } from './instructure-requests/instructure-requests.module';
import { CoursesModule } from './courses/courses.module';
import { CategoriesModule } from './categories/categories.module';
import { LevelsModule } from './levels/levels.module';
import { CourseSectionsModule } from './course-sections/course-sections.module';
import { LessonsModule } from './lessons/lessons.module';
import { LessonFilesModule } from './lesson-files/lesson-files.module';
import { UploadModule } from './upload/upload.module';
import { CartModule } from './cart/cart.module';
import { PaymentModule } from './payment/payment.module';
import { QuizModule } from './quiz/quiz.module';
import { CertificatesModule } from '../certificates/certificates.module';
import { StudentDashboardController } from './student-dashboard.controller';
// --- ADD to imports ---

// --- ADD CartModule to the imports array, alongside your existing modules ---
@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    InstructorRequestsModule,
    CoursesModule,
    CategoriesModule,
    LevelsModule,
    CourseSectionsModule,
    LessonsModule,
    LessonFilesModule,
    UploadModule,
    CartModule,
    PaymentModule,
    QuizModule,
    CertificatesModule, // ← add this
  ],
  controllers: [AppController, StudentDashboardController],
  providers: [AppService],
})
export class AppModule { }
