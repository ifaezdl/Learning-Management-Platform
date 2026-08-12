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

  if (result) {
    return (
      <div className="content mt-5">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <StudentSidebar />
            <div className="col-lg-9">
              <div className="page-title d-flex align-items-center justify-content-between">
                <h5>My Quiz Attempts</h5>
              </div>
              <div className="card">
                <div className="card-body">
                  <div className="text-center mb-3">
                    <h6 className="mb-1">
                      {result.isPassed
                        ? "Congratulations! You Passed"
                        : "Sorry, You Didn't Pass This Time"}
                    </h6>
                    <p className="fs-14">
                      نمره شما: {result.score} از {result.maxScore} — پاسخ صحیح:{" "}
                      {result.correctCount} از {result.totalQuestions}
                    </p>
                  </div>
                  <div className="d-flex align-items-center justify-content-center">
                    <Link
                      to={route.studentDashboard}
                      className="btn btn-secondary rounded-pill"
                    >
                      <i className="isax isax-arrow-left-2 me-1 fs-10" />
                      Back to Dashboard
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="content mt-5">
      <div className="container">
        <ProfileCard />
        <div className="row">
          <StudentSidebar />
          <div className="col-lg-9">
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
                            Quiz Progress
                          </span>
                          <span>
                            Question {currentIndex + 1} out of{" "}
                            {questions.length}
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
                    <i className="isax isax-arrow-left-2 me-1 fs-10" />
                    Previous
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
                    {submitting ? "در حال ثبت..." : "Finish"}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-secondary rounded-pill"
                    onClick={() => setCurrentIndex((i) => i + 1)}
                  >
                    Next
                    <i className="isax isax-arrow-right-3 ms-1 fs-10" />
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
