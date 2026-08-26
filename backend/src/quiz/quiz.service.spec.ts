import { Test, TestingModule } from '@nestjs/testing';
import {
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { QuizService } from './quiz.service';
import { PrismaService } from '../prisma/prisma.service';
import { RecommendationsService } from '../recommendations/recommendations.service';

// ---------------------------------------------------------------------------
// Mock ها — Prisma و RecommendationsService کاملاً جعلی هستند
// ---------------------------------------------------------------------------

/** یک دوره نمونه که به Teacher_Id=10 تعلق دارد */
const mockCourse = {
  Id: 1,
  Title: 'دوره نمونه',
  Teacher_Id: 10,
  Category: { Title: 'برنامه‌نویسی' },
  Level: { LevelName: 'مبتدی' },
  ShortDescription: 'توضیح کوتاه',
  Description: 'توضیح کامل',
  CourseLearningOutcomes: [],
  CoursePrequisties: [],
  CourseSections: [],
};

/** یک آزمون نمونه متعلق به دوره بالا */
const mockQuiz = {
  Id: 100,
  Course_Id: 1,
  Title: 'آزمون هفته اول',
  StartAt: new Date('2026-09-01T09:00:00.000Z'),
  EndAt: new Date('2026-09-07T23:59:00.000Z'),
  DurationMinutes: 30,
  PassScore: 10,
  QuestionsToShow: 5,
  ShowAllQuestions: false,
  AllowPreviousQuestion: true,
  IsPublished: false,
  ScorePerQuestion: 1,
  Courses: mockCourse,
};

const mockPrisma = {
  courses: {
    findUnique: jest.fn(),
  },
  quizzes: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  quizQuestions: {
    findMany: jest.fn(),
    create: jest.fn(),
    deleteMany: jest.fn(),
  },
  quizChoices: {
    createMany: jest.fn(),
    deleteMany: jest.fn(),
  },
  quizAttempts: {
    count: jest.fn(),
  },
  enrollments: {
    findFirst: jest.fn(),
  },
  // $transaction — callback را مستقیم اجرا می‌کند
  $transaction: jest.fn((callback) =>
    typeof callback === 'function' ? callback(mockPrisma) : Promise.resolve(callback),
  ),
};

const mockRecommendationsService = {
  refresh: jest.fn().mockResolvedValue(undefined),
};

// ---------------------------------------------------------------------------
// Users نمونه
// ---------------------------------------------------------------------------
const ownerUser = { id: 10, roleId: 2 };   // مدرس مالک دوره
const otherUser = { id: 99, roleId: 2 };   // مدرس غیرمالک
const adminUser = { id: 1,  roleId: 3 };   // ادمین

// ---------------------------------------------------------------------------
// Test Suite
// ---------------------------------------------------------------------------
describe('QuizService', () => {
  let service: QuizService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RecommendationsService, useValue: mockRecommendationsService },
      ],
    }).compile();

    service = module.get<QuizService>(QuizService);
  });

  // =========================================================================
  // createQuiz
  // =========================================================================
  describe('createQuiz', () => {
    const dto = {
      title: 'آزمون هفته اول',
      startAt: '2026-09-01T09:00:00.000Z',
      endAt: '2026-09-07T23:59:00.000Z',
      durationMinutes: 30,
      passScore: 10,
      questionsToShow: 5,
    };

    it('مدرس مالک می‌تواند آزمون جدید بسازد', async () => {
      mockPrisma.courses.findUnique.mockResolvedValue(mockCourse);
      mockPrisma.quizzes.create.mockResolvedValue({ ...mockQuiz, Id: 101 });

      const result = await service.createQuiz(1, ownerUser, dto as any);

      expect(mockPrisma.quizzes.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            Course_Id: 1,
            Title: 'آزمون هفته اول',
            IsPublished: false,
          }),
        }),
      );
      expect(result.Id).toBe(101);
    });

    it('مدرس غیرمالک ForbiddenException دریافت می‌کند', async () => {
      mockPrisma.courses.findUnique.mockResolvedValue(mockCourse); // Teacher_Id=10, user.id=99

      await expect(service.createQuiz(1, otherUser, dto as any)).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockPrisma.quizzes.create).not.toHaveBeenCalled();
    });

    it('ادمین می‌تواند برای هر دوره‌ای آزمون بسازد', async () => {
      mockPrisma.courses.findUnique.mockResolvedValue(mockCourse);
      mockPrisma.quizzes.create.mockResolvedValue({ ...mockQuiz, Id: 102 });

      await expect(service.createQuiz(1, adminUser, dto as any)).resolves.not.toThrow();
      expect(mockPrisma.quizzes.create).toHaveBeenCalled();
    });

    it('دوره‌ای که وجود ندارد NotFoundException می‌دهد', async () => {
      mockPrisma.courses.findUnique.mockResolvedValue(null);

      await expect(service.createQuiz(999, ownerUser, dto as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // =========================================================================
  // listQuizzesByCourse
  // =========================================================================
  describe('listQuizzesByCourse', () => {
    it('لیست چند آزمون با شمارش صحیح سوال و شرکت‌کننده را برمی‌گرداند', async () => {
      mockPrisma.courses.findUnique.mockResolvedValue(mockCourse);
      mockPrisma.quizzes.findMany.mockResolvedValue([
        {
          ...mockQuiz,
          Id: 100,
          Title: 'آزمون هفته اول',
          _count: { QuizQuestions: 4, QuizAttempts: 12 },
        },
        {
          ...mockQuiz,
          Id: 101,
          Title: 'آزمون هفته دوم',
          _count: { QuizQuestions: 5, QuizAttempts: 0 },
        },
      ]);

      const result = await service.listQuizzesByCourse(1, ownerUser);

      expect(result).toHaveLength(2);
      expect(result[0]._count.QuizQuestions).toBe(4);
      expect(result[0]._count.QuizAttempts).toBe(12);
      expect(result[1]._count.QuizQuestions).toBe(5);
      expect(result[1]._count.QuizAttempts).toBe(0);
      expect(mockPrisma.quizzes.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { Course_Id: 1 },
        }),
      );
    });

    it('مدرس غیرمالک ForbiddenException دریافت می‌کند', async () => {
      mockPrisma.courses.findUnique.mockResolvedValue(mockCourse);

      await expect(service.listQuizzesByCourse(1, otherUser)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  // =========================================================================
  // updateQuiz
  // =========================================================================
  describe('updateQuiz', () => {
    const questions = [
      {
        questionText: 'سوال اول',
        skillTag: 'متغیرها',
        score: 1,
        choices: [
          { text: 'الف', isCorrect: true },
          { text: 'ب', isCorrect: false },
          { text: 'ج', isCorrect: false },
          { text: 'د', isCorrect: false },
        ],
      },
    ];

    beforeEach(() => {
      mockPrisma.quizzes.findUnique.mockResolvedValue(mockQuiz);
      mockPrisma.quizQuestions.findMany.mockResolvedValue([{ Id: 1 }, { Id: 2 }]);
      mockPrisma.quizChoices.deleteMany.mockResolvedValue({ count: 2 });
      mockPrisma.quizQuestions.deleteMany.mockResolvedValue({ count: 2 });
      mockPrisma.quizQuestions.create.mockResolvedValue({ Id: 10 });
      mockPrisma.quizChoices.createMany.mockResolvedValue({ count: 4 });
      mockPrisma.quizzes.update.mockResolvedValue({ ...mockQuiz, Title: 'آزمون ویرایش‌شده' });
      mockPrisma.quizzes.findUnique
        .mockResolvedValueOnce(mockQuiz)             // verifyQuizOwnership
        .mockResolvedValueOnce({ ...mockQuiz,        // return value at end of tx
            QuizQuestions: [] });
    });

    it('بانک سوالات همین آزمون بازنویسی می‌شود بدون تأثیر روی آزمون‌های دیگر', async () => {
      const result = await service.updateQuiz(100, ownerUser, {
        title: 'آزمون ویرایش‌شده',
        passScore: 1,
        questionsToShow: 1,
        questions,
      } as any);

      // اطمینان از اینکه فقط QuizQuestions همین آزمون حذف شد
      expect(mockPrisma.quizQuestions.deleteMany).toHaveBeenCalledWith({
        where: { Id: { in: [1, 2] } },
      });
      // سوال جدید با Quiz_Id همین آزمون ساخته شد
      expect(mockPrisma.quizQuestions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ Quiz_Id: 100 }),
        }),
      );
    });

    it('مدرس غیرمالک ForbiddenException دریافت می‌کند', async () => {
      mockPrisma.quizzes.findUnique.mockResolvedValue(mockQuiz); // Teacher_Id=10, user.id=99

      await expect(
        service.updateQuiz(100, otherUser, { title: 'تست' } as any),
      ).rejects.toThrow(ForbiddenException);
    });

    it('اگر questionsToShow از تعداد سوالات بیشتر باشد BadRequestException می‌دهد', async () => {
      await expect(
        service.updateQuiz(100, ownerUser, {
          questionsToShow: 99,
          questions,  // فقط ۱ سوال
        } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // =========================================================================
  // deleteQuiz
  // =========================================================================
  describe('deleteQuiz', () => {
    it('آزمون بدون attempt کاملاً حذف می‌شود', async () => {
      mockPrisma.quizzes.findUnique.mockResolvedValue(mockQuiz);
      mockPrisma.quizAttempts.count.mockResolvedValue(0);
      mockPrisma.quizzes.delete.mockResolvedValue(mockQuiz);

      const result = await service.deleteQuiz(100, ownerUser);

      expect(mockPrisma.quizzes.delete).toHaveBeenCalledWith({ where: { Id: 100 } });
      expect(result).toEqual({ message: 'آزمون با موفقیت حذف شد.' });
    });

    it('آزمون دارای attempt حذف نمی‌شود و BadRequestException با پیام مناسب می‌دهد', async () => {
      mockPrisma.quizzes.findUnique.mockResolvedValue(mockQuiz);
      mockPrisma.quizAttempts.count.mockResolvedValue(5);
      mockPrisma.quizzes.update.mockResolvedValue({ ...mockQuiz, IsPublished: false });

      await expect(service.deleteQuiz(100, ownerUser)).rejects.toThrow(
        BadRequestException,
      );

      // باید پیام فارسی مشخص داشته باشد
      await service.deleteQuiz(100, ownerUser).catch((err) => {
        expect(err.message).toContain('شرکت‌کننده');
      });
    });

    it('آزمون دارای attempt به‌صورت نرم غیرفعال می‌شود (IsPublished=false)', async () => {
      mockPrisma.quizzes.findUnique.mockResolvedValue({ ...mockQuiz, IsPublished: true });
      mockPrisma.quizAttempts.count.mockResolvedValue(3);
      mockPrisma.quizzes.update.mockResolvedValue({ ...mockQuiz, IsPublished: false });

      try {
        await service.deleteQuiz(100, ownerUser);
      } catch {
        // خطای 400 انتظار داریم
      }

      // باید IsPublished=false روی همین آزمون ست شود
      expect(mockPrisma.quizzes.update).toHaveBeenCalledWith({
        where: { Id: 100 },
        data: { IsPublished: false },
      });
      // حذف قطعی نباید انجام شود
      expect(mockPrisma.quizzes.delete).not.toHaveBeenCalled();
    });

    it('مدرس غیرمالک ForbiddenException دریافت می‌کند', async () => {
      mockPrisma.quizzes.findUnique.mockResolvedValue(mockQuiz);

      await expect(service.deleteQuiz(100, otherUser)).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockPrisma.quizAttempts.count).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // publishQuiz
  // =========================================================================
  describe('publishQuiz', () => {
    it('آزمون غیرمنتشر را منتشر می‌کند (false → true)', async () => {
      mockPrisma.quizzes.findUnique.mockResolvedValue({ ...mockQuiz, IsPublished: false });
      mockPrisma.quizzes.update.mockResolvedValue({ Id: 100, IsPublished: true });

      const result = await service.publishQuiz(100, ownerUser);

      expect(mockPrisma.quizzes.update).toHaveBeenCalledWith({
        where: { Id: 100 },
        data: { IsPublished: true },
      });
      expect(result).toEqual({ quizId: 100, isPublished: true });
    });

    it('آزمون منتشر را رفع انتشار می‌کند (true → false)', async () => {
      mockPrisma.quizzes.findUnique.mockResolvedValue({ ...mockQuiz, IsPublished: true });
      mockPrisma.quizzes.update.mockResolvedValue({ Id: 100, IsPublished: false });

      const result = await service.publishQuiz(100, ownerUser);

      expect(mockPrisma.quizzes.update).toHaveBeenCalledWith({
        where: { Id: 100 },
        data: { IsPublished: false },
      });
      expect(result.isPublished).toBe(false);
    });

    it('مدرس غیرمالک ForbiddenException دریافت می‌کند', async () => {
      mockPrisma.quizzes.findUnique.mockResolvedValue(mockQuiz);

      await expect(service.publishQuiz(100, otherUser)).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockPrisma.quizzes.update).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // Ownership — تمام متدهای مدرس برای کاربر غیرمالک ForbiddenException می‌دهند
  // =========================================================================
  describe('Ownership enforcement (non-owner instructor)', () => {
    const dto = {
      title: 'x',
      startAt: '2026-09-01T09:00:00.000Z',
      endAt: '2026-09-07T23:59:00.000Z',
      durationMinutes: 30,
      passScore: 1,
      questionsToShow: 1,
    };

    beforeEach(() => {
      mockPrisma.courses.findUnique.mockResolvedValue(mockCourse);
      mockPrisma.quizzes.findUnique.mockResolvedValue(mockQuiz);
    });

    it('createQuiz → ForbiddenException', async () => {
      await expect(service.createQuiz(1, otherUser, dto as any)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('listQuizzesByCourse → ForbiddenException', async () => {
      await expect(service.listQuizzesByCourse(1, otherUser)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('getQuizById → ForbiddenException', async () => {
      await expect(service.getQuizById(100, otherUser)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('updateQuiz → ForbiddenException', async () => {
      await expect(service.updateQuiz(100, otherUser, {} as any)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('deleteQuiz → ForbiddenException', async () => {
      await expect(service.deleteQuiz(100, otherUser)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('publishQuiz → ForbiddenException', async () => {
      await expect(service.publishQuiz(100, otherUser)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  // =========================================================================
  // Admin — به همه دوره‌ها دسترسی دارد
  // =========================================================================
  describe('Admin access (roleId=3)', () => {
    it('ادمین می‌تواند آزمون دوره دیگران را ببیند', async () => {
      mockPrisma.quizzes.findUnique.mockResolvedValue({
        ...mockQuiz,
        QuizQuestions: [],
        _count: { QuizAttempts: 0 },
      });

      await expect(service.getQuizById(100, adminUser)).resolves.not.toThrow();
    });

    it('ادمین می‌تواند آزمون دوره دیگران را حذف کند', async () => {
      mockPrisma.quizzes.findUnique.mockResolvedValue(mockQuiz);
      mockPrisma.quizAttempts.count.mockResolvedValue(0);
      mockPrisma.quizzes.delete.mockResolvedValue(mockQuiz);

      await expect(service.deleteQuiz(100, adminUser)).resolves.toEqual({
        message: 'آزمون با موفقیت حذف شد.',
      });
    });
  });
});
