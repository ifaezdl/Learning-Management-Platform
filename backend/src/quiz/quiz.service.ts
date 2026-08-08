import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GenerateQuizDto } from './dto/generate-quiz.dto';
import { SaveQuizDto } from './dto/save-quiz.dto';

interface AiChoice {
  text: string;
  isCorrect: boolean;
}
export interface AiQuestion {
  questionText: string;
  choices: AiChoice[];
}

@Injectable()
export class QuizService {
  constructor(private prisma: PrismaService) { }

  private async verifyOwnership(courseId: number, userId: number) {
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
    if (course.Teacher_Id !== userId) {
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
{"questionText": "متن سوال", "choices": [{"text":"گزینه", "isCorrect": true}, {"text":"گزینه", "isCorrect": false}, {"text":"گزینه", "isCorrect": false}, {"text":"گزینه", "isCorrect": false}]}
هر سوال دقیقاً باید ۴ گزینه داشته باشد و فقط یکی از آن‌ها isCorrect:true باشد. سوالات باید تک‌گزینه‌ای (single choice) باشند و مستقیماً بر اساس محتوای دوره زیر طراحی شوند، نه اطلاعات عمومی نامرتبط.`;

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

  private extractJsonArray(raw: string): AiQuestion[] {
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
        choices: q.choices.map((c: any) => ({
          text: String(c.text).trim(),
          isCorrect: !!c.isCorrect,
        })),
      }));
  }

  async generateQuestions(
    courseId: number,
    userId: number,
    dto: GenerateQuizDto,
  ) {
    const course = await this.verifyOwnership(courseId, userId);
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

    const questions = this.extractJsonArray(content);
    if (questions.length === 0) {
      throw new BadRequestException('هیچ سوال معتبری تولید نشد.');
    }
    return questions;
  }

  async getQuiz(courseId: number, userId: number) {
    await this.verifyOwnership(courseId, userId);
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

  async saveQuiz(courseId: number, userId: number, dto: SaveQuizDto) {
    await this.verifyOwnership(courseId, userId);

    if (dto.questionsToShow > dto.questions.length) {
      throw new BadRequestException(
        'تعداد سوالات نمایشی نمی‌تواند از تعداد کل سوالات بانک بیشتر باشد.',
      );
    }
    for (const q of dto.questions) {
      const correctCount = q.choices.filter((c) => c.isCorrect).length;
      if (correctCount !== 1) {
        throw new BadRequestException(
          `سوال "${q.questionText}" باید دقیقاً یک گزینه صحیح داشته باشد.`,
        );
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.quizzes.findFirst({
        where: { Course_Id: courseId },
      });
      if (existing) {
        await tx.quizzes.delete({ where: { Id: existing.Id } });
      }

      const quiz = await tx.quizzes.create({
        data: {
          Course_Id: courseId,
          Title: dto.title || 'آزمون دوره',
          StartAt: new Date(dto.startAt),
          EndAt: new Date(dto.endAt),
          DurationMinutes: dto.durationMinutes,
          ScorePerQuestion: dto.scorePerQuestion,
          QuestionsToShow: dto.questionsToShow,
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
    });
  }
}
