import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
  constructor(private prisma: PrismaService) {}

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
   * Endpoint 2: ایجاد آزمون تمرینی
   */
  async generatePracticeExam(
    studentId: number,
    courseId: number,
    skillTag?: string,
    questionCount: number = 10,
  ) {
    const enrollment = await this.prisma.enrollments.findFirst({
      where: { Student_Id: studentId, Course_Id: courseId },
    });
    if (!enrollment) {
      throw new ForbiddenException('شما در این دوره ثبت‌نام نکرده‌اید.');
    }

    const quizzes = await this.prisma.quizzes.findMany({
      where: { Course_Id: courseId },
      include: {
        QuizQuestions: {
          include: { QuizChoices: true },
        },
      },
    });

    if (quizzes.length === 0) {
      throw new NotFoundException('هیچ آزمونی برای این دوره وجود ندارد.');
    }

    let allQuestions: any[] = [];
    for (const quiz of quizzes) {
      allQuestions = [...allQuestions, ...quiz.QuizQuestions];
    }

    if (skillTag && skillTag.trim()) {
      allQuestions = allQuestions.filter(
        (q) =>
          q.SkillTag &&
          q.SkillTag.trim().toLowerCase() === skillTag.trim().toLowerCase(),
      );
    }

    if (allQuestions.length === 0) {
      throw new BadRequestException(
        'هیچ سوالی برای این مهارت/دوره وجود ندارد.',
      );
    }

    // حداقل 10 سوال برای تمرین کافی
    if (allQuestions.length < 10) {
      throw new BadRequestException(
        `برای ایجاد آزمون تمرینی، حداقل ۱۰ سوال نیاز است. فقط ${allQuestions.length} سوال دردسترس است.`,
      );
    }

    const shuffled = this.shuffleArray(allQuestions).slice(
      0,
      Math.min(questionCount, allQuestions.length),
    );

    return shuffled.map((q) => ({
      id: q.Id,
      questionText: q.QuestionText,
      skillTag: q.SkillTag || 'سایر',
      choices: q.QuizChoices.map((c: any) => ({
        id: c.Id,
        text: c.ChoiceText,
      })),
      score: Number(q.Score),
    }));
  }

  /**
   * Endpoint 3: ثبت نتیجه آزمون تمرینی
   */
  async submitPracticeExam(
    studentId: number,
    courseId: number,
    answers: { questionId: number; choiceId: number }[],
    skillTag?: string,
  ) {
    try {
      const enrollment = await this.prisma.enrollments.findFirst({
        where: { Student_Id: studentId, Course_Id: courseId },
      });
      if (!enrollment) {
        throw new ForbiddenException('شما در این دوره ثبت‌نام نکرده‌اید.');
      }

      const questionIds = answers.map((a) => a.questionId);
      const questions = await this.prisma.quizQuestions.findMany({
        where: { Id: { in: questionIds } },
        include: { QuizChoices: true, Quizzes: { select: { Course_Id: true } } },
      });

      const isValidCourse = questions.every(
        (q) => q.Quizzes.Course_Id === courseId,
      );
      if (!isValidCourse) {
        throw new BadRequestException('یکی یا بیشتر از سوالات برای این دوره نیستند.');
      }

      let totalScore = 0;
      let maxScore = 0;
      let correctCount = 0;

      const answerDetails: { questionId: number; isCorrect: boolean }[] = [];

      for (const answer of answers) {
        const question = questions.find((q) => q.Id === answer.questionId);
        if (!question) continue;

        maxScore += Number(question.Score);
        const correctChoice = question.QuizChoices.find(
          (c) => c.IsCorrect,
        );
        const chosenChoice = question.QuizChoices.find(
          (c) => c.Id === answer.choiceId,
        );

        const isCorrect = !!chosenChoice && chosenChoice.Id === correctChoice?.Id;
        if (isCorrect) {
          totalScore += Number(question.Score);
          correctCount += 1;
        }

        answerDetails.push({
          questionId: answer.questionId,
          isCorrect,
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
        answerDetails,
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
