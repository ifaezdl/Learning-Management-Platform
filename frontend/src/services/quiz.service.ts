import api from "./api";

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

export interface SaveQuizPayload {
  title?: string;
  startAt: string;
  endAt: string;
  durationMinutes: number;
  scorePerQuestion?: number;
  passScore: number;
  questionsToShow: number;
  showAllQuestions: boolean;
  allowPreviousQuestion: boolean;
  questions: {
    questionText: string;
    skillTag?: string;
    isAiGenerated?: boolean;
    score?: number;
    choices: { text: string; isCorrect: boolean }[];
  }[];
}
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
class QuizService {
  async getQuiz(courseId: number) {
    const res = await api.get(`/courses/${courseId}/quiz`);
    return res.data;
  }

  async generateQuestions(courseId: number, count: number) {
    const res = await api.post(`/courses/${courseId}/quiz/generate`, { count });
    return res.data as { questionText: string; skillTag: string; choices: QuizChoice[] }[];
  }

  async saveQuiz(courseId: number, payload: SaveQuizPayload) {
    const res = await api.post(`/courses/${courseId}/quiz`, payload);
    return res.data;
  }
  async myQuizzes() {
    const res = await api.get(`/quizzes/my`);
    return res.data as StudentQuizListItem[];
  }

  async startQuiz(courseId: number) {
    const res = await api.post(`/courses/${courseId}/quiz/start`);
    return res.data as StartQuizResponse;
  }

  async submitQuiz(
    attemptId: number,
    answers: { questionId: number; choiceId?: number }[],
  ) {
    const res = await api.post(`/quiz/attempts/${attemptId}/submit`, {
      answers,
    });
    return res.data as QuizResult;
  }

  async getResult(attemptId: number) {
    const res = await api.get(`/quiz/attempts/${attemptId}/result`);
    return res.data as QuizResult;
  }
}

export default new QuizService();
