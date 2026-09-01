import api from "./api";

// ============================================================================
// Types
// ============================================================================

export interface Review {
  id: number;
  userId: number;
  courseId: number;
  rating: number;
  comment?: string;
  isApproved: boolean;
  createdAt: string;
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  course?: {
    id: number;
    title: string;
    thumbnail?: string;
  };
}

export interface CourseReviewsResponse {
  reviews: Review[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    pages: number;
  };
}

export interface CreateReviewRequest {
  Rating: number;
  Comment?: string;
}

export interface UpdateReviewRequest {
  Rating?: number;
  Comment?: string;
}

// ============================================================================
// Service
// ============================================================================

class ReviewsService {
  /**
   * ایجاد نظر جدید برای یک دوره
   */
  async createReview(
    courseId: number,
    data: CreateReviewRequest
  ): Promise<Review> {
    const res = await api.post(`/reviews/courses/${courseId}`, data);
    return res.data;
  }

  /**
   * دریافت نظر شخصی برای یک دوره
   */
  async getMyReview(courseId: number): Promise<Review | null> {
    try {
      const res = await api.get(`/reviews/courses/${courseId}/my-review`);
      return res.data;
    } catch (error: any) {
      // اگر نظری نیست، 404 برمی‌گردد
      if (error.response?.status === 404 || error.response?.status === 400) {
        return null;
      }
      throw error;
    }
  }

  /**
   * ویرایش نظر
   */
  async updateReview(
    reviewId: number,
    data: UpdateReviewRequest
  ): Promise<Review> {
    const res = await api.put(`/reviews/${reviewId}`, data);
    return res.data;
  }

  /**
   * حذف نظر
   */
  async deleteReview(reviewId: number): Promise<void> {
    await api.delete(`/reviews/${reviewId}`);
  }

  /**
   * دریافت نظرات یک دوره
   */
  async getCourseReviews(
    courseId: number,
    page: number = 1,
    pageSize: number = 10
  ): Promise<CourseReviewsResponse> {
    const res = await api.get(
      `/reviews/courses/${courseId}?page=${page}&pageSize=${pageSize}`
    );
    return res.data;
  }

  /**
   * دریافت تمام نظرات شخصی
   */
  async getMyReviews(
    page: number = 1,
    pageSize: number = 10
  ): Promise<CourseReviewsResponse> {
    const res = await api.get(
      `/reviews/my-reviews?page=${page}&pageSize=${pageSize}`
    );
    return res.data;
  }
}

export default new ReviewsService();
