import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AnalyticsService, SkillStat } from '../analytics/analytics.service';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface CourseCandidate {
  courseId: number;
  title: string;
  categoryId: number;        // برای Category Affinity مقایسه مستقیم
  categoryTitle: string;
  levelName: string | null;
  averageRating: number;
  skillTags: string[]; // از سوالات آزمون دوره
  thumbnail: string | null;
}

interface ScoredCourse extends CourseCandidate {
  score: number; // 0-100
  matchedSkillTags: string[]; // تگ‌های ضعیف دانشجو که این دوره پوشش می‌دهد
  reason?: string; // توضیح فارسی
}

interface StudentProfile {
  completedCourseIds: number[];
  weakSkills: SkillStat[]; // مهارت‌های با درصد < 50
  avgCompletedLevel: number | null; // میانگین سطح دوره‌های تکمیل‌شده (1-3)
  favoriteCategoryIds: number[]; // دسته‌بندی‌های دوره‌های قبلی
}

// ============================================================================
// Constants — وزن‌های الگوریتم (قابل تنظیم برای دفاع)
// ============================================================================
const WEIGHTS = {
  SKILL_GAP_MATCH: 0.45,
  LEVEL_PROGRESSION: 0.25,
  CATEGORY_AFFINITY: 0.2,
  COURSE_QUALITY: 0.1,
};

const SKILL_WEAKNESS_THRESHOLD = 50; // مهارت‌هایی با درصد کمتر از این، ضعیف محسوب می‌شوند
const CACHE_VALIDITY_HOURS = 24; // مدت اعتبار کش پیشنهادات

@Injectable()
export class RecommendationsService {
  constructor(
    private prisma: PrismaService,
    private analyticsService: AnalyticsService,
  ) {}

  // ==========================================================================
  // Core Algorithm — Pure Function (قابل تست بدون دیتابیس)
  // ==========================================================================

  /**
   * محاسبه امتیاز یک دوره بر اساس پروفایل دانشجو
   * @param profile پروفایل مهارتی و سابقه دانشجو
   * @param course دوره کاندید
   * @returns امتیاز نرمالایز شده 0-100
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

    // -------- 1. Skill Gap Match (45%) --------
    // همپوشانی بین مهارت‌های ضعیف دانشجو و مهارت‌های دوره
    if (profile.weakSkills.length > 0 && course.skillTags.length > 0) {
      const weakSkillSet = new Set(
        profile.weakSkills.map((s) => s.tag.toLowerCase().trim()),
      );
      const courseSkillSet = new Set(
        course.skillTags.map((t) => t.toLowerCase().trim()),
      );

      let matchCount = 0;
      for (const weakTag of weakSkillSet) {
        if (courseSkillSet.has(weakTag)) {
          matchCount++;
          // پیدا کردن تگ اصلی (با case اصلی) برای ذخیره
          const originalTag = profile.weakSkills.find(
            (s) => s.tag.toLowerCase().trim() === weakTag,
          )?.tag;
          if (originalTag) matchedSkillTags.push(originalTag);
        }
      }

      const matchRatio = matchCount / Math.max(weakSkillSet.size, 1);
      totalScore += matchRatio * 100 * WEIGHTS.SKILL_GAP_MATCH;
    }

    // -------- 2. Level Progression (25%) --------
    // سطح دوره باید هم‌سطح یا یک پله بالاتر از میانگین دوره‌های گذرانده‌شده باشد
    if (profile.avgCompletedLevel !== null && course.levelName) {
      const levelMap: Record<string, number> = {
        مقدماتی: 1,
        متوسط: 2,
        پیشرفته: 3,
      };
      const courseLevel = levelMap[course.levelName] ?? 2;
      const idealLevel = profile.avgCompletedLevel + 1; // یک پله بالاتر
      const levelDiff = Math.abs(courseLevel - idealLevel);

      // هرچه فاصله کمتر، امتیاز بیشتر (کاهش نمایی)
      const levelScore = Math.exp(-levelDiff) * 100;
      totalScore += levelScore * WEIGHTS.LEVEL_PROGRESSION;
    } else {
      // اگر سابقه نداشت، امتیاز خنثی
      totalScore += 50 * WEIGHTS.LEVEL_PROGRESSION;
    }

    // -------- 3. Category Affinity (20%) --------
    // اگر دسته‌بندی دوره کاندید دقیقاً با یکی از دسته‌بندی‌های قبلی دانشجو یکسان باشد
    // → امتیاز کامل؛ در غیر این صورت → صفر
    // این رویکرد ساده و کاملاً قابل توضیح است:
    // دانشجو در یک حوزه سابقه دارد، پس دوره هم‌حوزه منطقی‌تر است
    if (profile.favoriteCategoryIds.length > 0) {
      const categoryScore = profile.favoriteCategoryIds.includes(course.categoryId)
        ? 100   // همان دسته‌بندی → امتیاز کامل
        : 0;    // دسته‌بندی متفاوت → بدون امتیاز از این مؤلفه
      totalScore += categoryScore * WEIGHTS.CATEGORY_AFFINITY;
    } else {
      // دانشجوی تازه‌کار بدون سابقه → امتیاز خنثی (نه مثبت نه منفی)
      totalScore += 50 * WEIGHTS.CATEGORY_AFFINITY;
    }

    // -------- 4. Course Quality (10%) --------
    // نرمالایز AverageRating (0-5) به 0-100
    const qualityScore = (course.averageRating / 5) * 100;
    totalScore += qualityScore * WEIGHTS.COURSE_QUALITY;

    return {
      score: Math.min(100, Math.max(0, totalScore)),
      matchedSkillTags,
    };
  }

  // ==========================================================================
  // Database Layer — دریافت پروفایل و کاندیدها
  // ==========================================================================

  private async buildStudentProfile(
    studentId: number,
  ): Promise<StudentProfile> {
    // دوره‌های تکمیل‌شده (دارای گواهینامه)
    const certificates = await this.prisma.certificates.findMany({
      where: { Student_Id: studentId },
      include: {
        Courses: {
          select: {
            CategoryId: true,
            Level_Id: true,
            Level: { select: { LevelName: true } },
          },
        },
      },
    });

    const completedCourseIds = certificates.map((c) => c.Course_Id);

    // میانگین سطح دوره‌های تکمیل‌شده
    const levelMap: Record<string, number> = {
      مقدماتی: 1,
      متوسط: 2,
      پیشرفته: 3,
    };
    const levels = certificates
      .map((c) => c.Courses.Level?.LevelName)
      .filter(Boolean)
      .map((ln) => levelMap[ln!] ?? 2);
    const avgCompletedLevel =
      levels.length > 0
        ? levels.reduce((a, b) => a + b, 0) / levels.length
        : null;

    // دسته‌بندی‌های محبوب
    const favoriteCategoryIds = [
      ...new Set(certificates.map((c) => c.Courses.CategoryId)),
    ];

    // مهارت‌های ضعیف (از analytics service)
    const { skills } = await this.analyticsService.getMySkillProfile(studentId);
    const weakSkills = skills.filter(
      (s) => s.percentage < SKILL_WEAKNESS_THRESHOLD,
    );

    return {
      completedCourseIds,
      weakSkills,
      avgCompletedLevel,
      favoriteCategoryIds,
    };
  }

  private async getCandidateCourses(
    studentId: number,
    excludeCourseIds: number[],
  ): Promise<CourseCandidate[]> {
    // دوره‌های منتشرشده که دانشجو در آن‌ها ثبت‌نام نکرده
    const enrollments = await this.prisma.enrollments.findMany({
      where: { Student_Id: studentId },
      select: { Course_Id: true },
    });
    const enrolledIds = enrollments.map((e) => e.Course_Id);
    const allExcluded = [...excludeCourseIds, ...enrolledIds];

    const courses = await this.prisma.courses.findMany({
      where: {
        IsPublished: true,
        Id: { notIn: allExcluded },
      },
      include: {
        Category: { select: { Title: true } },
        Level: { select: { LevelName: true } },
        Quizzes: {
          where: { IsPublished: true },
          include: {
            QuizQuestions: { select: { SkillTag: true } },
          },
        },
      },
    });

    return courses.map((c) => {
      // استخراج تمام SkillTag های یونیک از سوالات آزمون‌های دوره
      const skillTags = [
        ...new Set(
          c.Quizzes.flatMap((q) =>
            q.QuizQuestions.map((qq) => qq.SkillTag).filter(
              (tag): tag is string => !!tag && tag.trim() !== '',
            ),
          ),
        ),
      ];

      return {
        courseId: c.Id,
        title: c.Title,
        categoryId: c.CategoryId,
        categoryTitle: c.Category.Title,
        levelName: c.Level?.LevelName ?? null,
        averageRating: Number(c.AverageRating),
        skillTags,
        thumbnail: c.Thumbnail,
      };
    });
  }

  // ==========================================================================
  // LLM Integration — تولید توضیح فارسی
  // ==========================================================================

  private async generateReason(
    studentName: string,
    course: ScoredCourse,
  ): Promise<string> {
    // Fallback قالبی برای زمانی که LLM در دسترس نیست یا خطا می‌دهد
    const fallback = `این دوره روی مهارت‌های ${course.matchedSkillTags.join('، ')} تمرکز دارد که در آزمون‌های شما نیاز به تقویت دارند.`;

    if (course.matchedSkillTags.length === 0) {
      return `این دوره با سطح و زمینه یادگیری شما هم‌راستا است و می‌تواند مهارت‌های جدیدی به شما آموزش دهد.`;
    }

    const apiUrl =
      process.env.AI_API_URL || 'http://92.246.145.99:1234/v1/chat/completions';
    const model = 'qwen/qwen3-4b';

    const system = `تو یک مشاور آموزشی هستی که به دانشجویان کمک می‌کنی دوره‌های مناسب را انتخاب کنند. یک جمله کوتاه و دلنشین به زبان فارسی بنویس که توضیح دهد چرا این دوره برای دانشجو مناسب است. جمله باید محاوره‌ای و انگیزه‌بخش باشد، نه رسمی و خشک.`;

    const user = `دانشجو در مهارت‌های «${course.matchedSkillTags.join('، ')}» ضعیف است. دوره «${course.title}» این مهارت‌ها را پوشش می‌دهد. یک جمله توصیه کوتاه (حداکثر ۲۰ کلمه) بنویس.`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
          temperature: 0.7,
          max_tokens: 100,
          chat_template_kwargs: { enable_thinking: false },
        }),
      });

      if (!response.ok) {
        console.warn(
          `LLM service error (${response.status}), using fallback reason`,
        );
        return fallback;
      }

      const data: any = await response.json();
      const content = data?.choices?.[0]?.message?.content?.trim();

      if (!content || content.length < 10) {
        return fallback;
      }

      return content;
    } catch (error) {
      console.warn('LLM service unavailable, using fallback reason:', error);
      return fallback;
    }
  }

  // ==========================================================================
  // Public API Methods
  // ==========================================================================

  /**
   * دریافت پیشنهادهای فعال یک دانشجو (از کش یا محاسبه جدید)
   */
  async getRecommendations(studentId: number, currentUser: any) {
    // Ownership check
    if (currentUser.roleId !== 3 && currentUser.id !== studentId) {
      throw new ForbiddenException('دسترسی مجاز نیست.');
    }

    // بررسی کش موجود
    const cacheThreshold = new Date(
      Date.now() - CACHE_VALIDITY_HOURS * 60 * 60 * 1000,
    );
    const cached = await this.prisma.courseRecommendations.findMany({
      where: {
        Student_Id: studentId,
        Status: 'Active',
        GeneratedAt: { gte: cacheThreshold },
      },
      include: {
        Courses: {
          select: {
            Id: true,
            Title: true,
            Thumbnail: true,
            ShortDescription: true,
            Price: true,
            DiscountPrice: true,
            AverageRating: true,
            Category: { select: { Title: true } },
            Level: { select: { LevelName: true } },
          },
        },
      },
      orderBy: { Score: 'desc' },
    });

    if (cached.length > 0) {
      return cached.map((r) => ({
        id: r.Id,
        courseId: r.Course_Id,
        score: Number(r.Score),
        reason: r.Reason,
        matchedSkillTags: r.MatchedSkillTags
          ? JSON.parse(r.MatchedSkillTags)
          : [],
        status: r.Status,
        generatedAt: r.GeneratedAt,
        course: {
          id: r.Courses.Id,
          title: r.Courses.Title,
          thumbnail: r.Courses.Thumbnail,
          shortDescription: r.Courses.ShortDescription,
          price: Number(r.Courses.Price),
          discountPrice: r.Courses.DiscountPrice
            ? Number(r.Courses.DiscountPrice)
            : null,
          averageRating: Number(r.Courses.AverageRating),
          category: r.Courses.Category.Title,
          level: r.Courses.Level?.LevelName ?? null,
        },
      }));
    }

    // کش قدیمی یا موجود نیست → محاسبه جدید
    await this.refresh(studentId, 5);

    // بازخوانی از دیتابیس
    return this.getRecommendations(studentId, currentUser);
  }

  /**
   * محاسبه مجدد پیشنهادها (برای دانشجویی که تازه دوره‌ای را تمام کرده)
   */
  async refresh(studentId: number, topN: number = 5): Promise<void> {
    const profile = await this.buildStudentProfile(studentId);
    const candidates = await this.getCandidateCourses(
      studentId,
      profile.completedCourseIds,
    );

    if (candidates.length === 0) {
      // دانشجو در همه دوره‌ها ثبت‌نام کرده یا دوره‌ای منتشر نیست
      return;
    }

    // امتیازدهی به همه کاندیدها
    const scored: ScoredCourse[] = candidates.map((c) => {
      const { score, matchedSkillTags } = this.scoreCourse(profile, c);
      return { ...c, score, matchedSkillTags };
    });

    // مرتب‌سازی نزولی بر اساس امتیاز
    scored.sort((a, b) => b.score - a.score);

    // انتخاب N دوره برتر
    const topCourses = scored.slice(0, topN);

    // تولید توضیح برای هرکدام با LLM
    const student = await this.prisma.users.findUnique({
      where: { Id: studentId },
      select: { FirstName: true, LastName: true },
    });
    const studentName = `${student?.FirstName ?? ''} ${student?.LastName ?? ''}`.trim();

    for (const course of topCourses) {
      course.reason = await this.generateReason(studentName, course);
    }

    // حذف پیشنهادهای قدیمی Active برای همان دوره‌ها (جلوگیری از تکراری)
    const topCourseIds = topCourses.map((c) => c.courseId);
    await this.prisma.courseRecommendations.deleteMany({
      where: {
        Student_Id: studentId,
        Course_Id: { in: topCourseIds },
        Status: 'Active',
      },
    });

    // ذخیره پیشنهادهای جدید
    await this.prisma.courseRecommendations.createMany({
      data: topCourses.map((c) => ({
        Student_Id: studentId,
        Course_Id: c.courseId,
        Score: c.score,
        Reason: c.reason,
        MatchedSkillTags: JSON.stringify(c.matchedSkillTags),
        Status: 'Active',
      })),
    });
  }

  /**
   * علاقه‌مند نیستم — تغییر وضعیت به Dismissed
   */
  async dismiss(recommendationId: number, currentUser: any): Promise<void> {
    const rec = await this.prisma.courseRecommendations.findUnique({
      where: { Id: recommendationId },
    });

    if (!rec) {
      throw new NotFoundException('پیشنهاد یافت نشد.');
    }

    // Ownership check
    if (currentUser.roleId !== 3 && rec.Student_Id !== currentUser.id) {
      throw new ForbiddenException('دسترسی مجاز نیست.');
    }

    await this.prisma.courseRecommendations.update({
      where: { Id: recommendationId },
      data: { Status: 'Dismissed' },
    });
  }

  /**
   * تاریخچه پیشنهادها + نرخ تبدیل به ثبت‌نام
   */
  async getHistory(studentId: number, currentUser: any) {
    // Ownership check
    if (currentUser.roleId !== 3 && currentUser.id !== studentId) {
      throw new ForbiddenException('دسترسی مجاز نیست.');
    }

    const all = await this.prisma.courseRecommendations.findMany({
      where: { Student_Id: studentId },
      include: {
        Courses: {
          select: { Id: true, Title: true, Thumbnail: true },
        },
      },
      orderBy: { GeneratedAt: 'desc' },
    });

    const total = all.length;
    const enrolled = all.filter((r) => r.Status === 'Enrolled').length;
    const conversionRate = total > 0 ? (enrolled / total) * 100 : 0;

    return {
      history: all.map((r) => ({
        id: r.Id,
        courseId: r.Course_Id,
        courseTitle: r.Courses.Title,
        courseThumbnail: r.Courses.Thumbnail,
        score: Number(r.Score),
        reason: r.Reason,
        status: r.Status,
        generatedAt: r.GeneratedAt,
      })),
      stats: {
        total,
        enrolled,
        dismissed: all.filter((r) => r.Status === 'Dismissed').length,
        active: all.filter((r) => r.Status === 'Active').length,
        conversionRate: Math.round(conversionRate),
      },
    };
  }

  /**
   * به‌روزرسانی وضعیت به Enrolled (فراخوانی داخلی از enrollments module)
   */
  async markAsEnrolled(studentId: number, courseId: number): Promise<void> {
    await this.prisma.courseRecommendations.updateMany({
      where: {
        Student_Id: studentId,
        Course_Id: courseId,
        Status: 'Active',
      },
      data: { Status: 'Enrolled' },
    });
  }
}
