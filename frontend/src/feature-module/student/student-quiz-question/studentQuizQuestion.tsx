import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { all_routes } from "../../router/all_routes";
import ProfileCard from "../common/profileCard";
import StudentSidebar from "../common/studentSidebar";
import quizService, {
  StartQuizResponse,
  QuizResult,
} from "../../../services/quiz.service";

const StudentQuizQuestion = () => {
  const route = all_routes;
  const location = useLocation();
  const navigate = useNavigate();
  const attempt = (location.state as { attempt?: StartQuizResponse })?.attempt;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [remainingSec, setRemainingSec] = useState<number>(() =>
    attempt
      ? Math.max(
          0,
          Math.floor(
            (new Date(attempt.deadlineAt).getTime() - Date.now()) / 1000,
          ),
        )
      : 0,
  );
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    if (!attempt) {
      toast.error("آزمونی برای نمایش وجود ندارد.");
      navigate(route.studentQuiz);
    }
  }, [attempt, navigate, route.studentQuiz]);

  useEffect(() => {
    if (!attempt) return;
    const deadline = new Date(attempt.deadlineAt).getTime();
    const tick = () =>
      setRemainingSec(Math.max(0, Math.floor((deadline - Date.now()) / 1000)));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [attempt]);

  const finishQuiz = useCallback(
    async (auto = false) => {
      if (!attempt || submitting) return;
      setSubmitting(true);
      try {
        const payload = Object.entries(answers).map(
          ([questionId, choiceId]) => ({
            questionId: Number(questionId),
            choiceId,
          }),
        );
        const res = await quizService.submitQuiz(attempt.attemptId, payload);
        setResult(res);
        if (auto) toast("زمان آزمون به پایان رسید و آزمون شما ثبت شد.");
      } catch (err: any) {
        toast.error(
          err?.response?.data?.message || "ثبت آزمون با خطا مواجه شد.",
        );
      } finally {
        setSubmitting(false);
      }
    },
    [attempt, answers, submitting],
  );

  useEffect(() => {
    if (attempt && remainingSec === 0 && !result && !submitting) {
      finishQuiz(true);
    }
  }, [remainingSec, attempt, result, submitting, finishQuiz]);

  if (!attempt) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const questions = attempt.questions;
  const visibleQuestions = attempt.showAllQuestions
    ? questions
    : [questions[currentIndex]];
  const isLast = currentIndex === questions.length - 1;

  const handleSelect = (questionId: number, choiceId: number) =>
    setAnswers((prev) => ({ ...prev, [questionId]: choiceId }));

  // ── صفحه نتیجه آزمون ────────────────────────────────────────────────────────
  if (result) {
    const scorePercent =
      result.maxScore > 0
        ? Math.round((result.score / result.maxScore) * 100)
        : 0;

    return (
      <div className="content mt-5">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <StudentSidebar />
            <div className="col-lg-12">

              {/* ── کارت اصلی نتیجه ── */}
              <div
                className="rounded-4 overflow-hidden mb-4"
                style={{
                  background: result.isPassed
                    ? "linear-gradient(135deg, #0f9b58 0%, #0d7a46 100%)"
                    : "linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                }}
              >
                <div className="p-5 text-center text-white">
                  {/* آیکون وضعیت */}
                  <div
                    className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4"
                    style={{
                      width: 96,
                      height: 96,
                      background: "rgba(255,255,255,0.2)",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <i
                      className={`isax ${result.isPassed ? "isax-tick-circle" : "isax-close-circle"}`}
                      style={{ fontSize: 48 }}
                    />
                  </div>

                  <h3 className="fw-bold mb-1">
                    {result.isPassed ? "تبریک! 🎉" : "دلسرد نشو!"}
                  </h3>
                  <p className="mb-0 opacity-75" style={{ fontSize: 16 }}>
                    {result.isPassed
                      ? "در این آزمون موفق شدید"
                      : "این بار قبول نشدید، اما تلاش مهم است"}
                  </p>
                </div>

                {/* نوار نمره درصدی */}
                <div
                  className="px-5 pb-4"
                  style={{ background: "rgba(0,0,0,0.12)" }}
                >
                  <div className="d-flex justify-content-between text-white mb-1 pt-3">
                    <span style={{ fontSize: 13, opacity: 0.85 }}>نمره کسب‌شده</span>
                    <span className="fw-bold">{scorePercent}٪</span>
                  </div>
                  <div
                    className="rounded-pill overflow-hidden"
                    style={{ height: 8, background: "rgba(255,255,255,0.25)" }}
                  >
                    <div
                      className="h-100 rounded-pill"
                      style={{
                        width: `${scorePercent}%`,
                        background: "rgba(255,255,255,0.9)",
                        transition: "width 1s ease",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* ── کارت‌های آمار ── */}
              <div className="row g-3 mb-4">
                {[
                  {
                    label: "نمره نهایی",
                    value: `${result.score} / ${result.maxScore}`,
                    icon: "isax-medal-star",
                    color: "#6366f1",
                    bg: "#eef2ff",
                  },
                  {
                    label: "پاسخ صحیح",
                    value: result.correctCount,
                    icon: "isax-tick-square",
                    color: "#0f9b58",
                    bg: "#ecfdf5",
                  },
                  {
                    label: "پاسخ غلط",
                    value: result.wrongCount,
                    icon: "isax-close-square",
                    color: "#e74c3c",
                    bg: "#fef2f2",
                  },
                  {
                    label: "کل سوالات",
                    value: result.totalQuestions,
                    icon: "isax-message-question5",
                    color: "#f59e0b",
                    bg: "#fffbeb",
                  },
                ].map((stat) => (
                  <div className="col-6 col-md-3" key={stat.label}>
                    <div
                      className="rounded-3 p-3 text-center h-100 d-flex flex-column align-items-center justify-content-center gap-2"
                      style={{ background: stat.bg, border: `1.5px solid ${stat.bg}` }}
                    >
                      <div
                        className="d-flex align-items-center justify-content-center rounded-circle"
                        style={{
                          width: 44,
                          height: 44,
                          background: `${stat.color}18`,
                        }}
                      >
                        <i
                          className={`isax ${stat.icon}`}
                          style={{ fontSize: 20, color: stat.color }}
                        />
                      </div>
                      <div>
                        <div className="fw-bold fs-18" style={{ color: stat.color }}>
                          {stat.value}
                        </div>
                        <div className="text-muted" style={{ fontSize: 12 }}>
                          {stat.label}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── دکمه بازگشت ── */}
              <div className="text-center">
                <Link
                  to={route.studentQuiz}
                  className="btn btn-outline-secondary rounded-pill me-2"
                >
                  <i className="isax isax-clipboard-text me-1" />
                  بازگشت به آزمون‌ها
                </Link>
                <Link
                  to={route.studentDashboard}
                  className="btn btn-secondary rounded-pill"
                >
                  <i className="isax isax-home-2 me-1" />
                  داشبورد
                </Link>
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── صفحه سوالات آزمون ───────────────────────────────────────────────────────
  return (
    <div className="content mt-5">
      <div className="container">
        <ProfileCard />
        <div className="row">
          <StudentSidebar />
          <div className="col-lg-12">
            <div className="page-title d-flex align-items-center justify-content-between">
              <h5>{attempt.title}</h5>
              <span className="badge bg-danger-transparent text-danger fs-14">
                <i className="isax isax-clock me-1" />
                {formatTime(remainingSec)}
              </span>
            </div>

            {visibleQuestions.map((q, i) => (
              <div className="quiz-attempt-card border-0" key={q.id}>
                <div className="quiz-attempt-body p-0">
                  <div className="border p-3 mb-3 rounded-2">
                    {!attempt.showAllQuestions && (
                      <div className="mb-3">
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <span className="fw-semibold text-gray-9">
                            پیشرفت آزمون
                          </span>
                          <span>
                            سوال {currentIndex + 1} از {questions.length}
                          </span>
                        </div>
                        <div className="progress progress-xs flex-grow-1 mb-1">
                          <div
                            className="progress-bar bg-success rounded"
                            style={{
                              width: `${((currentIndex + 1) / questions.length) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                    <div className="mb-0">
                      <h6 className="mb-3">
                        {attempt.showAllQuestions ? `${i + 1}. ` : ""}
                        {q.questionText}
                      </h6>
                      {q.choices.map((c) => (
                        <div className="form-check mb-2" key={c.id}>
                          <input
                            className="form-check-input"
                            type="radio"
                            name={`question-${q.id}`}
                            id={`choice-${c.id}`}
                            checked={answers[q.id] === c.id}
                            onChange={() => handleSelect(q.id, c.id)}
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`choice-${c.id}`}
                          >
                            {c.text}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="d-flex align-items-center justify-content-between">
              {!attempt.showAllQuestions &&
                attempt.allowPreviousQuestion &&
                currentIndex > 0 && (
                  <button
                    type="button"
                    className="btn bg-gray-100 rounded-pill"
                    onClick={() => setCurrentIndex((i) => i - 1)}
                  >
                    <i className="isax isax-arrow-right-3 me-1 fs-10" />
                    سوال قبلی
                  </button>
                )}
              <div className="ms-auto">
                {attempt.showAllQuestions || isLast ? (
                  <button
                    type="button"
                    className="btn btn-secondary rounded-pill"
                    disabled={submitting}
                    onClick={() => finishQuiz(false)}
                  >
                    {submitting ? "در حال ثبت..." : "پایان و ثبت آزمون"}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-secondary rounded-pill"
                    onClick={() => setCurrentIndex((i) => i + 1)}
                  >
                    سوال بعدی
                    <i className="isax isax-arrow-left-3 ms-1 fs-10" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentQuizQuestion;
