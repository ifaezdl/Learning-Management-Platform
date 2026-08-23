import api from "./api";

// ─────────────────────────────────────────────────────────────────────────────
// Shared types
// ─────────────────────────────────────────────────────────────────────────────

export interface QuizChoice {
  Id?: number;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestionItem {
  clientId: string;
  Id?: number;
  questionText: string;
  skillTag?: string;
  choices: QuizChoice[];
  score?: number;
  isAiGenerated?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Instructor types
// ─────────────────────────────────────────────────────────────────────────────

/** خلاصه آزمون در لیست — برای تب «آزمون‌ها» در wizard ویرایش دوره */
export interface QuizSummary {
  Id: number;
  Course_Id: number;
  Title: string;
  StartAt: string | null;
  EndAt: string | null;
  DurationMinutes: number | null;
  PassScore: number;
  QuestionsToShow: number;
  ShowAllQuestions: boolean;
  AllowPreviousQuestion: boolean;
  ScorePerQuestion: number | null;
  IsPublished: boolean;
  _count: {
    QuizQuestions: number;
    QuizAttempts: number;
  };
}

/** جزئیات کامل آزمون + بانک سوالات — برای فرم ویرایش */
export interface QuizDetail extends QuizSummary {
  QuizQuestions: {
    Id: number;
    QuestionText: string;
    SkillTag: string | null;
    Score: number;
    Source: boolean;
    DisplayOrder: number;
    QuizChoices: {
      Id: number;
      ChoiceText: string;
      IsCorrect: boolean;
      DisplayOrder: number;
    }[];
  }[];
}

/** payload ایجاد آزمون جدید (بدون سوال) */
export interface CreateQuizPayload {
  title?: string;
  startAt: string;
  endAt: string;
  durationMinutes: number;
  passScore: number;
  questionsToShow: number;
  showAllQuestions?: boolean;
  allowPreviousQuestion?: boolean;
  scorePerQuestion?: number;
}

/** payload ویرایش آزمون (تنظیمات + بانک سوالات) */
export interface UpdateQuizPayload {
  title?: string;
  startAt?: string;
  endAt?: string;
  durationMinutes?: number;
  scorePerQuestion?: number;
  passScore?: number;
  questionsToShow?: number;
  showAllQuestions?: boolean;
  allowPreviousQuestion?: boolean;
  questions?: {
    questionText: string;
    skillTag?: string;
    isAiGenerated?: boolean;
    score?: number;
    choices: { text: string; isCorrect: boolean }[];
  }[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Student types (بدون تغییر)
// ─────────────────────────────────────────────────────────────────────────────

export interface StudentQuizListItem {
  quizId: number;
  courseId: number;
  courseTitle: string;
  title: string;
  startAt: string | null;
  endAt: string | null;
  durationMinutes: number | null;
  questionsToShow: number;
  bankSize: number;
  status: "upcoming" | "available" | "closed";
  attempted: boolean;
  attemptResult: { score: number; maxScore: number; isPassed: boolean } | null;
}

export interface AttemptQuestion {
  id: number;
  questionText: string;
  score: number;
  choices: { id: number; text: string }[];
}

export interface StartQuizResponse {
  attemptId: number;
  quizId: number;
  title: string;
  showAllQuestions: boolean;
  allowPreviousQuestion: boolean;
  passScore: number;
  deadlineAt: string;
  questions: AttemptQuestion[];
}

export interface QuizResult {
  attemptId: number;
  score: number;
  maxScore: number;
  isPassed: boolean;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────────────────────────

class QuizService {
  // ── Instructor API ──────────────────────────────────────────────────────────

  /** GET /courses/:courseId/quizzes — لیست همه آزمون‌های دوره */
  async listByCourse(courseId: number): Promise<QuizSummary[]> {
    const res = await api.get(`/courses/${courseId}/quizzes`);
    return res.data;
  }

  /** POST /courses/:courseId/quizzes — ایجاد آزمون جدید (بدون سوال) */
  async create(courseId: number, payload: CreateQuizPayload): Promise<QuizSummary> {
    const res = await api.post(`/courses/${courseId}/quizzes`, payload);
    return res.data;
  }

  /** GET /quizzes/:quizId — جزئیات کامل + بانک سوالات */
  async getById(quizId: number): Promise<QuizDetail> {
    const res = await api.get(`/quizzes/${quizId}`);
    return res.data;
  }

  /** PUT /quizzes/:quizId — ویرایش تنظیمات و/یا بانک سوالات */
  async update(quizId: number, payload: UpdateQuizPayload): Promise<QuizDetail> {
    const res = await api.put(`/quizzes/${quizId}`, payload);
    return res.data;
  }

  /** PUT /quizzes/:quizId/publish — toggle انتشار */
  async togglePublish(quizId: number): Promise<{ quizId: number; isPublished: boolean }> {
    const res = await api.put(`/quizzes/${quizId}/publish`);
    return res.data;
  }

  /** DELETE /quizzes/:quizId — حذف (با قانون حفاظت از داده) */
  async delete(quizId: number): Promise<{ message: string }> {
    const res = await api.delete(`/quizzes/${quizId}`);
    return res.data;
  }

  /** POST /quizzes/:quizId/generate — تولید سوال با AI (preview) */
  async generateQuestions(
    quizId: number,
    count: number,
  ): Promise<{ questionText: string; skillTag: string; choices: QuizChoice[] }[]> {
    const res = await api.post(`/quizzes/${quizId}/generate`, { count });
    return res.data;
  }

  // ── Student API ─────────────────────────────────────────────────────────────

  /** GET /quizzes/my — لیست آزمون‌های دانشجو */
  async myQuizzes(): Promise<StudentQuizListItem[]> {
    const res = await api.get(`/quizzes/my`);
    return res.data;
  }

  /** POST /quizzes/:quizId/start — شروع آزمون با quizId */
  async startQuiz(quizId: number): Promise<StartQuizResponse> {
    const res = await api.post(`/quizzes/${quizId}/start`);
    return res.data;
  }

  /** POST /quiz/attempts/:attemptId/submit */
  async submitQuiz(
    attemptId: number,
    answers: { questionId: number; choiceId?: number }[],
  ): Promise<QuizResult> {
    const res = await api.post(`/quiz/attempts/${attemptId}/submit`, { answers });
    return res.data;
  }

  /** GET /quiz/attempts/:attemptId/result */
  async getResult(attemptId: number): Promise<QuizResult> {
    const res = await api.get(`/quiz/attempts/${attemptId}/result`);
    return res.data;
  }
}

export default new QuizService();
