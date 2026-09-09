import { Injectable, BadRequestException } from '@nestjs/common';

/**
 * ساختار سوال تولید شده توسط هوش مصنوعی
 * Generated question structure from AI model
 */
export interface AiQuestion {
  questionText: string;
  skillTag: string;
  choices: AiChoice[];
}

/**
 * ساختار انتخاب/گزینه
 * Choice structure
 */
export interface AiChoice {
  text: string;
  isCorrect: boolean;
}

/**
 * سرویس هوش مصنوعی برای تولید سوالات
 * AI Service for generating questions using Qwen model
 */
@Injectable()
export class AiService {
  private readonly apiUrl: string;
  private readonly model: string;

  constructor() {
    this.apiUrl =
      process.env.AI_API_URL || 'http://92.246.145.99:1234/v1/chat/completions';
    this.model = process.env.AI_MODEL_NAME || 'qwen/qwen3-4b';
  }

  /**
   * تولید سوالات برای دوره
   * Generate questions for a course
   */
  async generateQuestionsForCourse(
    course: any,
    count: number,
  ): Promise<AiQuestion[]> {
    const { system, user } = this.buildCourseQuestionPrompt(course, count);
    return this.generateValidQuestions(system, user, course.Category?.Title);
  }

  /**
   * تولید سوالات برای یک مهارت خاص
   * Generate questions for a specific skill
   */
  async generateQuestionsForSkill(
    course: any,
    skillTag: string,
    count: number,
  ): Promise<AiQuestion[]> {
    const { system, user } = this.buildSkillBasedPrompt(
      course,
      skillTag,
      count,
    );
    return this.generateValidQuestions(system, user, skillTag, skillTag);
  }

  /** Retry malformed/transient model responses inside the server request. */
  private async generateValidQuestions(
    systemPrompt: string,
    userPrompt: string,
    fallbackTag?: string,
    expectedSkillTag?: string,
  ): Promise<AiQuestion[]> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        let questions = await this.callAiModel(
          systemPrompt,
          userPrompt,
          fallbackTag,
        );
        if (expectedSkillTag) {
          questions = questions.map((question) => ({
            ...question,
            skillTag: expectedSkillTag,
          }));
        }
        this.throwIfValidationFails(questions, expectedSkillTag);
        return questions;
      } catch (error) {
        lastError = error;
        console.warn(`AI question generation attempt ${attempt}/3 failed`);

        const message = error instanceof Error ? error.message : '';
        const isNonRetryable =
          message.includes('اتصال به سرویس') ||
          message.includes('در دسترس نیست') ||
          message.includes('احراز هویت') ||
          message.includes('تعداد درخواست‌های هوش مصنوعی');

        if (isNonRetryable) {
          throw error;
        }
      }
    }

    throw lastError;
  }

  /**
   * ساخت پرامپت برای تولید سوالات دوره
   * Build prompt for generating course questions
   */
  private buildCourseQuestionPrompt(
    course: any,
    count: number,
  ): { system: string; user: string } {
    const outcomes =
      course.CourseLearningOutcomes?.map((o: any) => o.Title).join('، ') || '';
    const prerequisites =
      course.CoursePrequisties?.map((p: any) => p.Title).join('، ') || '';
    const lessonTitles =
      course.CourseSections?.flatMap(
        (s: any) => s.Lessons?.map((l: any) => l.Title) || [],
      ).join('، ') || '';

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

  /**
   * ساخت پرامپت برای تولید سوالات براساس مهارت
   * Build prompt for skill-based practice exam question generation
   */
  private buildSkillBasedPrompt(
    course: any,
    skillTag: string,
    count: number,
  ): { system: string; user: string } {
    const outcomes =
      course.CourseLearningOutcomes?.map((o: any) => o.Title).join('، ') || '';
    const prerequisites =
      course.CoursePrequisties?.map((p: any) => p.Title).join('، ') || '';
    const lessonTitles =
      course.CourseSections?.flatMap(
        (s: any) => s.Lessons?.map((l: any) => l.Title) || [],
      ).join('، ') || '';

    const system = `تو یک طراح آزمون حرفه‌ای متمرکز بر یک مهارت خاص هستی. باید فقط و فقط یک آرایه JSON معتبر برگردانی، بدون هیچ توضیح اضافه، بدون Markdown، بدون backtick.
هر آیتم آرایه باید این ساختار را داشته باشد:
{"questionText": "متن سوال", "skillTag": "برچسب مهارت", "choices": [{"text":"گزینه", "isCorrect": true}, {"text":"گزینه", "isCorrect": false}, {"text":"گزینه", "isCorrect": false}, {"text":"گزینه", "isCorrect": false}]}

مهم: تمام سوالات حتماً باید تنها مهارت "${skillTag}" را بسنجند. هر سوال دقیقاً باید ۴ گزینه داشته باشد و فقط یکی از آن‌ها isCorrect:true باشد. سوالات باید تک‌گزینه‌ای (single choice) باشند.
تمام سوالات باید skillTag="${skillTag}" را داشته باشند. تغیر skillTag را تحریم می‌کنم.`;

    const user = `عنوان دوره: ${course.Title}
دسته‌بندی: ${course.Category?.Title ?? ''}
سطح: ${course.Level?.LevelName ?? ''}
توضیح کوتاه: ${course.ShortDescription ?? ''}
توضیح کامل: ${course.Description ?? ''}
اهداف یادگیری: ${outcomes || 'ندارد'}
پیش‌نیازها: ${prerequisites || 'ندارد'}
عناوین درس‌ها: ${lessonTitles || 'ندارد'}

مهارت مورد تمرین: ${skillTag}

لطفاً دقیقاً ${count} سوال تک‌گزینه‌ای که تنها مهارت "${skillTag}" را بسنجند، بر اساس این دوره تولید کن و فقط آرایه JSON را برگردان.
هر سوال باید skillTag="${skillTag}" داشته باشد.`;

    return { system, user };
  }

  /**
   * فراخوانی مدل هوش مصنوعی
   * Call AI model API
   */
  private async callAiModel(
    systemPrompt: string,
    userPrompt: string,
    fallbackTag?: string,
  ): Promise<AiQuestion[]> {
    let response: Response;

    try {
      response = await fetch(this.apiUrl, {
        method: 'POST',
        signal: AbortSignal.timeout(15_000),
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
          chat_template_kwargs: { enable_thinking: false },
        }),
      });
    } catch (error: any) {
      console.error('AI API Connection Error:', error);

      // بررسی نوع خطا
      if (error.code === 'ECONNREFUSED') {
        throw new BadRequestException(
          '❌ سرویس هوش مصنوعی در دسترس نیست. لطفاً بعداً دوباره تلاش کنید.',
        );
      }

      if (
        error.code === 'ETIMEDOUT' ||
        error.code === 'EHOSTUNREACH' ||
        error.name === 'TimeoutError' ||
        error.name === 'AbortError'
      ) {
        throw new BadRequestException(
          '❌ اتصال به سرویس هوش مصنوعی قطع شد. لطفاً اتصال اینترنت خود را بررسی کنید.',
        );
      }

      throw new BadRequestException(
        '❌ خطا در اتصال به سرویس هوش مصنوعی. لطفاً بعداً دوباره تلاش کنید.',
      );
    }

    if (!response.ok) {
      console.error(
        'AI API Response Error:',
        response.status,
        response.statusText,
      );

      // پیغام‌های مختلف برای status code‌های مختلف
      if (response.status === 503) {
        throw new BadRequestException(
          '❌ سرویس هوش مصنوعی موقتاً در دسترس نیست. لطفاً بعداً دوباره تلاش کنید.',
        );
      }

      if (response.status === 401 || response.status === 403) {
        throw new BadRequestException(
          '❌ خطای احراز هویت سرویس هوش مصنوعی. لطفاً تنظیمات سرور را بررسی کنید.',
        );
      }

      if (response.status === 429) {
        throw new BadRequestException(
          '❌ تعداد درخواست‌های هوش مصنوعی بیش از حد است. لطفاً بعداً تلاش کنید.',
        );
      }

      throw new BadRequestException(
        `❌ سرویس هوش مصنوعی خطا داد (کد: ${response.status}). لطفاً بعداً دوباره تلاش کنید.`,
      );
    }

    let data: any;
    try {
      data = await response.json();
    } catch (error) {
      console.error('AI API JSON Parse Error:', error);
      throw new BadRequestException(
        '❌ خطا در تجزیه پاسخ هوش مصنوعی. لطفاً بعداً دوباره تلاش کنید.',
      );
    }

    const content: string | undefined = data?.choices?.[0]?.message?.content;

    if (!content) {
      console.error('AI API No Content:', data);
      throw new BadRequestException(
        '❌ سرویس هوش مصنوعی پاسخ معتبری ارائه نداد. لطفاً بعداً دوباره تلاش کنید.',
      );
    }

    return this.extractJsonArray(content, fallbackTag);
  }

  /**
   * استخراج آرایه JSON از پاسخ
   * Extract JSON array from response
   */
  private extractJsonArray(raw: string, fallbackTag?: string): AiQuestion[] {
    let text = raw.trim();
    text = text
      .replace(/^```(?:json)?/i, '')
      .replace(/```$/, '')
      .trim();

    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');

    if (start === -1 || end === -1 || end < start) {
      console.error('No JSON array found in AI response');
      throw new BadRequestException(
        '❌ سرویس هوش مصنوعی سوال‌های معتبری تولید نکرد. لطفاً دوباره تلاش کنید.',
      );
    }

    const jsonSlice = text.slice(start, end + 1);

    let parsed: any;
    try {
      parsed = JSON.parse(jsonSlice);
    } catch (error) {
      console.error('JSON parse error:', error);
      throw new BadRequestException(
        '❌ خطا در تجزیه سوال‌های هوش مصنوعی. لطفاً دوباره تلاش کنید.',
      );
    }

    if (!Array.isArray(parsed)) {
      console.error('Response is not an array:', typeof parsed);
      throw new BadRequestException(
        '❌ ساختار سوال‌های هوش مصنوعی نامعتبر است. لطفاً دوباره تلاش کنید.',
      );
    }

    const questions = parsed
      .map((q) => {
        if (
          !q ||
          typeof q.questionText !== 'string' ||
          !Array.isArray(q.choices)
        ) {
          return null;
        }

        const processedChoices = q.choices.map((c: any, index: number) => ({
          text: String(c?.text ?? '').trim(),
          isCorrect:
            c?.isCorrect === true ||
            String(c?.isCorrect).toLowerCase() === 'true' ||
            q.correctChoiceIndex === index,
        }));

        return {
          questionText: q.questionText.trim(),
          skillTag:
            typeof q.skillTag === 'string' && q.skillTag.trim()
              ? q.skillTag.trim()
              : (fallbackTag ?? ''),
          choices: processedChoices,
        };
      })
      .filter(
        (q): q is AiQuestion =>
          q !== null &&
          q.choices.length >= 2 &&
          q.choices.some((c) => c.isCorrect),
      );

    if (questions.length === 0) {
      console.error('No valid questions extracted from AI response');
      throw new BadRequestException(
        '❌ هوش مصنوعی سوال‌های معتبری تولید نکرد. لطفاً دوباره تلاش کنید.',
      );
    }

    return questions;
  }

  /**
   * اعتبارسنجی کیفیت سوالات تولید شده
   * Validate quality of generated questions
   */
  validateQuestionQuality(
    questions: AiQuestion[],
    expectedSkillTag?: string,
  ): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    if (!questions || questions.length === 0) {
      issues.push('هیچ سوالی تولید نشده است.');
      return { valid: false, issues };
    }

    questions.forEach((question, index) => {
      const qNum = index + 1;

      // بررسی متن سوال
      if (!question.questionText || question.questionText.trim().length === 0) {
        issues.push(`سوال ${qNum}: متن سوال خالی است.`);
      } else if (question.questionText.length < 10) {
        issues.push(
          `سوال ${qNum}: متن سوال بسیار کوتاه است (کمتر از 10 کاراکتر).`,
        );
      } else if (question.questionText.length > 500) {
        issues.push(
          `سوال ${qNum}: متن سوال بسیار طولانی است (بیش از 500 کاراکتر).`,
        );
      }

      // بررسی برچسب مهارت
      if (!question.skillTag || question.skillTag.trim().length === 0) {
        issues.push(`سوال ${qNum}: برچسب مهارت خالی است.`);
      }

      // بررسی مهارت مورد انتظار
      if (expectedSkillTag && expectedSkillTag.trim()) {
        const normalizedExpected = expectedSkillTag.trim().toLowerCase();
        const normalizedActual = question.skillTag.trim().toLowerCase();
        if (normalizedActual !== normalizedExpected) {
          issues.push(
            `سوال ${qNum}: برچسب مهارت "${question.skillTag}" با مهارت مورد انتظار "${expectedSkillTag}" مطابقت ندارد.`,
          );
        }
      }

      // بررسی گزینه‌ها
      if (!question.choices || question.choices.length === 0) {
        issues.push(`سوال ${qNum}: هیچ گزینه‌ای وجود ندارد.`);
      } else if (question.choices.length < 2) {
        issues.push(`سوال ${qNum}: تعداد گزینه‌ها باید حداقل ۲ باشد.`);
      } else if (question.choices.length > 6) {
        issues.push(`سوال ${qNum}: تعداد گزینه‌ها بیش از ۶ است.`);
      }

      // بررسی اینکه دقیقاً یک گزینه صحیح وجود دارد
      const correctChoices = question.choices.filter(
        (c) => c.isCorrect === true,
      );
      if (correctChoices.length === 0) {
        issues.push(`سوال ${qNum}: هیچ گزینه صحیحی وجود ندارد. ⚠️`);
      } else if (correctChoices.length > 1) {
        issues.push(
          `سوال ${qNum}: بیش از یک گزینه صحیح وجود دارد (${correctChoices.length} تا).`,
        );
      }

      // بررسی اینکه حداقل یک گزینه غلط وجود دارد
      const incorrectChoices = question.choices.filter(
        (c) => c.isCorrect === false,
      );
      if (incorrectChoices.length === 0) {
        issues.push(
          `سوال ${qNum}: تمام گزینه‌ها صحیح هستند! این سوال نامعتبر است.`,
        );
      }

      // بررسی متن گزینه‌ها
      question.choices.forEach((choice, choiceIndex) => {
        const cNum = choiceIndex + 1;
        if (!choice.text || choice.text.trim().length === 0) {
          issues.push(`سوال ${qNum} گزینه ${cNum}: متن گزینه خالی است.`);
        } else if (choice.text.length < 2) {
          issues.push(`سوال ${qNum} گزینه ${cNum}: متن گزینه بسیار کوتاه است.`);
        } else if (choice.text.length > 200) {
          issues.push(
            `سوال ${qNum} گزینه ${cNum}: متن گزینه بسیار طولانی است.`,
          );
        }
      });
    });

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  /**
   * اعتبارسنجی سوالات و پرتاب خطا در صورت مشکل
   * Validate questions and throw if issues found
   */
  throwIfValidationFails(
    questions: AiQuestion[],
    expectedSkillTag?: string,
  ): void {
    const validation = this.validateQuestionQuality(
      questions,
      expectedSkillTag,
    );
    if (!validation.valid) {
      console.error('Question validation failed:', validation.issues);

      // اگر فقط مشکل کم تعداد سوال باشد
      if (
        validation.issues.length === 1 &&
        validation.issues[0].includes('تولید نشده')
      ) {
        throw new BadRequestException(
          '❌ هوش مصنوعی نتوانست سوالات معتبری تولید کند. لطفاً دوباره تلاش کنید.',
        );
      }

      // اگر مشکل skill tag matching باشد
      if (validation.issues.some((issue) => issue.includes('مطابقت ندارد'))) {
        throw new BadRequestException(
          `❌ سوالات تولید شده با مهارت درخواستی مطابقت ندارند. لطفاً دوباره تلاش کنید.`,
        );
      }

      // خطای عمومی
      throw new BadRequestException(
        `❌ سوالات تولید شده مشکلات کیفی دارند:\n${validation.issues.slice(0, 3).join('\n')}`,
      );
    }
  }
}
