import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GenerateQuizDto } from './dto/generate-quiz.dto';
import { SaveQuizDto } from './dto/save-quiz.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';

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
  constructor(private prisma: PrismaService) {}

  private async verifyOwnership(courseId: number, user: any) {
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
    if (!course) throw new NotFoundException('Course not found');
    // Admins (role 3) can manage any course
    if (user?.roleId !== 3 && course.Teacher_Id !== user?.id) {
      throw new ForbiddenException('You can only manage your own courses');
    }
    return course;
  }

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
    // strip ```json ... ``` fences if the model added them anyway
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
        // Use the model's skillTag if present, fall back to the course category, then empty string
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

  async generateQuestions(
    courseId: number,
    currentUser: any,
    dto: GenerateQuizDto,
  ) {
    const course = await this.verifyOwnership(courseId, currentUser);
    const { system, user } = this.buildPrompt(course, dto.count);

    const apiUrl =
      process.env.AI_API_URL || 'http://92.246.145.99:1234/v1/chat/completions';
    const model = 'qwen/qwen3-4b';

    let response: Response;
    try {
      response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: system,
            },
            {
              role: 'user',
              content: user,
            },
          ],
          temperature: 0.7,
          chat_template_kwargs: { enable_thinking: false },
        }),
      });
    } catch (e) {
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

  async getQuiz(courseId: number, user: any) {
    await this.verifyOwnership(courseId, user);
    const quiz = await this.prisma.quizzes.findFirst({
      where: { Course_Id: courseId },
      include: {
        QuizQuestions: {
          orderBy: { DisplayOrder: 'asc' },
          include: { QuizChoices: { orderBy: { DisplayOrder: 'asc' } } },
        },
      },
    });
    return quiz;
  }
  async saveQuiz(courseId: number, user: any, dto: SaveQuizDto) {
    await this.verifyOwnership(courseId, user);

    if (dto.questionsToShow > dto.questions.length) {
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

    if (dto.passScore > totalMaxScore) {
      throw new BadRequestException(
        'نمره قبولی نمی‌تواند از مجموع نمرات سوالات بیشتر باشد.',
      );
    }

    return this.prisma.$transaction(
      async (tx) => {
        const existing = await tx.quizzes.findFirst({
          where: { Course_Id: courseId },
        });

        if (existing) {
          const oldQuestions = await tx.quizQuestions.findMany({
            where: { Quiz_Id: existing.Id },
            select: { Id: true },
          });

          const questionIds = oldQuestions.map((q) => q.Id);

          if (questionIds.length > 0) {
            await tx.quizChoices.deleteMany({
              where: { Question_Id: { in: questionIds } },
            });
            await tx.quizQuestions.deleteMany({
              where: { Id: { in: questionIds } },
            });
          }

          await tx.quizzes.delete({ where: { Id: existing.Id } });
        }

        const quiz = await tx.quizzes.create({
          data: {
            Course_Id: courseId,
            Title: dto.title || 'آزمون دوره',
            StartAt: new Date(dto.startAt),
            EndAt: new Date(dto.endAt),
            DurationMinutes: dto.durationMinutes,
            ScorePerQuestion: dto.scorePerQuestion ?? 1,
            PassScore: dto.passScore,
            QuestionsToShow: dto.questionsToShow,
            ShowAllQuestions: dto.showAllQuestions ?? false,
            AllowPreviousQuestion: dto.allowPreviousQuestion ?? true,
            IsPublished: true,
          },
        });

        for (let i = 0; i < dto.questions.length; i++) {
          const q = dto.questions[i];

          const question = await tx.quizQuestions.create({
            data: {
              Quiz_Id: quiz.Id,
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

        return tx.quizzes.findUnique({
          where: { Id: quiz.Id },
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

  async startQuiz(courseId: number, studentId: number) {
    const enrolled = await this.prisma.enrollments.findFirst({
      where: { Course_Id: courseId, Student_Id: studentId },
    });
    if (!enrolled)
      throw new ForbiddenException('شما در این دوره ثبت‌نام نکرده‌اید.');

    const quiz = await this.prisma.quizzes.findFirst({
      where: { Course_Id: courseId },
      include: { QuizQuestions: { include: { QuizChoices: true } } },
    });
    if (!quiz)
      throw new NotFoundException('آزمونی برای این دوره تعریف نشده است.');

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
      // resume an in-progress attempt (e.g. after a page refresh)
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
      // never send IsCorrect to the client
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
      correctCount: attempt.QuizAttemptAnswers.filter((a) => a.IsCorrect)
        .length,
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
