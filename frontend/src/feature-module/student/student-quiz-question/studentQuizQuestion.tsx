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
    <div className="content">
      <div className="container">
        <ProfileCard />
        <div className="row">
          <StudentSidebar />
          <div className="col-lg-12">
            {/* ── هدر آزمون (Header) - Tall Gradient ── */}
            <div
              className="rounded-4 overflow-hidden mb-5 header-quiz-gradient"
              style={{
                background: "linear-gradient(175deg, #3757c5 0%, #5625E8 50%, #7c3aed 100%)",
                boxShadow: "0 20px 48px rgba(55, 87, 197, 0.35), inset 0 1px 0 rgba(255,255,255,0.2)",
                position: "relative",
                minHeight: 280,
                display: "flex",
                alignItems: "center",
              }}
            >
              {/* Animated background elements */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: "40%",
                  height: "100%",
                  background: "radial-gradient(circle at top right, rgba(255,255,255,0.08) 0%, transparent 70%)",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  width: "35%",
                  height: "100%",
                  background: "radial-gradient(circle at bottom left, rgba(255,255,255,0.05) 0%, transparent 70%)",
                  pointerEvents: "none",
                }}
              />

              <div className="p-5 w-100" style={{ position: "relative", zIndex: 1 }}>
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-4">
                  {/* عنوان آزمون */}
                  <div className="flex-grow-1">
                    <h6
                      className="text-white mb-2"
                      style={{
                        fontSize: 12,
                        opacity: 0.9,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "1.2px",
                      }}
                    >
                      <i className="isax isax-clipboard-text me-2" />
                      آزمون فعلی
                    </h6>
                    <h2 className="text-white mb-0 fw-bold" style={{ fontSize: 32, lineHeight: 1.2 }}>
                      {attempt.title}
                    </h2>
                  </div>

                  {/* تایمر - هوشمند */}
                  <div
                    className="timer-box d-flex align-items-center justify-content-center rounded-4 px-5 py-4"
                    style={{
                      background:
                        remainingSec > 600
                          ? "rgba(255, 255, 255, 0.15)"
                          : remainingSec > 300
                            ? "rgba(255, 193, 7, 0.15)"
                            : "rgba(255, 107, 107, 0.15)",
                      backdropFilter: "blur(12px)",
                      border:
                        remainingSec > 600
                          ? "2px solid rgba(255, 255, 255, 0.3)"
                          : remainingSec > 300
                            ? "2px solid rgba(255, 193, 7, 0.4)"
                            : "2px solid rgba(255, 107, 107, 0.4)",
                      minWidth: 200,
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      animation: remainingSec <= 300 ? "pulse-timer 1s ease-in-out infinite" : "none",
                    }}
                  >
                    <div className="text-center">
                      <i
                        className="isax isax-clock text-white"
                        style={{
                          fontSize: 24,
                          marginBottom: 8,
                          opacity: 0.9,
                          display: "block",
                        }}
                      />
                      <div
                        className="text-white fw-bold"
                        style={{
                          fontSize: 36,
                          fontVariantNumeric: "tabular-nums",
                          color:
                            remainingSec > 600
                              ? "#ffffff"
                              : remainingSec > 300
                                ? "#FFD700"
                                : "#FF6B6B",
                          transition: "color 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          textShadow: remainingSec <= 300 ? "0 0 20px rgba(255, 107, 107, 0.5)" : "none",
                          letterSpacing: "2px",
                        }}
                      >
                        {formatTime(remainingSec)}
                      </div>
                      <p
                        className="text-white mb-0"
                        style={{
                          fontSize: 12,
                          opacity: 0.85,
                          marginTop: 6,
                          fontWeight: 500,
                        }}
                      >
                        زمان باقی‌مانده
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── اطلاعات آزمون (Quiz Info) - Enhanced Progress ── */}
            <div className="row g-3 mb-5">
              {/* نمایشگر پیشرفت */}
              {!attempt.showAllQuestions && (
                <div className="col-12">
                  <div
                    className="rounded-4 p-5 progress-card"
                    style={{
                      background: "linear-gradient(135deg, #f8f9fb 0%, #eef2f9 50%, #f0f2f7 100%)",
                      border: "2px solid #e1e8f0",
                      boxShadow: "0 8px 24px rgba(55, 87, 197, 0.08), inset 0 1px 0 rgba(255,255,255,0.5)",
                    }}
                  >
                    <div className="d-flex align-items-center justify-content-between mb-4">
                      <div>
                        <h6
                          className="text-muted mb-2"
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: "0.8px",
                            textTransform: "uppercase",
                          }}
                        >
                          <i className="isax isax-activity me-2" />
                          پیشرفت آزمون
                        </h6>
                        <p className="text-dark fw-bold mb-0" style={{ fontSize: 18 }}>
                          سوال{" "}
                          <span
                            style={{
                              color: "#3757c5",
                              fontSize: 20,
                              fontWeight: 700,
                            }}
                          >
                            {currentIndex + 1}
                          </span>{" "}
                          از{" "}
                          <span
                            style={{
                              color: "#3757c5",
                              fontSize: 20,
                              fontWeight: 700,
                            }}
                          >
                            {questions.length}
                          </span>
                        </p>
                      </div>
                      <div
                        className="progress-circle d-flex align-items-center justify-content-center rounded-circle"
                        style={{
                          width: 72,
                          height: 72,
                          background: "conic-gradient(from 0deg, #03C95A 0%, #0DD3A3 " +
                            Math.round(((currentIndex + 1) / questions.length) * 100) +
                            "%, #e8ebf0 " +
                            Math.round(((currentIndex + 1) / questions.length) * 100) +
                            "%, #e8ebf0 100%)",
                          boxShadow: "0 4px 16px rgba(3, 201, 90, 0.2), inset 0 -2px 4px rgba(0,0,0,0.05)",
                        }}
                      >
                        <div
                          className="d-flex flex-column align-items-center justify-content-center"
                          style={{
                            width: 64,
                            height: 64,
                            borderRadius: "50%",
                            background: "white",
                          }}
                        >
                          <span className="fw-bold" style={{ color: "#03C95A", fontSize: 18 }}>
                            {Math.round(((currentIndex + 1) / questions.length) * 100)}%
                          </span>
                          <span style={{ fontSize: 10, color: "#999" }}>انجام‌شده</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar - Attractive */}
                    <div
                      className="progress-track rounded-pill overflow-hidden"
                      style={{
                        height: 14,
                        background: "#e1e8f0",
                        boxShadow: "inset 0 2px 4px rgba(0,0,0,0.08)",
                      }}
                    >
                      <div
                        className="progress-fill h-100 rounded-pill"
                        style={{
                          width: `${((currentIndex + 1) / questions.length) * 100}%`,
                          background: "linear-gradient(90deg, #03C95A 0%, #0DD3A3 50%, #10b981 100%)",
                          transition: "width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
                          boxShadow: "0 4px 12px rgba(3, 201, 90, 0.4), inset 0 1px 0 rgba(255,255,255,0.3)",
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* کارت‌های اطلاعات - Enhanced */}
              <div className="col-12">
                <div className="row g-3">
                  {[
                    {
                      label: "کل سوالات",
                      value: questions.length,
                      icon: "isax-message-question5",
                      color: "#3757c5",
                      bgColor: "#eef2ff",
                      borderColor: "#3757c520",
                      gradient: "linear-gradient(135deg, #3757c5 0%, #5625E8 100%)",
                    },
                    {
                      label: "جوابات ثبت‌شده",
                      value: Object.keys(answers).length,
                      icon: "isax-tick-square",
                      color: "#03C95A",
                      bgColor: "#ecfdf5",
                      borderColor: "#03C95A20",
                      gradient: "linear-gradient(135deg, #03C95A 0%, #0DD3A3 100%)",
                    },
                    {
                      label: "سوالات بدون جواب",
                      value: questions.length - Object.keys(answers).length,
                      icon: "isax-close-square",
                      color: "#FF4667",
                      bgColor: "#fef2f2",
                      borderColor: "#FF466720",
                      gradient: "linear-gradient(135deg, #FF4667 0%, #f472b6 100%)",
                    },
                  ].map((info, idx) => (
                    <div className="col-6 col-md-4" key={idx}>
                      <div
                        className="info-card rounded-3 p-4 h-100"
                        style={{
                          background: info.bgColor,
                          border: `2px solid ${info.borderColor}`,
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          cursor: "pointer",
                          position: "relative",
                          overflow: "hidden",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-6px) scale(1.02)";
                          e.currentTarget.style.boxShadow = `0 16px 32px ${info.color}20`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0) scale(1)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        <div
                          className="info-card-bg"
                          style={{
                            position: "absolute",
                            top: "-50%",
                            right: "-50%",
                            width: "200%",
                            height: "200%",
                            background: info.gradient,
                            opacity: 0.05,
                            borderRadius: "50%",
                            transition: "all 0.3s ease",
                          }}
                        />

                        <div className="d-flex flex-column align-items-center justify-content-center text-center" style={{ position: "relative", zIndex: 1 }}>
                          <div
                            className="icon-wrapper d-flex align-items-center justify-content-center rounded-3 mb-3"
                            style={{
                              width: 56,
                              height: 56,
                              background: info.gradient,
                              boxShadow: `0 8px 16px ${info.color}25`,
                              transition: "all 0.3s ease",
                            }}
                          >
                            <i
                              className={`isax ${info.icon}`}
                              style={{
                                fontSize: 24,
                                color: "white",
                              }}
                            />
                          </div>
                          <div
                            className="fw-bold"
                            style={{
                              color: info.color,
                              fontSize: 28,
                              fontVariantNumeric: "tabular-nums",
                              marginBottom: 6,
                            }}
                          >
                            {info.value}
                          </div>
                          <div
                            className="text-muted"
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              letterSpacing: "0.3px",
                              color: info.color,
                              opacity: 0.75,
                            }}
                          >
                            {info.label}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── بخش سوالات - Enhanced ── */}
            <div className="mb-5 questions-container">
              {visibleQuestions.map((q, i) => (
                <div
                  className="question-card rounded-4 overflow-hidden mb-5"
                  key={q.id}
                  style={{
                    border: "2px solid #e8ebf0",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    animation: "slideIn 0.4s ease forwards",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.15)";
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.borderColor = "#3757c5";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.borderColor = "#e8ebf0";
                  }}
                >
                  {/* رنگ هدر سوال - Gradient Top Bar */}
                  <div
                    style={{
                      height: 6,
                      background: "linear-gradient(90deg, #3757c5 0%, #5625E8 50%, #7c3aed 100%)",
                      boxShadow: "0 4px 12px rgba(55, 87, 197, 0.3)",
                    }}
                  />

                  <div className="p-5">
                    {/* شماره سوال و وضعیت */}
                    <div className="d-flex align-items-center justify-content-between mb-4 pb-3" style={{ borderBottom: "1px solid #e8ebf0" }}>
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="question-number d-flex align-items-center justify-content-center rounded-3 fw-bold text-white"
                          style={{
                            width: 44,
                            height: 44,
                            background: "linear-gradient(135deg, #3757c5 0%, #5625E8 100%)",
                            fontSize: 16,
                            boxShadow: "0 4px 12px rgba(55, 87, 197, 0.3)",
                          }}
                        >
                          {attempt.showAllQuestions ? i + 1 : currentIndex + 1}
                        </div>
                        {answers[q.id] && (
                          <div
                            className="badge d-flex align-items-center gap-2"
                            style={{
                              background: "linear-gradient(135deg, #03C95A 0%, #0DD3A3 100%)",
                              color: "white",
                              fontSize: 12,
                              fontWeight: 600,
                              padding: "6px 12px",
                              border: "none",
                              boxShadow: "0 4px 8px rgba(3, 201, 90, 0.25)",
                            }}
                          >
                            <i className="isax isax-tick-circle" />
                            پاسخ‌داده‌شده
                          </div>
                        )}
                      </div>
                      <span style={{ fontSize: 12, color: "#999", fontWeight: 500 }}>
                        {attempt.showAllQuestions ? `${i + 1} از ${questions.length}` : "سوال منفرد"}
                      </span>
                    </div>

                    {/* متن سوال */}
                    <h5
                      className="mb-5 fw-semibold text-dark"
                      style={{
                        fontSize: 17,
                        lineHeight: 1.7,
                        color: "#1a1a1a",
                      }}
                    >
                      {q.questionText}
                    </h5>

                    {/* گزینه‌ها - Enhanced */}
                    <div className="choices-container">
                      {q.choices.map((c, choiceIdx) => (
                        <div key={c.id}>
                          <input
                            className="form-check-input"
                            type="radio"
                            name={`question-${q.id}`}
                            id={`choice-${c.id}`}
                            checked={answers[q.id] === c.id}
                            onChange={() => handleSelect(q.id, c.id)}
                            style={{ display: "none" }}
                          />
                          <label
                            htmlFor={`choice-${c.id}`}
                            className="d-block rounded-3 p-4 mb-3 cursor-pointer choice-label"
                            style={{
                              background: answers[q.id] === c.id
                                ? "linear-gradient(135deg, #3757c520 0%, #5625E820 100%)"
                                : "#f8f9fb",
                              border: answers[q.id] === c.id
                                ? "2.5px solid #3757c5"
                                : "2px solid #e8ebf0",
                              cursor: "pointer",
                              transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                              fontSize: 15,
                              color: "#1a1a1a",
                              fontWeight: answers[q.id] === c.id ? 600 : 500,
                              position: "relative",
                              overflow: "hidden",
                            }}
                            onMouseEnter={(e) => {
                              if (answers[q.id] !== c.id) {
                                e.currentTarget.style.background = "#f0f2f7";
                                e.currentTarget.style.borderColor = "#3757c5";
                                e.currentTarget.style.boxShadow = "0 8px 20px rgba(55, 87, 197, 0.1)";
                                e.currentTarget.style.transform = "translateX(-2px)";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (answers[q.id] !== c.id) {
                                e.currentTarget.style.background = "#f8f9fb";
                                e.currentTarget.style.borderColor = "#e8ebf0";
                                e.currentTarget.style.boxShadow = "none";
                                e.currentTarget.style.transform = "translateX(0)";
                              }
                            }}
                          >
                            <div className="d-flex align-items-center gap-3">
                              <div
                                className="choice-radio d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                                style={{
                                  width: 24,
                                  height: 24,
                                  border: answers[q.id] === c.id
                                    ? "2.5px solid #3757c5"
                                    : "2px solid #d0d5dd",
                                  background: answers[q.id] === c.id
                                    ? "linear-gradient(135deg, #3757c5 0%, #5625E8 100%)"
                                    : "transparent",
                                  transition: "all 0.25s ease",
                                  boxShadow: answers[q.id] === c.id
                                    ? "0 4px 12px rgba(55, 87, 197, 0.3)"
                                    : "none",
                                }}
                              >
                                {answers[q.id] === c.id && (
                                  <i
                                    className="isax isax-check"
                                    style={{
                                      color: "white",
                                      fontSize: 14,
                                      fontWeight: 700,
                                    }}
                                  />
                                )}
                              </div>
                              <span style={{ flex: 1, lineHeight: 1.5 }}>{c.text}</span>
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── بخش دکمه‌ها - Modern Buttons ── */}
            <div className="d-flex align-items-center justify-content-between gap-3 mt-6 pb-4">
              {!attempt.showAllQuestions &&
                attempt.allowPreviousQuestion &&
                currentIndex > 0 && (
                  <button
                    type="button"
                    className="btn btn-navigation prev-btn rounded-3 px-5 py-2 fw-600"
                    style={{
                      background: "#f0f2f7",
                      color: "#3757c5",
                      border: "2px solid #e1e8f0",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      fontSize: 14,
                      fontWeight: 600,
                      letterSpacing: "0.3px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "linear-gradient(135deg, #3757c510 0%, #5625E810 100%)";
                      e.currentTarget.style.borderColor = "#3757c5";
                      e.currentTarget.style.boxShadow = "0 8px 20px rgba(55, 87, 197, 0.2)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#f0f2f7";
                      e.currentTarget.style.borderColor = "#e1e8f0";
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                    onClick={() => setCurrentIndex((i) => i - 1)}
                  >
                    <i className="isax isax-arrow-right-3 ms-2" />
                    سوال قبلی
                  </button>
                )}
              <div className="ms-auto d-flex gap-3">
                {attempt.showAllQuestions || isLast ? (
                  <button
                    type="button"
                    className="btn btn-submit submit-btn rounded-3 px-6 py-2 fw-600 text-white"
                    disabled={submitting}
                    style={{
                      background: submitting
                        ? "linear-gradient(135deg, #999 0%, #777 100%)"
                        : "linear-gradient(135deg, #3757c5 0%, #5625E8 50%, #7c3aed 100%)",
                      border: "none",
                      boxShadow: !submitting
                        ? "0 8px 24px rgba(55, 87, 197, 0.35), inset 0 1px 0 rgba(255,255,255,0.2)"
                        : "0 4px 12px rgba(0,0,0,0.1)",
                      cursor: submitting ? "not-allowed" : "pointer",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      fontSize: 15,
                      fontWeight: 700,
                      letterSpacing: "0.5px",
                      position: "relative",
                      overflow: "hidden",
                    }}
                    onMouseEnter={(e) => {
                      if (!submitting) {
                        e.currentTarget.style.boxShadow = "0 12px 32px rgba(55, 87, 197, 0.45), inset 0 1px 0 rgba(255,255,255,0.2)";
                        e.currentTarget.style.transform = "translateY(-3px)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!submitting) {
                        e.currentTarget.style.boxShadow = "0 8px 24px rgba(55, 87, 197, 0.35), inset 0 1px 0 rgba(255,255,255,0.2)";
                        e.currentTarget.style.transform = "translateY(0)";
                      }
                    }}
                    onClick={() => finishQuiz(false)}
                  >
                    {submitting ? (
                      <>
                        <i
                          className="isax isax-loading-1 ms-2"
                          style={{
                            animation: "spin 1s linear infinite",
                          }}
                        />
                        در حال ثبت...
                      </>
                    ) : (
                      <>
                        <i className="isax isax-tick-square ms-2" />
                        پایان و ثبت آزمون
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-next next-btn rounded-3 px-6 py-2 fw-600 text-white"
                    style={{
                      background: "linear-gradient(135deg, #3757c5 0%, #5625E8 50%, #7c3aed 100%)",
                      border: "none",
                      boxShadow: "0 8px 24px rgba(55, 87, 197, 0.35), inset 0 1px 0 rgba(255,255,255,0.2)",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      fontSize: 15,
                      fontWeight: 700,
                      letterSpacing: "0.5px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 12px 32px rgba(55, 87, 197, 0.45), inset 0 1px 0 rgba(255,255,255,0.2)";
                      e.currentTarget.style.transform = "translateY(-3px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "0 8px 24px rgba(55, 87, 197, 0.35), inset 0 1px 0 rgba(255,255,255,0.2)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                    onClick={() => setCurrentIndex((i) => i + 1)}
                  >
                    سوال بعدی
                    <i className="isax isax-arrow-left-3 me-2" />
                  </button>
                )}
              </div>
            </div>
            
            <style>
              {`
                @keyframes spin {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }

                @keyframes slideIn {
                  from {
                    opacity: 0;
                    transform: translateY(20px);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }

                @keyframes pulse-timer {
                  0%, 100% {
                    opacity: 1;
                    transform: scale(1);
                  }
                  50% {
                    opacity: 0.9;
                    transform: scale(1.02);
                  }
                }

                @keyframes fadeIn {
                  from {
                    opacity: 0;
                  }
                  to {
                    opacity: 1;
                  }
                }

                @keyframes shakeX {
                  0%, 100% { transform: translateX(0); }
                  10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
                  20%, 40%, 60%, 80% { transform: translateX(4px); }
                }

                .header-quiz-gradient {
                  animation: fadeIn 0.5s ease;
                }

                .progress-card {
                  animation: slideIn 0.5s ease 0.1s backwards;
                }

                .info-card {
                  animation: slideIn 0.5s ease forwards;
                }

                .info-card:nth-child(1) {
                  animation-delay: 0.15s;
                }

                .info-card:nth-child(2) {
                  animation-delay: 0.25s;
                }

                .info-card:nth-child(3) {
                  animation-delay: 0.35s;
                }

                .question-card {
                  animation: slideIn 0.4s ease forwards;
                }

                .timer-box {
                  animation: fadeIn 0.6s ease 0.3s backwards;
                }

                /* Choice label smooth transitions */
                .choice-label {
                  position: relative;
                }

                .choice-label::before {
                  content: '';
                  position: absolute;
                  top: 0;
                  left: -100%;
                  width: 100%;
                  height: 100%;
                  background: linear-gradient(
                    90deg,
                    rgba(255, 255, 255, 0) 0%,
                    rgba(255, 255, 255, 0.15) 50%,
                    rgba(255, 255, 255, 0) 100%
                  );
                  transition: left 0.5s ease;
                  pointer-events: none;
                  border-radius: inherit;
                }

                .choice-label:hover::before {
                  left: 100%;
                }

                /* Progress circle animation */
                .progress-circle {
                  animation: slideIn 0.5s ease 0.2s backwards;
                }

                /* Button hover effects */
                .btn-navigation, .btn-next, .btn-submit {
                  position: relative;
                  overflow: hidden;
                }

                .btn-navigation::before, .btn-next::before, .btn-submit::before {
                  content: '';
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  width: 0;
                  height: 0;
                  border-radius: 50%;
                  background: rgba(255, 255, 255, 0.2);
                  transform: translate(-50%, -50%);
                  transition: width 0.6s, height 0.6s;
                  pointer-events: none;
                }

                .btn-navigation:hover::before, .btn-next:hover::before, .btn-submit:hover::before {
                  width: 300px;
                  height: 300px;
                }

                /* Smooth scrolling */
                html {
                  scroll-behavior: smooth;
                }

                /* Selection styles */
                .choice-label:has(input:checked) {
                  animation: slideIn 0.3s ease;
                }

                /* Icon animations */
                .icon-wrapper {
                  animation: slideIn 0.5s ease backwards;
                }

                /* Progress bar fill animation */
                .progress-fill {
                  animation: slideIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s backwards;
                }
              `}
            </style>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentQuizQuestion;
