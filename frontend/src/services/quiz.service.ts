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
  isAiGenerated?: boolean;
}

export interface SaveQuizPayload {
  title?: string;
  startAt: string;
  endAt: string;
  durationMinutes: number;
  scorePerQuestion: number;
  questionsToShow: number;
  questions: {
    questionText: string;
    isAiGenerated?: boolean;
    choices: { text: string; isCorrect: boolean }[];
  }[];
}

class QuizService {
  async getQuiz(courseId: number) {
    const res = await api.get(`/courses/${courseId}/quiz`);
    return res.data;
  }

  async generateQuestions(courseId: number, count: number) {
    debugger;
    const res = await api.post(`/courses/${courseId}/quiz/generate`, { count });
    return res.data as { questionText: string; choices: QuizChoice[] }[];
  }

  async saveQuiz(courseId: number, payload: SaveQuizPayload) {
    debugger;
    const res = await api.post(`/courses/${courseId}/quiz`, payload);
    return res.data;
  }
}

export default new QuizService();
