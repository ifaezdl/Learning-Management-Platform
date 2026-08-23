import api from "./api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CourseRecommendation {
  id: number;
  courseId: number;
  score: number;
  reason: string | null;
  matchedSkillTags: string[];
  status: string;
  generatedAt: string;
  course: {
    id: number;
    title: string;
    thumbnail: string | null;
    shortDescription: string | null;
    price: number;
    discountPrice: number | null;
    averageRating: number;
    category: string;
    level: string | null;
  };
}

export interface RecommendationHistory {
  id: number;
  courseId: number;
  courseTitle: string;
  courseThumbnail: string | null;
  score: number;
  reason: string | null;
  status: string;
  generatedAt: string;
}

export interface RecommendationStats {
  total: number;
  enrolled: number;
  dismissed: number;
  active: number;
  conversionRate: number;
}

export interface RecommendationHistoryResponse {
  history: RecommendationHistory[];
  stats: RecommendationStats;
}

// ---------------------------------------------------------------------------
// Service class
// ---------------------------------------------------------------------------

class RecommendationsService {
  /**
   * دریافت دوره‌های پیشنهادی فعال دانشجوی جاری
   */
  async getMyRecommendations(): Promise<CourseRecommendation[]> {
    const res = await api.get("/recommendations/students/me");
    return res.data;
  }

  /**
   * محاسبه مجدد پیشنهادها
   */
  async refreshRecommendations(topN: number = 5): Promise<void> {
    await api.post("/recommendations/refresh", { topN });
  }

  /**
   * علاقه‌مند نیستم — حذف یک پیشنهاد
   */
  async dismissRecommendation(recommendationId: number): Promise<void> {
    await api.post(`/recommendations/${recommendationId}/dismiss`);
  }

  /**
   * تاریخچه پیشنهادها + آمار نرخ تبدیل
   */
  async getHistory(studentId: number): Promise<RecommendationHistoryResponse> {
    const res = await api.get(`/recommendations/students/${studentId}/history`);
    return res.data;
  }
}

export default new RecommendationsService();
