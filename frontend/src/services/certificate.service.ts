import api from "./api";

export interface Certificate {
  Id: number;
  Student_Id: number;
  Course_Id: number;
  Attempt_Id: number;
  CertificateCode: string;
  Score: number;
  MaxScore: number;
  IssuedAt: string;
  Courses: { Title: string };
}

export interface AnswerChoice {
  id: number;
  text: string;
  isCorrect: boolean;
}

export interface AnswerQuestion {
  questionId: number;
  questionText: string;
  displayOrder: number;
  score: number;
  skillTag: string | null;
  choices: AnswerChoice[];
  studentChoiceId: number | null;
  studentChoiceText: string;
  correctChoiceId: number | null;
  correctChoiceText: string;
  isCorrect: boolean;
}

export interface AnswerSheet {
  certificateId: number;
  certificateCode: string;
  courseTitle: string;
  quizTitle: string;
  score: number;
  maxScore: number;
  correctCount: number;
  totalQuestions: number;
  questions: AnswerQuestion[];
}

class CertificateService {
  async myCertificates(): Promise<Certificate[]> {
    const res = await api.get("/certificates/my");
    return res.data;
  }

  async getCertificate(id: number): Promise<Certificate> {
    const res = await api.get(`/certificates/${id}`);
    return res.data;
  }

  async getAnswers(id: number): Promise<AnswerSheet> {
    const res = await api.get(`/certificates/${id}/answers`);
    return res.data;
  }
}

export default new CertificateService();
