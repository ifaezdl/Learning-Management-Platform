import api from "./api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WeakSkillByCourse {
  courseId: number;
  courseTitle: string;
  weakSkills: {
    tag: string;
    percentage: number;
    correct: number;
    total: number;
  }[];
  hasAttemptedMainQuiz: boolean;
  allCourseSkills: string[];
}

export interface PracticeQuestion {
  id: number;
  questionText: string;
  skillTag: string;
  choices: { id: number; text: string }[];
  score: number;
}

export interface PracticeExamResult {
  id: number;
  courseId: number;
  courseTitle: string;
  score: number;
  maxScore: number;
  isPassed: boolean;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  percentage: number;
}

export interface PracticeExamResultItem {
  id: number;
  courseId: number;
  courseTitle: string;
  title: string;
  skillTag: string | null;
  score: number;
  maxScore: number;
  isPassed: boolean;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  percentage: number;
  completedAt: string;
}

export interface PracticeExamResultDetails {
  id: number;
  courseId: number;
  courseTitle: string;
  skillTag: string | null;
  score: number;
  maxScore: number;
  percentage: number;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  isPassed: boolean;
  completedAt: string;
  questions: Array<{
    questionId: number;
    questionText: string;
    skillTag: string;
    isCorrect: boolean;
    studentChoiceId: number | null;
    choices: Array<{
      id: number;
      text: string;
      isCorrect: boolean;
    }>;
  }>;
}

export interface ProgressComparison {
  hasComparison: boolean;
  message: string;
  previousResult?: {
    percentage: number;
    correctCount: number;
    totalQuestions: number;
    date: string;
  };
  latestResult?: {
    percentage: number;
    correctCount: number;
    totalQuestions: number;
    date: string;
  };
  improvement?: number;
  trend?: "صعودی" | "نزولی" | "ثابت";
}

// ---------------------------------------------------------------------------
// Service class
// ---------------------------------------------------------------------------

class PracticeExamsService {
  /**
   * دریافت مهارت‌های ضعیف دانشجو به تفکیک دوره
   * GET /practice-exams/weak-skills
   */
  async getWeakSkillsByCoursesForStudent(): Promise<WeakSkillByCourse[]> {
    const res = await api.get("/practice-exams/weak-skills");
    return res.data;
  }

  /**
   * ایجاد آزمون تمرینی برای مهارت‌های ضعیف
   * POST /practice-exams/courses/:courseId/generate
   *
   * @param courseId شناسه دوره
   * @param skillTag برچسب مهارت (اختیاری)
   * @param questionCount تعداد سوالات (پیش‌فرض: 5)
   */
  async generatePracticeExam(
    courseId: number,
    skillTag?: string,
    questionCount: number = 5,
  ): Promise<PracticeQuestion[]> {
    const params: Record<string, string | number> = {
      questionCount,
    };
    if (skillTag) params.skillTag = skillTag;

    const res = await api.post(
      `/practice-exams/courses/${courseId}/generate`,
      {},
      { params },
    );
    return res.data;
  }

  /**
   * ثبت نتیجه آزمون تمرینی
   * POST /practice-exams/courses/:courseId/submit
   */
  async submitPracticeExam(
    courseId: number,
    answers: { questionId: number; choiceId: number }[],
    skillTag?: string,
  ): Promise<PracticeExamResult> {
    const params: Record<string, string> = {};
    if (skillTag) params.skillTag = skillTag;

    const res = await api.post(
      `/practice-exams/courses/${courseId}/submit`,
      { answers },
      { params },
    );
    return res.data;
  }

  /**
   * دریافت لیست تمام نتایج تمرینی دانشجو
   * GET /practice-exams/results
   */
  async getPracticeExamResults(
    courseId?: number,
  ): Promise<PracticeExamResultItem[]> {
    const params: Record<string, number> = {};
    if (courseId) params.courseId = courseId;

    const res = await api.get("/practice-exams/results", { params });
    return res.data;
  }

  /**
   * دریافت تفاصیل یک نتیجه تمرینی
   * GET /practice-exams/results/:resultId
   */
  async getPracticeExamResultDetails(
    resultId: number,
  ): Promise<PracticeExamResultDetails> {
    const res = await api.get(`/practice-exams/results/${resultId}`);
    return res.data;
  }

  /**
   * مقایسه پیشرفت - درصد بهبود نسبت به آخرین آزمون
   * GET /practice-exams/courses/:courseId/progress-comparison
   */
  async comparePracticeExamProgress(
    courseId: number,
    skillTag?: string,
  ): Promise<ProgressComparison> {
    const params: Record<string, string> = {};
    if (skillTag) params.skillTag = skillTag;

    const res = await api.get(
      `/practice-exams/courses/${courseId}/progress-comparison`,
      { params },
    );
    return res.data;
  }
}

export default new PracticeExamsService();
