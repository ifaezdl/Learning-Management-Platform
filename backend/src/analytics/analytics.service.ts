import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface SkillStat {
  tag: string;
  correct: number;
  total: number;
  percentage: number;
}

export interface SkillBreakdownResult {
  attemptId: number;
  skills: SkillStat[];
}

export interface QuizScorePoint {
  date: Date;
  percentage: number;
  courseTitle: string;
}

export interface CompletionPoint {
  date: Date;
  percentage: number;
  courseTitle: string;
}

export interface ProgressTrendResult {
  quizScores: QuizScorePoint[];
  courseCompletion: CompletionPoint[];
}

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  // -----------------------------------------------------------------------
  // Shared helper — group answers by SkillTag and compute percentages.
  // Input: array of { skillTag: string | null, isCorrect: boolean }
  // Returns sorted array, weakest first (ascending percentage).
  // -----------------------------------------------------------------------
  groupBySkill(
    answers: { skillTag: string | null | undefined; isCorrect: boolean }[],
  ): SkillStat[] {
    const map = new Map<string, { correct: number; total: number }>();

    for (const a of answers) {
      const tag =
        a.skillTag && a.skillTag.trim() ? a.skillTag.trim() : 'سایر';
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
        percentage: total === 0 ? 0 : Math.round((correct / total) * 100),
      });
    }

    // Weakest first
    result.sort((a, b) => a.percentage - b.percentage);
    return result;
  }

  // -----------------------------------------------------------------------
  // Endpoint 1 — Skill breakdown for a single attempt
  // -----------------------------------------------------------------------
  async getAttemptSkills(
    attemptId: number,
    currentUser: any,
  ): Promise<SkillBreakdownResult> {
    const attempt = await this.prisma.quizAttempts.findUnique({
      where: { Id: attemptId },
      include: {
        Quizzes: { select: { Course_Id: true, Courses: { select: { Teacher_Id: true } } } },
      },
    });
    if (!attempt) throw new NotFoundException('آزمون یافت نشد.');

    // Students can only see their own attempt; instructors/admins can see their course attempts
    const isOwner = attempt.Student_Id === currentUser.id;
    const isCourseInstructor =
      currentUser.roleId === 2 &&
      attempt.Quizzes.Courses.Teacher_Id === currentUser.id;
    const isAdmin = currentUser.roleId === 3;

    if (!isOwner && !isCourseInstructor && !isAdmin) {
      throw new ForbiddenException('دسترسی مجاز نیست.');
    }

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

    return { attemptId, skills: this.groupBySkill(mapped) };
  }

  // -----------------------------------------------------------------------
  // Endpoint 2 — Aggregated skill profile across all the student's attempts
  // Optional courseId filter
  // -----------------------------------------------------------------------
  async getMySkillProfile(
    studentId: number,
    courseId?: number,
  ): Promise<{ skills: SkillStat[] }> {
    // Find all submitted attempts for this student (optionally filtered by course)
    const attempts = await this.prisma.quizAttempts.findMany({
      where: {
        Student_Id: studentId,
        SubmittedAt: { not: null },
        ...(courseId
          ? { Quizzes: { Course_Id: courseId } }
          : {}),
      },
      select: { Id: true },
    });

    if (attempts.length === 0) return { skills: [] };

    const attemptIds = attempts.map((a) => a.Id);

    const answers = await this.prisma.quizAttemptAnswers.findMany({
      where: { Attempt_Id: { in: attemptIds } },
      include: {
        QuizQuestions: { select: { SkillTag: true } },
      },
    });

    const mapped = answers.map((a) => ({
      skillTag: a.QuizQuestions.SkillTag,
      isCorrect: !!a.IsCorrect,
    }));

    return { skills: this.groupBySkill(mapped) };
  }

  // -----------------------------------------------------------------------
  // Endpoint 3 — Progress trend over time
  // Returns quiz score series + course completion series
  // -----------------------------------------------------------------------
  async getProgressTrend(
    studentId: number,
    courseId?: number,
  ): Promise<ProgressTrendResult> {
    // -- Quiz score series --------------------------------------------------
    const attempts = await this.prisma.quizAttempts.findMany({
      where: {
        Student_Id: studentId,
        SubmittedAt: { not: null },
        ...(courseId
          ? { Quizzes: { Course_Id: courseId } }
          : {}),
      },
      orderBy: { SubmittedAt: 'asc' },
      include: { Quizzes: { include: { Courses: { select: { Title: true } } } } },
    });

    const quizScores: QuizScorePoint[] = attempts.map((a) => ({
      date: a.SubmittedAt!,
      percentage:
        a.MaxScore && Number(a.MaxScore) > 0
          ? Math.round((Number(a.Score) / Number(a.MaxScore)) * 100)
          : 0,
      courseTitle: a.Quizzes.Courses.Title,
    }));

    // -- Course completion series -------------------------------------------
    // For each course (optionally filtered), get total lessons and group
    // completed lessons by date to compute a running completion %.
    const enrollments = await this.prisma.enrollments.findMany({
      where: {
        Student_Id: studentId,
        ...(courseId ? { Course_Id: courseId } : {}),
      },
      select: { Course_Id: true },
    });

    const courseIds = enrollments.map((e) => e.Course_Id);
    const completionPoints: CompletionPoint[] = [];

    if (courseIds.length > 0) {
      // Total lessons per course (only published lessons)
      const lessonCounts = await this.prisma.lessons.groupBy({
        by: ['Course_Id'],
        where: { Course_Id: { in: courseIds }, IsPublished: true },
        _count: { Id: true },
      });
      const totalByC = new Map<number, number>(
        lessonCounts.map((l) => [l.Course_Id, l._count.Id]),
      );

      // All completed progress records for this student
      const progressRows = await this.prisma.courseProgress.findMany({
        where: {
          Student_Id: studentId,
          Course_Id: { in: courseIds },
          IsCompleted: true,
          CompletedAt: { not: null },
        },
        orderBy: { CompletedAt: 'asc' },
        include: { Courses: { select: { Title: true } } },
      });

      // Build rolling completion per course
      const completedCountByC = new Map<number, number>();
      for (const row of progressRows) {
        const cid = row.Course_Id;
        completedCountByC.set(cid, (completedCountByC.get(cid) ?? 0) + 1);
        const total = totalByC.get(cid) ?? 1;
        completionPoints.push({
          date: row.CompletedAt!,
          percentage: Math.min(
            100,
            Math.round((completedCountByC.get(cid)! / total) * 100),
          ),
          courseTitle: row.Courses.Title,
        });
      }

      // Sort ascending by date
      completionPoints.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
    }

    return { quizScores, courseCompletion: completionPoints };
  }

  // -----------------------------------------------------------------------
  // Endpoint 4 — Instructor: class-wide skill overview for a course
  // -----------------------------------------------------------------------
  async getCourseSkillsOverview(
    courseId: number,
    currentUser: any,
  ): Promise<{ courseId: number; skills: SkillStat[] }> {
    // Verify the course exists and the requestor is the owner or admin
    const course = await this.prisma.courses.findUnique({
      where: { Id: courseId },
      select: { Teacher_Id: true },
    });
    if (!course) throw new NotFoundException('دوره یافت نشد.');
    if (currentUser.roleId !== 3 && course.Teacher_Id !== currentUser.id) {
      throw new ForbiddenException('دسترسی مجاز نیست.');
    }

    // Get all quizzes for the course
    const quizzes = await this.prisma.quizzes.findMany({
      where: { Course_Id: courseId },
      select: { Id: true },
    });
    if (quizzes.length === 0) return { courseId, skills: [] };

    const quizIds = quizzes.map((q) => q.Id);

    // All submitted attempts for those quizzes
    const attempts = await this.prisma.quizAttempts.findMany({
      where: { Quiz_Id: { in: quizIds }, SubmittedAt: { not: null } },
      select: { Id: true },
    });
    if (attempts.length === 0) return { courseId, skills: [] };

    const attemptIds = attempts.map((a) => a.Id);

    const answers = await this.prisma.quizAttemptAnswers.findMany({
      where: { Attempt_Id: { in: attemptIds } },
      include: { QuizQuestions: { select: { SkillTag: true } } },
    });

    const mapped = answers.map((a) => ({
      skillTag: a.QuizQuestions.SkillTag,
      isCorrect: !!a.IsCorrect,
    }));

    return { courseId, skills: this.groupBySkill(mapped) };
  }

  // -----------------------------------------------------------------------
  // Endpoint 5 — Instructor: per-student skill breakdown for a course
  // Returns every enrolled student with their overall progress + skill stats
  // -----------------------------------------------------------------------
  async getCourseStudentAnalytics(
    courseId: number,
    currentUser: any,
  ): Promise<any[]> {
    // Ownership check
    const course = await this.prisma.courses.findUnique({
      where: { Id: courseId },
      select: { Teacher_Id: true },
    });
    if (!course) throw new NotFoundException('دوره یافت نشد.');
    if (currentUser.roleId !== 3 && course.Teacher_Id !== currentUser.id) {
      throw new ForbiddenException('دسترسی مجاز نیست.');
    }

    // All enrolled students
    const enrollments = await this.prisma.enrollments.findMany({
      where: { Course_Id: courseId },
      include: {
        Users: {
          select: {
            Id: true,
            FirstName: true,
            LastName: true,
            Email: true,
            Avatar: true,
          },
        },
      },
      orderBy: { EnrollmentDate: 'desc' },
    });

    if (enrollments.length === 0) return [];

    // Total published lessons for completion %
    const totalLessons = await this.prisma.lessons.count({
      where: { Course_Id: courseId, IsPublished: true },
    });

    // Lesson completion per student
    const progressGroups = await this.prisma.courseProgress.groupBy({
      by: ['Student_Id'],
      where: { Course_Id: courseId, IsCompleted: true },
      _count: { Lesson_Id: true },
    });
    const progressMap = new Map<number, number>(
      progressGroups.map((g) => [g.Student_Id, g._count.Lesson_Id]),
    );

    // Quizzes for the course
    const quizzes = await this.prisma.quizzes.findMany({
      where: { Course_Id: courseId },
      select: { Id: true },
    });
    const quizIds = quizzes.map((q) => q.Id);

    // All submitted attempts for these quizzes
    const attempts =
      quizIds.length > 0
        ? await this.prisma.quizAttempts.findMany({
            where: { Quiz_Id: { in: quizIds }, SubmittedAt: { not: null } },
            select: {
              Id: true,
              Student_Id: true,
              Score: true,
              MaxScore: true,
              IsPassed: true,
              SubmittedAt: true,
            },
          })
        : [];

    const attemptIds = attempts.map((a) => a.Id);

    // All answers for all attempts in this course
    const allAnswers =
      attemptIds.length > 0
        ? await this.prisma.quizAttemptAnswers.findMany({
            where: { Attempt_Id: { in: attemptIds } },
            include: {
              QuizAttempts: { select: { Student_Id: true } },
              QuizQuestions: { select: { SkillTag: true } },
            },
          })
        : [];

    // Index answers by studentId
    const answersByStudent = new Map<
      number,
      { skillTag: string | null; isCorrect: boolean }[]
    >();
    for (const a of allAnswers) {
      const sid = a.QuizAttempts.Student_Id;
      const list = answersByStudent.get(sid) ?? [];
      list.push({
        skillTag: a.QuizQuestions.SkillTag,
        isCorrect: !!a.IsCorrect,
      });
      answersByStudent.set(sid, list);
    }

    // Index attempts by studentId
    const attemptsByStudent = new Map<number, typeof attempts>();
    for (const a of attempts) {
      const list = attemptsByStudent.get(a.Student_Id) ?? [];
      list.push(a);
      attemptsByStudent.set(a.Student_Id, list);
    }

    // Certificates
    const certificates = await this.prisma.certificates.findMany({
      where: { Course_Id: courseId },
      select: { Student_Id: true, Score: true, MaxScore: true, IssuedAt: true },
    });
    const certMap = new Map(certificates.map((c) => [c.Student_Id, c]));

    return enrollments.map((enrollment) => {
      const sid = enrollment.Student_Id;

      const completedLessons = progressMap.get(sid) ?? 0;
      const progressPercent =
        totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0;

      const studentAttempts = attemptsByStudent.get(sid) ?? [];
      const hasAttempted = studentAttempts.length > 0;
      const totalScore = studentAttempts.reduce(
        (s, a) => s + Number(a.Score ?? 0),
        0,
      );
      const totalMaxScore = studentAttempts.reduce(
        (s, a) => s + Number(a.MaxScore ?? 0),
        0,
      );
      const quizScorePercent =
        hasAttempted && totalMaxScore > 0
          ? Math.round((totalScore / totalMaxScore) * 100)
          : null;
      const isPassed = hasAttempted
        ? studentAttempts.every((a) => a.IsPassed)
        : null;

      return {
        studentId: sid,
        firstName: enrollment.Users.FirstName,
        lastName: enrollment.Users.LastName,
        email: enrollment.Users.Email,
        avatar: enrollment.Users.Avatar,
        enrollmentDate: enrollment.EnrollmentDate,
        completedLessons,
        totalLessons,
        progressPercent,
        hasAttempted,
        quizScorePercent,
        isPassed,
        certificate: certMap.get(sid) ?? null,
        skillBreakdown: this.groupBySkill(answersByStudent.get(sid) ?? []),
      };
    });
  }
}
