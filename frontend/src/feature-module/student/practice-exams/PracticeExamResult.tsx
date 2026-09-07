import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import practiceExamsService from "../../../services/practice-exams.service";
import StudentSidebar from "../common/studentSidebar";
import ProfileCard from "../common/profileCard";
import "./practice-exams.scss";

interface ResultQuestion {
  questionId: number;
  questionText: string;
  skillTag: string;
  isCorrect: boolean;
  studentChoiceId: number | null;
  choices: Array<{
    id: number;
    text: string;
    isCorrect: boolean;
  }>;
}

interface PracticeExamResultDetails {
  id: number;
  courseId: number;
  courseTitle: string;
  skillTag: string | null;
  score: number;
  maxScore: number;
  percentage: number;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  isPassed: boolean;
  completedAt: string;
  questions: ResultQuestion[];
}

const PracticeExamResult = () => {
  const { resultId } = useParams<{ resultId: string }>();
  const navigate = useNavigate();

  const [result, setResult] = useState<PracticeExamResultDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  const [showAnswerSheet, setShowAnswerSheet] = useState(false);

  useEffect(() => {
    loadResult();
  }, [resultId]);

  const loadResult = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!resultId) {
        setError("شناسه نتیجه یافت نشد");
        return;
      }

      const resultData =
        await practiceExamsService.getPracticeExamResultDetails(
          Number(resultId),
        );
      setResult(resultData);
    } catch (err: any) {
      console.error("Error loading result:", err);
      setError(err.message || "خطا در بارگذاری نتایج. لطفاً دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="content mt-5">
        <div className="container text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">درحال بارگذاری...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content mt-5">
        <div className="container">
          <div className="alert alert-danger" role="alert">
            <i className="isax isax-close-circle me-2"></i>
            <strong>خطا:</strong> {error}
          </div>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/student/practice-exams")}
          >
            <i className="isax isax-arrow-left me-2"></i>
            بازگشت به آزمون‌های تمرینی
          </button>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="content mt-5">
        <div className="container">
          <div className="alert alert-warning" role="alert">
            <i className="isax isax-info-circle me-2"></i>
            نتیجه یافت نشد
          </div>
        </div>
      </div>
    );
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "#28a745"; // سبز - عالی
    if (percentage >= 70) return "#17a2b8"; // آبی - خوب
    if (percentage >= 60) return "#ffc107"; // زرد - متوسط
    return "#dc3545"; // قرمز - ضعیف
  };

  const getStatusText = (percentage: number) => {
    if (percentage >= 80) return "عالی! 🎉";
    if (percentage >= 70) return "خوب! 👍";
    if (percentage >= 60) return "متوسط 😐";
    return "نیاز به تلاش بیشتر 💪";
  };

  const getStudentAnswerText = (question: ResultQuestion): string => {
    if (question.studentChoiceId === null) {
      return "بدون پاسخ";
    }
    const studentChoice = question.choices.find(
      (c) => c.id === question.studentChoiceId,
    );
    return studentChoice ? studentChoice.text : "نامشخص";
  };

  const getCorrectAnswerText = (question: ResultQuestion): string => {
    const correctChoice = question.choices.find((c) => c.isCorrect);
    return correctChoice ? correctChoice.text : "نامشخص";
  };

  return (
    <div className="content mt-5">
      <div className="container">
        <ProfileCard />
        <div className="row">
          <StudentSidebar />
          <div className="col-lg-12">
            <div className="p-4">
              {/* Header */}
              <div
                style={{
                  background: `linear-gradient(135deg, ${
                    result.isPassed ? "#667eea" : "#f85032"
                  } 0%, ${result.isPassed ? "#764ba2" : "#e73c1f"} 100%)`,
                  padding: "2.5rem",
                  borderRadius: "1.2rem",
                  color: "white",
                  marginBottom: "2rem",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                }}
              >
                <div className="text-center mb-4">
                  <h2
                    style={{ fontSize: "2rem", fontWeight: "700", margin: 0 }}
                  >
                    {getStatusText(result.percentage)}
                  </h2>
                  <p style={{ margin: "0.5rem 0 0 0", opacity: 0.95 }}>
                    {result.courseTitle}
                  </p>
                </div>

                {/* Score Circle */}
                <div className="text-center mb-4">
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "120px",
                      height: "120px",
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.2)",
                      fontSize: "2.5rem",
                      fontWeight: "700",
                      color: "#fff",
                      position: "relative",
                    }}
                  >
                    {result.percentage}%
                  </div>
                </div>

                {/* Stats */}
                <div className="row g-3">
                  <div className="col-md-3">
                    <div
                      style={{
                        background: "rgba(255,255,255,0.15)",
                        padding: "1rem",
                        borderRadius: "0.75rem",
                        backdropFilter: "blur(10px)",
                        textAlign: "center",
                      }}
                    >
                      <small style={{ opacity: 0.9, display: "block" }}>
                        نمره
                      </small>
                      <h5 style={{ margin: "0.5rem 0 0 0", color: "#fff" }}>
                        {result.score} / {result.maxScore}
                      </h5>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div
                      style={{
                        background: "rgba(255,255,255,0.15)",
                        padding: "1rem",
                        borderRadius: "0.75rem",
                        backdropFilter: "blur(10px)",
                        textAlign: "center",
                      }}
                    >
                      <small style={{ opacity: 0.9, display: "block" }}>
                        صحیح
                      </small>
                      <h5 style={{ margin: "0.5rem 0 0 0", color: "#fff" }}>
                        {result.correctCount}
                      </h5>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div
                      style={{
                        background: "rgba(255,255,255,0.15)",
                        padding: "1rem",
                        borderRadius: "0.75rem",
                        backdropFilter: "blur(10px)",
                        textAlign: "center",
                      }}
                    >
                      <small style={{ opacity: 0.9, display: "block" }}>
                        غلط
                      </small>
                      <h5 style={{ margin: "0.5rem 0 0 0", color: "#fff" }}>
                        {result.wrongCount}
                      </h5>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div
                      style={{
                        background: "rgba(255,255,255,0.15)",
                        padding: "1rem",
                        borderRadius: "0.75rem",
                        backdropFilter: "blur(10px)",
                        textAlign: "center",
                      }}
                    >
                      <small style={{ opacity: 0.9, display: "block" }}>
                        وضعیت
                      </small>
                      <h5 style={{ margin: "0.5rem 0 0 0", color: "#fff" }}>
                        {result.isPassed ? "✅ قبول" : "❌ رد"}
                      </h5>
                    </div>
                  </div>
                </div>

                {/* Skill Tag */}
                {result.skillTag && (
                  <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
                    <span
                      style={{
                        background: "rgba(255,255,255,0.2)",
                        padding: "0.5rem 1rem",
                        borderRadius: "2rem",
                        fontSize: "0.9rem",
                      }}
                    >
                      مهارت: <strong>{result.skillTag}</strong>
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="d-flex gap-2 mb-4 d-flex justify-content-between">
                <button
                  className="btn btn-outline-secondary d-flex align-items-center"
                  onClick={() => navigate("/student/practice-exams")}
                >
                  <i className="isax isax-arrow-right me-2"></i>
                  بازگشت
                </button>
                <button
                  className={`btn ${
                    showAnswerSheet ? "btn-primary" : "btn-outline-primary"
                  }`}
                  onClick={() => setShowAnswerSheet(!showAnswerSheet)}
                >
                  <i className="isax isax-document me-2"></i>
                  {showAnswerSheet ? "مخفی کردن" : "نمایش"} پاسخنامه
                </button>
              </div>

              {/* Answer Sheet */}
              {showAnswerSheet && (
                <div className="card mb-4">
                  <div className="card-header bg-light">
                    <h6 className="mb-0">
                      <i className="isax isax-document-text me-2"></i>
                      پاسخنامه تفصیلی
                    </h6>
                  </div>
                  <div className="card-body">
                    {result.questions.map((question, index) => (
                      <div
                        key={question.questionId}
                        className="mb-4 pb-4 border-bottom"
                        style={{ display: index === 0 ? "block" : "block" }}
                      >
                        {/* Question Header */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "start",
                            marginBottom: "1rem",
                            cursor: "pointer",
                          }}
                          onClick={() =>
                            setExpandedQuestion(
                              expandedQuestion === index ? null : index,
                            )
                          }
                        >
                          <div style={{ flex: 1 }}>
                            <h6 className="mb-2">
                              <span className="badge bg-primary me-2">
                                سوال {index + 1}
                              </span>
                              {question.skillTag && (
                                <span
                                  className="badge bg-info"
                                  style={{ marginRight: "0.5rem" }}
                                >
                                  {question.skillTag}
                                </span>
                              )}
                            </h6>
                            <p className="mb-0 text-end fs-6">
                              {question.questionText}
                            </p>
                          </div>
                          <div style={{ marginLeft: "1rem" }}>
                            <span
                              className={`badge ${
                                question.isCorrect ? "bg-success" : "bg-danger"
                              } fs-6 py-2 px-3`}
                            >
                              {question.isCorrect ? "✅ صحیح" : "❌ غلط"}
                            </span>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {expandedQuestion === index && (
                          <div
                            style={{
                              background: "#f8f9fa",
                              padding: "1rem",
                              borderRadius: "0.5rem",
                              marginTop: "1rem",
                            }}
                          >
                            {/* Student Answer */}
                            <div className="mb-3">
                              <label
                                style={{
                                  fontWeight: "600",
                                  color: "#495057",
                                  display: "block",
                                  marginBottom: "0.5rem",
                                }}
                              >
                                پاسخ شما:
                              </label>
                              <div
                                style={{
                                  padding: "0.75rem",
                                  background: question.isCorrect
                                    ? "#d4edda"
                                    : "#f8d7da",
                                  border: `1px solid ${
                                    question.isCorrect ? "#c3e6cb" : "#f5c6cb"
                                  }`,
                                  borderRadius: "0.25rem",
                                  color: question.isCorrect
                                    ? "#155724"
                                    : "#721c24",
                                  textAlign: "right",
                                }}
                              >
                                {getStudentAnswerText(question)}
                              </div>
                            </div>

                            {/* Correct Answer */}
                            {!question.isCorrect && (
                              <div className="mb-3">
                                <label
                                  style={{
                                    fontWeight: "600",
                                    color: "#495057",
                                    display: "block",
                                    marginBottom: "0.5rem",
                                  }}
                                >
                                  پاسخ صحیح:
                                </label>
                                <div
                                  style={{
                                    padding: "0.75rem",
                                    background: "#d4edda",
                                    border: "1px solid #c3e6cb",
                                    borderRadius: "0.25rem",
                                    color: "#155724",
                                    textAlign: "right",
                                  }}
                                >
                                  {getCorrectAnswerText(question)}
                                </div>
                              </div>
                            )}

                            {/* All Choices */}
                            <div>
                              <label
                                style={{
                                  fontWeight: "600",
                                  color: "#495057",
                                  display: "block",
                                  marginBottom: "0.5rem",
                                }}
                              >
                                تمام گزینه‌ها:
                              </label>
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "0.5rem",
                                }}
                              >
                                {question.choices.map((choice) => (
                                  <div
                                    key={choice.id}
                                    style={{
                                      padding: "0.5rem 0.75rem",
                                      background:
                                        choice.isCorrect && question.isCorrect
                                          ? "#d4edda"
                                          : choice.isCorrect
                                            ? "#fff3cd"
                                            : choice.id ===
                                                question.studentChoiceId
                                              ? "#f8d7da"
                                              : "#fff",
                                      border: `1px solid ${
                                        choice.isCorrect ? "#c3e6cb" : "#dee2e6"
                                      }`,
                                      borderRadius: "0.25rem",
                                      cursor: "default",
                                      textAlign: "right",
                                    }}
                                  >
                                    <span style={{ marginRight: "0.5rem" }}>
                                      {choice.isCorrect && "✅"}
                                      {choice.id === question.studentChoiceId &&
                                        !choice.isCorrect &&
                                        "❌"}
                                    </span>
                                    {choice.text}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="card">
                <div className="card-header bg-light">
                  <h6 className="mb-0">خلاصه نتایج</h6>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <p>
                        <strong>دوره:</strong> {result.courseTitle}
                      </p>
                      {result.skillTag && (
                        <p>
                          <strong>مهارت:</strong> {result.skillTag}
                        </p>
                      )}
                    </div>
                    <div className="col-md-6 mb-3">
                      <p>
                        <strong>تاریخ تکمیل:</strong>{" "}
                        {new Date(result.completedAt).toLocaleDateString(
                          "fa-IR",
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <p>
                        <strong>تعداد سوالات:</strong> {result.totalQuestions}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <p>
                        <strong>وضعیت:</strong>{" "}
                        {result.isPassed ? (
                          <span className="badge bg-success">قبول ✅</span>
                        ) : (
                          <span className="badge bg-danger">رد ❌</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeExamResult;
