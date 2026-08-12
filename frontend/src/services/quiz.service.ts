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
  questions: {
    questionText: string;
    isAiGenerated?: boolean;
    score?: number;
    choices: { text: string; isCorrect: boolean }[];
  }[];
}

class QuizService {
  async getQuiz(courseId: number) {
    const res = await api.get(`/courses/${courseId}/quiz`);
    return res.data;
  }

  async generateQuestions(courseId: number, count: number) {
    const res = await api.post(`/courses/${courseId}/quiz/generate`, { count });
    return res.data as { questionText: string; choices: QuizChoice[] }[];
  }

  async saveQuiz(courseId: number, payload: SaveQuizPayload) {
    const res = await api.post(`/courses/${courseId}/quiz`, payload);
    return res.data;
  }
}

export default new QuizService();
