import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GenerateQuizDto } from './dto/generate-quiz.dto';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { RecommendationsService } from '../recommendations/recommendations.service';

interface AiChoice {
  text: string;
  isCorrect: boolean;
}
export interface AiQuestion {
  questionText: string;
  skillTag: string;
  choices: AiChoice[];
}

@Injectable()
export class QuizService {
  constructor(
    private prisma: PrismaService,
    private recommendationsService: RecommendationsService,
  ) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // Ownership helpers — دقیقاً همان الگوی CourseSectionsService
  // ─────────────────────────────────────────────────────────────────────────────

  /** مالکیت دوره را بررسی می‌کند — برای عملیات روی کل دوره */
  private async verifyCourseOwnership(courseId: number, user: any) {
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
    if (!course) throw new NotFoundException('دوره یافت نشد.');
    if (user?.roleId !== 3 && course.Teacher_Id !== user?.id) {
      throw new ForbiddenException('شما فقط می‌توانید دوره‌های خود را مدیریت کنید.');
    }
    return course;
  }

  /** مالکیت آزمون را بررسی می‌کند — برای عملیات روی یک آزمون خاص */
  private async verifyQuizOwnership(quizId: number, user: any) {
    const quiz = await this.prisma.quizzes.findUnique({
      where: { Id: quizId },
      include: {
        Courses: {
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
        },
      },
    });
    if (!quiz) throw new NotFoundException('آزمون یافت نشد.');
    if (user?.roleId !== 3 && quiz.Courses.Teacher_Id !== user?.id) {
      throw new ForbiddenException('شما فقط می‌توانید آزمون‌های دوره‌های خود را مدیریت کنید.');
    }
    return quiz;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // AI helpers
  // ─────────────────────────────────────────────────────────────────────────────

  private buildPrompt(
    course: any,
    count: number,
  ): { system: string; user: string } {
    const outcomes = course.CourseLearningOutcomes.map(
      (o: any) => o.Title,
    ).join('، ');
    const prerequisites = course.CoursePrequisties.map(
      (p: any) => p.Title,
    ).join('، ');
    const lessonTitles = course.CourseSections.flatMap((s: any) =>
      s.Lessons.map((l: any) => l.Title),
    ).join('، ');

    const system = `تو یک طراح آزمون حرفه‌ای هستی. باید فقط و فقط یک آرایه JSON معتبر برگردانی، بدون هیچ توضیح اضافه، بدون Markdown، بدون backtick.
هر آیتم آرایه باید این ساختار را داشته باشد:
{"questionText": "متن سوال", "skillTag": "برچسب مهارت (۲ تا ۴ کلمه فارسی، مثلاً 'مدیریت حافظه' یا 'حلقه‌های تکرار')", "choices": [{"text":"گزینه", "isCorrect": true}, {"text":"گزینه", "isCorrect": false}, {"text":"گزینه", "isCorrect": false}, {"text":"گزینه", "isCorrect": false}]}
هر سوال دقیقاً باید ۴ گزینه داشته باشد و فقط یکی از آن‌ها isCorrect:true باشد. سوالات باید تک‌گزینه‌ای (single choice) باشند و مستقیماً بر اساس محتوای دوره زیر طراحی شوند، نه اطلاعات عمومی نامرتبط. برچسب مهارت باید مفهوم اصلی که سوال آن را می‌سنجد را در ۲ تا ۴ کلمه فارسی توصیف کند و با اهداف یادگیری دوره هم‌راستا باشد.`;

    const user = `عنوان دوره: ${course.Title}
دسته‌بندی: ${course.Category?.Title ?? ''}
سطح: ${course.Level?.LevelName ?? ''}
توضیح کوتاه: ${course.ShortDescription ?? ''}
توضیح کامل: ${course.Description ?? ''}
اهداف یادگیری: ${outcomes || 'ندارد'}
پیش‌نیازها: ${prerequisites || 'ندارد'}
عناوین درس‌ها: ${lessonTitles || 'ندارد'}

لطفاً دقیقاً ${count} سوال تک‌گزینه‌ای بر اساس این دوره تولید کن و فقط آرایه JSON را برگردان.`;

    return { system, user };
  }

  private extractJsonArray(raw: string, fallbackTag?: string): AiQuestion[] {
    let text = raw.trim();
    text = text
      .replace(/^```(?:json)?/i, '')
      .replace(/```$/, '')
      .trim();

    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');
    if (start === -1 || end === -1 || end < start) {
      throw new BadRequestException('پاسخ هوش مصنوعی قابل تجزیه نبود.');
    }
    const jsonSlice = text.slice(start, end + 1);

    let parsed: any;
    try {
      parsed = JSON.parse(jsonSlice);
    } catch {
      throw new BadRequestException('پاسخ هوش مصنوعی JSON معتبر نبود.');
    }

    if (!Array.isArray(parsed)) {
      throw new BadRequestException('ساختار پاسخ هوش مصنوعی نامعتبر است.');
    }

    return parsed
      .filter(
        (q) =>
          q &&
          typeof q.questionText === 'string' &&
          Array.isArray(q.choices) &&
          q.choices.length >= 2 &&
          q.choices.some((c: any) => c?.isCorrect === true),
      )
      .map((q) => ({
        questionText: q.questionText.trim(),
        skillTag:
          typeof q.skillTag === 'string' && q.skillTag.trim()
            ? q.skillTag.trim()
            : (fallbackTag ?? ''),
        choices: q.choices.map((c: any) => ({
          text: String(c.text).trim(),
          isCorrect: !!c.isCorrect,
        })),
      }));
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CRUD — چندآزمونی (الگوی CourseSections)
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * لیست خلاصه همه آزمون‌های یک دوره، همراه با تعداد سوال و شرکت‌کننده.
   * GET /courses/:courseId/quizzes
   */
  async listQuizzesByCourse(courseId: number, user: any) {
    await this.verifyCourseOwnership(courseId, user);

    return this.prisma.quizzes.findMany({
      where: { Course_Id: courseId },
      orderBy: { Id: 'asc' },
      include: {
        _count: {
          select: {
            QuizQuestions: true,
            QuizAttempts: true,
          },
        },
      },
    });
  }

  /**
   * ایجاد یک آزمون جدید برای دوره — همیشه رکورد جدید (نه جایگزینی).
   * POST /courses/:courseId/quizzes
   */
  async createQuiz(courseId: number, user: any, dto: CreateQuizDto) {
    await this.verifyCourseOwnership(courseId, user);

    return this.prisma.quizzes.create({
      data: {
        Course_Id: courseId,
        Title: dto.title ?? 'آزمون دوره',
        StartAt: new Date(dto.startAt),
        EndAt: new Date(dto.endAt),
        DurationMinutes: dto.durationMinutes,
        ScorePerQuestion: dto.scorePerQuestion ?? 1,
        PassScore: dto.passScore,
        QuestionsToShow: dto.questionsToShow,
        ShowAllQuestions: dto.showAllQuestions ?? false,
        AllowPreviousQuestion: dto.allowPreviousQuestion ?? true,
        IsPublished: false,
      },
    });
  }

  /**
   * جزئیات کامل یک آزمون + بانک سوالات، برای فرم ویرایش.
   * GET /quizzes/:quizId
   */
  async getQuizById(quizId: number, user: any) {
    const quiz = await this.verifyQuizOwnership(quizId, user);

    return this.prisma.quizzes.findUnique({
      where: { Id: quizId },
      include: {
        QuizQuestions: {
          orderBy: { DisplayOrder: 'asc' },
          include: { QuizChoices: { orderBy: { DisplayOrder: 'asc' } } },
        },
        _count: {
          select: { QuizAttempts: true },
        },
      },
    });
  }

  /**
   * ویرایش تنظیمات و/یا بانک سوالات یک آزمون خاص.
   * اگر questions ارسال شود، بانک سوالات همین آزمون کاملاً بازنویسی می‌شود
   * بدون اینکه آزمون‌های دیگر دوره دست‌خورده شوند.
   * PUT /quizzes/:quizId
   */
  async updateQuiz(quizId: number, user: any, dto: UpdateQuizDto) {
    await this.verifyQuizOwnership(quizId, user);

    if (dto.questions !== undefined) {
      // اعتبارسنجی بانک سوالات
      if (dto.questionsToShow !== undefined && dto.questionsToShow > dto.questions.length) {
        throw new BadRequestException(
          'تعداد سوالات نمایشی نمی‌تواند از تعداد کل سوالات بانک بیشتر باشد.',
        );
      }

      let totalMaxScore = 0;
      for (const q of dto.questions) {
        const correctCount = q.choices.filter((c) => c.isCorrect).length;
        if (correctCount !== 1) {
          throw new BadRequestException(
            `سوال "${q.questionText}" باید دقیقاً یک گزینه صحیح داشته باشد.`,
          );
        }
        totalMaxScore += q.score ?? 1;
      }

      if (dto.passScore !== undefined && dto.passScore > totalMaxScore) {
        throw new BadRequestException(
          'نمره قبولی نمی‌تواند از مجموع نمرات سوالات بیشتر باشد.',
        );
      }
    }

    return this.prisma.$transaction(
      async (tx) => {
        // به‌روزرسانی تنظیمات آزمون
        const updateData: any = {};
        if (dto.title !== undefined) updateData.Title = dto.title;
        if (dto.startAt !== undefined) updateData.StartAt = new Date(dto.startAt);
        if (dto.endAt !== undefined) updateData.EndAt = new Date(dto.endAt);
        if (dto.durationMinutes !== undefined) updateData.DurationMinutes = dto.durationMinutes;
        if (dto.scorePerQuestion !== undefined) updateData.ScorePerQuestion = dto.scorePerQuestion;
        if (dto.passScore !== undefined) updateData.PassScore = dto.passScore;
        if (dto.questionsToShow !== undefined) updateData.QuestionsToShow = dto.questionsToShow;
        if (dto.showAllQuestions !== undefined) updateData.ShowAllQuestions = dto.showAllQuestions;
        if (dto.allowPreviousQuestion !== undefined) updateData.AllowPreviousQuestion = dto.allowPreviousQuestion;

        await tx.quizzes.update({ where: { Id: quizId }, data: updateData });

        // بازنویسی بانک سوالات — فقط اگر questions ارسال شده باشد
        if (dto.questions !== undefined) {
          const oldQuestions = await tx.quizQuestions.findMany({
            where: { Quiz_Id: quizId },
            select: { Id: true },
          });
          const oldIds = oldQuestions.map((q) => q.Id);
          if (oldIds.length > 0) {
            await tx.quizChoices.deleteMany({ where: { Question_Id: { in: oldIds } } });
            await tx.quizQuestions.deleteMany({ where: { Id: { in: oldIds } } });
          }

          for (let i = 0; i < dto.questions.length; i++) {
            const q = dto.questions[i];
            const question = await tx.quizQuestions.create({
              data: {
                Quiz_Id: quizId,
                QuestionText: q.questionText,
                DisplayOrder: i + 1,
                Source: !!q.isAiGenerated,
                Score: q.score ?? 1,
                SkillTag: q.skillTag ?? null,
              },
            });
            await tx.quizChoices.createMany({
              data: q.choices.map((c, ci) => ({
                Question_Id: question.Id,
                ChoiceText: c.text,
                IsCorrect: c.isCorrect,
                DisplayOrder: ci + 1,
              })),
            });
          }
        }

        return tx.quizzes.findUnique({
          where: { Id: quizId },
          include: {
            QuizQuestions: {
              orderBy: { DisplayOrder: 'asc' },
              include: { QuizChoices: { orderBy: { DisplayOrder: 'asc' } } },
            },
          },
        });
      },
      { maxWait: 10000, timeout: 30000 },
    );
  }

  /**
   * Toggle وضعیت انتشار آزمون.
   * PUT /quizzes/:quizId/publish
   */
  async publishQuiz(quizId: number, user: any) {
    const quiz = await this.verifyQuizOwnership(quizId, user);

    const updated = await this.prisma.quizzes.update({
      where: { Id: quizId },
      data: { IsPublished: !quiz.IsPublished },
    });
    return { quizId: updated.Id, isPublished: updated.IsPublished };
  }

  /**
   * حذف آزمون با قانون حفاظت از داده‌های یادگیری:
   * - اگر هیچ attempt ثبت‌شده‌ای نداشته باشد → حذف واقعی
   * - اگر attempt دارد → حذف ممنوع؛ فقط غیرفعال‌سازی نرم پیشنهاد می‌شود
   * DELETE /quizzes/:quizId
   */
  async deleteQuiz(quizId: number, user: any) {
    await this.verifyQuizOwnership(quizId, user);

    const attemptCount = await this.prisma.quizAttempts.count({
      where: { Quiz_Id: quizId },
    });

    if (attemptCount > 0) {
      // غیرفعال‌سازی نرم به‌جای حذف قطعی — تاریخچه یادگیری دانشجو حفظ می‌شود
      await this.prisma.quizzes.update({
        where: { Id: quizId },
        data: { IsPublished: false },
      });
      throw new BadRequestException(
        'این آزمون دارای شرکت‌کننده است و قابل حذف کامل نیست؛ می‌توانید آن را غیرفعال کنید.',
      );
    }

    // حذف واقعی — Prisma cascade روی QuizQuestions/QuizChoices پاک می‌کند
    await this.prisma.quizzes.delete({ where: { Id: quizId } });
    return { message: 'آزمون با موفقیت حذف شد.' };
  }

  /**
   * تولید سوال با AI برای یک آزمون خاص (preview — ذخیره نمی‌شود تا PUT بعدی).
   * context پرامپت از رابطه Quiz → Course گرفته می‌شود.
   * POST /quizzes/:quizId/generate
   */
  async generateQuestions(
    quizId: number,
    currentUser: any,
    dto: GenerateQuizDto,
  ) {
    const quiz = await this.verifyQuizOwnership(quizId, currentUser);
    // course و همه روابط مورد نیاز پرامپت از verifyQuizOwnership (include Courses) آمده
    const course = quiz.Courses;

    const { system, user } = this.buildPrompt(course, dto.count);

    const apiUrl =
      process.env.AI_API_URL || 'http://92.246.145.99:1234/v1/chat/completions';
    const model = 'qwen/qwen3-4b';

    let response: Response;
    try {
      response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
          temperature: 0.7,
          chat_template_kwargs: { enable_thinking: false },
        }),
      });
    } catch {
      throw new BadRequestException('اتصال به سرویس هوش مصنوعی برقرار نشد.');
    }

    if (!response.ok) {
      throw new BadRequestException(
        `سرویس هوش مصنوعی خطا داد (${response.status}).`,
      );
    }

    const data: any = await response.json();
    const content: string | undefined = data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new BadRequestException('پاسخی از هوش مصنوعی دریافت نشد.');
    }

    const questions = this.extractJsonArray(content, course.Category?.Title);
    if (questions.length === 0) {
      throw new BadRequestException('هیچ سوال معتبری تولید نشد.');
    }
    return questions;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Student-facing methods — بدون تغییر در امضا (student-quiz.controller.ts)
  // ─────────────────────────────────────────────────────────────────────────────

  async listMyQuizzes(studentId: number) {
    const enrollments = await this.prisma.enrollments.findMany({
      where: { Student_Id: studentId },
      select: { Course_Id: true },
    });
    const courseIds = enrollments.map((e) => e.Course_Id);
    if (courseIds.length === 0) return [];

    const quizzes = await this.prisma.quizzes.findMany({
      where: { Course_Id: { in: courseIds }, IsPublished: true },
      include: {
        Courses: { select: { Title: true } },
        QuizQuestions: { select: { Id: true } },
      },
    });

    const attempts = await this.prisma.quizAttempts.findMany({
      where: {
        Quiz_Id: { in: quizzes.map((q) => q.Id) },
        Student_Id: studentId,
      },
    });
    const attemptByQuiz = new Map(attempts.map((a) => [a.Quiz_Id, a]));

    const now = new Date();
    return quizzes.map((q) => {
      const attempt = attemptByQuiz.get(q.Id);
      let status: 'upcoming' | 'available' | 'closed' = 'available';
      if (q.StartAt && now < q.StartAt) status = 'upcoming';
      else if (q.EndAt && now > q.EndAt) status = 'closed';

      return {
        quizId: q.Id,
        courseId: q.Course_Id,
        courseTitle: q.Courses.Title,
        title: q.Title,
        startAt: q.StartAt,
        endAt: q.EndAt,
        durationMinutes: q.DurationMinutes,
        questionsToShow: q.QuestionsToShow,
        bankSize: q.QuizQuestions.length,
        status,
        attempted: !!attempt?.SubmittedAt,
        attemptResult: attempt?.SubmittedAt
          ? {
              score: Number(attempt.Score),
              maxScore: Number(attempt.MaxScore),
              isPassed: attempt.IsPassed,
            }
          : null,
      };
    });
  }

  /**
   * شروع آزمون توسط دانشجو — حالا با quizId (نه courseId).
   * POST /quizzes/:quizId/start
   */
  async startQuiz(quizId: number, studentId: number) {
    const quiz = await this.prisma.quizzes.findUnique({
      where: { Id: quizId },
      include: { QuizQuestions: { include: { QuizChoices: true } } },
    });
    if (!quiz) throw new NotFoundException('آزمون یافت نشد.');

    if (!quiz.IsPublished) {
      throw new BadRequestException('این آزمون هنوز منتشر نشده است.');
    }

    const enrolled = await this.prisma.enrollments.findFirst({
      where: { Course_Id: quiz.Course_Id, Student_Id: studentId },
    });
    if (!enrolled)
      throw new ForbiddenException('شما در این دوره ثبت‌نام نکرده‌اید.');

    const now = new Date();
    if (quiz.StartAt && now < quiz.StartAt) {
      throw new BadRequestException('آزمون هنوز شروع نشده است.');
    }
    if (quiz.EndAt && now > quiz.EndAt) {
      throw new BadRequestException('مهلت شرکت در آزمون به پایان رسیده است.');
    }

    const existing = await this.prisma.quizAttempts.findUnique({
      where: {
        Quiz_Id_Student_Id: { Quiz_Id: quiz.Id, Student_Id: studentId },
      },
    });
    if (existing) {
      if (existing.SubmittedAt) {
        throw new BadRequestException('شما قبلاً در این آزمون شرکت کرده‌اید.');
      }
      if (now > existing.DeadlineAt) {
        throw new BadRequestException('زمان آزمون شما به پایان رسیده است.');
      }
      return this.buildAttemptResponse(quiz, existing);
    }

    const pool = [...quiz.QuizQuestions];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const selected = pool.slice(0, Math.min(quiz.QuestionsToShow, pool.length));

    const startedAt = now;
    const deadlineAt = new Date(
      startedAt.getTime() + (quiz.DurationMinutes ?? 30) * 60000,
    );

    const attempt = await this.prisma.quizAttempts.create({
      data: {
        Quiz_Id: quiz.Id,
        Student_Id: studentId,
        QuestionIds: JSON.stringify(selected.map((q) => q.Id)),
        StartedAt: startedAt,
        DeadlineAt: deadlineAt,
      },
    });

    return this.buildAttemptResponse(quiz, attempt, selected);
  }

  private buildAttemptResponse(quiz: any, attempt: any, selected?: any[]) {
    const questionIds: number[] = JSON.parse(attempt.QuestionIds);
    const questions =
      selected ??
      quiz.QuizQuestions.filter((q: any) => questionIds.includes(q.Id));
    return {
      attemptId: attempt.Id,
      quizId: quiz.Id,
      title: quiz.Title,
      showAllQuestions: quiz.ShowAllQuestions,
      allowPreviousQuestion: quiz.AllowPreviousQuestion,
      passScore: Number(quiz.PassScore),
      deadlineAt: attempt.DeadlineAt,
      questions: questions.map((q: any) => ({
        id: q.Id,
        questionText: q.QuestionText,
        score: Number(q.Score),
        choices: q.QuizChoices.map((c: any) => ({
          id: c.Id,
          text: c.ChoiceText,
        })),
      })),
    };
  }

  async submitQuiz(attemptId: number, studentId: number, dto: SubmitQuizDto) {
    const attempt = await this.prisma.quizAttempts.findUnique({
      where: { Id: attemptId },
    });
    if (!attempt || attempt.Student_Id !== studentId) {
      throw new NotFoundException('آزمون یافت نشد.');
    }
    if (attempt.SubmittedAt) {
      throw new BadRequestException('این آزمون قبلاً ثبت شده است.');
    }

    const selectedIds: number[] = JSON.parse(attempt.QuestionIds);
    const questions = await this.prisma.quizQuestions.findMany({
      where: { Id: { in: selectedIds } },
      include: { QuizChoices: true },
    });

    let score = 0;
    let maxScore = 0;
    const answerRows: any[] = [];

    for (const q of questions) {
      maxScore += Number(q.Score);
      const given = dto.answers.find((a) => a.questionId === q.Id);
      const correctChoice = q.QuizChoices.find((c) => c.IsCorrect);
      const chosenChoice = given?.choiceId
        ? q.QuizChoices.find((c) => c.Id === given.choiceId)
        : null;
      const isCorrect = !!chosenChoice && chosenChoice.Id === correctChoice?.Id;
      if (isCorrect) score += Number(q.Score);

      answerRows.push({
        Attempt_Id: attempt.Id,
        Question_Id: q.Id,
        Choice_Id: chosenChoice?.Id ?? null,
        IsCorrect: isCorrect,
      });
    }

    const quiz = await this.prisma.quizzes.findUnique({
      where: { Id: attempt.Quiz_Id },
    });
    const isPassed = score >= Number(quiz!.PassScore);

    await this.prisma.$transaction(async (tx) => {
      await tx.quizAttemptAnswers.createMany({ data: answerRows });
      await tx.quizAttempts.update({
        where: { Id: attempt.Id },
        data: {
          SubmittedAt: new Date(),
          Score: score,
          MaxScore: maxScore,
          IsPassed: isPassed,
        },
      });
      if (isPassed) {
        await tx.certificates.create({
          data: {
            Student_Id: studentId,
            Course_Id: quiz!.Course_Id,
            Attempt_Id: attempt.Id,
            CertificateCode: `CERT-${quiz!.Course_Id}-${attempt.Id}-${Date.now()}`,
            Score: score,
            MaxScore: maxScore,
          },
        });
      }
    });

    if (isPassed) {
      this.recommendationsService
        .refresh(studentId, 5)
        .catch((err) =>
          console.warn(
            `Failed to refresh recommendations for student ${studentId}:`,
            err,
          ),
        );
    }

    return this.getResult(attempt.Id, studentId);
  }

  async getResult(attemptId: number, studentId: number) {
    const attempt = await this.prisma.quizAttempts.findUnique({
      where: { Id: attemptId },
      include: { QuizAttemptAnswers: true },
    });
    if (!attempt || attempt.Student_Id !== studentId) {
      throw new NotFoundException('نتیجه‌ای یافت نشد.');
    }
    return {
      attemptId: attempt.Id,
      score: Number(attempt.Score),
      maxScore: Number(attempt.MaxScore),
      isPassed: attempt.IsPassed,
      totalQuestions: attempt.QuizAttemptAnswers.length,
      correctCount: attempt.QuizAttemptAnswers.filter((a) => a.IsCorrect).length,
      wrongCount: attempt.QuizAttemptAnswers.filter((a) => !a.IsCorrect).length,
    };
  }

  async getInProgressAttempt(studentId: number) {
    const attempt = await this.prisma.quizAttempts.findFirst({
      where: {
        Student_Id: studentId,
        SubmittedAt: null,
        DeadlineAt: { gt: new Date() },
      },
      include: {
        Quizzes: { include: { Courses: { select: { Title: true } } } },
      },
    });
    if (!attempt) return null;

    return {
      attemptId: attempt.Id,
      courseId: attempt.Quizzes.Course_Id,
      quizTitle: attempt.Quizzes.Title,
      courseTitle: attempt.Quizzes.Courses.Title,
      deadlineAt: attempt.DeadlineAt,
    };
  }
}
