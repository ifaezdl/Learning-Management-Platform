import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { all_routes } from "../../router/all_routes";
import StudentSidebar from "../common/studentSidebar";
import ProfileCard from "../common/profileCard";
import quizService, {
  StudentQuizListItem,
} from "../../../services/quiz.service";

const PAGE_SIZE = 5;

const statusLabel: Record<StudentQuizListItem["status"], string> = {
  upcoming: "هنوز شروع نشده",
  available: "در حال برگزاری",
  closed: "پایان یافته",
};

const statusClass: Record<StudentQuizListItem["status"], string> = {
  upcoming: "text-warning",
  available: "text-success",
  closed: "text-danger",
};

const statusIcon: Record<StudentQuizListItem["status"], string> = {
  upcoming: "isax isax-clock",
  available: "isax isax-play-circle",
  closed: "isax isax-close-circle",
};

const StudentQuiz = () => {
  const route = all_routes;
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<StudentQuizListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    quizService
      .myQuizzes()
      .then(setQuizzes)
      .catch(() => toast.error("بارگذاری آزمون‌ها با خطا مواجه شد."))
      .finally(() => setLoading(false));
  }, []);

  const handleStart = async (q: StudentQuizListItem) => {
    if (q.status === "upcoming") {
      toast.error("این آزمون هنوز شروع نشده است.");
      return;
    }
    if (q.status === "closed") {
      toast.error("مهلت شرکت در این آزمون به پایان رسیده است.");
      return;
    }
    if (q.attempted) {
      toast.error("شما قبلاً در این آزمون شرکت کرده‌اید.");
      return;
    }
    setStarting(q.quizId);
    try {
      const attempt = await quizService.startQuiz(q.quizId);
      navigate(route.studentQuizQuestion, { state: { attempt } });
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "شروع آزمون با خطا مواجه شد.",
      );
    } finally {
      setStarting(null);
    }
  };

  // ── Pagination ──────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(quizzes.length / PAGE_SIZE));
  const paged = quizzes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="content mt-5">
      <div className="container">
        <ProfileCard />
        <div className="row">
          <StudentSidebar />
          <div className="col-md-12">
            <div className="page-title d-flex align-items-center justify-content-between mb-3">
              <h5 className="mb-0">آزمون‌های پیش رو</h5>
              {!loading && quizzes.length > 0 && (
                <span className="text-muted fs-14">
                  {quizzes.length} آزمون
                </span>
              )}
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status" />
                <p className="mt-2 text-muted">در حال بارگذاری...</p>
              </div>
            ) : quizzes.length === 0 ? (
              <div className="text-center text-muted py-5 border rounded-3">
                <i className="isax isax-clipboard-text fs-1 d-block mb-3 opacity-50" />
                <p>آزمونی برای دوره‌های شما یافت نشد.</p>
                <small>مطمئن شوید آزمون توسط مدرس منتشر شده باشد.</small>
              </div>
            ) : (
              <>
                {paged.map((q) => (
                  <div
                    key={q.quizId}
                    className="border rounded-3 p-3 mb-3 d-flex align-items-start justify-content-between gap-3"
                  >
                    {/* اطلاعات آزمون */}
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <i className={`${statusIcon[q.status]} ${statusClass[q.status]} fs-18`} />
                        <h6 className="mb-0">{q.title}</h6>
                      </div>
                      <p className="fs-14 text-muted mb-1">
                        <i className="isax isax-book me-1" />
                        {q.courseTitle}
                      </p>
                      <div className="d-flex flex-wrap gap-3 fs-13 text-muted">
                        <span>
                          <i className="isax isax-message-question5 me-1" />
                          {q.questionsToShow} سوال
                        </span>
                        {q.durationMinutes && (
                          <span>
                            <i className="isax isax-clock me-1" />
                            {q.durationMinutes} دقیقه
                          </span>
                        )}
                        {q.startAt && (
                          <span>
                            <i className="isax isax-calendar me-1" />
                            شروع:{" "}
                            {new Date(q.startAt).toLocaleDateString("fa-IR", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        )}
                        {q.endAt && (
                          <span>
                            <i className="isax isax-calendar-remove me-1" />
                            پایان:{" "}
                            {new Date(q.endAt).toLocaleDateString("fa-IR", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        )}
                      </div>

                      {/* وضعیت */}
                      <div className="mt-2 d-flex align-items-center gap-2 flex-wrap">
                        <span className={`badge ${q.status === "available" ? "bg-success" : q.status === "closed" ? "bg-danger" : "bg-warning text-dark"} fs-12`}>
                          {statusLabel[q.status]}
                        </span>
                        {q.attempted && q.attemptResult && (
                          <span className={`badge ${q.attemptResult.isPassed ? "bg-success" : "bg-danger"} fs-12`}>
                            نمره: {q.attemptResult.score}/{q.attemptResult.maxScore}
                            {" — "}
                            {q.attemptResult.isPassed ? "قبول ✓" : "مردود ✗"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* دکمه */}
                    <div className="flex-shrink-0">
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        disabled={
                          starting === q.quizId ||
                          q.attempted ||
                          q.status !== "available"
                        }
                        onClick={() => handleStart(q)}
                      >
                        {starting === q.quizId ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-1" />
                            در حال شروع...
                          </>
                        ) : q.attempted ? (
                          "شرکت کردید"
                        ) : (
                          "شرکت در آزمون"
                        )}
                      </button>
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <nav className="d-flex justify-content-center mt-4" aria-label="صفحه‌بندی آزمون‌ها">
                    <ul className="pagination pagination-sm mb-0">
                      <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                        <button
                          className="page-link"
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          aria-label="صفحه قبل"
                        >
                          <i className="isax isax-arrow-right-3" />
                        </button>
                      </li>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <li key={p} className={`page-item ${p === page ? "active" : ""}`}>
                          <button
                            className="page-link"
                            onClick={() => setPage(p)}
                          >
                            {p}
                          </button>
                        </li>
                      ))}

                      <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
                        <button
                          className="page-link"
                          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                          aria-label="صفحه بعد"
                        >
                          <i className="isax isax-arrow-left-3" />
                        </button>
                      </li>
                    </ul>
                  </nav>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentQuiz;
