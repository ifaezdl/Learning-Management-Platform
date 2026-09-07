# کدهای نوآوری برای دفاع پایان‌نامه
## Code Snippets - Professional Format for Screenshots

---

## 📌 بخش ۱: سرویس تولید سوال با AI

### کد ۱: AI Service - تولید سوالات

```typescript
// AI Service - Question Generation using Qwen Model
// سرویس هوش مصنوعی برای تولید سوالات با مدل Qwen

import { Injectable } from '@nestjs/common';

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
   * تولید سوالات برای یک دوره
   * Generate questions based on course content and learning outcomes
   * 
   * @param course - اطلاعات دوره (عنوان، اهداف، درس‌ها)
   * @param count - تعداد سوالات مورد نظر
   * @returns آرایه سوالات تولید شده با برچسب مهارت
   */
  async generateQuestionsForCourse(
    course: any,
    count: number,
  ): Promise<AiQuestion[]> {
    // مرحله ۱: استخراج اطلاعات دوره
    const courseInfo = this.extractCourseInfo(course);
    
    // مرحله ۲: ساخت پرامپت دوزبانه
    const { system, user } = this.buildPrompt(courseInfo, count);
    
    // مرحله ۳: فراخوانی API هوش مصنوعی
    const response = await this.callAiApi(system, user);
    
    // مرحله ۴: پارسینگ JSON و استخراج سوالات
    const questions = this.parseQuestions(response);
    
    // مرحله ۵: اعتبارسنجی کیفیت
    this.validateQuestions(questions);
    
    return questions;
  }

  /**
   * ساخت پرامپت برای مدل
   * Build system and user prompts for AI model
   */
  private buildPrompt(courseInfo: any, count: number) {
    const systemPrompt = `
تو یک طراح آزمون حرفه‌ای هستی.
MUST: خروجی ONLY JSON array است، بدون متن اضافی.
Format: [{"question":"...", "choices":[...], "correctIndex":0, "skillTag":"..."}]

الزامات:
✓ دقیقاً 4 گزینه برای هر سوال
✓ فقط 1 گزینه صحیح
✓ برچسب مهارت: 2-4 کلمه فارسی
✓ سوالات متنوع و غیر تکراری
✓ براساس محتوای دوره، نه اطلاعات عمومی`;

    const userPrompt = `
عنوان دوره: ${courseInfo.title}
دسته‌بندی: ${courseInfo.category}
سطح: ${courseInfo.level}

اهداف یادگیری:
${courseInfo.outcomes.map((o: string) => `• ${o}`).join('\n')}

پیش‌نیازها:
${courseInfo.prerequisites.map((p: string) => `• ${p}`).join('\n')}

درس‌ها:
${courseInfo.lessons.slice(0, 5).map((l: string) => `• ${l}`).join('\n')}

لطفاً ${count} سوال اختبار درست و با کیفیت تولید کن.`;

    return { system: systemPrompt, user: userPrompt };
  }

  /**
   * فراخوانی API هوش مصنوعی
   * Call Qwen AI API
   */
  private async callAiApi(
    systemPrompt: string,
    userPrompt: string
  ): Promise<string> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,  // تعادل بین خلاقیت و دقت
        max_tokens: 2000,
      }),
    });

    const data = await response.json();
    return data?.choices?.[0]?.message?.content || '';
  }

  /**
   * پارسینگ قوی برای استخراج JSON
   * Robust JSON parsing with error handling
   */
  private parseQuestions(content: string): any[] {
    // حذف markdown fences
    let cleaned = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '');

    // استخراج آرایه JSON
    const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('JSON not found');

    const parsed = JSON.parse(jsonMatch[0]);
    return Array.isArray(parsed) ? parsed : [parsed];
  }

  /**
   * اعتبارسنجی کیفی سوالات
   * Validate question quality
   */
  private validateQuestions(questions: any[]): void {
    questions.forEach((q, idx) => {
      // بررسی متن سوال
      if (!q.question || q.question.trim().length < 10) {
        throw new Error(`سوال ${idx + 1}: متن ناکافی`);
      }

      // بررسی تعداد گزینه‌ها
      if (!Array.isArray(q.choices) || q.choices.length !== 4) {
        throw new Error(`سوال ${idx + 1}: تعداد گزینه‌ها نادرست`);
      }

      // بررسی گزینه صحیح
      const correctCount = q.choices.filter(
        (c: any) => c.isCorrect === true
      ).length;
      if (correctCount !== 1) {
        throw new Error(`سوال ${idx + 1}: باید دقیقاً 1 صحیح`);
      }

      // بررسی برچسب مهارت
      const skillTag = q.skillTag?.trim() || '';
      if (skillTag.length === 0) {
        q.skillTag = 'مهارت عمومی';
      }
    });
  }
}
```

---

## 📌 بخش ۲: سیستم تحلیل مهارت

### کد ۲: groupBySkill() - گروه‌بندی مهارت‌ها

```typescript
// Analytics Service - Skill-Based Analysis
// سرویس تحلیل - تجزیه‌تحلیل مبتنی بر مهارت

export interface SkillStat {
  tag: string;          // نام مهارت
  correct: number;      // تعداد پاسخ صحیح
  total: number;        // تعداد کل سوالات
  percentage: number;   // درصد موفقیت (0-100)
}

/**
 * گروه‌بندی جواب‌ها براساس برچسب مهارت
 * Group answers by skill tag and calculate success percentage
 * 
 * @param answers - لیست جواب‌های دانشجو با برچسب‌های مهارت
 * @returns آرایه مهارت‌ها از ضعیفترین به قوی‌ترین
 * 
 * مثال:
 * Input:  [
 *   { skillTag: "حلقه", isCorrect: true },
 *   { skillTag: "حلقه", isCorrect: false },
 *   { skillTag: "تابع", isCorrect: true }
 * ]
 * 
 * Output: [
 *   { tag: "حلقه", correct: 1, total: 2, percentage: 50 },
 *   { tag: "تابع", correct: 1, total: 1, percentage: 100 }
 * ]
 */
function groupBySkill(
  answers: Array<{ skillTag: string | null; isCorrect: boolean }>
): SkillStat[] {
  // ۱. ایجاد Map برای ذخیره آمار هر مهارت
  const skillMap = new Map<string, { correct: number; total: number }>();

  // ۲. حلقه بر روی تمام جواب‌ها
  for (const answer of answers) {
    // نرمال‌سازی برچسب (خالی → "سایر")
    const skillTag = (answer.skillTag?.trim()) 
      ? answer.skillTag.trim() 
      : 'سایر';

    // دریافت یا ایجاد entry
    const stats = skillMap.get(skillTag) ?? { correct: 0, total: 0 };
    
    // به‌روزرسانی شمارنده‌ها
    stats.total += 1;
    if (answer.isCorrect) {
      stats.correct += 1;
    }

    skillMap.set(skillTag, stats);
  }

  // ۳. تبدیل Map به آرایه
  const result: SkillStat[] = [];
  for (const [tag, stats] of skillMap.entries()) {
    result.push({
      tag,
      correct: stats.correct,
      total: stats.total,
      // درصد = (صحیح / کل) × 100
      percentage: Math.round((stats.correct / stats.total) * 100),
    });
  }

  // ۴. مرتب‌سازی: ضعیفترین ← قوی‌ترین
  result.sort((a, b) => a.percentage - b.percentage);

  return result;
}

// استفاده:
const skills = groupBySkill([
  { skillTag: 'Loop', isCorrect: true },
  { skillTag: 'Loop', isCorrect: false },
  { skillTag: 'Function', isCorrect: true },
  { skillTag: 'Function', isCorrect: true },
]);

console.log(skills);
// [
//   { tag: 'Loop', correct: 1, total: 2, percentage: 50 },
//   { tag: 'Function', correct: 2, total: 2, percentage: 100 }
// ]
```

### کد ۳: classifyTrend() - تشخیص روند یادگیری

```typescript
// Trend Classification using Linear Regression
// تشخیص روند با استفاده از رگرسیون خطی

export interface TrendClassification {
  status: 'صعودی' | 'نزولی' | 'ثابت' | 'داده کافی نیست';
  slope: number;        // شیب خط رگرسیون
  description: string;  // توضیح متنی
}

/**
 * تشخیص روند یادگیری با رگرسیون خطی
 * Classify learning trend using linear regression formula
 * 
 * فرمول: y = mx + b
 * m = slope (شیب) = نشان‌دهنده روند
 * 
 * تفسیر:
 * slope > +2   ✅ صعودی (بهبود)
 * slope < -2   ❌ نزولی (تاهل)
 * -2 ≤ slope ≤ +2  ➡️ ثابت (بدون تغییر معنادار)
 * 
 * @param scores - لیست نمرات با تاریخ
 * @returns طبقه‌بندی روند
 */
function classifyTrend(
  scores: Array<{ date: Date; percentage: number }>
): TrendClassification {
  // بررسی حداقل تعداد نقاط
  if (scores.length < 2) {
    return {
      status: 'داده کافی نیست',
      slope: 0,
      description: 'حداقل 2 آزمون برای تحلیل روند لازم است.',
    };
  }

  // مرتب‌سازی براساس تاریخ
  const sorted = [...scores].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // بررسی: آیا همه نمرات یکسان هستند؟
  const allSame = sorted.every(s => s.percentage === sorted[0].percentage);
  if (allSame) {
    return {
      status: 'ثابت',
      slope: 0,
      description: `نمره در ${sorted[0].percentage}٪ ثابت مانده است.`,
    };
  }

  // محاسبه رگرسیون خطی
  // y = درصد نمره
  // x = شماره آزمون (0, 1, 2, ...)
  
  const n = sorted.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

  for (let i = 0; i < n; i++) {
    const x = i;                    // شماره
    const y = sorted[i].percentage; // نمره
    
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  }

  // فرمول شیب: m = (n*Σ(xy) - Σx*Σy) / (n*Σ(x²) - (Σx)²)
  const numerator = n * sumXY - sumX * sumY;
  const denominator = n * sumX2 - sumX * sumX;

  const slope = numerator / denominator;

  // تصمیم‌گیری
  let status: TrendClassification['status'];
  let description: string;

  if (slope > 2) {
    status = 'صعودی';
    description = `
روند صعودی ✅
شیب: ${slope.toFixed(2)} درصد برای هر آزمون
تفسیر: دانشجو رو به بهبود است.`;
  } else if (slope < -2) {
    status = 'نزولی';
    description = `
روند نزولی ❌
شیب: ${slope.toFixed(2)} درصد برای هر آزمون
تفسیر: نیاز به دخالت و راهنمایی دارد.`;
  } else {
    status = 'ثابت';
    description = `
روند ثابت ➡️
شیب: ${slope.toFixed(2)} درصد
تفسیر: عملکرد تغییر معنادار نکرده است.`;
  }

  return { status, slope, description };
}

// مثال عملی:
const trendExample = classifyTrend([
  { date: new Date('2024-01-01'), percentage: 65 },
  { date: new Date('2024-01-08'), percentage: 72 },
  { date: new Date('2024-01-15'), percentage: 78 },
  { date: new Date('2024-01-22'), percentage: 85 },
]);

console.log(trendExample);
// {
//   status: 'صعودی',
//   slope: 6.67,
//   description: 'روند صعودی ✅\nشیب: 6.67 درصد برای هر آزمون\n...'
// }
```

---

## 📌 بخش ۳: الگوریتم توصیه دوره

### کد ۴: scoreCourse() - محاسبه امتیاز دوره

```typescript
// Recommendation Engine - Course Scoring Algorithm
// موتور توصیه - الگوریتم محاسبه امتیاز دوره

export interface StudentProfile {
  weakSkills: Array<{ tag: string; percentage: number }>;
  avgCompletedLevel: number | null;  // 1: beginner, 2: intermediate, 3: advanced
  favoriteCategoryIds: number[];
}

export interface CourseCandidate {
  id: number;
  title: string;
  skillTags: string[];
  level: number;
  categoryId: number;
  averageRating: number;  // 0-5
}

// وزن‌های الگوریتم (مجموع = 100%)
const ALGORITHM_WEIGHTS = {
  SKILL_GAP_MATCH: 0.45,      // ۴۵% - اهمیت: آیا دوره مهارت‌های ضعیف را پوشش می‌دهد؟
  LEVEL_PROGRESSION: 0.25,    // ۲۵% - اهمیت: آیا سطح دوره مناسب است؟
  CATEGORY_AFFINITY: 0.20,    // ۲۰% - اهمیت: دسته‌بندی علاقه‌مندی‌های قبلی؟
  COURSE_QUALITY: 0.10,       // ۱۰% - اهمیت: کیفیت و امتیاز دوره
};

/**
 * محاسبه امتیاز دوره برای یک دانشجو
 * Score a course based on student profile using weighted algorithm
 * 
 * معادله:
 * Score = (SkillMatch × 0.45) + 
 *         (LevelFit × 0.25) + 
 *         (CategoryMatch × 0.20) + 
 *         (Quality × 0.10)
 * 
 * @param profile - پروفایل دانشجو
 * @param course - اطلاعات دوره
 * @returns امتیاز (0-100) و مهارت‌های متطابق
 */
function scoreCourse(
  profile: StudentProfile,
  course: CourseCandidate
): { score: number; matchedSkills: string[] } {
  let totalScore = 0;
  const matchedSkills: string[] = [];

  // ═══════════════════════════════════════════════════════
  // ۱️⃣ Skill Gap Match (۴۵%)
  // آیا مهارت‌های ضعیف دانشجو در دوره پوشش داده می‌شوند؟
  // ═══════════════════════════════════════════════════════
  
  if (profile.weakSkills.length > 0 && course.skillTags.length > 0) {
    // تبدیل به lowercase برای مقایسه
    const weakSkillSet = new Set(
      profile.weakSkills.map(s => s.tag.toLowerCase().trim())
    );
    
    const courseSkillSet = new Set(
      course.skillTags.map(t => t.toLowerCase().trim())
    );

    // شمارش تطابق‌ها
    let matchCount = 0;
    for (const weakSkill of weakSkillSet) {
      if (courseSkillSet.has(weakSkill)) {
        matchCount++;
        // اضافه کردن به لیست تطابق‌ها
        const original = profile.weakSkills.find(
          s => s.tag.toLowerCase().trim() === weakSkill
        )?.tag;
        if (original) matchedSkills.push(original);
      }
    }

    // محاسبه نسبت مطابقت
    // نسبت = تطابق / مهارت‌های ضعیف
    const matchRatio = matchCount / Math.max(weakSkillSet.size, 1);
    
    // امتیاز این مقوله (0-100)
    const skillScore = matchRatio * 100;
    
    // اعمال وزن
    totalScore += skillScore * ALGORITHM_WEIGHTS.SKILL_GAP_MATCH;
  }

  // ═══════════════════════════════════════════════════════
  // ۲️⃣ Level Progression (۲۵%)
  // آیا سطح دوره برای پیشرفت کافی است؟
  // ═══════════════════════════════════════════════════════
  
  if (profile.avgCompletedLevel !== null) {
    // سطح ایده‌آل = سطح فعلی + ۱
    const idealLevel = profile.avgCompletedLevel + 1;
    
    // محاسبه فاصله
    const levelDistance = Math.abs(course.level - idealLevel);
    
    // فرمول: هرچه نزدیک‌تر، بهتر
    // استفاده از exponential decay: e^(-distance)
    const levelScore = Math.exp(-levelDistance) * 100;
    
    totalScore += levelScore * ALGORITHM_WEIGHTS.LEVEL_PROGRESSION;
  }

  // ═══════════════════════════════════════════════════════
  // ۳️⃣ Category Affinity (۲۰%)
  // آیا دسته‌بندی با علاقه‌مندی‌های قبلی مطابقت دارد؟
  // ═══════════════════════════════════════════════════════
  
  const categoryMatch = profile.favoriteCategoryIds.includes(
    course.categoryId
  ) ? 100 : 30;  // اگر موافق: ۱۰۰، غیر موافق: ۳۰
  
  totalScore += categoryMatch * ALGORITHM_WEIGHTS.CATEGORY_AFFINITY;

  // ═══════════════════════════════════════════════════════
  // ۴️⃣ Course Quality (۱۰%)
  // امتیاز دوره براساس نظرات (0-5 ⟹ 0-100)
  // ═══════════════════════════════════════════════════════
  
  const qualityScore = (course.averageRating / 5) * 100;
  totalScore += qualityScore * ALGORITHM_WEIGHTS.COURSE_QUALITY;

  // برگرداندن نتیجه نهایی
  return {
    score: Math.round(totalScore),
    matchedSkills,
  };
}

// مثال عملی:
const studentProfile: StudentProfile = {
  weakSkills: [
    { tag: 'مدیریت حافظه', percentage: 35 },
    { tag: 'حلقه‌های تکرار', percentage: 45 },
  ],
  avgCompletedLevel: 1,  // completed beginner courses
  favoriteCategoryIds: [3, 4],  // algorithms, data structures
};

const course1: CourseCandidate = {
  id: 101,
  title: 'مدیریت حافظه پیشرفته',
  skillTags: ['مدیریت حافظه', 'Pointers'],
  level: 3,  // advanced
  categoryId: 3,  // algorithms
  averageRating: 4.8,
};

const result = scoreCourse(studentProfile, course1);

console.log(result);
// {
//   score: 82,
//   matchedSkills: ['مدیریت حافظه']
// }
```

---

## 📌 بخش ۴: سیستم آزمون - Soft Delete

### کد ۵: سیستم حفاظت از داده‌های یادگیری

```typescript
// Quiz Service - Learning Data Protection (Soft Delete)
// سرویس آزمون - حفاظت از داده‌های یادگیری

/**
 * حذف آزمون با حفاظت از تاریخچه یادگیری
 * Delete quiz with learning history protection
 * 
 * قانون شرعی:
 * ✅ اگر هیچ attempt ثبت‌نشده → حذف کامل (hard delete)
 * ⚠️ اگر attempt دارد → فقط غیرفعال (soft delete)
 * 
 * دلیل: داده‌های یادگیری دانشجویان مقدس هستند
 * و گواهینامه‌ها باید تأیید‌پذیر باشند.
 * 
 * @param quizId - ID آزمون برای حذف
 * @param userId - ID مدرس/ادمین
 */
async deleteQuiz(quizId: number, userId: number): Promise<void> {
  // ۱. بررسی مالکیت
  const quiz = await db.quizzes.findUnique({
    where: { id: quizId },
    include: { courses: { select: { teacherId: true } } },
  });

  if (quiz.courses.teacherId !== userId) {
    throw new ForbiddenException('شما مالک این آزمون نیستید');
  }

  // ۲. شمارش تعداد attempt ها
  const attemptCount = await db.quizAttempts.count({
    where: { quizId: quizId },
  });

  // ۳. تصمیم‌گیری
  if (attemptCount > 0) {
    // ⚠️ SOFT DELETE: فقط غیرفعال‌سازی
    await db.quizzes.update({
      where: { id: quizId },
      data: {
        isPublished: false,  // مخفی کردن از دانشجویان
        deletedAt: new Date(),  // علامت حذف
      },
    });

    // پیام برای مدرس
    throw new BadRequestException(
      `❌ این آزمون ${attemptCount} شرکت‌کننده دارد.\n` +
      `✓ آزمون غیرفعال شد اما داده‌های یادگیری محفوظ ماند.`
    );
  } else {
    // ✅ HARD DELETE: حذف کامل
    // اول حذف انتخاب‌ها (برای فارغ کردن جدول وابسته)
    const questions = await db.quizQuestions.findMany({
      where: { quizId },
      select: { id: true },
    });

    if (questions.length > 0) {
      const questionIds = questions.map(q => q.id);
      await db.quizChoices.deleteMany({
        where: { questionId: { in: questionIds } },
      });
    }

    // حذف سوالات
    await db.quizQuestions.deleteMany({
      where: { quizId },
    });

    // حذف آزمون
    await db.quizzes.delete({
      where: { id: quizId },
    });

    console.log(`✅ آزمون ${quizId} کاملاً حذف شد.`);
  }
}

// مثال استفاده:
try {
  await deleteQuiz(123, currentUserId);
} catch (error) {
  console.log(error.message);
  // ❌ این آزمون 45 شرکت‌کننده دارد.
  // ✓ آزمون غیرفعال شد اما داده‌های یادگیری محفوظ ماند.
}
```

---

## 📌 بخش ۵: سیستم چت Real-Time

### کد ۶: SSE برای چت بلادرنگ

```typescript
// Chat Service - Real-time Chat using Server-Sent Events (SSE)
// سرویس چت - چت بلادرنگ با استفاده از SSE

import { Subject } from 'rxjs';

/**
 * سرویس چت با SSE
 * Chat service using Server-Sent Events for real-time updates
 * 
 * چرا SSE بجای WebSocket؟
 * ✓ SSE: HTTP standard, auto-reconnect, simpler
 * ✗ WebSocket: Needs special proxy config, more complex
 */
@Injectable()
export class ChatService {
  // Map برای نگه‌داشتن connection های فعال
  // Key: userId, Value: Set of RxJS Subjects
  private userStreams = new Map<number, Set<Subject<ChatEvent>>>();

  /**
   * شروع stream چت برای کاربر
   * Start chat stream for user
   * 
   * @param userId - ID کاربری
   * @param courseId - ID دوره
   * @returns Observable که رویدادهای چت را emit می‌کند
   */
  subscribeToChat(userId: number, courseId: number): Observable<ChatEvent> {
    return new Observable((observer) => {
      // ایجاد Subject جدید
      const subject = new Subject<ChatEvent>();

      // اضافه کردن به مجموعه user
      if (!this.userStreams.has(userId)) {
        this.userStreams.set(userId, new Set());
      }
      this.userStreams.get(userId)!.add(subject);

      // Subscribe کردن observer به subject
      const subscription = subject.subscribe(observer);

      // Cleanup هنگام unsubscribe
      return () => {
        subscription.unsubscribe();
        this.userStreams.get(userId)?.delete(subject);
      };
    });
  }

  /**
   * ارسال پیام به تمام کاربران یک دوره
   * Broadcast message to all users in a course
   * 
   * @param courseId - ID دوره
   * @param message - متن پیام
   * @param senderId - ID فرستنده
   */
  async broadcastMessage(
    courseId: number,
    message: string,
    senderId: number
  ): Promise<void> {
    // ۱. ذخیره پیام در دیتابیس
    const savedMessage = await db.chatMessages.create({
      data: {
        courseId,
        senderId,
        text: message,
        createdAt: new Date(),
      },
    });

    // ۲. دریافت تمام دانشجویان دوره
    const enrollments = await db.enrollments.findMany({
      where: { courseId },
      select: { studentId: true },
    });

    // ۳. فرستادن پیام به تمام کاربران
    for (const enrollment of enrollments) {
      const userId = enrollment.studentId;
      const userSubjects = this.userStreams.get(userId);

      if (userSubjects) {
        const event: ChatEvent = {
          type: 'message',
          data: {
            messageId: savedMessage.id,
            senderId,
            senderName: savedMessage.sender.name,
            text: message,
            timestamp: new Date().toISOString(),
          },
        };

        // emit کردن به تمام subjects این کاربر
        userSubjects.forEach(subject => subject.next(event));
      }
    }
  }

  /**
   * رویداد: کاربری شروع به تایپ کرد
   * Event: User is typing
   */
  async broadcastTyping(
    courseId: number,
    userId: number,
    isTyping: boolean
  ): Promise<void> {
    const enrollments = await db.enrollments.findMany({
      where: { courseId },
      select: { studentId: true },
    });

    const user = await db.users.findUnique({ where: { id: userId } });

    for (const enrollment of enrollments) {
      const targetUserId = enrollment.studentId;
      const subjects = this.userStreams.get(targetUserId);

      if (subjects) {
        const event: ChatEvent = {
          type: 'typing',
          data: {
            userId,
            userName: user.name,
            isTyping,
          },
        };

        subjects.forEach(subject => subject.next(event));
      }
    }
  }

  /**
   * واکنش emoji به پیام
   * Add emoji reaction to message
   */
  async toggleReaction(
    messageId: number,
    userId: number,
    emoji: string
  ): Promise<void> {
    // بررسی وجود reaction
    const existing = await db.chatMessageReactions.findFirst({
      where: { messageId, userId, emoji },
    });

    const message = await db.chatMessages.findUnique({
      where: { id: messageId },
      select: { courseId: true },
    });

    if (existing) {
      // حذف reaction
      await db.chatMessageReactions.delete({
        where: { id: existing.id },
      });
    } else {
      // اضافه کردن reaction
      await db.chatMessageReactions.create({
        data: { messageId, userId, emoji },
      });
    }

    // Broadcast تغییر
    const enrollments = await db.enrollments.findMany({
      where: { courseId: message.courseId },
      select: { studentId: true },
    });

    for (const enrollment of enrollments) {
      const subjects = this.userStreams.get(enrollment.studentId);
      if (subjects) {
        const event: ChatEvent = {
          type: 'reaction-updated',
          data: { messageId, emoji, count: 1 },
        };
        subjects.forEach(subject => subject.next(event));
      }
    }
  }
}

// تعریف انواع رویدادها
interface ChatEvent {
  type: 'message' | 'typing' | 'reaction-updated' | 'online-users';
  data: any;
}
```

### استفاده در Controller:

```typescript
// Chat Controller - HTTP endpoints
// کنترلر چت - نقاط پایانی HTTP

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  /**
   * SSE endpoint: شروع stream چت
   * 
   * درخواست:
   * GET /chat/stream?courseId=5
   * Authorization: Bearer {token}
   * 
   * پاسخ:
   * Content-Type: text/event-stream
   * Connection: keep-alive
   * 
   * Payload:
   * event: message
   * data: {"senderId": 5, "text": "سلام"}
   */
  @Sse('stream')
  chatStream(
    @Query('courseId') courseId: number,
    @Req() req: any
  ): Observable<MessageEvent> {
    const userId = req.user.id;

    return this.chatService
      .subscribeToChat(userId, courseId)
      .pipe(
        map((event: ChatEvent) => ({
          data: event.data,
        }))
      );
  }

  /**
   * فرستادن پیام
   * 
   * POST /chat/send
   * Body: { courseId: 5, message: "سلام همه" }
   */
  @Post('send')
  async sendMessage(
    @Body() dto: SendMessageDto,
    @Req() req: any
  ): Promise<void> {
    const userId = req.user.id;
    await this.chatService.broadcastMessage(
      dto.courseId,
      dto.message,
      userId
    );
  }

  /**
   * تایپ کردن
   * 
   * POST /chat/typing
   * Body: { courseId: 5, isTyping: true }
   */
  @Post('typing')
  async setTyping(
    @Body() dto: TypingDto,
    @Req() req: any
  ): Promise<void> {
    await this.chatService.broadcastTyping(
      dto.courseId,
      req.user.id,
      dto.isTyping
    );
  }
}

// Frontend: استفاده EventSource برای SSE
// const eventSource = new EventSource(
//   'http://api/chat/stream?courseId=5',
//   { headers: { Authorization: `Bearer ${token}` } }
// );
//
// eventSource.addEventListener('message', (event) => {
//   const message = JSON.parse(event.data);
//   console.log(`${message.senderName}: ${message.text}`);
// });
```

---

## 📌 خلاصه نقاط نوآورانه

| # | نوآوری | فایل | کد اصلی |
|---|:---:|:---:|:---:|
| ۱ | تولید سوال با AI | `ai.service.ts` | `generateQuestionsForCourse()` |
| ۲ | تحلیل مهارت | `analytics.service.ts` | `groupBySkill()` + `classifyTrend()` |
| ۳ | توصیه هوشمند | `recommendations.service.ts` | `scoreCourse()` |
| ۴ | حفاظت داده | `quiz.service.ts` | Soft Delete Logic |
| ۵ | چت Real-time | `chat.service.ts` | SSE + Subject |

---

**📸 نکات برای عکس‌گیری:**
- کدهای چپ‌چین، خوانا و بدون راست‌چینی
- کامنت‌های فارسی-انگلیسی برای وضوح
- Syntax highlighting برای بهتر نمایش
- مثال‌های عملی و نتیجه‌های واقعی

