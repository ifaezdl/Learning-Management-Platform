import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import recommendationsService, {
  CourseRecommendation,
} from "../../../services/recommendations.service";
import { toast } from "react-toastify";

const RecommendedCourses: React.FC = () => {
  const [recommendations, setRecommendations] = useState<
    CourseRecommendation[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const data = await recommendationsService.getMyRecommendations();
      setRecommendations(data);
    } catch (error: any) {
      console.error("خطا در دریافت پیشنهادها:", error);
      // اگر خطایی رخ داد، لیست خالی نمایش می‌دهیم (نه پیام خطا)
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await recommendationsService.refreshRecommendations(5);
      toast.success("پیشنهادها با موفقیت به‌روزرسانی شدند.");
      await fetchRecommendations();
    } catch (error: any) {
      toast.error("خطا در به‌روزرسانی پیشنهادها.");
    } finally {
      setRefreshing(false);
    }
  };

  const handleDismiss = async (id: number) => {
    try {
      await recommendationsService.dismissRecommendation(id);
      toast.success("پیشنهاد حذف شد.");
      setRecommendations((prev) => prev.filter((r) => r.id !== id));
    } catch (error: any) {
      toast.error("خطا در حذف پیشنهاد.");
    }
  };

  if (loading) {
    return (
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4 text-center">
          <div className="spinner-border spinner-border-sm text-primary" />
          <span className="ms-2 small text-muted">
            در حال بارگذاری پیشنهادها...
          </span>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4 text-center">
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
            style={{
              width: 64,
              height: 64,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            <i
              className="isax isax-teacher text-white"
              style={{ fontSize: 32 }}
            />
          </div>
          <h5 className="mb-2">دوره‌ای برای پیشنهاد یافت نشد</h5>
          <p className="text-muted small mb-3">
            پس از شرکت در آزمون‌ها، دوره‌های مناسب به شما پیشنهاد می‌شوند.
          </p>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                در حال بررسی...
              </>
            ) : (
              <>
                <i className="isax isax-refresh me-2" />
                بررسی مجدد
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body p-4">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div className="d-flex align-items-center">
            <div
              className="d-flex align-items-center justify-content-center rounded-3 me-3"
              style={{
                width: 48,
                height: 48,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
            >
              <i
                className="isax isax-lamp-on text-white"
                style={{ fontSize: 22 }}
              />
            </div>
            <div>
              <h5 className="mb-1 fw-bold">دوره‌های پیشنهادی برای شما</h5>
              <p className="text-muted small mb-0">
                بر اساس عملکرد و مهارت‌های شما انتخاب شده‌اند
              </p>
            </div>
          </div>
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={handleRefresh}
            disabled={refreshing}
            title="به‌روزرسانی پیشنهادها"
          >
            <i
              className={`isax isax-refresh ${refreshing ? "fa-spin" : ""}`}
            />
          </button>
        </div>

        <div className="row g-3">
          {recommendations.map((rec) => (
            <div key={rec.id} className="col-lg-6 col-md-12">
              <div
                className="card border h-100"
                style={{
                  borderColor: "#e2e8f0 !important",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(0,0,0,0.1)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div className="row g-0">
                  <div className="col-4">
                    <img
                      src={
                        rec.course.thumbnail ||
                        "/assets/img/course/course-default.jpg"
                      }
                      alt={rec.course.title}
                      className="img-fluid h-100 w-100"
                      style={{
                        objectFit: "cover",
                        borderTopLeftRadius: "0.375rem",
                        borderBottomLeftRadius: "0.375rem",
                      }}
                    />
                  </div>
                  <div className="col-8">
                    <div className="card-body p-3 d-flex flex-column h-100">
                      <div className="d-flex align-items-start justify-content-between mb-2">
                        <span
                          className="badge px-2 py-1"
                          style={{
                            background:
                              "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            fontSize: "11px",
                          }}
                        >
                          {Math.round(rec.score)} امتیاز
                        </span>
                        <button
                          className="btn btn-link btn-sm text-muted p-0"
                          onClick={() => handleDismiss(rec.id)}
                          title="علاقه‌مند نیستم"
                          style={{ fontSize: "18px", lineHeight: 1 }}
                        >
                          <i className="isax isax-close-circle" />
                        </button>
                      </div>

                      <h6 className="mb-2 fw-bold" style={{ fontSize: "14px" }}>
                        <Link
                          to={`/course/course-details/${rec.courseId}`}
                          className="text-dark text-decoration-none"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {rec.course.title}
                        </Link>
                      </h6>

                      {rec.matchedSkillTags.length > 0 && (
                        <div className="mb-2">
                          <div
                            className="d-flex flex-wrap gap-1"
                            style={{ fontSize: "10px" }}
                          >
                            {rec.matchedSkillTags.slice(0, 3).map((tag, idx) => (
                              <span
                                key={idx}
                                className="badge bg-warning-subtle text-warning px-2 py-1"
                              >
                                <i
                                  className="isax isax-tag-2 me-1"
                                  style={{ fontSize: "9px" }}
                                />
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {rec.reason && (
                        <p
                          className="text-muted mb-2 flex-grow-1"
                          style={{
                            fontSize: "12px",
                            lineHeight: "1.4",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          <i
                            className="isax isax-info-circle me-1"
                            style={{ fontSize: "11px" }}
                          />
                          {rec.reason}
                        </p>
                      )}

                      <div className="d-flex align-items-center justify-content-between mt-auto pt-2 border-top">
                        <div className="d-flex align-items-center gap-2">
                          <span className="text-muted" style={{ fontSize: "11px" }}>
                            <i className="isax isax-star1 text-warning me-1" />
                            {rec.course.averageRating.toFixed(1)}
                          </span>
                          {rec.course.level && (
                            <span
                              className="text-muted"
                              style={{ fontSize: "11px" }}
                            >
                              •
                            </span>
                          )}
                          {rec.course.level && (
                            <span
                              className="text-muted"
                              style={{ fontSize: "11px" }}
                            >
                              {rec.course.level}
                            </span>
                          )}
                        </div>
                        <Link
                          to={`/course/course-details/${rec.courseId}`}
                          className="btn btn-primary btn-sm py-1 px-3"
                          style={{ fontSize: "12px" }}
                        >
                          مشاهده دوره
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecommendedCourses;
