import React, { useState, useEffect } from "react";
import reviewsService, { Review } from "../../../services/reviews.service";
import { toast } from "react-toastify";

interface ReviewsListProps {
  courseId: number;
  maxReviews?: number;
  isEnrolled?: boolean;
}

const ReviewsList: React.FC<ReviewsListProps> = ({
  courseId,
  maxReviews = 5,
  isEnrolled = false,
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalReviews, setTotalReviews] = useState(0);
  const [averageRating, setAverageRating] = useState<number>(0);

  useEffect(() => {
    loadReviews();
  }, [courseId]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await reviewsService.getCourseReviews(
        courseId,
        1,
        maxReviews
      );
      setReviews(data.reviews);
      setTotalReviews(data.pagination.total);

      // محاسبهٔ میانگین رتینگ
      if (data.reviews.length > 0) {
        const avg =
          data.reviews.reduce((sum, review) => sum + review.rating, 0) /
          data.reviews.length;
        setAverageRating(Math.round(avg * 10) / 10);
      }
    } catch (error) {
      console.error("خطا در بارگذاری نظرات:", error);
      toast.error("خطایی در بارگذاری نظرات رخ داد");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card border-0 shadow-sm">
        <div className="card-body text-center py-4">
          <div className="spinner-border spinner-border-sm text-primary" />
          <p className="text-muted mt-2 small">در حال بارگذاری نظرات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body">
        {/* خلاصهٔ رتینگ */}
        {totalReviews > 0 && (
          <div className="mb-4 pb-3 border-bottom">
            <div className="d-flex align-items-center gap-3">
              <div className="text-center">
                <div className="h4 mb-1 fw-bold">{averageRating}</div>
                <div className="rating small mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <i
                      key={star}
                      className={`fa-solid fa-star ${
                        star <= Math.round(averageRating) ? "filled" : ""
                      }`}
                      style={{
                        color:
                          star <= Math.round(averageRating) ? "#ffc107" : "#ddd",
                        marginRight: "2px",
                      }}
                    />
                  ))}
                </div>
                <small className="text-muted">
                  {totalReviews} نظر
                </small>
              </div>
              <div className="flex-grow-1">
                {/* توزیع رتینگ‌ها */}
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = reviews.filter(
                    (r) => r.rating === star
                  ).length;
                  const percentage =
                    totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                  return (
                    <div key={star} className="d-flex align-items-center mb-2">
                      <small className="text-muted" style={{ width: "20px" }}>
                        {star}
                      </small>
                      <div
                        className="progress flex-grow-1 mx-2"
                        style={{ height: "6px" }}
                      >
                        <div
                          className="progress-bar bg-warning"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <small className="text-muted" style={{ width: "30px" }}>
                        {count}
                      </small>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* لیست نظرات */}
        {reviews.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted mb-0">هیچ نظری برای این دوره ثبت نشده‌است</p>
          </div>
        ) : (
          <div className="reviews-list">
            {reviews.map((review) => (
              <div key={review.id} className="mb-3 pb-3 border-bottom">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h6 className="mb-0">
                      {review.user?.firstName} {review.user?.lastName}
                    </h6>
                    <small className="text-muted">
                      {new Date(review.createdAt).toLocaleDateString("fa-IR")}
                    </small>
                  </div>
                  <div className="rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <i
                        key={star}
                        className={`fa-solid fa-star ${
                          star <= review.rating ? "filled" : ""
                        }`}
                        style={{
                          color: star <= review.rating ? "#ffc107" : "#ddd",
                          marginRight: "2px",
                          fontSize: "0.85rem",
                        }}
                      />
                    ))}
                  </div>
                </div>
                <p className="mb-0 small text-dark">{review.comment}</p>
              </div>
            ))}

            {!isEnrolled && totalReviews > maxReviews && (
              <div className="alert alert-info mt-3 mb-0 py-2">
                <i className="isax isax-info-circle me-2" />
                <small>
                  این دوره {totalReviews} نظر دارد. برای دیدن تمام نظرات و ثبت نظر خود، دوره را خریداری کنید.
                </small>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsList;
