import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { AnalyticsService } from '../src/analytics/analytics.service';

@Injectable()
export class CertificatesService {
  constructor(
    private prisma: PrismaService,
    private analyticsService: AnalyticsService,
  ) {}

  async myCertificates(studentId: number) {
    return await this.prisma.certificates.findMany({
      where: { Student_Id: studentId },
      include: { Courses: { select: { Title: true } } },
      orderBy: { IssuedAt: 'desc' },
    });
  }

  async getOne(id: number, studentId: number) {
    const cert = await this.prisma.certificates.findUnique({
      where: { Id: id },
      include: {
        Courses: { select: { Title: true } },
        Users: { select: { FirstName: true, LastName: true } },
      },
    });
    if (!cert || cert.Student_Id !== studentId) {
      throw new NotFoundException('گواهینامه یافت نشد.');
    }

    // Enrich with skill breakdown for the linked attempt (read-side only —
    // the original transaction is untouched).
    let skillBreakdown: ReturnType<AnalyticsService['groupBySkill']> = [];
    try {
      const result = await this.analyticsService.getAttemptSkills(
        cert.Attempt_Id,
        { id: studentId, roleId: 1 }, // student context — owns the attempt
      );
      skillBreakdown = result.skills;
    } catch {
      // Non-fatal: if no answers exist yet (edge case), return empty array
      skillBreakdown = [];
    }

    return { ...cert, skillBreakdown };
  }

  /**
   * پاسخنامه کامل یک آزمون: سوالات + پاسخ صحیح + پاسخ دانشجو
   * GET /certificates/:id/answers
   */
  async getAnswers(id: number, studentId: number) {
    const cert = await this.prisma.certificates.findUnique({
      where: { Id: id },
      include: {
        Courses: { select: { Title: true } },
        QuizAttempts: {
          include: {
            Quizzes: { select: { Title: true } },
            QuizAttemptAnswers: {
              include: {
                QuizQuestions: {
                  include: {
                    QuizChoices: { orderBy: { DisplayOrder: 'asc' } },
                  },
                },
                QuizChoices: true,
              },
            },
          },
        },
      },
    });

    if (!cert || cert.Student_Id !== studentId) {
      throw new NotFoundException('گواهینامه یافت نشد.');
    }

    const attempt = cert.QuizAttempts;
    const answers = attempt.QuizAttemptAnswers;

    // ساخت لیست سوالات با جزئیات کامل
    const questions = answers.map((a) => {
      const question = a.QuizQuestions;
      const studentChoice = a.QuizChoices;
      const correctChoice = question.QuizChoices.find((c) => c.IsCorrect);

      return {
        questionId: question.Id,
        questionText: question.QuestionText,
        displayOrder: question.DisplayOrder,
        score: Number(question.Score),
        skillTag: question.SkillTag,
        choices: question.QuizChoices.map((c) => ({
          id: c.Id,
          text: c.ChoiceText,
          isCorrect: c.IsCorrect,
        })),
        studentChoiceId: studentChoice?.Id ?? null,
        studentChoiceText: studentChoice?.ChoiceText ?? 'پاسخ داده نشده',
        correctChoiceId: correctChoice?.Id ?? null,
        correctChoiceText: correctChoice?.ChoiceText ?? '',
        isCorrect: a.IsCorrect ?? false,
      };
    });

    // مرتب‌سازی بر اساس ترتیب نمایش
    questions.sort((a, b) => a.displayOrder - b.displayOrder);

    const correctCount = questions.filter((q) => q.isCorrect).length;

    return {
      certificateId: cert.Id,
      certificateCode: cert.CertificateCode,
      courseTitle: cert.Courses.Title,
      quizTitle: attempt.Quizzes.Title,
      score: Number(cert.Score),
      maxScore: Number(cert.MaxScore),
      correctCount,
      totalQuestions: questions.length,
      questions,
    };
  }
}
