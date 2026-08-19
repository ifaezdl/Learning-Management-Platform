import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import courseService, {
  Course,
  Section,
} from "../../../../services/course.service";
import quizService from "../../../../services/quiz.service";
import "./coursesummary.scss";
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
    (sum, section) => sum + (section.Lessons?.length || 0),
    0,
  );

  const totalFiles = sections.reduce(
    (sum, section) =>
      sum +
      (section.Lessons?.reduce(
        (lessonSum, lesson) => lessonSum + (lesson.LessonFiles?.length || 0),
        0,
      ) || 0),
    0,
  );

  const totalQuizScore =
    quiz?.QuizQuestions?.reduce(
      (sum, question) => sum + Number(question.Score || 1),
      0,
    ) || 0;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";

    const date = new Date(dateStr);

    const datePart = date.toLocaleDateString("fa-IR");

    const timePart = date.toLocaleTimeString("fa-IR", {
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
      <div className="course-summary-loading">
        <div className="spinner-border text-primary mb-3" role="status" />

        <p className="text-muted mb-0">در حال بارگذاری اطلاعات دوره...</p>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <div className="course-summary">
      <div className="course-summary-card">
        {/* =====================================================
            Header
        ====================================================== */}

        <div className="course-summary-header">
          <div className="course-summary-header-content">
            <div className="course-summary-title">
              <div className="course-summary-title-icon">
                <i className="fas fa-clipboard-list" />
              </div>

              <div>
                <h5>خلاصه دوره</h5>
                <span>بررسی اطلاعات نهایی قبل از انتشار</span>
              </div>
            </div>

            {course.IsPublished ? (
              <span className="course-summary-status published">
                <i className="fas fa-check-circle" />
                منتشر شده
              </span>
            ) : (
              <span className="course-summary-status draft">
                <i className="fas fa-pen" />
                پیش‌نویس
              </span>
            )}
          </div>
        </div>

        {/* =====================================================
            Body
        ====================================================== */}

        <div className="course-summary-body">
          {/* ===================================================
              Course Information
          ==================================================== */}

          <div className="row g-3 mb-4">
            {/* General Information */}

            <div className="col-lg-6">
              <div className="summary-info-box h-100">
                <div className="summary-section-title">
                  <span className="summary-section-icon">
                    <i className="fas fa-info-circle" />
                  </span>

                  <span>اطلاعات کلی</span>
                </div>

                <div className="summary-info-row">
                  <span className="summary-info-label">عنوان</span>

                  <strong className="summary-info-value">{course.Title}</strong>
                </div>

                <div className="summary-info-row">
                  <span className="summary-info-label">دسته‌بندی</span>

                  <span className="summary-info-value">
                    {course.Category?.Title || "-"}
                  </span>
                </div>

                <div className="summary-info-row">
                  <span className="summary-info-label">سطح دوره</span>

                  <span className="summary-info-value">
                    {course.Level?.LevelName || "تعیین نشده"}
                  </span>
                </div>
              </div>
            </div>

            {/* Pricing Information */}

            <div className="col-lg-6">
              <div className="summary-info-box h-100">
                <div className="summary-section-title">
                  <span className="summary-section-icon">
                    <i className="fas fa-tag" />
                  </span>

                  <span>قیمت‌گذاری</span>
                </div>

                <div className="summary-info-row">
                  <span className="summary-info-label">قیمت</span>

                  <strong className="summary-info-value primary">
                    {Number(course.Price).toLocaleString("fa-IR")} ریال
                  </strong>
                </div>

                <div className="summary-info-row">
                  <span className="summary-info-label">قیمت با تخفیف</span>

                  <span className="summary-info-value">
                    {course.DiscountPrice != null
                      ? `${Number(course.DiscountPrice).toLocaleString(
                          "fa-IR",
                        )} ریال`
                      : "تعیین نشده"}
                  </span>
                </div>

                <div className="summary-info-row">
                  <span className="summary-info-label">وضعیت دوره</span>

                  {course.IsPublished ? (
                    <span className="summary-status-badge success">
                      <i className="fas fa-check-circle" />
                      منتشر شده
                    </span>
                  ) : (
                    <span className="summary-status-badge warning">
                      <i className="fas fa-clock" />
                      پیش‌نویس
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ===================================================
              Statistics
          ==================================================== */}

          <div className="row g-3 mb-4">
            {/* Sections */}

            <div className="col-xl-3 col-md-6">
              <div className="summary-stat-card">
                <div className="summary-stat-icon">
                  <i className="fas fa-layer-group" />
                </div>

                <div className="summary-stat-content">
                  <h4>{sections.length}</h4>
                  <span>سرفصل‌ها</span>
                </div>
              </div>
            </div>

            {/* Lessons */}

            <div className="col-xl-3 col-md-6">
              <div className="summary-stat-card">
                <div className="summary-stat-icon">
                  <i className="fas fa-play-circle" />
                </div>

                <div className="summary-stat-content">
                  <h4>{totalLessons}</h4>
                  <span>دروس</span>
                </div>
              </div>
            </div>

            {/* Files */}

            <div className="col-xl-3 col-md-6">
              <div className="summary-stat-card">
                <div className="summary-stat-icon">
                  <i className="fas fa-paperclip" />
                </div>

                <div className="summary-stat-content">
                  <h4>{totalFiles}</h4>
                  <span>فایل‌های آموزشی</span>
                </div>
              </div>
            </div>

            {/* Questions */}

            <div className="col-xl-3 col-md-6">
              <div className="summary-stat-card">
                <div className="summary-stat-icon">
                  <i className="fas fa-question-circle" />
                </div>

                <div className="summary-stat-content">
                  <h4>{quiz?.QuizQuestions?.length || 0}</h4>

                  <span>سوالات آزمون</span>
                </div>
              </div>
            </div>
          </div>

          {/* ===================================================
              Quiz Summary
          ==================================================== */}

          <div className="summary-quiz-box">
            <div className="summary-quiz-header">
              <span className="summary-section-icon">
                <i className="fas fa-clipboard-check" />
              </span>

              <span>آزمون دوره</span>
            </div>

            {quiz ? (
              <div className="summary-quiz-content">
                <div className="summary-info-row">
                  <span className="summary-info-label">عنوان آزمون</span>

                  <strong className="summary-info-value">{quiz.Title}</strong>
                </div>

                <div className="summary-info-row">
                  <span className="summary-info-label">زمان شروع</span>

                  <span className="summary-info-value">
                    {formatDate(quiz.StartAt)}
                  </span>
                </div>

                <div className="summary-info-row">
                  <span className="summary-info-label">زمان پایان</span>

                  <span className="summary-info-value">
                    {formatDate(quiz.EndAt)}
                  </span>
                </div>

                <div className="summary-info-row">
                  <span className="summary-info-label">مدت زمان آزمون</span>

                  <span className="summary-info-value">
                    {quiz.DurationMinutes ?? "-"} دقیقه
                  </span>
                </div>

                <div className="summary-info-row">
                  <span className="summary-info-label">
                    تعداد سوال نمایش داده‌شده به هر کاربر
                  </span>

                  <span className="summary-info-value">
                    {quiz.QuestionsToShow}
                  </span>
                </div>

                <div className="summary-info-row">
                  <span className="summary-info-label">
                    تعداد کل سوالات بانک
                  </span>

                  <span className="summary-info-value">
                    {quiz.QuizQuestions?.length || 0}
                  </span>
                </div>

                <div className="summary-info-row">
                  <span className="summary-info-label">
                    مجموع نمره بانک سوالات
                  </span>

                  <span className="summary-info-value">{totalQuizScore}</span>
                </div>

                <div className="summary-info-row">
                  <span className="summary-info-label">نمره قبولی</span>

                  <strong className="summary-info-value primary">
                    {quiz.PassScore}
                  </strong>
                </div>
              </div>
            ) : (
              <div className="summary-quiz-empty">
                <div className="summary-empty-icon">
                  <i className="fas fa-exclamation-circle" />
                </div>

                <p className="mb-0">
                  هنوز آزمونی برای این دوره تعریف نشده است.
                </p>
              </div>
            )}
          </div>

          {/* ===================================================
              Publish Section
          ==================================================== */}

          <div
            className={`summary-publish-box ${
              course.IsPublished ? "published" : ""
            }`}
          >
            {course.IsPublished ? (
              <div className="summary-publish-content">
                <div className="summary-publish-icon">
                  <i className="fas fa-check" />
                </div>

                <h6 className="summary-publish-title">دوره منتشر شده است</h6>

                <p className="summary-publish-text">
                  این دوره قبلاً منتشر شده و برای دانشجویان قابل مشاهده و
                  ثبت‌نام است.
                </p>
              </div>
            ) : (
              <div className="summary-publish-content">
                <div className="summary-publish-icon">
                  <i className="fas fa-rocket" />
                </div>

                <h6 className="summary-publish-title">دوره آماده انتشار است</h6>

                <p className="summary-publish-text">
                  اطلاعات دوره را بررسی کردید؟ با انتشار دوره، دانشجویان
                  می‌توانند آن را مشاهده و ثبت‌نام کنند.
                </p>

                <button
                  type="button"
                  className="summary-publish-btn"
                  onClick={handlePublish}
                  disabled={publishing}
                >
                  {publishing ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      در حال انتشار...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-rocket me-2" />
                      انتشار دوره
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseSummary;
