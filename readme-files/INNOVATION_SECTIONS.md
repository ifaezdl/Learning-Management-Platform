# بخش‌های مهم و نواوری پروژه LMS

## 📋 فهرست بخش‌ها
1. [سرویس تولید سوال با هوش مصنوعی](#1-سرویس-تولید-سوال-با-هوش-مصنوعی)
2. [سیستم تحلیل مهارت و پیشرفت](#2-سیستم-تحلیل-مهارت-و-پیشرفت)
3. [الگوریتم پیشنهاد دوره هوشمند](#3-الگوریتم-پیشنهاد-دوره-هوشمند)
4. [سیستم آزمون پویا](#4-سیستم-آزمون-پویا)
5. [سیستم چت و ارتباطات با Event Streaming](#5-سیستم-چت-و-ارتباطات-با-event-streaming)

---

## 1. سرویس تولید سوال با هوش مصنوعی

### 🎯 توضیح مختصر
یکی از مهم‌ترین ویژگی‌های پروژه، تولید خودکار سوالات آزمون با استفاده از مدل Qwen AI است. این سیستم بر اساس محتوای دوره، اهداف یادگیری و سطح دشواری، سوالات با کیفیت تولید می‌کند.

### 📌 خصوصیات کلیدی:
- **پرامپت هوشمند**: استخراج اهداف یادگیری، پیش‌نیازها و عناوین درس‌ها برای بهتر شدن کیفیت سوالات
- **اعتبارسنجی کیفی**: بررسی خودکار متن سوال، تعداد گزینه‌ها، صحیح بودن گزینه صحیح
- **برچسب‌های مهارت**: هر سوال با یک یا چند برچسب مهارت برای تحلیل دقیق شناخته می‌شود
- **تولید براساس مهارت**: قابلیت تولید سوالات برای یک مهارت خاص برای آزمون‌های تمرینی

### 💻 کد اصلی

```typescript
/**
 * سرویس هوش مصنوعی برای تولید سوالات
 * AI Service for generating questions using Qwen model
 * 
 * نواوری: استفاده از مدل Qwen3-4B برای تولید سوالات با کیفیت بالا
 * بر اساس محتوای دوره و اهداف یادگیری
 */
@Injectable()
export class AiService {
  private readonly apiUrl: string;
  private readonly model: string;

  constructor() {
    this.apiUrl = process.env.AI_API_URL || 
      'http://92.246.145.99:1234/v1/chat/completions';
    this.model = process.env.AI_MODEL_NAME || 'qwen/qwen3-4b';
  }

  /**
   * تولید سوالات برای دوره
   * Generate questions for a course
   * 
   * فرآیند:
   * 1. استخراج اطلاعات دوره (عنوان، اهداف، درس‌ها)
   * 2. ساخت پرامپت ساختاری برای مدل
   * 3. فراخوانی API هوش مصنوعی
   * 4. پارسینگ و اعتبارسنجی JSON پاسخ
   * 5. تحقق از کیفیت برچسب‌های مهارت
   */
  async generateQuestionsForCourse(
    course: any,
    count: number,
  ): Promise<AiQuestion[]> {
    const { system, user } = this.buildCourseQuestionPrompt(course, count);
    const questions = await this.callAiModel(
      system, 
      user, 
      course.Category?.Title
    );
    
    // تحقق از کیفیت
    this.throwIfValidationFails(questions);
    
    return questions;
  }

  /**
   * ساخت پرامپت برای تولید سوالات دوره
   * Build prompt for generating course questions
   * 
   * آنچه که مدل را راهنمایی می‌کند:
   * - فرمت JSON دقیق خروجی
   * - تعداد گزینه‌ها (دقیقاً 4)
   * - یک گزینه صحیح و سه گزینه غلط
   * - برچسب مهارت فارسی
   */
  private buildCourseQuestionPrompt(
    course: any,
    count: number,
  ): { system: string; user: string } {
    const outcomes = course.CourseLearningOutcomes?.map(
      (o: any) => o.Title,
    ).join('، ') || '';
    const prerequisites = course.CoursePrequisties?.map(
      (p: any) => p.Title,
    ).join('، ') || '';
    const lessonTitles = course.CourseSections?.flatMap((s: any) =>
      s.Lessons?.map((l: any) => l.Title) || [],
    ).join('، ') || '';

    // سیستم پرامپت: دستورالعمل‌های دقیق برای مدل
    const system = `تو یک طراح آزمون حرفه‌ای هستی. 
    باید فقط و فقط یک آرایه JSON معتبر برگردانی، بدون توضیح اضافی.
    ساختار: {"questionText": "...", "skillTag": "مهارت", "choices": [...]}
    الزامات:
    - هر سوال دقیقاً 4 گزینه دارد
    - فقط 1 گزینه صحیح (isCorrect: true)
    - برچسب مهارت: 2-4 کلمه فارسی
    - سوالات براساس محتوای دوره، نه اطلاعات عمومی`;

    // پرامپت کاربر: داده‌های دوره
    const user = `عنوان دوره: ${course.Title}
    دسته‌بندی: ${course.Category?.Title ?? ''}
    سطح: ${course.Level?.LevelName ?? ''}
    اهداف یادگیری: ${outcomes || 'ندارد'}
    پیش‌نیازها: ${prerequisites || 'ندارد'}
    عناوین درس‌ها: ${lessonTitles || 'ندارد'}
    
    لطفاً ${count} سوال تولید کن.`;

    return { system, user };
  }

  /**
   * اعتبارسنجی کیفی سوالات تولید شده
   * Validate quality of generated questions
   * 
   * بررسی‌های دقیق:
   * - طول متن سوال (10-500 کاراکتر)
   * - برچسب مهارت (2-4 کلمه فارسی)
   * - تعداد صحیح گزینه‌های صحیح (دقیقاً 1)
   * - طول متن هر گزینه (2-200 کاراکتر)
   */
  validateQuestionQuality(
    questions: AiQuestion[], 
    expectedSkillTag?: string
  ): { 
    valid: boolean; 
    issues: string[] 
  } {
    const issues: string[] = [];

    questions.forEach((question, index) => {
      const qNum = index + 1;

      // بررسی متن سوال
      if (!question.questionText || 
          question.questionText.trim().length === 0) {
        issues.push(`سوال ${qNum}: متن سوال خالی است.`);
      }

      // بررسی برچسب مهارت (باید 2-4 کلمه فارسی باشد)
      if (expectedSkillTag && expectedSkillTag.trim()) {
        const normalizedExpected = expectedSkillTag.trim().toLowerCase();
        const normalizedActual = question.skillTag.trim().toLowerCase();
        if (normalizedActual !== normalizedExpected) {
          issues.push(
            `سوال ${qNum}: برچسب "${question.skillTag}" ` +
            `با مهارت مورد انتظار "${expectedSkillTag}" مطابقت ندارد.`,
          );
        }
      }

      // بررسی اینکه دقیقاً یک گزینه صحیح وجود دارد
      const correctChoices = question.choices.filter(
        (c) => c.isCorrect === true
      );
      if (correctChoices.length !== 1) {
        issues.push(
          `سوال ${qNum}: تعداد گزینه‌های صحیح ${correctChoices.length} است ` +
          `(باید 1 باشد).`
        );
      }
    });

    return {
      valid: issues.length === 0,
      issues,
    };
  }
}
```

### 📊 فرآیند عملکرد
```
دوره (محتوا، اهداف) 
    ↓
[استخراج اطلاعات]
    ↓
Qwen AI Model
    ↓
JSON Array (سوالات)
    ↓
[اعتبارسنجی کیفیت]
    ↓
سوالات تایید شده
```

---

## 2. سیستم تحلیل مهارت و پیشرفت

### 🎯 توضیح مختصر
سیستم جامع تحلیل یادگیری که درک جامعی از نقاط قوت و ضعف دانشجو ارائه می‌دهد. این سیستم نه‌تنها نمرات را تحلیل می‌کند، بلکه مهارت‌های خاصی را که دانشجو در آن‌ها ضعیف است شناسایی می‌کند و روند پیشرفت را طبقه‌بندی می‌کند.

### 📌 خصوصیات کلیدی:
- **تحلیل مهارت براساس برچسب**: هر سوال با برچسب مهارت، امکان تحلیل دقیق نقاط ضعف
- **رگرسیون خطی برای تشخیص روند**: الگوریتم ریاضی برای تشخیص روند یادگیری (صعودی/نزولی/ثابت)
- **تحلیل سطح کلاس**: مدرسان می‌توانند کلاس کامل را تجزیه‌تحلیل کنند
- **تحلیل شخصی و گروهی**: تفکیک کامل بین داده‌های شخصی و گروهی

### 💻 کد اصلی

```typescript
/**
 * سرویس تحلیل یادگیری
 * Analytics Service - Learning Analytics & Trend Prediction
 * 
 * نواوری: تحلیل پیشرفتی درس‌آموزان بر اساس مهارت‌های خاص
 * با الگوریتم رگرسیون خطی برای تشخیص روند یادگیری
 */
@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  /**
   * گروه‌بندی جواب‌ها براساس برچسب مهارت
   * Group answers by skill tag and calculate percentages
   * 
   * این تابع:
   * 1. تمام جواب‌ها را براساس برچسب مهارت گروه‌بندی می‌کند
   * 2. درصد موفقیت را برای هر مهارت محاسبه می‌کند
   * 3. نتایج را از ضعیفترین به قوی‌ترین مرتب می‌کند
   * 
   * خروجی: [مهارت ضعیف ترین ← → قوی ترین]
   */
  groupBySkill(
    answers: { skillTag: string | null; isCorrect: boolean }[],
  ): SkillStat[] {
    const map = new Map<string, { correct: number; total: number }>();

    for (const a of answers) {
      // اگر برچسب خالی باشد، آن را "سایر" درنظر می‌گیریم
      const tag = a.skillTag && a.skillTag.trim() ? 
        a.skillTag.trim() : 'سایر';
      
      const bucket = map.get(tag) ?? { correct: 0, total: 0 };
      bucket.total += 1;
      if (a.isCorrect) bucket.correct += 1;
      map.set(tag, bucket);
    }

    const result: SkillStat[] = [];
    for (const [tag, { correct, total }] of map.entries()) {
      result.push({
        tag,
        correct,
        total,
        percentage: total === 0 ? 0 : 
          Math.round((correct / total) * 100),
      });
    }

    // مرتب‌سازی: ضعیفترین مهارت‌ها اول
    result.sort((a, b) => a.percentage - b.percentage);
    return result;
  }

  /**
   * تشخیص روند یادگیری با رگرسیون خطی
   * Trend classification using linear regression
   * 
   * فرمول رگرسیون خطی: y = mx + b
   * m = شیب (slope) = شاخص روند
   * 
   * تفسیر شیب:
   * - slope > +2: صعودی (پیشرفت خوب)
   * - slope < -2: نزولی (نیاز به کمک)
   * - -2 ≤ slope ≤ +2: ثابت (بدون تغییر معنادار)
   * 
   * نواوری: الگوریتم ریاضی برای خودکار شناسایی روند بدون دخالت انسان
   */
  classifyTrend(
    scores: { date: Date; percentage: number }[],
  ): TrendClassification {
    // حداقل 2 نقطه لازم است
    if (scores.length < 2) {
      return {
        status: 'داده کافی نیست',
        slope: 0,
        description: 'حداقل دو آزمون برای تحلیل روند لازم است.',
      };
    }

    const sorted = [...scores].sort(
      (a, b) => new Date(a.date).getTime() - 
                 new Date(b.date).getTime(),
    );

    const n = sorted.length;

    // اگر همه نمرات یکسان باشند
    const allSame = sorted.every(
      (s) => s.percentage === sorted[0].percentage
    );
    if (allSame) {
      return {
        status: 'ثابت',
        slope: 0,
        description: 
          `نمره در ${sorted[0].percentage}٪ ثابت مانده است.`,
      };
    }

    // محاسبه رگرسیون خطی
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

    for (let i = 0; i < n; i++) {
      const x = i;  // شماره آزمون
      const y = sorted[i].percentage;  // درصد نمره
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
    }

    // فرمول شیب: m = (n*sumXY - sumX*sumY) / 
    //                 (n*sumX2 - sumX^2)
    const numerator = n * sumXY - sumX * sumY;
    const denominator = n * sumX2 - sumX * sumX;

    const slope = numerator / denominator;

    // تصمیم‌گیری بر اساس شیب
    const POSITIVE_THRESHOLD = 2;
    const NEGATIVE_THRESHOLD = -2;

    let status: TrendClassification['status'];
    let description: string;

    if (slope > POSITIVE_THRESHOLD) {
      status = 'صعودی';
      description = 
        `روند یادگیری صعودی است ` +
        `(شیب: ${slope.toFixed(2)} درصد به ازای هر آزمون).`;
    } else if (slope < NEGATIVE_THRESHOLD) {
      status = 'نزولی';
      description = 
        `روند یادگیری نزولی است ` +
        `(شیب: ${slope.toFixed(2)} درصد). نیاز به توجه دارد.`;
    } else {
      status = 'ثابت';
      description = 
        `روند نسبتاً ثابت است ` +
        `(شیب: ${slope.toFixed(2)}).`;
    }

    return { status, slope, description };
  }

  /**
   * تحلیل مهارت‌های یک دانشجو در یک آزمون خاص
   * Get skill breakdown for a single attempt
   */
  async getAttemptSkills(
    attemptId: number,
    currentUser: any,
  ): Promise<SkillBreakdownResult> {
    const attempt = await this.prisma.quizAttempts.findUnique({
      where: { Id: attemptId },
    });

    // دریافت تمام جواب‌های این آزمون
    const answers = await this.prisma.quizAttemptAnswers.findMany({
      where: { Attempt_Id: attemptId },
      include: {
        QuizQuestions: { select: { SkillTag: true } },
      },
    });

    const mapped = answers.map((a) => ({
      skillTag: a.QuizQuestions.SkillTag,
      isCorrect: !!a.IsCorrect,
    }));

    return { 
      attemptId, 
      skills: this.groupBySkill(mapped) 
    };
  }

  /**
   * نمایش روند پیشرفت دانشجو در طول زمان
   * Get progress trend over time
   */
  async getProgressTrend(
    studentId: number,
    courseId?: number,
  ): Promise<ProgressTrendResult> {
    // دریافت تمام آزمون‌های ثبت‌شده دانشجو
    const attempts = await this.prisma.quizAttempts.findMany({
      where: {
        Student_Id: studentId,
        SubmittedAt: { not: null },
        ...(courseId ? { Quizzes: { Course_Id: courseId } } : {}),
      },
      orderBy: { SubmittedAt: 'asc' },
    });

    const quizScores = attempts.map((a) => ({
      date: a.SubmittedAt!,
      percentage: Number(a.MaxScore) > 0
        ? Math.round(
            (Number(a.Score) / Number(a.MaxScore)) * 100
          )
        : 0,
      courseTitle: a.Quizzes.Courses.Title,
    }));

    return { quizScores, courseCompletion: [] };
  }
}
```

### 📊 نمونه خروجی تحلیل

```json
{
  "skills": [
    {
      "tag": "مدیریت حافظه",
      "correct": 2,
      "total": 5,
      "percentage": 40
    },
    {
      "tag": "حلقه‌های تکرار",
      "correct": 3,
      "total": 4,
      "percentage": 75
    }
  ],
  "trend": {
    "status": "صعودی",
    "slope": 3.5,
    "description": "روند یادگیری صعودی است (شیب: 3.50 درصد به ازای هر آزمون)."
  }
}
```

---

## 3. الگوریتم پیشنهاد دوره هوشمند

### 🎯 توضیح مختصر
یک سیستم توصیه‌گر هوشمند که بر اساس:
- **مهارت‌های ضعیف دانشجو** (مهارت‌های با کمتر از 50٪ موفقیت)
- **سطح پیشرفت** (ارتقا به دوره‌های سطح بالاتر)
- **علاقه‌مندی‌های قبلی** (دسته‌بندی‌های دوره‌های قبلی)
- **کیفیت دوره** (امتیاز و نظرات)

دوره‌های مناسب را پیشنهاد می‌دهد.

### 📌 خصوصیات کلیدی:
- **وزن‌دهی دقیق**: الگوریتم یادگیری ماشین برای ترجیح دقیق
- **تاریخچه کش**: کاهش بار سرور با کش کردن پیشنهادات
- **الگوریتم خالص**: تابع `scoreCourse` برای تست واحدی آسان
- **شفاف‌سازی**: درصد و دلایل منطقی برای هر پیشنهاد

### 💻 کد اصلی

```typescript
/**
 * سرویس پیشنهاد دوره هوشمند
 * Recommendations Service - Intelligent Course Recommendations
 * 
 * نواوری: الگوریتم هوشمند برای پیشنهاد دوره بر اساس:
 * - مهارت‌های ضعیف دانشجو (45%)
 * - سطح پیشرفت (25%)
 * - علاقه‌مندی‌های قبلی (20%)
 * - کیفیت دوره (10%)
 */
@Injectable()
export class RecommendationsService {
  constructor(
    private prisma: PrismaService,
    private analyticsService: AnalyticsService,
  ) {}

  // وزن‌های الگوریتم (قابل تنظیم)
  private readonly WEIGHTS = {
    SKILL_GAP_MATCH: 0.45,     // اهمیت: مطابقت مهارت‌های ضعیف
    LEVEL_PROGRESSION: 0.25,    // اهمیت: سطح دشواری
    CATEGORY_AFFINITY: 0.2,     // اهمیت: علاقه‌مندی قبلی
    COURSE_QUALITY: 0.1,        // اهمیت: کیفیت و امتیاز
  };

  /**
   * محاسبه امتیاز یک دوره برای یک دانشجو
   * Score a course based on student profile
   * 
   * فرآیند:
   * 1. محاسبه میزان مطابقت مهارت‌های ضعیف (45%)
   * 2. محاسبه سطح پیشرفت (25%)
   * 3. محاسبه علاقه‌مندی قبلی (20%)
   * 4. محاسبه کیفیت دوره (10%)
   * 5. ترکیب وزن‌دار: نمره = 0-100
   */
  private scoreCourse(
    profile: StudentProfile,
    course: CourseCandidate,
  ): {
    score: number;
    matchedSkillTags: string[];
  } {
    let totalScore = 0;
    const matchedSkillTags: string[] = [];

    // ─────────────────────────────────────────────────────
    // 1️⃣ Skill Gap Match (45%) — بیشترین وزن
    // مطابقت بین مهارت‌های ضعیف دانشجو و مهارت‌های دوره
    // ─────────────────────────────────────────────────────
    if (profile.weakSkills.length > 0 && 
        course.skillTags.length > 0) {
      
      const weakSkillSet = new Set(
        profile.weakSkills.map(
          (s) => s.tag.toLowerCase().trim()
        )
      );
      
      const courseSkillSet = new Set(
        course.skillTags.map(
          (t) => t.toLowerCase().trim()
        )
      );

      let matchCount = 0;
      for (const weakTag of weakSkillSet) {
        if (courseSkillSet.has(weakTag)) {
          matchCount++;
          // یافتن برچسب اصلی
          const originalTag = profile.weakSkills.find(
            (s) => s.tag.toLowerCase().trim() === weakTag
          )?.tag;
          if (originalTag) matchedSkillTags.push(originalTag);
        }
      }

      // نسبت مطابقت
      const matchRatio = matchCount / 
        Math.max(weakSkillSet.size, 1);
      
      // امتیاز برای این مقوله
      const skillScore = matchRatio * 100;
      totalScore += skillScore * this.WEIGHTS.SKILL_GAP_MATCH;
    }

    // ─────────────────────────────────────────────────────
    // 2️⃣ Level Progression (25%)
    // آیا دوره، سطح بالاتر از دوره‌های قبلی است؟
    // ─────────────────────────────────────────────────────
    if (profile.avgCompletedLevel !== null) {
      const levelMap: Record<string, number> = {
        'مبتدی': 1,
        'متوسط': 2,
        'پیشرفته': 3,
      };
      
      const courseLevel = levelMap[course.levelName] ?? 2;
      const progression = courseLevel > 
        profile.avgCompletedLevel ? 1 : 0.5;
      
      totalScore += progression * 100 * 
        this.WEIGHTS.LEVEL_PROGRESSION;
    }

    // ─────────────────────────────────────────────────────
    // 3️⃣ Category Affinity (20%)
    // آیا دسته‌بندی، دسته‌بندی‌های قبلی است؟
    // ─────────────────────────────────────────────────────
    const categoryMatch = 
      profile.favoriteCategoryIds.includes(
        course.categoryId
      ) ? 1 : 0.3;
    
    totalScore += categoryMatch * 100 * 
      this.WEIGHTS.CATEGORY_AFFINITY;

    // ─────────────────────────────────────────────────────
    // 4️⃣ Course Quality (10%)
    // امتیاز دوره بر اساس نظرات
    // ─────────────────────────────────────────────────────
    const qualityScore = (course.averageRating / 5) * 100;
    totalScore += qualityScore * 
      this.WEIGHTS.COURSE_QUALITY;

    return {
      score: Math.round(totalScore),
      matchedSkillTags,
    };
  }

  /**
   * دریافت پیشنهادات برای یک دانشجو
   * Get recommendations for a student
   */
  async getRecommendations(
    studentId: number,
    limit: number = 5,
  ): Promise<ScoredCourse[]> {
    // 1. ساخت پروفایل دانشجو
    const profile = await this.buildStudentProfile(
      studentId
    );

    // 2. دریافت دوره‌های کاندید
    const candidates = await this.getCoursesCandidates(
      profile
    );

    // 3. امتیاز‌دهی و مرتب‌سازی
    const scored = candidates
      .map((c) => {
        const { score, matchedSkillTags } = 
          this.scoreCourse(profile, c);
        return { ...c, score, matchedSkillTags };
      })
      .filter((c) => c.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return scored;
  }
}
```

### 📊 نمونه خروجی

```json
{
  "recommendations": [
    {
      "courseId": 5,
      "title": "مدیریت حافظه پیشرفته",
      "score": 87,
      "matchedSkillTags": ["مدیریت حافظه"],
      "reason": "این دوره مهارت ضعیف شما را پوشش می‌دهد"
    },
    {
      "courseId": 8,
      "title": "الگوریتم‌های بهینه",
      "score": 72,
      "matchedSkillTags": ["حلقه‌های تکرار"],
      "reason": "سطح دوره نسبت به سابقه شما بالاتر است"
    }
  ]
}
```

---

## 4. سیستم آزمون پویا

### 🎯 توضیح مختصر
سیستم جامع آزمون‌گیری که اجازه می‌دهد مدرسان آزمون‌های متعددی برای یک دوره ایجاد کنند، هر آزمون با تنظیمات خاص:
- انتخاب سوالات از یک بانک سوالات
- تنظیم زمان و شرایط آزمون
- تولید خودکار سوالات با AI
- ارائه فوری نتیجه و تعیین موفقیت/شکست

### 📌 خصوصیات کلیدی:
- **آزمون‌های چندگانه برای دوره**: هر دوره می‌تواند چندین آزمون داشته باشد
- **بانک سوالات منعطف**: هر آزمون می‌تواند از بانک سوالات مختلف استفاده کند
- **تولید پویا**: حتی بدون سوالات پیش‌ساخت، می‌توان سوالات AI ایجاد کرد
- **حفاظت از داده‌های یادگیری**: آزمون فقط در صورت عدم شرکت کسی حذف می‌شود

### 💻 کد اصلی

```typescript
/**
 * سرویس آزمون
 * Quiz Service - Comprehensive Quiz Management
 * 
 * نواوری: سیستم آزمون منعطف با پشتیبانی از:
 * - آزمون‌های متعدد برای هر دوره
 * - تولید پویا سوالات با AI
 * - حفاظت خودکار از داده‌های یادگیری
 */
@Injectable()
export class QuizService {
  constructor(
    private prisma: PrismaService,
    private recommendationsService: RecommendationsService,
  ) {}

  /**
   * لیست تمام آزمون‌های یک دوره
   * List quizzes for a course
   */
  async listQuizzesByCourse(courseId: number, user: any) {
    // بررسی مالکیت دوره
    await this.verifyCourseOwnership(courseId, user);

    return this.prisma.quizzes.findMany({
      where: { Course_Id: courseId },
      orderBy: { Id: 'asc' },
      include: {
        _count: {
          select: {
            QuizQuestions: true,  // تعداد سوالات
            QuizAttempts: true,   // تعداد شرکت‌کنندگان
          },
        },
      },
    });
  }

  /**
   * ایجاد آزمون جدید برای دوره
   * Create a new quiz for a course
   * 
   * نکات مهم:
   * - هر دوره می‌تواند چندین آزمون داشته باشد
   * - هر آزمون می‌تواند تنظیمات متفاوتی داشته باشد
   * - آزمون در آغاز منتشر نشده است (IsPublished: false)
   */
  async createQuiz(
    courseId: number, 
    user: any, 
    dto: CreateQuizDto
  ) {
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
   * ویرایش تنظیمات آزمون و/یا بانک سوالات
   * Update quiz settings and questions
   * 
   * منطق:
   * 1. اگر بانک سوالات ارسال شود، قدیم بانک حذف می‌شود
   * 2. اگر بانک ارسال نشود، فقط تنظیمات به‌روز می‌شود
   * 3. آزمون‌های دیگر دوره تأثر نمی‌پذیرند
   * 
   * اعتبارسنجی:
   * - تعداد سوالات نمایشی ≤ تعداد کل سوالات
   * - نمره قبولی ≤ مجموع نمرات
   * - هر سوال دقیقاً 1 گزینه صحیح دارد
   */
  async updateQuiz(
    quizId: number, 
    user: any, 
    dto: UpdateQuizDto
  ) {
    await this.verifyQuizOwnership(quizId, user);

    // اعتبارسنجی بانک سوالات
    if (dto.questions !== undefined) {
      let totalMaxScore = 0;
      for (const q of dto.questions) {
        const correctCount = q.choices.filter(
          (c) => c.isCorrect
        ).length;
        
        if (correctCount !== 1) {
          throw new BadRequestException(
            `سوال "${q.questionText}" باید دقیقاً ` +
            `یک گزینه صحیح داشته باشد.`,
          );
        }
        
        totalMaxScore += q.score ?? 1;
      }

      if (dto.passScore !== undefined && 
          dto.passScore > totalMaxScore) {
        throw new BadRequestException(
          'نمره قبولی نمی‌تواند از مجموع بیشتر باشد.',
        );
      }
    }

    // به‌روزرسانی با Transaction برای اتمی‌ت
    return this.prisma.$transaction(
      async (tx) => {
        // به‌روزرسانی تنظیمات
        const updateData: any = {};
        if (dto.title !== undefined) updateData.Title = dto.title;
        if (dto.startAt !== undefined) 
          updateData.StartAt = new Date(dto.startAt);
        if (dto.endAt !== undefined) 
          updateData.EndAt = new Date(dto.endAt);
        if (dto.durationMinutes !== undefined) 
          updateData.DurationMinutes = dto.durationMinutes;
        if (dto.passScore !== undefined) 
          updateData.PassScore = dto.passScore;

        await tx.quizzes.update({
          where: { Id: quizId },
          data: updateData,
        });

        // حذف و بازنویسی بانک سوالات (اگر فرستاده شده)
        if (dto.questions !== undefined) {
          // حذف قدیم
          const oldQuestions = await tx.quizQuestions.findMany({
            where: { Quiz_Id: quizId },
            select: { Id: true },
          });
          const oldIds = oldQuestions.map((q) => q.Id);
          
          if (oldIds.length > 0) {
            await tx.quizChoices.deleteMany({
              where: { Question_Id: { in: oldIds } },
            });
            await tx.quizQuestions.deleteMany({
              where: { Id: { in: oldIds } },
            });
          }

          // درج جدید
          for (let i = 0; i < dto.questions.length; i++) {
            const q = dto.questions[i];
            const question = await tx.quizQuestions.create({
              data: {
                Quiz_Id: quizId,
                QuestionText: q.questionText,
                DisplayOrder: i + 1,
                Source: !!q.isAiGenerated,
                Score: q.score ?? 1,
                SkillTag: q.skillTag ?? null,  // برچسب مهارت
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
              include: {
                QuizChoices: {
                  orderBy: { DisplayOrder: 'asc' },
                },
              },
            },
          },
        });
      },
      { maxWait: 10000, timeout: 30000 },
    );
  }

  /**
   * حذف آزمون با حفاظت از داده‌های یادگیری
   * Delete quiz (with data protection)
   * 
   * قانون:
   * - اگر هیچ attempt ثبت‌شده‌ای نداشته → حذف کامل
   * - اگر attempt دارد → فقط غیرفعال‌سازی
   * 
   * دلیل: داده‌های یادگیری دانشجویان حفظ شود
   */
  async deleteQuiz(quizId: number, user: any) {
    await this.verifyQuizOwnership(quizId, user);

    const attemptCount = await this.prisma.quizAttempts.count({
      where: { Quiz_Id: quizId },
    });

    if (attemptCount > 0) {
      // غیرفعال‌سازی نرم
      await this.prisma.quizzes.update({
        where: { Id: quizId },
        data: { IsPublished: false },
      });
      throw new BadRequestException(
        'این آزمون دارای شرکت‌کننده است؛ ' +
        'می‌توانید آن را غیرفعال کنید.',
      );
    }

    // حذف کامل
    await this.prisma.quizzes.delete({
      where: { Id: quizId },
    });
    return { message: 'آزمون حذف شد.' };
  }

  /**
   * تولید سوالات با AI برای آزمون
   * Generate questions using AI
   */
  async generateQuestions(
    quizId: number,
    currentUser: any,
    dto: GenerateQuizDto,
  ) {
    const quiz = await this.verifyQuizOwnership(
      quizId, 
      currentUser
    );
    const course = quiz.Courses;

    const { system, user } = this.buildPrompt(
      course, 
      dto.count
    );

    // فراخوانی API هوش مصنوعی
    const apiUrl = process.env.AI_API_URL || 
      'http://92.246.145.99:1234/v1/chat/completions';
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen/qwen3-4b',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new BadRequestException(
        `هوش مصنوعی خطا داد (${response.status}).`,
      );
    }

    const data: any = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new BadRequestException(
        'پاسخی دریافت نشد.',
      );
    }

    const questions = this.extractJsonArray(
      content, 
      course.Category?.Title
    );
    
    if (questions.length === 0) {
      throw new BadRequestException(
        'هیچ سوال معتبری تولید نشد.',
      );
    }
    
    return questions;
  }

  /**
   * شروع آزمون توسط دانشجو
   * Start quiz - student side
   * 
   * فرآیند:
   * 1. بررسی ثبت‌نام در دوره
   * 2. بررسی زمان شروع/پایان
   * 3. انتخاب تصادفی سوالات از بانک
   * 4. ثبت attempt جدید
   * 5. بازگرداندن سوالات برای نمایش
   */
  async startQuiz(
    quizId: number, 
    studentId: number
  ) {
    const quiz = await this.prisma.quizzes.findUnique({
      where: { Id: quizId },
      include: {
        QuizQuestions: {
          include: { QuizChoices: true },
        },
      },
    });
    
    if (!quiz) {
      throw new NotFoundException('آزمون یافت نشد.');
    }

    if (!quiz.IsPublished) {
      throw new BadRequestException(
        'این آزمون هنوز منتشر نشده است.',
      );
    }

    // بررسی ثبت‌نام
    const enrolled = await this.prisma.enrollments
      .findFirst({
        where: {
          Course_Id: quiz.Course_Id,
          Student_Id: studentId,
        },
      });
    
    if (!enrolled) {
      throw new ForbiddenException(
        'شما در این دوره ثبت‌نام نکرده‌اید.',
      );
    }

    // بررسی زمان
    const now = new Date();
    if (quiz.StartAt && now < quiz.StartAt) {
      throw new BadRequestException(
        'آزمون هنوز شروع نشده است.',
      );
    }
    
    if (quiz.EndAt && now > quiz.EndAt) {
      throw new BadRequestException(
        'مهلت شرکت به پایان رسیده است.',
      );
    }

    // بررسی شرکت قبلی
    const existing = 
      await this.prisma.quizAttempts.findUnique({
        where: {
          Quiz_Id_Student_Id: {
            Quiz_Id: quiz.Id,
            Student_Id: studentId,
          },
        },
      });
    
    if (existing?.SubmittedAt) {
      throw new BadRequestException(
        'شما قبلاً در این آزمون شرکت کرده‌اید.',
      );
    }

    // انتخاب تصادفی سوالات
    const pool = [...quiz.QuizQuestions];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    
    const selected = pool.slice(
      0, 
      Math.min(quiz.QuestionsToShow, pool.length)
    );

    // ثبت attempt
    const startedAt = now;
    const deadlineAt = new Date(
      startedAt.getTime() + 
      (quiz.DurationMinutes ?? 30) * 60000
    );

    const attempt = await this.prisma.quizAttempts
      .create({
        data: {
          Quiz_Id: quiz.Id,
          Student_Id: studentId,
          QuestionIds: JSON.stringify(
            selected.map((q) => q.Id)
          ),
          StartedAt: startedAt,
          DeadlineAt: deadlineAt,
        },
      });

    return this.buildAttemptResponse(
      quiz, 
      attempt, 
      selected
    );
  }

  /**
   * ثبت پاسخ‌های آزمون دانشجو
   * Submit quiz answers
   * 
   * فرآیند:
   * 1. بررسی و محاسبه نمره
   * 2. تعیین موفقیت/شکست
   * 3. تولید گواهی (اگر موفق شد)
   * 4. به‌روزرسانی پیشنهادات
   */
  async submitQuiz(
    attemptId: number,
    studentId: number,
    dto: SubmitQuizDto,
  ) {
    const attempt = await this.prisma.quizAttempts
      .findUnique({
        where: { Id: attemptId },
      });
    
    if (!attempt || attempt.Student_Id !== studentId) {
      throw new NotFoundException('آزمون یافت نشد.');
    }

    if (attempt.SubmittedAt) {
      throw new BadRequestException(
        'این آزمون قبلاً ثبت شده است.',
      );
    }

    // دریافت سوالات و محاسبه نمره
    const selectedIds: number[] = 
      JSON.parse(attempt.QuestionIds);
    
    const questions = await this.prisma.quizQuestions
      .findMany({
        where: { Id: { in: selectedIds } },
        include: { QuizChoices: true },
      });

    let score = 0;
    let maxScore = 0;
    const answerRows: any[] = [];

    for (const q of questions) {
      maxScore += Number(q.Score);
      
      const given = dto.answers.find(
        (a) => a.questionId === q.Id
      );
      
      const correctChoice = q.QuizChoices.find(
        (c) => c.IsCorrect
      );
      
      const chosenChoice = given?.choiceId
        ? q.QuizChoices.find(
            (c) => c.Id === given.choiceId
          )
        : null;
      
      const isCorrect = !!chosenChoice && 
        chosenChoice.Id === correctChoice?.Id;
      
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
    
    const isPassed = score >= 
      Number(quiz!.PassScore);

    // ذخیره نتایج
    await this.prisma.$transaction(async (tx) => {
      await tx.quizAttemptAnswers.createMany({
        data: answerRows,
      });
      
      await tx.quizAttempts.update({
        where: { Id: attempt.Id },
        data: {
          SubmittedAt: new Date(),
          Score: score,
          MaxScore: maxScore,
          IsPassed: isPassed,
        },
      });
      
      // تولید گواهی
      if (isPassed) {
        await tx.certificates.create({
          data: {
            Student_Id: studentId,
            Course_Id: quiz!.Course_Id,
            Attempt_Id: attempt.Id,
            CertificateCode: 
              `CERT-${quiz!.Course_Id}-` +
              `${attempt.Id}-${Date.now()}`,
            Score: score,
            MaxScore: maxScore,
          },
        });
      }
    });

    // به‌روزرسانی پیشنهادات (اگر موفق شد)
    if (isPassed) {
      this.recommendationsService
        .refresh(studentId, 5)
        .catch((err) =>
          console.warn(
            `تازه‌سازی ناموفق برای ${studentId}:`,
            err,
          ),
        );
    }

    return this.getResult(attempt.Id, studentId);
  }
}
```

---

## 5. سیستم چت و ارتباطات با Event Streaming

### 🎯 توضیح مختصر
سیستم چت real-time برای دوره‌ها که از WebSocket و RxJS برای رویدادهای live استفاده می‌کند. شامل:
- پیام‌های متنی و فایل‌های پیوست
- پیام‌های جواب (reply)
- واکنش‌های emoji
- نظرسنجی (poll) و رای‌گیری
- نشانه‌گذاری "خوانده شده" برای پیام‌ها

### 📌 خصوصیات کلیدی:
- **RxJS Subjects**: استفاده از Subject برای broadcast رویدادها
- **WebSocket Integration**: ارتباط real-time بدون تاخیر
- **مدل سلسله مراتبی**: پیام‌ها می‌توانند جواب به پیام‌های دیگر باشند
- **کنترل دسترسی جامع**: معلم + دانشجویان + مدیر

### 💻 کد اصلی

```typescript
/**
 * سرویس چت
 * Chat Service - Real-time Course Communications
 * 
 * نواوری: سیستم چت real-time با:
 * - پیام‌های جواب (reply)
 * - فایل‌های پیوست
 * - واکنش‌های emoji
 * - نظرسنجی و رای‌گیری
 * - Event streaming با RxJS
 */
@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: ChatEventsService,
  ) {}

  /**
   * بررسی دسترسی کاربر به چت دوره
   * Assert user can access course chat
   * 
   * قوانین:
   * - مدیر: دسترسی همه
   * - معلم: فقط دوره‌های خودش
   * - دانشجو: فقط دوره‌های ثبت‌نام‌شده‌اش
   */
  private async assertAccess(
    user: any, 
    courseId: number
  ) {
    // مدیران همه جا دسترسی دارند
    if (user.roleId === 3) return;
    
    const course = await this.prisma.courses
      .findUnique({
        where: { Id: courseId },
        select: { Teacher_Id: true },
      });
    
    if (!course) {
      throw new NotFoundException('دوره پیدا نشد');
    }

    // معلمان فقط دوره‌های خودشان
    if (user.roleId === 2) {
      if (course.Teacher_Id !== user.id) {
        throw new ForbiddenException(
          'شما مدرس این دوره نیستید',
        );
      }
      return;
    }

    // دانشجویان فقط دوره‌های ثبت‌نام‌شده‌شان
    const enrollment = await this.prisma.enrollments
      .findFirst({
        where: {
          Course_Id: courseId,
          Student_Id: user.id,
        },
        select: { Id: true },
      });
    
    if (!enrollment) {
      throw new ForbiddenException(
        'شما عضو این دوره نیستید',
      );
    }
  }

  /**
   * دریافت تمام شرکت‌کنندگان چت یک دوره
   * Get all participants (students + teacher + admins)
   */
  private async getParticipantIds(
    courseId: number
  ): Promise<number[]> {
    const course = await this.prisma.courses
      .findUnique({
        where: { Id: courseId },
        select: { Teacher_Id: true },
      });
    
    if (!course) return [];

    const enrollments = await this.prisma.enrollments
      .findMany({
        where: { Course_Id: courseId },
        select: { Student_Id: true },
      });
    
    const admins = await this.prisma.users.findMany({
      where: { Role_Id: 3, IsActive: true },
      select: { Id: true },
    });

    const ids = new Set<number>([
      course.Teacher_Id,
      ...enrollments.map((e) => e.Student_Id),
      ...admins.map((a) => a.Id),
    ]);

    return Array.from(ids);
  }

  /**
   * ارسال پیام جدید
   * Send a new message
   * 
   * ویژگی‌ها:
   * - پیام‌های متنی
   * - فایل‌های پیوست
   * - پیام‌های جواب (ReplyTo_Id)
   * - Event streaming خودکار
   */
  async sendMessage(
    courseId: number,
    user: any,
    dto: SendMessageDto,
  ) {
    await this.assertAccess(user, courseId);

    // بررسی پیام جواب (اگر مشخص شده)
    if (dto.replyToId) {
      const replyTo = await this.prisma.chatMessages
        .findUnique({
          where: { Id: dto.replyToId },
        });
      
      if (!replyTo || 
          replyTo.Course_Id !== courseId) {
        throw new NotFoundException(
          'پیام مورد نظر یافت نشد',
        );
      }
    }

    // ایجاد پیام
    const message = await this.prisma.chatMessages
      .create({
        data: {
          Course_Id: courseId,
          Sender_Id: user.id,
          Content: dto.content,
          ReplyTo_Id: dto.replyToId ?? null,
          AttachmentUrl: dto.attachmentUrl ?? null,
          AttachmentName: dto.attachmentName ?? null,
          AttachmentType: dto.attachmentType ?? null,
          AttachmentSize: dto.attachmentSize ?? 0,
        },
        include: { Sender: true, ReplyTo: true },
      });

    // Emit event برای تمام شرکت‌کنندگان
    const participants = await this.getParticipantIds(
      courseId
    );
    
    this.events.emitMessageSent({
      courseId,
      message,
      participantIds: participants,
    });

    return message;
  }

  /**
   * اضافه کردن واکنش (emoji) به پیام
   * React to a message with emoji
   * 
   * ویژگی:
   * - واکنش‌های emoji (👍 😂 ❤️ ...)
   * - تعداد واکنش‌های مختلف
   * - نمایش لیست کاربرانی که واکنش دادند
   */
  async reactToMessage(
    courseId: number,
    messageId: number,
    user: any,
    dto: ReactMessageDto,
  ) {
    await this.assertAccess(user, courseId);

    const message = await this.prisma.chatMessages
      .findUnique({
        where: { Id: messageId },
      });
    
    if (!message || 
        message.Course_Id !== courseId) {
      throw new NotFoundException(
        'پیام یافت نشد',
      );
    }

    // بررسی واکنش قبلی
    const existing = await this.prisma.chatReactions
      .findUnique({
        where: {
          Message_Id_User_Id: {
            Message_Id: messageId,
            User_Id: user.id,
          },
        },
      });

    let reaction: any;
    if (existing) {
      // اگر واکنش قبلی بود، آن را به‌روز کن
      reaction = await this.prisma.chatReactions
        .update({
          where: { Id: existing.Id },
          data: { Reaction: dto.reaction },
        });
    } else {
      // اگر نبود، واکنش جدید بساز
      reaction = await this.prisma.chatReactions
        .create({
          data: {
            Message_Id: messageId,
            User_Id: user.id,
            Reaction: dto.reaction,
          },
        });
    }

    // Emit event
    const participants = await this.getParticipantIds(
      courseId
    );
    
    this.events.emitReactionAdded({
      courseId,
      messageId,
      reaction,
      participantIds: participants,
    });

    return reaction;
  }

  /**
   * ایجاد نظرسنجی (poll) در چت
   * Create a poll in chat
   * 
   * ویژگی‌ها:
   * - سؤال + چند گزینه
   * - ردیابی رای‌ها
   * - نتایج live
   */
  async createPoll(
    courseId: number,
    user: any,
    dto: CreatePollDto,
  ) {
    await this.assertAccess(user, courseId);

    const poll = await this.prisma.chatPolls
      .create({
        data: {
          Course_Id: courseId,
          Creator_Id: user.id,
          Question: dto.question,
          Options: dto.options.join('|'),
          ExpiresAt: dto.expiresAt 
            ? new Date(dto.expiresAt) 
            : null,
        },
      });

    // Emit event
    const participants = await this.getParticipantIds(
      courseId
    );
    
    this.events.emitPollCreated({
      courseId,
      poll,
      participantIds: participants,
    });

    return poll;
  }

  /**
   * رای‌دادن در نظرسنجی
   * Vote in a poll
   */
  async votePoll(
    courseId: number,
    user: any,
    dto: VotePollDto,
  ) {
    await this.assertAccess(user, courseId);

    // بررسی نظرسنجی
    const poll = await this.prisma.chatPolls
      .findUnique({
        where: { Id: dto.pollId },
      });
    
    if (!poll || poll.Course_Id !== courseId) {
      throw new NotFoundException(
        'نظرسنجی یافت نشد',
      );
    }

    if (poll.ExpiresAt && 
        new Date() > poll.ExpiresAt) {
      throw new BadRequestException(
        'مهلت رای‌دادن تمام شده است',
      );
    }

    // بررسی رای قبلی
    const existingVote = 
      await this.prisma.chatPollVotes.findUnique({
        where: {
          Poll_Id_User_Id: {
            Poll_Id: dto.pollId,
            User_Id: user.id,
          },
        },
      });

    let vote: any;
    if (existingVote) {
      vote = await this.prisma.chatPollVotes
        .update({
          where: { Id: existingVote.Id },
          data: { SelectedOption: dto.optionIndex },
        });
    } else {
      vote = await this.prisma.chatPollVotes
        .create({
          data: {
            Poll_Id: dto.pollId,
            User_Id: user.id,
            SelectedOption: dto.optionIndex,
          },
        });
    }

    // Emit event
    const participants = await this.getParticipantIds(
      courseId
    );
    
    this.events.emitVoteAdded({
      courseId,
      pollId: dto.pollId,
      vote,
      participantIds: participants,
    });

    return vote;
  }

  /**
   * دریافت پیام‌های دوره
   * Get course messages with pagination
   * 
   * ویژگی‌ها:
   * - بارگذاری Lazy
   * - شامل پیام‌های جواب
   * - شامل واکنش‌ها
   */
  async getMessages(
    courseId: number,
    user: any,
    limit: number = 50,
    offset: number = 0,
  ) {
    await this.assertAccess(user, courseId);

    const messages = await this.prisma.chatMessages
      .findMany({
        where: { Course_Id: courseId },
        orderBy: { CreatedAt: 'desc' },
        skip: offset,
        take: limit,
        include: {
          Sender: { select: SENDER_SELECT },
          ReplyTo: {
            select: {
              Id: true,
              Content: true,
              Sender: { select: SENDER_SELECT },
            },
          },
          Reactions: {
            select: {
              User_Id: true,
              Reaction: true,
            },
          },
        },
      });

    return messages.reverse();
  }

  /**
   * Subscribe به رویدادهای چت
   * Subscribe to chat events
   * 
   * استفاده RxJS برای streaming:
   */
  getMessageStream(
    courseId: number
  ): Observable<any> {
    return this.events.onMessageSent().pipe(
      filter((event) => 
        event.courseId === courseId
      ),
      map((event) => event.message),
    );
  }
}
```

### 📊 نمونه Event Stream

```json
{
  "type": "message_sent",
  "courseId": 1,
  "message": {
    "id": 42,
    "content": "سلام دوستان!",
    "sender": { "id": 5, "firstName": "علی" },
    "createdAt": "2024-09-07T10:30:00Z",
    "reactions": [
      { "userId": 6, "reaction": "👍" },
      { "userId": 7, "reaction": "❤️" }
    ]
  },
  "participantIds": [1, 2, 3, 4, 5]
}
```

---

## 📈 خلاصه نواوری‌های اصلی

| ویژگی | نواوری | فایده |
|-------|---------|--------|
| **تولید سوال AI** | استفاده از مدل Qwen3-4B | صرفه‌جویی در وقت مدرسین |
| **تحلیل مهارت** | برچسب‌های مهارت برای هر سوال | شناسایی نقاط ضعف دقیق |
| **رگرسیون خطی** | الگوریتم خودکار برای روند | تشخیص خودکار پیشرفت |
| **پیشنهاد هوشمند** | الگوریتم وزن‌دار | دوره‌های مناسب به دانشجو |
| **آزمون‌های متعدد** | آزمون‌های مختلف برای دوره | انعطاف‌پذیری بیشتر |
| **چت Real-time** | RxJS + WebSocket | ارتباطات آنی |
| **حفاظت داده** | Soft delete برای آزمون‌ها | تاریخچه یادگیری محفوظ |

---

## 🎓 نتیجه‌گیری

این پروژه یک سیستم مدیریت یادگیری جامع است که از:
- **هوش مصنوعی** برای تولید سوالات
- **تحلیل داده** برای شناسایی نقاط ضعف
- **الگوریتم‌های هوشمند** برای پیشنهادات شخصی‌شده
- **ارتباطات Real-time** برای تعامل بهتر

استفاده می‌کند تا تجربه یادگیری بهتر و شخصی‌شده‌تری برای دانشجویان فراهم آورد.

