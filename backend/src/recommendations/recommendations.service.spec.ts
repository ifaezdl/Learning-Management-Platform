import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { PrismaService } from '../prisma/prisma.service';
import { AnalyticsService } from '../analytics/analytics.service';

// ---------------------------------------------------------------------------
// Mock ها — Prisma و AnalyticsService کاملاً جعلی هستند
// ---------------------------------------------------------------------------
const mockPrisma = {
  certificates: { findMany: jest.fn() },
  enrollments: { findMany: jest.fn() },
  courses: { findMany: jest.fn() },
  courseRecommendations: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    createMany: jest.fn(),
    deleteMany: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
  users: { findUnique: jest.fn() },
};

const mockAnalyticsService = {
  getMySkillProfile: jest.fn(),
};

// ---------------------------------------------------------------------------
// Helper — ساختن داده‌های CourseCandidate (بدون Prisma)
// ---------------------------------------------------------------------------
function makeCourse(overrides: Partial<any> = {}): any {
  return {
    courseId: 1,
    title: 'دوره آزمایشی',
    categoryId: 10,
    categoryTitle: 'برنامه‌نویسی',
    levelName: 'متوسط',
    averageRating: 4.0,
    skillTags: ['حلقه‌های تکرار', 'توابع'],
    thumbnail: null,
    ...overrides,
  };
}

function makeProfile(overrides: Partial<any> = {}): any {
  return {
    completedCourseIds: [],
    weakSkills: [
      { tag: 'حلقه‌های تکرار', correct: 1, total: 4, percentage: 25 },
      { tag: 'توابع', correct: 1, total: 4, percentage: 25 },
    ],
    avgCompletedLevel: 1,
    favoriteCategoryIds: [1],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Test Suite
// ---------------------------------------------------------------------------
describe('RecommendationsService', () => {
  let service: RecommendationsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecommendationsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AnalyticsService, useValue: mockAnalyticsService },
      ],
    }).compile();

    service = module.get<RecommendationsService>(RecommendationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // =========================================================================
  // scoreCourse — تابع pure (دسترسی خصوصی از طریق any)
  // =========================================================================
  describe('scoreCourse (private method — tested via any cast)', () => {
    it('Skill Gap Match: امتیاز بالاتر وقتی دوره مهارت‌های ضعیف را پوشش می‌دهد', () => {
      const profile = makeProfile({
        weakSkills: [
          { tag: 'حلقه‌های تکرار', correct: 1, total: 4, percentage: 25 },
        ],
      });

      // دوره با تگ مطابق
      const courseWithMatch = makeCourse({
        skillTags: ['حلقه‌های تکرار'],
      });
      // دوره بدون تگ مطابق
      const courseNoMatch = makeCourse({
        skillTags: ['مبانی پایگاه داده'],
      });

      const { score: scoreWithMatch } = (service as any).scoreCourse(
        profile,
        courseWithMatch,
      );
      const { score: scoreNoMatch } = (service as any).scoreCourse(
        profile,
        courseNoMatch,
      );

      // دوره با تگ مطابق باید امتیاز بیشتری داشته باشد
      expect(scoreWithMatch).toBeGreaterThan(scoreNoMatch);
    });

    it('Skill Gap Match: matchedSkillTags درست پر می‌شود', () => {
      const profile = makeProfile({
        weakSkills: [
          { tag: 'حلقه‌های تکرار', correct: 1, total: 4, percentage: 25 },
          { tag: 'توابع', correct: 2, total: 4, percentage: 50 },
        ],
      });
      const course = makeCourse({ skillTags: ['حلقه‌های تکرار', 'کلاس‌ها'] });

      const { matchedSkillTags } = (service as any).scoreCourse(
        profile,
        course,
      );
      expect(matchedSkillTags).toContain('حلقه‌های تکرار');
      expect(matchedSkillTags).not.toContain('توابع'); // تگ دوم در دوره نیست
    });

    it('Level Progression: سطح یک بالاتر بهترین امتیاز را دارد', () => {
      // دانشجو میانگین سطح 1 (مقدماتی) → ایده‌آل سطح 2 (متوسط)
      const profile = makeProfile({ avgCompletedLevel: 1 });

      const courseIdealLevel = makeCourse({ levelName: 'متوسط' }); // سطح 2
      const courseSameLevel = makeCourse({ levelName: 'مقدماتی' }); // سطح 1
      const courseAdvanced = makeCourse({ levelName: 'پیشرفته' }); // سطح 3

      const { score: scoreIdeal } = (service as any).scoreCourse(
        profile,
        courseIdealLevel,
      );
      const { score: scoreSame } = (service as any).scoreCourse(
        profile,
        courseSameLevel,
      );
      const { score: scoreAdvanced } = (service as any).scoreCourse(
        profile,
        courseAdvanced,
      );

      // سطح ایده‌آل (2) باید بالاترین، سطح پیشرفته (3) کمتر از ایده‌آل باشد
      expect(scoreIdeal).toBeGreaterThanOrEqual(scoreSame);
      expect(scoreIdeal).toBeGreaterThanOrEqual(scoreAdvanced);
    });

    it('Course Quality: دوره با rating بالاتر امتیاز بیشتر دریافت می‌کند', () => {
      // پروفایل بدون مهارت ضعیف — فقط کیفیت دوره تأثیر دارد
      const profile = makeProfile({ weakSkills: [], favoriteCategoryIds: [] });

      const highRating = makeCourse({ averageRating: 5.0, skillTags: [] });
      const lowRating = makeCourse({ averageRating: 1.0, skillTags: [] });

      const { score: high } = (service as any).scoreCourse(profile, highRating);
      const { score: low } = (service as any).scoreCourse(profile, lowRating);

      expect(high).toBeGreaterThan(low);
    });

    it('Category Affinity: دوره هم‌دسته‌بندی امتیاز بالاتر از دوره با دسته دیگر دارد', () => {
      // دانشجو قبلاً در دسته‌بندی شماره 10 دوره گذرانده
      const profile = makeProfile({
        weakSkills: [],
        favoriteCategoryIds: [10],
      });

      const sameCategory = makeCourse({ categoryId: 10, skillTags: [] });
      const diffCategory = makeCourse({ categoryId: 99, skillTags: [] });

      const { score: scoreSame } = (service as any).scoreCourse(
        profile,
        sameCategory,
      );
      const { score: scoreDiff } = (service as any).scoreCourse(
        profile,
        diffCategory,
      );

      expect(scoreSame).toBeGreaterThan(scoreDiff);
    });

    it('دوره بدون SkillTag امتیاز صفر برای Skill Gap Match دریافت می‌کند', () => {
      const profile = makeProfile({
        weakSkills: [
          { tag: 'حلقه‌های تکرار', correct: 1, total: 4, percentage: 25 },
        ],
      });
      const courseNoTags = makeCourse({ skillTags: [] });

      const { matchedSkillTags } = (service as any).scoreCourse(
        profile,
        courseNoTags,
      );
      expect(matchedSkillTags).toHaveLength(0);
    });

    it('دانشجو بدون هیچ آزمونی (بدون مهارت ضعیف) — باز هم امتیاز معقول دریافت می‌کند', () => {
      const profile = makeProfile({
        weakSkills: [],
        avgCompletedLevel: null,
        favoriteCategoryIds: [],
      });
      const course = makeCourse();
      const { score } = (service as any).scoreCourse(profile, course);

      // امتیاز باید بین 0 و 100 باشد (نه خطا، نه null)
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('امتیاز نهایی همیشه در بازه [0, 100] باقی می‌ماند', () => {
      const profile = makeProfile();
      const course = makeCourse({ averageRating: 5.0 });
      const { score } = (service as any).scoreCourse(profile, course);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  // =========================================================================
  // getRecommendations — ownership check
  // =========================================================================
  describe('getRecommendations', () => {
    it('ForbiddenException برای دانشجویی که سعی می‌کند پیشنهادهای دیگری ببیند', async () => {
      await expect(
        service.getRecommendations(99, { id: 1, roleId: 1 }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('ادمین (roleId=3) می‌تواند پیشنهادهای هر دانشجو را ببیند', async () => {
      // کش موجود و معتبر
      mockPrisma.courseRecommendations.findMany.mockResolvedValue([
        {
          Id: 1,
          Course_Id: 10,
          Score: 75.5,
          Reason: 'علت آزمایشی',
          MatchedSkillTags: '["حلقه‌ها"]',
          Status: 'Active',
          GeneratedAt: new Date(),
          Courses: {
            Id: 10,
            Title: 'دوره آزمایشی',
            Thumbnail: null,
            ShortDescription: null,
            Price: 0,
            DiscountPrice: null,
            AverageRating: 4.5,
            Category: { Title: 'برنامه‌نویسی' },
            Level: { LevelName: 'متوسط' },
          },
        },
      ]);

      const result = await service.getRecommendations(99, { id: 1, roleId: 3 });
      expect(result).toHaveLength(1);
      expect(result[0].courseId).toBe(10);
      expect(result[0].matchedSkillTags).toEqual(['حلقه‌ها']);
    });
  });

  // =========================================================================
  // dismiss — ownership check
  // =========================================================================
  describe('dismiss', () => {
    it('NotFoundException وقتی رکورد وجود ندارد', async () => {
      mockPrisma.courseRecommendations.findUnique.mockResolvedValue(null);

      await expect(
        service.dismiss(999, { id: 1, roleId: 1 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('ForbiddenException وقتی دانشجوی دیگری سعی می‌کند dismiss کند', async () => {
      mockPrisma.courseRecommendations.findUnique.mockResolvedValue({
        Id: 1,
        Student_Id: 5, // مالک = 5
      });

      await expect(
        service.dismiss(1, { id: 99, roleId: 1 }), // کاربر = 99
      ).rejects.toThrow(ForbiddenException);
    });

    it('دانشجوی مالک می‌تواند رکورد خودش را dismiss کند', async () => {
      mockPrisma.courseRecommendations.findUnique.mockResolvedValue({
        Id: 1,
        Student_Id: 42,
      });
      mockPrisma.courseRecommendations.update.mockResolvedValue({});

      await expect(
        service.dismiss(1, { id: 42, roleId: 1 }),
      ).resolves.not.toThrow();

      expect(mockPrisma.courseRecommendations.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { Id: 1 },
          data: { Status: 'Dismissed' },
        }),
      );
    });
  });

  // =========================================================================
  // markAsEnrolled — به‌روزرسانی وضعیت به Enrolled
  // =========================================================================
  describe('markAsEnrolled', () => {
    it('وضعیت Active را به Enrolled تغییر می‌دهد', async () => {
      mockPrisma.courseRecommendations.updateMany.mockResolvedValue({ count: 1 });

      await service.markAsEnrolled(10, 20);

      expect(mockPrisma.courseRecommendations.updateMany).toHaveBeenCalledWith({
        where: {
          Student_Id: 10,
          Course_Id: 20,
          Status: 'Active',
        },
        data: { Status: 'Enrolled' },
      });
    });
  });

  // =========================================================================
  // getHistory — ownership check
  // =========================================================================
  describe('getHistory', () => {
    it('ForbiddenException برای دانشجویی که تاریخچه دیگری را می‌بیند', async () => {
      await expect(
        service.getHistory(99, { id: 1, roleId: 1 }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('آمار نرخ تبدیل درست محاسبه می‌شود', async () => {
      mockPrisma.courseRecommendations.findMany.mockResolvedValue([
        { Id: 1, Course_Id: 1, Score: 80, Reason: null, Status: 'Enrolled', GeneratedAt: new Date(), Courses: { Id: 1, Title: 'دوره ۱', Thumbnail: null } },
        { Id: 2, Course_Id: 2, Score: 60, Reason: null, Status: 'Active', GeneratedAt: new Date(), Courses: { Id: 2, Title: 'دوره ۲', Thumbnail: null } },
        { Id: 3, Course_Id: 3, Score: 40, Reason: null, Status: 'Dismissed', GeneratedAt: new Date(), Courses: { Id: 3, Title: 'دوره ۳', Thumbnail: null } },
      ]);

      const result = await service.getHistory(5, { id: 5, roleId: 1 });

      expect(result.history).toHaveLength(3);
      expect(result.stats.total).toBe(3);
      expect(result.stats.enrolled).toBe(1);
      expect(result.stats.active).toBe(1);
      expect(result.stats.dismissed).toBe(1);
      // conversionRate = round(1/3 * 100) = 33
      expect(result.stats.conversionRate).toBe(33);
    });
  });
});
