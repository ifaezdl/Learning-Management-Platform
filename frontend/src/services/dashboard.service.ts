import api from "./api";

export interface InProgressAttempt {
  attemptId: number;
  courseId: number;
  quizTitle: string;
  courseTitle: string;
  deadlineAt: string;
}

export interface DashboardSummary {
  enrolledCount: number;
  availableQuizzesCount: number;
  certificatesCount: number;
  inProgressAttempt: InProgressAttempt | null;
}

class DashboardService {
  async getSummary(): Promise<DashboardSummary> {
    const res = await api.get("/api/student/dashboard/summary");
    return res.data;
  }
}

export default new DashboardService();
