import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../prisma/prisma.service';

// ---------------------------------------------------------------------------
// Minimal PrismaService mock — we only stub what AnalyticsService calls.
// Each test can override individual methods via jest.spyOn.
// ---------------------------------------------------------------------------
const mockPrisma = {
  quizAttempts: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
  quizAttemptAnswers: {
    findMany: jest.fn(),
  },
  quizzes: {
    findMany: jest.fn(),
  },
  courses: {
    findUnique: jest.fn(),
  },
  enrollments: {
    findMany: jest.fn(),
  },
  lessons: {
    groupBy: jest.fn(),
  },
  courseProgress: {
    findMany: jest.fn(),
  },
};

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  beforeEach(async () => {
    // Reset all mock calls between tests
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // =========================================================================
  // groupBySkill — pure function, no DB calls
  // =========================================================================
  describe('groupBySkill', () => {
    it('groups answers by skillTag and computes correct percentages', () => {
      const answers = [
        { skillTag: 'حلقه‌های تکرار', isCorrect: true },
        { skillTag: 'حلقه‌های تکرار', isCorrect: false },
        { skillTag: 'حلقه‌های تکرار', isCorrect: false },
        { skillTag: 'حلقه‌های تکرار', isCorrect: false },
        { skillTag: 'مدیریت حافظه', isCorrect: true },
        { skillTag: 'مدیریت حافظه', isCorrect: true },
        { skillTag: 'مدیریت حافظه', isCorrect: true },
        { skillTag: 'مدیریت حافظه', isCorrect: true },
      ];

      const result = service.groupBySkill(answers);

      expect(result).toHaveLength(2);

      // Sorted weakest first — 'حلقه‌های تکرار' has 25%, 'مدیریت حافظه' has 100%
      expect(result[0].tag).toBe('حلقه‌های تکرار');
      expect(result[0].correct).toBe(1);
      expect(result[0].total).toBe(4);
      expect(result[0].percentage).toBe(25);

      expect(result[1].tag).toBe('مدیریت حافظه');
      expect(result[1].correct).toBe(4);
      expect(result[1].total).toBe(4);
      expect(result[1].percentage).toBe(100);
    });

    it('falls back to "سایر" when skillTag is null or empty string', () => {
      const answers = [
        { skillTag: null, isCorrect: true },
        { skillTag: '', isCorrect: false },
        { skillTag: '  ', isCorrect: true },
      ];

      const result = service.groupBySkill(answers);

      expect(result).toHaveLength(1);
      expect(result[0].tag).toBe('سایر');
      expect(result[0].total).toBe(3);
      expect(result[0].correct).toBe(2);
      expect(result[0].percentage).toBe(67); // Math.round(2/3*100)
    });

    it('returns empty array for empty input', () => {
      expect(service.groupBySkill([])).toEqual([]);
    });

    it('returns 0% when all answers are wrong', () => {
      const answers = [
        { skillTag: 'توابع', isCorrect: false },
        { skillTag: 'توابع', isCorrect: false },
      ];
      const result = service.groupBySkill(answers);
      expect(result[0].percentage).toBe(0);
      expect(result[0].correct).toBe(0);
    });

    it('returns 100% when all answers are correct', () => {
      const answers = [
        { skillTag: 'شی‌گرایی', isCorrect: true },
        { skillTag: 'شی‌گرایی', isCorrect: true },
        { skillTag: 'شی‌گرایی', isCorrect: true },
      ];
      const result = service.groupBySkill(answers);
      expect(result[0].percentage).toBe(100);
    });

    it('sorts output ascending by percentage (weakest first)', () => {
      const answers = [
        { skillTag: 'A', isCorrect: true },  // 100%
        { skillTag: 'B', isCorrect: false }, // 0%
        { skillTag: 'C', isCorrect: true },  // 100%
        { skillTag: 'C', isCorrect: false }, // 50%
      ];
      const result = service.groupBySkill(answers);
      // Expected order: B (0%), C (50%), A (100%)
      expect(result[0].tag).toBe('B');
      expect(result[0].percentage).toBe(0);
      expect(result[1].tag).toBe('C');
      expect(result[1].percentage).toBe(50);
      expect(result[2].tag).toBe('A');
      expect(result[2].percentage).toBe(100);
    });

    it('handles mixed null and named tags independently', () => {
      const answers = [
        { skillTag: 'متغیرها', isCorrect: true },
        { skillTag: null, isCorrect: false },
        { skillTag: 'متغیرها', isCorrect: false },
        { skillTag: null, isCorrect: true },
      ];
      const result = service.groupBySkill(answers);
      expect(result).toHaveLength(2);

      const other = result.find((r) => r.tag === 'سایر');
      const vars = result.find((r) => r.tag === 'متغیرها');

      expect(other).toBeDefined();
      expect(other!.total).toBe(2);
      expect(other!.correct).toBe(1);
      expect(other!.percentage).toBe(50);

      expect(vars).toBeDefined();
      expect(vars!.total).toBe(2);
      expect(vars!.correct).toBe(1);
      expect(vars!.percentage).toBe(50);
    });
  });

  // =========================================================================
  // getAttemptSkills — DB-dependent, tests auth checks
  // =========================================================================
  describe('getAttemptSkills', () => {
    const baseAttempt = {
      Id: 1,
      Student_Id: 10,
      Quizzes: {
        Course_Id: 5,
        Courses: { Teacher_Id: 20 },
      },
    };

    it('throws NotFoundException when attempt does not exist', async () => {
      mockPrisma.quizAttempts.findUnique.mockResolvedValue(null);

      await expect(
        service.getAttemptSkills(999, { id: 10, roleId: 1 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when student tries to access another student attempt', async () => {
      mockPrisma.quizAttempts.findUnique.mockResolvedValue(baseAttempt);

      // user.id = 99 ≠ attempt.Student_Id = 10, role = 1 (student)
      await expect(
        service.getAttemptSkills(1, { id: 99, roleId: 1 }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('allows student to access their own attempt and returns grouped skills', async () => {
      mockPrisma.quizAttempts.findUnique.mockResolvedValue(baseAttempt);
      mockPrisma.quizAttemptAnswers.findMany.mockResolvedValue([
        {
          IsCorrect: true,
          QuizQuestions: { SkillTag: 'حلقه‌ها' },
        },
        {
          IsCorrect: false,
          QuizQuestions: { SkillTag: 'حلقه‌ها' },
        },
        {
          IsCorrect: true,
          QuizQuestions: { SkillTag: 'توابع' },
        },
      ]);

      const result = await service.getAttemptSkills(1, { id: 10, roleId: 1 });

      expect(result.attemptId).toBe(1);
      expect(result.skills).toHaveLength(2);

      // Weakest first: 'حلقه‌ها' = 50%, 'توابع' = 100%
      expect(result.skills[0].tag).toBe('حلقه‌ها');
      expect(result.skills[0].percentage).toBe(50);
      expect(result.skills[1].tag).toBe('توابع');
      expect(result.skills[1].percentage).toBe(100);
    });

    it('allows admin (role 3) to access any attempt', async () => {
      mockPrisma.quizAttempts.findUnique.mockResolvedValue(baseAttempt);
      mockPrisma.quizAttemptAnswers.findMany.mockResolvedValue([]);

      const result = await service.getAttemptSkills(1, { id: 999, roleId: 3 });
      expect(result.attemptId).toBe(1);
      expect(result.skills).toEqual([]);
    });

    it('allows course instructor (role 2, Teacher_Id match) to access attempt', async () => {
      mockPrisma.quizAttempts.findUnique.mockResolvedValue(baseAttempt);
      mockPrisma.quizAttemptAnswers.findMany.mockResolvedValue([]);

      // user.id = 20 = Teacher_Id, role = 2
      const result = await service.getAttemptSkills(1, { id: 20, roleId: 2 });
      expect(result.attemptId).toBe(1);
    });

    it('throws ForbiddenException for instructor who does not own the course', async () => {
      mockPrisma.quizAttempts.findUnique.mockResolvedValue(baseAttempt);

      // user.id = 30 ≠ Teacher_Id = 20, role = 2
      await expect(
        service.getAttemptSkills(1, { id: 30, roleId: 2 }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // =========================================================================
  // getMySkillProfile — returns empty when no submitted attempts
  // =========================================================================
  describe('getMySkillProfile', () => {
    it('returns empty skills when student has no submitted attempts', async () => {
      mockPrisma.quizAttempts.findMany.mockResolvedValue([]);

      const result = await service.getMySkillProfile(42);
      expect(result).toEqual({ skills: [] });
    });

    it('aggregates answers across multiple attempts', async () => {
      mockPrisma.quizAttempts.findMany.mockResolvedValue([
        { Id: 1 },
        { Id: 2 },
      ]);
      mockPrisma.quizAttemptAnswers.findMany.mockResolvedValue([
        { IsCorrect: true,  QuizQuestions: { SkillTag: 'مدیریت حافظه' } },
        { IsCorrect: false, QuizQuestions: { SkillTag: 'مدیریت حافظه' } },
        { IsCorrect: true,  QuizQuestions: { SkillTag: 'مدیریت حافظه' } },
        { IsCorrect: true,  QuizQuestions: { SkillTag: 'مدیریت حافظه' } },
      ]);

      const result = await service.getMySkillProfile(42);
      expect(result.skills).toHaveLength(1);
      expect(result.skills[0].tag).toBe('مدیریت حافظه');
      expect(result.skills[0].correct).toBe(3);
      expect(result.skills[0].total).toBe(4);
      expect(result.skills[0].percentage).toBe(75);
    });
  });

  // =========================================================================
  // getCourseSkillsOverview — instructor ownership check
  // =========================================================================
  describe('getCourseSkillsOverview', () => {
    it('throws NotFoundException when course does not exist', async () => {
      mockPrisma.courses.findUnique.mockResolvedValue(null);

      await expect(
        service.getCourseSkillsOverview(999, { id: 1, roleId: 2 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when instructor does not own the course', async () => {
      mockPrisma.courses.findUnique.mockResolvedValue({ Teacher_Id: 5 });

      await expect(
        service.getCourseSkillsOverview(1, { id: 99, roleId: 2 }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('allows admin to access any course overview', async () => {
      mockPrisma.courses.findUnique.mockResolvedValue({ Teacher_Id: 5 });
      mockPrisma.quizzes.findMany.mockResolvedValue([]);

      const result = await service.getCourseSkillsOverview(1, {
        id: 999,
        roleId: 3,
      });
      expect(result).toEqual({ courseId: 1, skills: [] });
    });

    it('returns empty skills when course has no quizzes', async () => {
      mockPrisma.courses.findUnique.mockResolvedValue({ Teacher_Id: 10 });
      mockPrisma.quizzes.findMany.mockResolvedValue([]);

      const result = await service.getCourseSkillsOverview(1, {
        id: 10,
        roleId: 2,
      });
      expect(result).toEqual({ courseId: 1, skills: [] });
    });

    it('aggregates skills across all students in the course', async () => {
      mockPrisma.courses.findUnique.mockResolvedValue({ Teacher_Id: 10 });
      mockPrisma.quizzes.findMany.mockResolvedValue([{ Id: 1 }, { Id: 2 }]);
      mockPrisma.quizAttempts.findMany.mockResolvedValue([
        { Id: 10 },
        { Id: 11 },
        { Id: 12 },
      ]);
      mockPrisma.quizAttemptAnswers.findMany.mockResolvedValue([
        { IsCorrect: false, QuizQuestions: { SkillTag: 'آرایه‌ها' } },
        { IsCorrect: false, QuizQuestions: { SkillTag: 'آرایه‌ها' } },
        { IsCorrect: true,  QuizQuestions: { SkillTag: 'آرایه‌ها' } },
        { IsCorrect: true,  QuizQuestions: { SkillTag: 'رشته‌ها' } },
        { IsCorrect: true,  QuizQuestions: { SkillTag: 'رشته‌ها' } },
      ]);

      const result = await service.getCourseSkillsOverview(1, {
        id: 10,
        roleId: 2,
      });

      expect(result.courseId).toBe(1);
      // Weakest first: 'آرایه‌ها' = 33%, 'رشته‌ها' = 100%
      expect(result.skills[0].tag).toBe('آرایه‌ها');
      expect(result.skills[0].percentage).toBe(33);
      expect(result.skills[1].tag).toBe('رشته‌ها');
      expect(result.skills[1].percentage).toBe(100);
    });
  });
});
