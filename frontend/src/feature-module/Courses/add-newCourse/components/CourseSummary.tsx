import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import courseService, {
  Course,
  Section,
} from "../../../../services/course.service";
import quizService from "../../../../services/quiz.service";

interface CourseSummaryProps {
  courseId: number;
  onPublished: () => void;
}

interface QuizSummary {
  Id: number;
  Title: string;
  StartAt: string | null;
  EndAt: string | null;
  DurationMinutes: number | null;
  PassScore: number;
  QuestionsToShow: number;
  QuizQuestions: { Id: number; Score: number }[];
}

const CourseSummary: React.FC<CourseSummaryProps> = ({
  courseId,
  onPublished,
}) => {
  const [course, setCourse] = useState<Course | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [quiz, setQuiz] = useState<QuizSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [courseData, sectionsData, quizData] = await Promise.all([
        courseService.getCourse(courseId),
        courseService.getSections(courseId),
        quizService.getQuiz(courseId).catch(() => null),
      ]);
      setCourse(courseData);
      setSections(sectionsData);
      setQuiz(quizData);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "بارگذاری اطلاعات دوره با خطا مواجه شد.";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalLessons = sections.reduce(
    (sum, s) => sum + (s.Lessons?.length || 0),
    0,
  );

  const totalFiles = sections.reduce(
    (sum, s) =>
      sum +
      (s.Lessons?.reduce((lSum, l) => lSum + (l.LessonFiles?.length || 0), 0) ||
        0),
    0,
  );

  const totalQuizScore =
    quiz?.QuizQuestions?.reduce((sum, q) => sum + Number(q.Score || 1), 0) || 0;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    const datePart = d.toLocaleDateString("fa-IR");
    const timePart = d.toLocaleTimeString("fa-IR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${datePart} - ${timePart}`;
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      await courseService.publishCourse(courseId);
      toast.success("دوره با موفقیت منتشر شد.");
      onPublished();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || "انتشار دوره با خطا مواجه شد.";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5">
        <div className="spinner-border text-primary mb-3" role="status" />
        <p className="text-muted mb-0">در حال بارگذاری اطلاعات دوره...</p>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="card border-0 shadow-sm">
      {/* Header */}
      <div
        className="card-header border-0 py-4"
        style={{
          background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
          borderRadius: "0.5rem 0.5rem 0 0",
        }}
      >
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <i className="fas fa-clipboard-list text-white fs-5" />
            <h5 className="mb-0 text-white">خلاصه دوره</h5>
          </div>
          {course.IsPublished ? (
            <span className="badge bg-white text-success px-3 py-2 rounded-pill">
              <i className="fas fa-check-circle me-1" /> منتشر شده
            </span>
          ) : (
            <span className="badge bg-white text-primary px-3 py-2 rounded-pill">
              <i className="fas fa-pen me-1" /> پیش‌نویس
            </span>
          )}
        </div>
      </div>

      <div className="card-body p-4">
        {/* Info cards */}
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <div className="bg-light rounded-3 p-3 h-100">
              <h6
                className="text-muted text-uppercase mb-3"
                style={{ fontSize: 12, letterSpacing: 0.5 }}
              >
                اطلاعات کلی
              </h6>
              <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                <span className="text-muted small">عنوان</span>
                <strong className="text-end">{course.Title}</strong>
              </div>
              <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                <span className="text-muted small">دسته‌بندی</span>
                <span>{course.Category?.Title || "-"}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center py-2">
                <span className="text-muted small">سطح</span>
                <span>{course.Level?.LevelName || "تعیین نشده"}</span>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="bg-light rounded-3 p-3 h-100">
              <h6
                className="text-muted text-uppercase mb-3"
                style={{ fontSize: 12, letterSpacing: 0.5 }}
              >
                قیمت‌گذاری
              </h6>
              <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                <span className="text-muted small">قیمت</span>
                <strong className="text-primary">
                  {Number(course.Price).toLocaleString("fa-IR")} ریال
                </strong>
              </div>
              <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                <span className="text-muted small">قیمت با تخفیف</span>
                <span>
                  {course.DiscountPrice != null
                    ? `${course.DiscountPrice.toLocaleString("fa-IR")} ریال`
                    : "تعیین نشده"}
                </span>
              </div>
              <div className="d-flex justify-content-between align-items-center py-2">
                <span className="text-muted small">وضعیت</span>
                {course.IsPublished ? (
                  <span className="badge bg-success-subtle text-success">
                    منتشر شده
                  </span>
                ) : (
                  <span className="badge bg-warning-subtle text-warning">
                    پیش‌نویس
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="d-flex align-items-center gap-3 border rounded-3 p-3 h-100">
              <div
                className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                style={{
                  width: 48,
                  height: 48,
                  backgroundColor: "#EEF2FF",
                  color: "#4f46e5",
                }}
              >
                <i className="fas fa-layer-group" />
              </div>
              <div>
                <h4 className="mb-0">{sections.length}</h4>
                <small className="text-muted">سرفصل‌ها</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="d-flex align-items-center gap-3 border rounded-3 p-3 h-100">
              <div
                className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                style={{
                  width: 48,
                  height: 48,
                  backgroundColor: "#ECFDF5",
                  color: "#10b981",
                }}
              >
                <i className="fas fa-play-circle" />
              </div>
              <div>
                <h4 className="mb-0">{totalLessons}</h4>
                <small className="text-muted">دروس</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="d-flex align-items-center gap-3 border rounded-3 p-3 h-100">
              <div
                className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                style={{
                  width: 48,
                  height: 48,
                  backgroundColor: "#FFF7ED",
                  color: "#f97316",
                }}
              >
                <i className="fas fa-paperclip" />
              </div>
              <div>
                <h4 className="mb-0">{totalFiles}</h4>
                <small className="text-muted">فایل‌ها</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="d-flex align-items-center gap-3 border rounded-3 p-3 h-100">
              <div
                className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                style={{
                  width: 48,
                  height: 48,
                  backgroundColor: "#FEF2F2",
                  color: "#ef4444",
                }}
              >
                <i className="fas fa-question-circle" />
              </div>
              <div>
                <h4 className="mb-0">{quiz?.QuizQuestions?.length || 0}</h4>
                <small className="text-muted">سوالات آزمون</small>
              </div>
            </div>
          </div>
        </div>

        {/* Quiz detail */}
        <div className="bg-light rounded-3 p-3 mb-4">
          <h6
            className="text-muted text-uppercase mb-3"
            style={{ fontSize: 12, letterSpacing: 0.5 }}
          >
            آزمون دوره
          </h6>
          {quiz ? (
            <>
              <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                <span className="text-muted small">عنوان آزمون</span>
                <strong>{quiz.Title}</strong>
              </div>
              <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                <span className="text-muted small">زمان شروع</span>
                <span>{formatDate(quiz.StartAt)}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                <span className="text-muted small">زمان پایان</span>
                <span>{formatDate(quiz.EndAt)}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                <span className="text-muted small">مدت زمان آزمون</span>
                <span>{quiz.DurationMinutes ?? "-"} دقیقه</span>
              </div>
              <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                <span className="text-muted small">
                  تعداد سوال نمایش داده‌شده به هر کاربر
                </span>
                <span>{quiz.QuestionsToShow}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                <span className="text-muted small">مجموع نمره بانک سوالات</span>
                <span>{totalQuizScore}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center py-2">
                <span className="text-muted small">نمره قبولی</span>
                <strong className="text-primary">{quiz.PassScore}</strong>
              </div>
            </>
          ) : (
            <div className="text-center text-muted py-3">
              <i className="fas fa-exclamation-circle me-1" />
              هنوز آزمونی برای این دوره تعریف نشده است.
            </div>
          )}
        </div>

        {/* Publish section */}
        <div
          className="text-center rounded-3 p-4"
          style={{
            backgroundColor: course.IsPublished ? "#ECFDF5" : "#F8FAFC",
            border: `1px dashed ${course.IsPublished ? "#10b981" : "#cbd5e1"}`,
          }}
        >
          {course.IsPublished ? (
            <div className="py-2">
              <i className="fas fa-check-circle fa-2x text-success mb-2" />
              <p className="text-muted mb-0">
                این دوره قبلاً منتشر شده و برای دانشجویان قابل مشاهده است.
              </p>
            </div>
          ) : (
            <div className="py-2">
              <p className="text-muted mb-3">
                دوره شما آماده انتشار است. با انتشار، دوره برای دانشجویان قابل
                مشاهده و ثبت‌نام خواهد بود.
              </p>
              <button
                className="btn btn-success btn-lg px-5 rounded-pill"
                onClick={handlePublish}
                disabled={publishing}
              >
                {publishing && (
                  <span className="spinner-border spinner-border-sm me-2" />
                )}
                <i className="fas fa-rocket me-2" />
                انتشار دوره
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseSummary;
