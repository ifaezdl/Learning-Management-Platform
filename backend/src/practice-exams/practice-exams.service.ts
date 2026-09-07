import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';

export interface WeakSkillByCourse {
  courseId: number;
  courseTitle: string;
  weakSkills: {
    tag: string;
    percentage: number;
    correct: number;
    total: number;
  }[];
  hasAttemptedMainQuiz: boolean;
  allCourseSkills: string[];
}

export interface PracticeExamResult {
  id: number;
  courseId: number;
  courseTitle: string;
  title: string;
  createdAt: Date;
  score: number;
  maxScore: number;
  isPassed: boolean;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
}

@Injectable()
export class PracticeExamsService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
  ) {}

  /**
   * Endpoint 1: دریافت مهارت‌های ضعیف دانشجو به تفکیک دوره
   */
  async getWeakSkillsByCoursesForStudent(
    studentId: number,
  ): Promise<WeakSkillByCourse[]> {
    const enrollments = await this.prisma.enrollments.findMany({
      where: { Student_Id: studentId },
      include: { Courses: { select: { Id: true, Title: true } } },
    });

    const results: WeakSkillByCourse[] = [];

    for (const enrollment of enrollments) {
      const courseId = enrollment.Courses.Id;
      const courseTitle = enrollment.Courses.Title;

      const mainQuizzes = await this.prisma.quizzes.findMany({
        where: { Course_Id: courseId, IsPublished: true },
        select: { Id: true },
      });

      if (mainQuizzes.length === 0) {
        results.push({
          courseId,
          courseTitle,
          weakSkills: [],
          hasAttemptedMainQuiz: false,
          allCourseSkills: [],
        });
        continue;
      }

      const quizIds = mainQuizzes.map((q) => q.Id);

      const attempts = await this.prisma.quizAttempts.findMany({
        where: {
          Student_Id: studentId,
          Quiz_Id: { in: quizIds },
          SubmittedAt: { not: null },
        },
        select: { Id: true },
      });

      if (attempts.length === 0) {
        const allQuizzes = await this.prisma.quizzes.findMany({
          where: { Course_Id: courseId },
          include: {
            QuizQuestions: { select: { SkillTag: true } },
          },
        });

        const allSkillTags = new Set<string>();
        for (const quiz of allQuizzes) {
          for (const question of quiz.QuizQuestions) {
            if (question.SkillTag && question.SkillTag.trim()) {
              allSkillTags.add(question.SkillTag.trim());
            }
          }
        }

        results.push({
          courseId,
          courseTitle,
          weakSkills: [],
          hasAttemptedMainQuiz: false,
          allCourseSkills: Array.from(allSkillTags),
        });
        continue;
      }

      const attemptIds = attempts.map((a) => a.Id);
      const answers = await this.prisma.quizAttemptAnswers.findMany({
        where: { Attempt_Id: { in: attemptIds } },
        include: {
          QuizQuestions: { select: { SkillTag: true } },
        },
      });

      const skillMap = new Map<
        string,
        { correct: number; total: number; percentage: number }
      >();

      for (const answer of answers) {
        const tag =
          answer.QuizQuestions.SkillTag &&
          answer.QuizQuestions.SkillTag.trim()
            ? answer.QuizQuestions.SkillTag.trim()
            : 'سایر';

        const stat = skillMap.get(tag) || { correct: 0, total: 0, percentage: 0 };
        stat.total += 1;
        if (answer.IsCorrect) stat.correct += 1;
        stat.percentage =
          stat.total === 0 ? 0 : Math.round((stat.correct / stat.total) * 100);
        skillMap.set(tag, stat);
      }

      const weakSkills = Array.from(skillMap.entries())
        .map(([tag, stat]) => ({
          tag,
          percentage: stat.percentage,
          correct: stat.correct,
          total: stat.total,
        }))
        .filter((s) => s.percentage < 70)
        .sort((a, b) => a.percentage - b.percentage);

      results.push({
        courseId,
        courseTitle,
        weakSkills,
        hasAttemptedMainQuiz: true,
        allCourseSkills: Array.from(skillMap.keys()),
      });
    }

    return results;
  }

  /**
   * Endpoint 2: ایجاد آزمون تمرینی با استفاده از هوش مصنوعی
   * Generate practice exam using AI model
   */
  async generatePracticeExam(
    studentId: number,
    courseId: number,
    skillTag?: string,
    questionCount: number = 10,
  ) {
    try {
      // تحقق از ثبت‌نام دانشجو
      const enrollment = await this.prisma.enrollments.findFirst({
        where: { Student_Id: studentId, Course_Id: courseId },
      });
      if (!enrollment) {
        throw new ForbiddenException('شما در این دوره ثبت‌نام نکرده‌اید.');
      }

      // دریافت اطلاعات دوره با تمام روابط مورد نیاز
      const course = await this.prisma.courses.findUnique({
        where: { Id: courseId },
        include: {
          Category: true,
          Level: true,
          CourseLearningOutcomes: { orderBy: { DisplayOrder: 'asc' } },
          CoursePrequisties: { orderBy: { DisplayOrder: 'asc' } },
          CourseSections: {
            orderBy: { DisplayOrder: 'asc' },
            include: { Lessons: { orderBy: { SortOrder: 'asc' } } },
          },
        },
      });

      if (!course) {
        throw new NotFoundException('دوره یافت نشد.');
      }

      // تولید سوالات از طریق هوش مصنوعی
      let aiQuestions: any[];
      try {
        if (skillTag && skillTag.trim()) {
          // اگر مهارت خاص انتخاب شده، سوالات برای آن مهارت تولید کن
          aiQuestions = await this.aiService.generateQuestionsForSkill(
            course,
            skillTag,
            questionCount,
          );
        } else {
          // وگرنه سوالات کلی دوره تولید کن
          aiQuestions = await this.aiService.generateQuestionsForCourse(
            course,
            questionCount,
          );
        }
      } catch (error: any) {
        // بهتر error message ارسال کن
        const errorMessage = error.message || 'خطا در تولید سوالات';
        console.error('AI Question Generation Error:', errorMessage);
        
        if (errorMessage.includes('در دسترس نیست')) {
          throw new BadRequestException(errorMessage);
        }
        
        throw new BadRequestException(
          `❌ ${errorMessage}`,
        );
      }

      if (aiQuestions.length === 0) {
        throw new BadRequestException('❌ هوش مصنوعی نتوانست سوالات معتبری تولید کند.');
      }

      // تبدیل سوالات تولید شده به فرمت مورد انتظار فرانت‌اند
      // هر سوال یک ID موقتی دریافت می‌کند (منفی برای تمایز از سوالات پایگاه داده)
      return aiQuestions.map((q, index) => {
        // پیدا کردن شاخص گزینه صحیح
        const correctChoiceIndex = q.choices.findIndex((c: any) => c.isCorrect);
        
        return {
          id: -(index + 1), // ID منفی برای نشان‌دادن سوالات تولید شده
          questionText: q.questionText,
          skillTag: q.skillTag,
          choices: q.choices.map((choice: any, choiceIndex: number) => ({
            id: -(index + 1) * 100 - (choiceIndex + 1), // ID منفی برای گزینه‌ها
            text: choice.text,
          })),
          correctChoiceIndex, // شاخص گزینه صحیح (0-3)
          score: 1, // هر سوال 1 امتیاز
          isGenerated: true, // نشان‌دادن اینکه سوال توسط AI تولید شده
        };
      });
    } catch (error: any) {
      // اگر error از قبل است، همان رو پاس بده
      if (error.status) {
        throw error;
      }
      // وگرنه generic error بده
      throw new BadRequestException(
        error.message || '❌ خطا در ایجاد آزمون تمرینی',
      );
    }
  }

  /**
   * Endpoint 3: ثبت نتیجه آزمون تمرینی
   * Handle both database questions and AI-generated questions
   */
  async submitPracticeExam(
    studentId: number,
    courseId: number,
    answers: { questionId: number; choiceId: number; questionText?: string; correctChoiceIndex?: number; choices?: Array<{id: number; text: string; choiceIndex: number}>  }[],
    skillTag?: string,
  ) {
    try {
      const enrollment = await this.prisma.enrollments.findFirst({
        where: { Student_Id: studentId, Course_Id: courseId },
      });
      if (!enrollment) {
        throw new ForbiddenException('شما در این دوره ثبت‌نام نکرده‌اید.');
      }

      let totalScore = 0;
      let maxScore = 0;
      let correctCount = 0;

      const answerDetails: any[] = [];

      // جداسازی سوالات تولید شده و سوالات پایگاه داده
      const dbQuestionIds = answers
        .filter((a) => a.questionId > 0)
        .map((a) => a.questionId);
      
      const generatedQuestions = answers.filter((a) => a.questionId < 0);

      // برای سوالات پایگاه داده
      let dbQuestions: any[] = [];
      if (dbQuestionIds.length > 0) {
        dbQuestions = await this.prisma.quizQuestions.findMany({
          where: { Id: { in: dbQuestionIds } },
          include: { QuizChoices: true, Quizzes: { select: { Course_Id: true } } },
        });

        const isValidCourse = dbQuestions.every(
          (q) => q.Quizzes.Course_Id === courseId,
        );
        if (!isValidCourse) {
          throw new BadRequestException(
            'یکی یا بیشتر از سوالات برای این دوره نیستند.',
          );
        }

        for (const answer of answers.filter((a) => a.questionId > 0)) {
          const question = dbQuestions.find((q) => q.Id === answer.questionId);
          if (!question) continue;

          maxScore += Number(question.Score);
          const correctChoice = question.QuizChoices.find((c) => c.IsCorrect);
          const chosenChoice = question.QuizChoices.find(
            (c) => c.Id === answer.choiceId,
          );

          const isCorrect =
            !!chosenChoice && chosenChoice.Id === correctChoice?.Id;
          if (isCorrect) {
            totalScore += Number(question.Score);
            correctCount += 1;
          }

          answerDetails.push({
            questionId: answer.questionId,
            studentChoiceId: answer.choiceId,
            isCorrect,
            questionText: question.QuestionText,
            skillTag: question.SkillTag || 'سایر',
            choices: question.QuizChoices.map((c) => ({
              id: c.Id,
              text: c.ChoiceText,
              isCorrect: c.IsCorrect,
            })),
            isGenerated: false,
          });
        }
      }

      // برای سوالات تولید شده توسط AI
      for (const answer of generatedQuestions) {
        maxScore += 1; // هر سوال 1 امتیاز

        // Log برای debugging
        console.log(`\n=== AI Question ${answer.questionId} ===`);
        console.log(`correctChoiceIndex: ${answer.correctChoiceIndex}`);
        console.log(`studentChoiceId (choiceId): ${answer.choiceId}`);
        console.log(`choices: ${answer.choices?.length || 0} items`);

        // seatCheck: choiceId باید با correctChoiceIndex برابر باشد
        const isCorrect = answer.choiceId === answer.correctChoiceIndex;
        console.log(`isCorrect: ${isCorrect}`);
        
        if (isCorrect) {
          totalScore += 1;
          correctCount += 1;
        }

        answerDetails.push({
          questionId: answer.questionId,
          studentChoiceId: answer.choiceId,
          isCorrect,
          questionText: answer.questionText,
          skillTag: skillTag || 'تمرین عمومی',
          correctChoiceIndex: answer.correctChoiceIndex,
          // ذخیره گزینه‌ها برای سوالات AI (جدید!)
          choices: answer.choices?.map((choice, idx) => ({
            id: choice.id,
            text: choice.text,
            isCorrect: idx === answer.correctChoiceIndex,
          })) || [],
          isGenerated: true,
        });
      }

      const result = await this.prisma.practiceExamResults.create({
        data: {
          Student_Id: studentId,
          Course_Id: courseId,
          SkillTag: skillTag || null,
          Score: totalScore,
          MaxScore: maxScore,
          CorrectCount: correctCount,
          TotalQuestions: answers.length,
          AnswerDetails: JSON.stringify(answerDetails),
          CompletedAt: new Date(),
        },
      });

      const course = await this.prisma.courses.findUnique({
        where: { Id: courseId },
        select: { Title: true },
      });

      const scoreNum = Number(result.Score);
      const maxScoreNum = Number(result.MaxScore);

      return {
        id: result.Id,
        courseId,
        courseTitle: course?.Title,
        score: scoreNum,
        maxScore: maxScoreNum,
        isPassed: scoreNum >= maxScoreNum * 0.7,
        totalQuestions: result.TotalQuestions,
        correctCount: result.CorrectCount,
        wrongCount: result.TotalQuestions - result.CorrectCount,
        percentage: Math.round((scoreNum / maxScoreNum) * 100),
      };
    } catch (error: any) {
      if (error.code === 'P2021') {
        throw new BadRequestException(
          '⚠️ جدول PracticeExamResults هنوز ایجاد نشده است. لطفاً DATABASE_MIGRATION_GUIDE.md را بخوانید.',
        );
      }
      throw error;
    }
  }

  /**
   * Endpoint 4: دریافت لیست آزمون‌های تمرینی
   */
  async getPracticeExamResults(studentId: number, courseId?: number) {
    try {
      const results = await this.prisma.practiceExamResults.findMany({
        where: {
          Student_Id: studentId,
          ...(courseId ? { Course_Id: courseId } : {}),
        },
        include: {
          Courses: { select: { Title: true } },
        },
        orderBy: { CompletedAt: 'desc' },
      });

      return results.map((r) => ({
        id: r.Id,
        courseId: r.Course_Id,
        courseTitle: r.Courses.Title,
        title: `آزمون تمرینی${r.SkillTag ? ` - ${r.SkillTag}` : ''}`,
        skillTag: r.SkillTag,
        score: Number(r.Score),
        maxScore: Number(r.MaxScore),
        isPassed: Number(r.Score) >= Number(r.MaxScore) * 0.7,
        totalQuestions: r.TotalQuestions,
        correctCount: r.CorrectCount,
        wrongCount: r.TotalQuestions - r.CorrectCount,
        percentage: Math.round((Number(r.Score) / Number(r.MaxScore)) * 100),
        completedAt: r.CompletedAt,
      }));
    } catch (error: any) {
      if (error.code === 'P2021') {
        console.error('⚠️ جدول PracticeExamResults هنوز ایجاد نشده است');
        return [];
      }
      throw error;
    }
  }

  /**
   * Endpoint 5: دریافت تفاصیل نتیجه
   */
  async getPracticeExamResultDetails(resultId: number, studentId: number) {
    try {
      const result = await this.prisma.practiceExamResults.findUnique({
        where: { Id: resultId },
        include: {
          Courses: { select: { Title: true } },
        },
      });

      if (!result) {
        throw new NotFoundException('نتیجه یافت نشد.');
      }

      if (result.Student_Id !== studentId) {
        throw new ForbiddenException('دسترسی مجاز نیست.');
      }

      const answerDetails = JSON.parse(result.AnswerDetails || '[]');
      
      // جداسازی سوالات پایگاه داده و AI
      const dbQuestionIds = answerDetails
        .filter((a: any) => !a.isGenerated && a.questionId > 0)
        .map((a: any) => a.questionId);

      // دریافت سوالات پایگاه داده
      let dbQuestions: any[] = [];
      if (dbQuestionIds.length > 0) {
        dbQuestions = await this.prisma.quizQuestions.findMany({
          where: { Id: { in: dbQuestionIds } },
          include: { QuizChoices: true },
        });
      }

      // بازسازی تمام سوالات (پایگاه داده و AI)
      const enrichedQuestions = answerDetails
        .map((answer: any, index: number) => {
          // برای سوالات پایگاه داده
          if (!answer.isGenerated && answer.questionId > 0) {
            const question = dbQuestions.find((q) => q.Id === answer.questionId);
            
            // اگر سوال در DB وجود نداشته باشد، از stored data استفاده کن
            if (!question) {
              // حتی اگر سوال حذف شده باشد، داده‌های ذخیره شده را نمایش بده
              return {
                questionId: answer.questionId,
                questionText: answer.questionText || 'سوال پیدا نشد',
                skillTag: answer.skillTag || 'سایر',
                isCorrect: answer.isCorrect,
                studentChoiceId: answer.studentChoiceId || null,
                choices: answer.choices || [
                  { id: -1, text: 'پاسخ‌نامه حذف شده', isCorrect: false }
                ],
              };
            }

            return {
              questionId: answer.questionId,
              questionText: answer.questionText || question.QuestionText,
              skillTag: answer.skillTag || question.SkillTag || 'سایر',
              isCorrect: answer.isCorrect,
              studentChoiceId: answer.studentChoiceId || null,
              choices: answer.choices || question.QuizChoices.map((choice) => ({
                id: choice.Id,
                text: choice.ChoiceText,
                isCorrect: choice.IsCorrect,
              })),
            };
          }

          // برای سوالات توسط AI (بازسازی از داده‌های ذخیره شده)
          if (answer.isGenerated || answer.questionId < 0) {
            // اگر correctChoiceIndex تعریف نشده باشد، از stored data استفاده کن
            const correctIdx = answer.correctChoiceIndex !== undefined 
              ? answer.correctChoiceIndex 
              : 0;

            return {
              questionId: answer.questionId,
              questionText: answer.questionText || 'سوال بدون متن',
              skillTag: answer.skillTag || 'تمرین عمومی',
              isCorrect: answer.isCorrect,
              studentChoiceId: answer.studentChoiceId,
              // برای سوالات AI، گزینه‌ها را بازسازی کن از correctChoiceIndex
              choices: answer.choices && Array.isArray(answer.choices) 
                ? answer.choices 
                : Array(4)
                    .fill(null)
                    .map((_, choiceIdx) => ({
                      id: -(Math.abs(answer.questionId) * 100 + choiceIdx + 1),
                      text: choiceIdx === correctIdx 
                        ? `گزینه ${choiceIdx + 1} (صحیح)` 
                        : `گزینه ${choiceIdx + 1}`,
                      isCorrect: choiceIdx === correctIdx,
                    })),
            };
          }

          // Fallback: هر سوالی که match نشود
          return {
            questionId: answer.questionId,
            questionText: answer.questionText || 'سوال بدون عنوان',
            skillTag: answer.skillTag || 'نامشخص',
            isCorrect: answer.isCorrect,
            studentChoiceId: answer.studentChoiceId || null,
            choices: answer.choices || [{ id: -1, text: 'داده‌ای موجود نیست', isCorrect: false }],
          };
        })
        .filter(q => q !== null && q !== undefined);

      return {
        id: result.Id,
        courseId: result.Course_Id,
        courseTitle: result.Courses.Title,
        skillTag: result.SkillTag,
        score: Number(result.Score),
        maxScore: Number(result.MaxScore),
        percentage: Math.round((Number(result.Score) / Number(result.MaxScore)) * 100),
        totalQuestions: result.TotalQuestions,
        correctCount: result.CorrectCount,
        wrongCount: result.TotalQuestions - result.CorrectCount,
        isPassed: Number(result.Score) >= Number(result.MaxScore) * 0.7,
        completedAt: result.CompletedAt,
        questions: enrichedQuestions,
      };
    } catch (error: any) {
      if (error.code === 'P2021') {
        throw new NotFoundException('جدول PracticeExamResults هنوز ایجاد نشده است.');
      }
      throw error;
    }
  }

  /**
   * Endpoint 6: مقایسه پیشرفت
   */
  async comparePracticeExamProgress(
    studentId: number,
    courseId: number,
    skillTag?: string,
  ) {
    try {
      const results = await this.prisma.practiceExamResults.findMany({
        where: {
          Student_Id: studentId,
          Course_Id: courseId,
          ...(skillTag ? { SkillTag: skillTag } : {}),
        },
        orderBy: { CompletedAt: 'asc' },
      });

      if (results.length < 2) {
        return {
          hasComparison: false,
          message: 'برای مقایسه حداقل دو آزمون تمرینی لازم است.',
        };
      }

      const previousResult = results[results.length - 2];
      const latestResult = results[results.length - 1];

      const previousPercentage = Math.round(
        (Number(previousResult.Score) / Number(previousResult.MaxScore)) * 100,
      );
      const latestPercentage = Math.round(
        (Number(latestResult.Score) / Number(latestResult.MaxScore)) * 100,
      );

      const improvement = latestPercentage - previousPercentage;
      const trend = improvement > 0 ? 'صعودی' : improvement < 0 ? 'نزولی' : 'ثابت';

      return {
        hasComparison: true,
        previousResult: {
          percentage: previousPercentage,
          correctCount: previousResult.CorrectCount,
          totalQuestions: previousResult.TotalQuestions,
          date: previousResult.CompletedAt,
        },
        latestResult: {
          percentage: latestPercentage,
          correctCount: latestResult.CorrectCount,
          totalQuestions: latestResult.TotalQuestions,
          date: latestResult.CompletedAt,
        },
        improvement,
        trend,
        message:
          trend === 'صعودی'
            ? `تبریک! شما ${improvement}٪ بهتر شدید.`
            : trend === 'نزولی'
              ? `مقدار شما ${Math.abs(improvement)}٪ کاهش یافت. دوباره سعی کنید.`
              : 'نتایج شما ثابت باقی مانده است.',
      };
    } catch (error: any) {
      if (error.code === 'P2021') {
        return {
          hasComparison: false,
          message: 'جدول PracticeExamResults هنوز ایجاد نشده است.',
        };
      }
      throw error;
    }
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
