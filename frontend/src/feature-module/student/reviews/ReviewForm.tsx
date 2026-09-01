import React, { useState, useEffect } from "react";
import reviewsService, { Review } from "../../../services/reviews.service";
import { toast } from "react-toastify";

interface ReviewFormProps {
  courseId: number;
  courseTitle?: string;
  onSubmitSuccess?: () => void;
  onCancel?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  courseId,
  courseTitle,
  onSubmitSuccess,
  onCancel,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // دریافت نظر موجود (اگر وجود داشته باشد)
  useEffect(() => {
    loadMyReview();
  }, [courseId]);

  const loadMyReview = async () => {
    try {
      const existing = await reviewsService.getMyReview(courseId);
      if (existing) {
        setMyReview(existing);
        setRating(existing.rating);
        setComment(existing.comment || "");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("خطا در بارگذاری نظر:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating < 1 || rating > 5) {
      toast.error("رتینگ باید بین ۱ تا ۵ باشد");
      return;
    }

    if (!comment.trim()) {
      toast.error("لطفا یک نظر بنویسید");
      return;
    }

    setLoading(true);

    try {
      if (myReview && isEditing) {
        // ویرایش نظر موجود
        await reviewsService.updateReview(myReview.id, {
          Rating: rating,
          Comment: comment,
        });
        toast.success("نظر شما با موفقیت به‌روزرسانی شد");
      } else if (!myReview) {
        // ایجاد نظر جدید
        await reviewsService.createReview(courseId, {
          Rating: rating,
          Comment: comment,
        });
        toast.success("نظر شما با موفقیت ثبت شد");
      }

      // بارگذاری مجدد نظر
      await loadMyReview();
      setIsEditing(false);

      // فراخوانی callback
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error: any) {
      console.error("خطا در ثبت نظر:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "خطایی در ثبت نظر رخ داد";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!myReview) return;

    if (!window.confirm("آیا مطمئن هستید که می‌خواهید این نظر را حذف کنید؟")) {
      return;
    }

    setLoading(true);

    try {
      await reviewsService.deleteReview(myReview.id);
      toast.success("نظر شما با موفقیت حذف شد");
      setMyReview(null);
      setRating(5);
      setComment("");
      setIsEditing(false);

      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error: any) {
      console.error("خطا در حذف نظر:", error);
      toast.error("خطایی در حذف نظر رخ داد");
    } finally {
      setLoading(false);
    }
  };

  // نمایش نظر موجود
  if (myReview && !isEditing) {
    return (
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h6 className="mb-1">نظر شما برای {courseTitle || "این دوره"}</h6>
              <p className="text-muted small mb-0">
                {new Date(myReview.createdAt).toLocaleDateString("fa-IR")}
              </p>
            </div>
            <div className="rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <i
                  key={star}
                  className={`fa-solid fa-star ${
                    star <= myReview.rating ? "filled" : ""
                  }`}
                  style={{
                    color: star <= myReview.rating ? "#ffc107" : "#ddd",
                    marginRight: "2px",
                  }}
                />
              ))}
            </div>
          </div>

          <div className="mb-3">
            <p className="mb-0">{myReview.comment}</p>
          </div>

          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={() => setIsEditing(true)}
              disabled={loading}
            >
              <i className="isax isax-edit-2 me-1" />
              ویرایش
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              onClick={handleDelete}
              disabled={loading}
            >
              <i className="isax isax-trash me-1" />
              حذف
            </button>
          </div>
        </div>
      </div>
    );
  }

  // نمایش فرم ثبت یا ویرایش
  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-body">
        <h6 className="mb-3">
          {isEditing
            ? `ویرایش نظر برای ${courseTitle || "این دوره"}`
            : `ثبت نظر برای ${courseTitle || "این دوره"}`}
        </h6>

        <form onSubmit={handleSubmit}>
          {/* رتینگ */}
          <div className="mb-3">
            <label className="form-label">رتینگ</label>
            <div className="d-flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="btn btn-sm"
                  onClick={() => setRating(star)}
                  disabled={loading}
                  style={{
                    background: "none",
                    border: "none",
                    padding: "0",
                  }}
                >
                  <i
                    className={`fa-${star <= rating ? "solid" : "regular"} fa-star`}
                    style={{
                      fontSize: "1.5rem",
                      color: star <= rating ? "#ffc107" : "#ddd",
                      cursor: "pointer",
                    }}
                  />
                </button>
              ))}
            </div>
            <small className="text-muted d-block mt-1">{rating} از 5</small>
          </div>

          {/* متن نظر */}
          <div className="mb-3">
            <label className="form-label">نظر شما</label>
            <textarea
              className="form-control"
              rows={4}
              placeholder="نظر خود را درباره این دوره بنویسید..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={loading}
              maxLength={1000}
            />
            <small className="text-muted d-block mt-1">
              {comment.length}/1000
            </small>
          </div>

          {/* دکمه‌ها */}
          <div className="d-flex gap-2">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !comment.trim()}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  در حال ثبت...
                </>
              ) : (
                <>
                  <i className="isax isax-send-2 me-1" />
                  {isEditing ? "به‌روزرسانی" : "ثبت نظر"}
                </>
              )}
            </button>

            {(isEditing || onCancel) && (
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  if (isEditing) {
                    setIsEditing(false);
                    setRating(myReview?.rating || 5);
                    setComment(myReview?.comment || "");
                  } else if (onCancel) {
                    onCancel();
                  }
                }}
                disabled={loading}
              >
                انصراف
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewForm;
