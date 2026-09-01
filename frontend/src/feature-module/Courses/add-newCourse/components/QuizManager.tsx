/**
 * QuizManager — مدیریت آزمون‌های یک دوره (چندآزمونی)
 *
 * الگوی پیاده‌سازی: دقیقاً مشابه SectionManager
 * ─────────────────────────────────────────────────────────
 * مدرس در این کامپوننت:
 *  - لیست همه آزمون‌های دوره را می‌بیند (عنوان، تعداد سوال، وضعیت، شرکت‌کننده)
 *  - آزمون جدید اضافه می‌کند (فرم تنظیمات پایه → رکورد اولیه ساخته می‌شود → سپس وارد QuizBuilder می‌شود)
 *  - آزمون موجود را ویرایش می‌کند (مستقیماً QuizBuilder با quizId)
 *  - آزمون بدون شرکت‌کننده را حذف می‌کند
 *  - آزمون دارای شرکت‌کننده را غیرفعال می‌کند
 */
import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import DatePicker from "react-multi-date-picker";
import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import quizService, {
  QuizSummary,
  CreateQuizPayload,
} from "../../../../services/quiz.service";
import InstructorQuizQuestions from "../../../Instructor/instructor-quiz-question/instructorQuizQuestions";
import "./quiz-manager.scss";

interface QuizManagerProps {
  courseId: number;
}

type View = "list" | "builder";

const QuizManager: React.FC<QuizManagerProps> = ({ courseId }) => {
  // ── state ──────────────────────────────────────────────
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [loading, setLoading] = useState(false);

  // "builder" view state
  const [view, setView] = useState<View>("list");
  const [activeQuizId, setActiveQuizId] = useState<number | null>(null);

  // Create form modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<CreateQuizPayload>({
    title: "",
    startAt: "",
    endAt: "",
    durationMinutes: 30,
    passScore: 0,
    questionsToShow: 10,
    showAllQuestions: false,
    allowPreviousQuestion: true,
    scorePerQuestion: 1,
  });
  const [startDateObj, setStartDateObj] = useState<DateObject | null>(null);
  const [startTime, setStartTime] = useState("09:00");
  const [endDateObj, setEndDateObj] = useState<DateObject | null>(null);
  const [endTime, setEndTime] = useState("23:59");

  // Delete / deactivate confirm modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<QuizSummary | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── data fetch ─────────────────────────────────────────
  const fetchQuizzes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await quizService.listByCourse(courseId);
      setQuizzes(data);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || "بارگذاری آزمون‌ها با خطا مواجه شد.";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  // ── create ─────────────────────────────────────────────
  /** DateObject شمسی + "HH:MM" → ISO string میلادی */
  const buildISO = (dateObj: DateObject | null, time: string): string => {
    if (!dateObj) return "";
    const d = dateObj.toDate();
    const [h, m] = time.split(":").map(Number);
    d.setHours(h, m, 0, 0);
    return d.toISOString();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title?.trim()) {
      toast.error("عنوان آزمون را وارد کنید.");
      return;
    }
    if (!startDateObj || !endDateObj) {
      toast.error("تاریخ شروع و پایان را مشخص کنید.");
      return;
    }
    const startAt = buildISO(startDateObj, startTime);
    const endAt = buildISO(endDateObj, endTime);
    if (new Date(endAt) <= new Date(startAt)) {
      toast.error("زمان پایان باید بعد از زمان شروع باشد.");
      return;
    }
    setCreating(true);
    try {
      const created = await quizService.create(courseId, {
        ...form,
        startAt,
        endAt,
      });
      toast.success("آزمون با موفقیت ایجاد شد. اکنون سوالات را اضافه کنید.");
      setShowCreateModal(false);
      resetForm();
      // بلافاصله وارد QuizBuilder برای این quizId می‌شویم
      setActiveQuizId(created.Id);
      setView("builder");
      fetchQuizzes();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || "ایجاد آزمون با خطا مواجه شد.";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      startAt: "",
      endAt: "",
      durationMinutes: 30,
      passScore: 0,
      questionsToShow: 10,
      showAllQuestions: false,
      allowPreviousQuestion: true,
      scorePerQuestion: 1,
    });
    setStartDateObj(null);
    setStartTime("09:00");
    setEndDateObj(null);
    setEndTime("23:59");
  };

  // ── edit (open builder) ────────────────────────────────
  const handleEdit = (quiz: QuizSummary) => {
    setActiveQuizId(quiz.Id);
    setView("builder");
  };

  // ── delete / deactivate ────────────────────────────────
  const openDeleteModal = (quiz: QuizSummary) => {
    setSelectedQuiz(quiz);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!selectedQuiz) return;
    setDeleting(true);
    try {
      await quizService.delete(selectedQuiz.Id);
      toast.success("آزمون با موفقیت حذف شد.");
      setShowDeleteModal(false);
      setSelectedQuiz(null);
      fetchQuizzes();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "";
      // بک‌اند 400 برمی‌گرداند + آزمون را غیرفعال کرده
      if (err?.response?.status === 400) {
        toast.success("آزمون غیرفعال شد (شرکت‌کننده دارد و قابل حذف نیست).");
        setShowDeleteModal(false);
        setSelectedQuiz(null);
        fetchQuizzes();
      } else {
        toast.error(Array.isArray(msg) ? msg[0] : msg || "خطا در حذف آزمون.");
      }
    } finally {
      setDeleting(false);
    }
  };

  // ── toggle publish ─────────────────────────────────────
  const handleTogglePublish = async (quiz: QuizSummary) => {
    if (quiz._count.QuizQuestions === 0) {
      toast.error("قبل از انتشار حداقل یک سوال اضافه کنید.");
      return;
    }
    try {
      const res = await quizService.togglePublish(quiz.Id);
      toast.success(
        res.isPublished ? "آزمون منتشر شد." : "آزمون از انتشار خارج شد.",
      );
      fetchQuizzes();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || "تغییر وضعیت انتشار با خطا مواجه شد.";
      toast.error(msg);
    }
  };

  // ── render ─────────────────────────────────────────────

  // Builder view — به همان کامپوننت موجود با quizId
  if (view === "builder" && activeQuizId) {
    return (
      <InstructorQuizQuestions
        quizId={activeQuizId}
        onPrev={() => {
          setView("list");
          setActiveQuizId(null);
          fetchQuizzes();
        }}
        onNext={() => {
          setView("list");
          setActiveQuizId(null);
          fetchQuizzes();
        }}
      />
    );
  }

  return (
    <>
      <div className="quiz-manager">
        {/* ── Header ── */}
        <div className="quiz-manager-header">
          <div className="quiz-manager-heading">
            <div className="quiz-manager-icon">
              <i className="isax isax-clipboard-text" />
            </div>
            <div>
              <h6>مدیریت آزمون‌ها</h6>
              <p>
                آزمون‌های دوره را ایجاد کنید و بانک سوالات هر آزمون را مستقل
                مدیریت کنید.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="quiz-manager-add-btn"
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
          >
            <i className="isax isax-add" />
            <span>افزودن آزمون جدید</span>
          </button>
        </div>

        {/* ── Body ── */}
        <div className="quiz-manager-body">
          {loading ? (
            <div className="quiz-manager-loading">
              <div
                className="spinner-border"
                role="status"
                aria-label="در حال بارگذاری"
              />
              <span>در حال دریافت آزمون‌ها...</span>
            </div>
          ) : quizzes.length === 0 ? (
            <div className="quiz-manager-empty">
              <div className="quiz-manager-empty-icon">
                <i className="isax isax-clipboard-text" />
              </div>
              <h6>هنوز آزمونی برای این دوره ساخته نشده است</h6>
              <p>
                می‌توانید چند آزمون مستقل (مثلاً هفتگی یا بر اساس هر سرفصل) برای
                این دوره بسازید.
              </p>
              <button
                type="button"
                className="quiz-manager-empty-btn"
                onClick={() => {
                  resetForm();
                  setShowCreateModal(true);
                }}
              >
                <i className="isax isax-add" />
                افزودن اولین آزمون
              </button>
            </div>
          ) : (
            <div className="quiz-manager-table-wrapper">
              <table className="quiz-manager-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>عنوان آزمون</th>
                    <th>تعداد سوال</th>
                    <th>شرکت‌کننده</th>
                    <th>وضعیت</th>
                    <th>بازه زمانی</th>
                    <th>عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {quizzes.map((quiz, idx) => (
                    <tr key={quiz.Id}>
                      <td>{idx + 1}</td>
                      <td>
                        <span className="quiz-manager-title">
                          {quiz.Title || `آزمون ${idx + 1}`}
                        </span>
                      </td>
                      <td>
                        <span className="quiz-count-badge">
                          <i className="isax isax-message-question5" />
                          {quiz._count.QuizQuestions}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`quiz-attempt-badge ${quiz._count.QuizAttempts > 0 ? "has-attempts" : ""}`}
                        >
                          <i className="isax isax-profile-2user" />
                          {quiz._count.QuizAttempts}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className={`quiz-status-badge ${quiz.IsPublished ? "published" : "draft"}`}
                          onClick={() => handleTogglePublish(quiz)}
                          title={
                            quiz.IsPublished
                              ? "کلیک برای رفع انتشار"
                              : "کلیک برای انتشار"
                          }
                        >
                          <i
                            className={
                              quiz.IsPublished
                                ? "isax isax-eye"
                                : "isax isax-eye-slash"
                            }
                          />
                          {quiz.IsPublished ? "منتشرشده" : "پیش‌نویس"}
                        </button>
                      </td>
                      <td className="quiz-date-cell">
                        {quiz.StartAt ? (
                          <span className="quiz-date-range">
                            <small>
                              {new Date(quiz.StartAt).toLocaleDateString(
                                "fa-IR",
                              )}
                            </small>
                            <i className="isax isax-arrow-left-3 mx-1" />
                            <small>
                              {quiz.EndAt
                                ? new Date(quiz.EndAt).toLocaleDateString(
                                    "fa-IR",
                                  )
                                : "—"}
                            </small>
                          </span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td>
                        <div className="quiz-manager-actions">
                          <button
                            type="button"
                            className="quiz-manager-action-btn edit"
                            title="ویرایش آزمون"
                            onClick={() => handleEdit(quiz)}
                          >
                            <i className="isax isax-edit-2" />
                          </button>
                          <button
                            type="button"
                            className="quiz-manager-action-btn delete"
                            title={
                              quiz._count.QuizAttempts > 0
                                ? "غیرفعال‌سازی (دارای شرکت‌کننده)"
                                : "حذف آزمون"
                            }
                            onClick={() => openDeleteModal(quiz)}
                          >
                            <i className="isax isax-trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* =============================================
          CREATE MODAL — تنظیمات پایه (بدون سوال)
      ============================================= */}
      {showCreateModal && (
        <div className="quiz-modal-backdrop">
          <div
            className="quiz-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-quiz-title"
          >
            <div className="quiz-modal-header">
              <div className="quiz-modal-title-group">
                <div className="quiz-modal-icon-box">
                  <i className="isax isax-clipboard-text" />
                </div>
                <div>
                  <h5 id="create-quiz-title">افزودن آزمون جدید</h5>
                  <span>
                    تنظیمات پایه آزمون را وارد کنید — سوالات در مرحله بعد اضافه
                    می‌شوند
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="quiz-modal-close-btn"
                onClick={() => setShowCreateModal(false)}
                disabled={creating}
              >
                <i className="isax isax-close-circle" />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="quiz-modal-body">
                <div className="quiz-form-row">
                  <div className="quiz-form-group full">
                    <label>
                      <span className="required">*</span> عنوان آزمون
                    </label>
                    <input
                      type="text"
                      className="quiz-form-control"
                      value={form.title}
                      onChange={(e) =>
                        setForm({ ...form, title: e.target.value })
                      }
                      placeholder="مثلاً: آزمون هفته اول"
                      disabled={creating}
                      autoFocus
                    />
                  </div>
                </div>

                <div className="quiz-form-row two-col">
                  <div className="quiz-form-group">
                    <label>
                      <span className="required">*</span> تاریخ شروع
                    </label>
                    <DatePicker
                      calendar={persian}
                      locale={persian_fa}
                      value={startDateObj}
                      onChange={(val) => setStartDateObj(val as DateObject)}
                      inputClass="quiz-form-control"
                      calendarPosition="bottom-right"
                      containerStyle={{ width: "100%" }}
                      disabled={creating}
                      placeholder="انتخاب تاریخ"
                    />
                  </div>
                  <div className="quiz-form-group">
                    <label>
                      <span className="required">*</span> ساعت شروع
                    </label>
                    <input
                      type="time"
                      className="quiz-form-control"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      disabled={creating}
                    />
                  </div>
                </div>

                <div className="quiz-form-row two-col">
                  <div className="quiz-form-group">
                    <label>
                      <span className="required">*</span> تاریخ پایان
                    </label>
                    <DatePicker
                      calendar={persian}
                      locale={persian_fa}
                      value={endDateObj}
                      onChange={(val) => setEndDateObj(val as DateObject)}
                      inputClass="quiz-form-control"
                      calendarPosition="bottom-right"
                      containerStyle={{ width: "100%" }}
                      disabled={creating}
                      placeholder="انتخاب تاریخ"
                    />
                  </div>
                  <div className="quiz-form-group">
                    <label>
                      <span className="required">*</span> ساعت پایان
                    </label>
                    <input
                      type="time"
                      className="quiz-form-control"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      disabled={creating}
                    />
                  </div>
                </div>

                <div className="quiz-form-row two-col">
                  <div className="quiz-form-group">
                    <label>
                      مدت زمان (دقیقه) <span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      className="quiz-form-control"
                      value={form.durationMinutes}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          durationMinutes: Number(e.target.value),
                        })
                      }
                      disabled={creating}
                    />
                  </div>
                  <div className="quiz-form-group">
                    <label>
                      نمره قبولی <span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={0.25}
                      className="quiz-form-control"
                      value={form.passScore}
                      onChange={(e) =>
                        setForm({ ...form, passScore: Number(e.target.value) })
                      }
                      disabled={creating}
                    />
                  </div>
                </div>

                <div className="quiz-form-row two-col">
                  <div className="quiz-form-group">
                    <label>
                      تعداد سوال برای هر دانشجو{" "}
                      <span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      className="quiz-form-control"
                      value={form.questionsToShow}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          questionsToShow: Number(e.target.value),
                        })
                      }
                      disabled={creating}
                    />
                    <small>پس از افزودن سوالات می‌توان تغییر داد</small>
                  </div>
                  <div className="quiz-form-group">
                    <label>نمره پیش‌فرض هر سوال</label>
                    <input
                      type="number"
                      min={0}
                      step={0.25}
                      className="quiz-form-control"
                      value={form.scorePerQuestion}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          scorePerQuestion: Number(e.target.value),
                        })
                      }
                      disabled={creating}
                    />
                  </div>
                </div>
              </div>

              <div className="quiz-modal-footer">
                <button
                  type="button"
                  className="quiz-modal-btn cancel"
                  onClick={() => setShowCreateModal(false)}
                  disabled={creating}
                >
                  لغو
                </button>
                <button
                  type="submit"
                  className="quiz-modal-btn primary"
                  disabled={creating}
                >
                  {creating ? (
                    <>
                      <span className="spinner-border spinner-border-sm" />
                      در حال ایجاد...
                    </>
                  ) : (
                    <>
                      ایجاد آزمون و افزودن سوالات
                      <i className="isax isax-arrow-left-2" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =============================================
          DELETE / DEACTIVATE CONFIRM MODAL
      ============================================= */}
      {showDeleteModal && selectedQuiz && (
        <div className="quiz-modal-backdrop">
          <div
            className="quiz-modal quiz-delete-modal"
            role="dialog"
            aria-modal="true"
          >
            <div className="quiz-modal-header">
              <div className="quiz-modal-title-group">
                <div className="quiz-modal-icon-box danger">
                  <i className="isax isax-trash" />
                </div>
                <div>
                  <h5>
                    {selectedQuiz._count.QuizAttempts > 0
                      ? "غیرفعال‌سازی آزمون"
                      : "حذف آزمون"}
                  </h5>
                  <span>این عملیات قابل بازگشت نیست.</span>
                </div>
              </div>
              <button
                type="button"
                className="quiz-modal-close-btn"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                <i className="isax isax-close-circle" />
              </button>
            </div>

            <div className="quiz-delete-body">
              {selectedQuiz._count.QuizAttempts > 0 ? (
                <>
                  <p>
                    آزمون <strong>«{selectedQuiz.Title}»</strong> دارای{" "}
                    <strong>
                      {selectedQuiz._count.QuizAttempts} شرکت‌کننده
                    </strong>{" "}
                    است.
                  </p>
                  <div className="quiz-delete-warning">
                    <i className="isax isax-warning-2" />
                    <span>
                      برای حفاظت از تاریخچه یادگیری دانشجویان، این آزمون{" "}
                      <strong>قابل حذف کامل نیست</strong>. با تأیید، آزمون فقط{" "}
                      <strong>غیرفعال</strong> می‌شود و از دید دانشجویان پنهان
                      خواهد شد.
                    </span>
                  </div>
                </>
              ) : (
                <p>
                  آیا از حذف آزمون <strong>«{selectedQuiz.Title}»</strong>{" "}
                  اطمینان دارید؟ تمام سوالات این آزمون نیز حذف خواهند شد.
                </p>
              )}
            </div>

            <div className="quiz-modal-footer">
              <button
                type="button"
                className="quiz-modal-btn cancel"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                لغو
              </button>
              <button
                type="button"
                className="quiz-modal-btn danger"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <span className="spinner-border spinner-border-sm" />
                    در حال پردازش...
                  </>
                ) : selectedQuiz._count.QuizAttempts > 0 ? (
                  <>
                    <i className="isax isax-eye-slash" />
                    بله، غیرفعال کن
                  </>
                ) : (
                  <>
                    <i className="isax isax-trash" />
                    بله، حذف کن
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuizManager;
