import api from "./api";

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export interface SkillStat {
  tag: string;
  correct: number;
  total: number;
  percentage: number;
}

export interface AttemptSkillsResponse {
  attemptId: number;
  skills: SkillStat[];
}

export interface SkillProfileResponse {
  skills: SkillStat[];
}

export interface QuizScorePoint {
  date: string;
  percentage: number;
  courseTitle: string;
}

export interface CompletionPoint {
  date: string;
  percentage: number;
  courseTitle: string;
}

export interface ProgressTrendResponse {
  quizScores: QuizScorePoint[];
  courseCompletion: CompletionPoint[];
}

export interface CourseSkillsOverviewResponse {
  courseId: number;
  skills: SkillStat[];
}

export interface CourseStudentAnalytic {
  studentId: number;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  avatar: string | null;
  enrollmentDate: string | null;
  completedLessons: number;
  totalLessons: number;
  progressPercent: number;
  hasAttempted: boolean;
  quizScorePercent: number | null;
  isPassed: boolean | null;
  certificate: {
    Score: number;
    MaxScore: number;
    IssuedAt: string;
  } | null;
  skillBreakdown: SkillStat[];
}

// ---------------------------------------------------------------------------
// Service class
// ---------------------------------------------------------------------------

class AnalyticsService {
  /**
   * Endpoint 1 — skill breakdown for a single submitted attempt.
   * Accessible by the student who owns it, the course instructor, or admin.
   */
  async getAttemptSkills(attemptId: number): Promise<AttemptSkillsResponse> {
    const res = await api.get(`/analytics/attempts/${attemptId}/skills`);
    return res.data;
  }

  /**
   * Endpoint 2 — aggregated skill profile across all the student's attempts.
   * Pass courseId to filter to one course.
   */
  async getMySkillProfile(courseId?: number): Promise<SkillProfileResponse> {
    const params = courseId ? { courseId } : {};
    const res = await api.get("/analytics/students/me/skills", { params });
    return res.data;
  }

  /**
   * Endpoint 3 — quiz score trend + course completion trend over time.
   * Pass courseId to filter to one course.
   */
  async getProgressTrend(courseId?: number): Promise<ProgressTrendResponse> {
    const params = courseId ? { courseId } : {};
    const res = await api.get("/analytics/students/me/progress-trend", {
      params,
    });
    return res.data;
  }

  /**
   * Endpoint 4 — class-wide skill overview for a course (instructor / admin).
   */
  async getCourseSkillsOverview(
    courseId: number,
  ): Promise<CourseSkillsOverviewResponse> {
    const res = await api.get(`/analytics/courses/${courseId}/skills-overview`);
    return res.data;
  }

  /**
   * Endpoint 5 — per-student progress + skill breakdown for a course.
   * Instructor owner or admin only.
   */
  async getCourseStudentAnalytics(
    courseId: number,
  ): Promise<CourseStudentAnalytic[]> {
    const res = await api.get(`/analytics/courses/${courseId}/students`);
    return res.data;
  }
}

export default new AnalyticsService();
