import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import practiceExamsService from "../../../services/practice-exams.service";
import StudentSidebar from "../common/studentSidebar";
import ProfileCard from "../common/profileCard";
import "./practice-exams.scss";

interface WeakSkill {
  tag: string;
  percentage: number;
  correct: number;
  total: number;
}

interface WeakSkillByCourse {
  courseId: number;
  courseTitle: string;
  hasAttemptedMainQuiz: boolean;
  weakSkills: WeakSkill[];
}

interface PracticeExamResultItem {
  id: number;
  courseId: number;
  courseTitle: string;
  skillTag: string | null;
  score: number;
  maxScore: number;
  percentage: number;
  completedAt: string;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  isPassed: boolean;
}

const COURSES_PER_PAGE = 5;

const PracticeExams = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("weak-skills");
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [selectedResult, setSelectedResult] = useState<PracticeExamResultItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [weakSkillsData, setWeakSkillsData] = useState<WeakSkillByCourse[]>([]);
  const [practiceResults, setPracticeResults] = useState<PracticeExamResultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [coursesPage, setCoursesPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [answerDetails, setAnswerDetails] = useState<any>(null);
  const [loadingAnswers, setLoadingAnswers] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const weakSkillsResponse = await practiceExamsService.getWeakSkillsByCoursesForStudent();
      const resultsResponse = await practiceExamsService.getPracticeExamResults();
      setWeakSkillsData(weakSkillsResponse);
      setPracticeResults(resultsResponse);
      if (weakSkillsResponse.length > 0) {
        setSelectedCourse(weakSkillsResponse[0].courseId);
      }
    } catch (err: any) {
      setError(err.message || "خطایی رخ داد");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateExam = async (courseId: number, skillTag: string) => {
    try {
      const response = await practiceExamsService.generatePracticeExam(courseId, skillTag, 10);
      localStorage.setItem("practiceExamData", JSON.stringify({ questions: response, courseId, skillTag }));
      navigate("/student/practice-exams/take/1", { state: { courseId, skillTag } });
    } catch (err: any) {
      setError(err.message || "خطایی در ایجاد آزمون رخ داد");
    }
  };

  const selectedCourseData = weakSkillsData.find(c => c.courseId === selectedCourse);
  const paginatedCourses = weakSkillsData.slice(
    (coursesPage - 1) * COURSES_PER_PAGE,
    coursesPage * COURSES_PER_PAGE,
  );
  const totalPages = Math.ceil(weakSkillsData.length / COURSES_PER_PAGE);

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

  return (
    <div className="content mt-5">
      <div className="container">
        <ProfileCard />
        <div className="row">
          <StudentSidebar />
          <div className="col-lg-12">
            <div className="p-4">
              {/* Header - Like Analytics Page */}
              <div style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                padding: "2.5rem",
                borderRadius: "1.2rem",
                color: "white",
                marginBottom: "2rem",
                boxShadow: "0 10px 30px rgba(102, 126, 234, 0.15)"
              }}>
                <div className="d-flex align-items-center mb-3">
                  <div 
                    style={{
                      width: 60,
                      height: 60,
                      background: "rgba(255,255,255,0.2)",
                      borderRadius: "0.75rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginLeft: "1.5rem"
                    }}
                  >
                    <i className="isax isax-book-square" style={{ fontSize: 28, color: "white" }}></i>
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: "1.75rem", fontWeight: "700" }}>
                      آزمون‌های تمرینی
                    </h2>
                    <p style={{ margin: "0.5rem 0 0 0", opacity: 0.95, fontSize: "0.95rem" }}>
                      تمرین هدفمند برای تقویت مهارت‌های ضعیف شما
                    </p>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="row mt-4 g-3">
                  <div className="col-md-3">
                    <div style={{
                      background: "rgba(255,255,255,0.15)",
                      padding: "1rem",
                      borderRadius: "0.75rem",
                      backdropFilter: "blur(10px)"
                    }}>
                      <small style={{ opacity: 0.9, display: "block", marginBottom: "0.5rem" }}>
                        تمرین‌های انجام شده
                      </small>
                      <h4 style={{ margin: 0, fontSize: "1.75rem", fontWeight: "700" }}>
                        {practiceResults.length}
                      </h4>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div style={{
                      background: "rgba(255,255,255,0.15)",
                      padding: "1rem",
                      borderRadius: "0.75rem",
                      backdropFilter: "blur(10px)"
                    }}>
                      <small style={{ opacity: 0.9, display: "block", marginBottom: "0.5rem" }}>
                        مهارت‌های ضعیف
                      </small>
                      <h4 style={{ margin: 0, fontSize: "1.75rem", fontWeight: "700" }}>
                        {weakSkillsData.reduce((acc, c) => acc + c.weakSkills.length, 0)}
                      </h4>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div style={{
                      background: "rgba(255,255,255,0.15)",
                      padding: "1rem",
                      borderRadius: "0.75rem",
                      backdropFilter: "blur(10px)"
                    }}>
                      <small style={{ opacity: 0.9, display: "block", marginBottom: "0.5rem" }}>
                        میانگین نمره
                      </small>
                      <h4 style={{ margin: 0, fontSize: "1.75rem", fontWeight: "700" }}>
                        {practiceResults.length > 0 
                          ? (practiceResults.reduce((acc, r) => acc + r.percentage, 0) / practiceResults.length).toFixed(1)
                          : "0"}%
                      </h4>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div style={{
                      background: "rgba(255,255,255,0.15)",
                      padding: "1rem",
                      borderRadius: "0.75rem",
                      backdropFilter: "blur(10px)"
                    }}>
                      <small style={{ opacity: 0.9, display: "block", marginBottom: "0.5rem" }}>
                        نرخ موفقیت
                      </small>
                      <h4 style={{ margin: 0, fontSize: "1.75rem", fontWeight: "700" }}>
                        {practiceResults.length > 0
                          ? ((practiceResults.filter(r => r.isPassed).length / practiceResults.length) * 100).toFixed(0)
                          : "0"}%
                      </h4>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                  {error}
                  <button type="button" className="btn-close" onClick={() => setError(null)}></button>
                </div>
              )}

              {/* Tabs */}
              <div style={{ borderBottom: "2px solid #e9ecef", marginBottom: "2rem", display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={() => setActiveTab("weak-skills")}
                  style={{
                    padding: "1rem 1.5rem",
                    background: activeTab === "weak-skills" ? "#667eea" : "transparent",
                    color: activeTab === "weak-skills" ? "white" : "#94a3b8",
                    border: "none",
                    cursor: "pointer",
                    borderRadius: "0.5rem 0.5rem 0 0",
                    fontWeight: activeTab === "weak-skills" ? "600" : "500",
                    fontSize: "0.95rem",
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== "weak-skills") {
                      e.currentTarget.style.color = "#667eea";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== "weak-skills") {
                      e.currentTarget.style.color = "#94a3b8";
                    }
                  }}
                >
                  <i className="isax isax-target me-2"></i>
                  مهارت‌های ضعیف
                </button>
                <button
                  onClick={() => setActiveTab("results")}
                  style={{
                    padding: "1rem 1.5rem",
                    background: activeTab === "results" ? "#667eea" : "transparent",
                    color: activeTab === "results" ? "white" : "#94a3b8",
                    border: "none",
                    cursor: "pointer",
                    borderRadius: "0.5rem 0.5rem 0 0",
                    fontWeight: activeTab === "results" ? "600" : "500",
                    fontSize: "0.95rem",
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== "results") {
                      e.currentTarget.style.color = "#667eea";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== "results") {
                      e.currentTarget.style.color = "#94a3b8";
                    }
                  }}
                >
                  <i className="isax isax-chart-2 me-2"></i>
                  نتایج تمرین ({practiceResults.length})
                </button>
              </div>

              {/* Tab: Weak Skills */}
              {activeTab === "weak-skills" && (
                <div className="row">
                  <div className="col-md-4 mb-4">
                    <div className="card" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)", borderRadius: "0.75rem" }}>
                      <div className="card-body">
                        <h6 className="card-title mb-3" style={{ color: "#1e293b", fontWeight: "600" }}>
                          <i className="isax isax-book me-2"></i>
                          دوره‌ها
                        </h6>
                        {paginatedCourses.map((course) => (
                          <button
                            key={course.courseId}
                            onClick={() => setSelectedCourse(course.courseId)}
                            style={{
                              display: "block",
                              width: "100%",
                              textAlign: "right",
                              padding: "0.75rem",
                              marginBottom: "0.5rem",
                              background: selectedCourse === course.courseId ? "#667eea" : "#f8fafc",
                              color: selectedCourse === course.courseId ? "white" : "#475569",
                              border: selectedCourse === course.courseId ? "1px solid #667eea" : "1px solid #e2e8f0",
                              borderRadius: "0.5rem",
                              cursor: "pointer",
                              fontSize: "0.9rem"
                            }}
                          >
                            <div style={{ fontWeight: "500" }}>{course.courseTitle}</div>
                            <small style={{ opacity: 0.7 }}>
                              {course.weakSkills.length} مهارت ضعیف
                            </small>
                          </button>
                        ))}
                        {totalPages > 1 && (
                          <nav style={{ marginTop: "1rem" }} aria-label="pagination">
                            <ul className="pagination pagination-sm" style={{ justifyContent: "center" }}>
                              <li className={`page-item ${coursesPage === 1 ? "disabled" : ""}`}>
                                <button className="page-link" onClick={() => setCoursesPage(coursesPage - 1)}>
                                  قبلی
                                </button>
                              </li>
                              {Array.from({ length: totalPages }, (_, i) => (
                                <li key={i + 1} className={`page-item ${coursesPage === i + 1 ? "active" : ""}`}>
                                  <button className="page-link" onClick={() => setCoursesPage(i + 1)}>
                                    {i + 1}
                                  </button>
                                </li>
                              ))}
                              <li className={`page-item ${coursesPage === totalPages ? "disabled" : ""}`}>
                                <button className="page-link" onClick={() => setCoursesPage(coursesPage + 1)}>
                                  بعدی
                                </button>
                              </li>
                            </ul>
                          </nav>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-8">
                    {selectedCourseData && selectedCourseData.weakSkills.length > 0 ? (
                      <div className="row">
                        {selectedCourseData.weakSkills.map((skill) => (
                          <div key={skill.tag} className="col-md-6 mb-4">
                            <div className="card" style={{ borderLeft: "4px solid #667eea", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", borderRadius: "0.75rem" }}>
                              <div className="card-body">
                                <h6 className="card-title" style={{ color: "#1e293b", fontWeight: "600" }}>
                                  <i className="isax isax-target me-2" style={{ color: "#667eea" }}></i>
                                  {skill.tag}
                                </h6>
                                <div style={{ marginBottom: "1rem" }}>
                                  <small className="text-muted" style={{ color: "#64748b" }}>میانگین نمره: {skill.percentage}%</small>
                                  <div className="progress" style={{ height: "8px", marginTop: "0.5rem" }}>
                                    <div
                                      className="progress-bar"
                                      style={{
                                        width: `${skill.percentage}%`,
                                        background: skill.percentage < 60 ? "#ef4444" : "#667eea"
                                      }}
                                    />
                                  </div>
                                </div>
                                <small className="text-muted d-block mb-3" style={{ color: "#64748b" }}>
                                  درست: {skill.correct}/{skill.total}
                                </small>
                                <button
                                  onClick={() => handleGenerateExam(selectedCourseData.courseId, skill.tag)}
                                  style={{
                                    width: "100%",
                                    padding: "0.5rem",
                                    background: "#667eea",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "0.5rem",
                                    cursor: "pointer",
                                    fontWeight: "500",
                                    transition: "all 0.3s"
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = "#5568d3";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "#667eea";
                                  }}
                                >
                                  شروع تمرین
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="alert alert-info" style={{ background: "#f0f4ff", border: "1px solid #c7d2fe", color: "#1e40af" }}>
                        شما مهارت ضعیفی ندارید یا هنوز آزمونی انجام نداده‌اید.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab: Results */}
              {activeTab === "results" && (
                <div>
                  {practiceResults.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-hover" style={{ textAlign: "right", color: "#475569" }}>
                        <thead style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                          <tr>
                            <th style={{ color: "#64748b", fontWeight: "600" }}>دوره</th>
                            <th style={{ color: "#64748b", fontWeight: "600" }}>مهارت</th>
                            <th style={{ color: "#64748b", fontWeight: "600" }}>سوالات</th>
                            <th style={{ color: "#64748b", fontWeight: "600" }}>نمره</th>
                            <th style={{ color: "#64748b", fontWeight: "600" }}>درصد</th>
                            <th style={{ color: "#64748b", fontWeight: "600" }}>تاریخ</th>
                            <th style={{ color: "#64748b", fontWeight: "600" }}>عملیات</th>
                          </tr>
                        </thead>
                        <tbody>
                          {practiceResults.map((result) => (
                            <tr key={result.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                              <td style={{ color: "#475569" }}>{result.courseTitle}</td>
                              <td style={{ color: "#475569" }}>{result.skillTag}</td>
                              <td style={{ color: "#475569" }}>{result.totalQuestions}</td>
                              <td style={{ color: "#475569" }}>{result.score.toFixed(1)}/{result.maxScore}</td>
                              <td>
                                <div className="progress" style={{ height: "20px" }}>
                                  <div
                                    className="progress-bar"
                                    style={{
                                      width: `${result.percentage}%`,
                                      background: result.percentage >= 70 ? "#10b981" : result.percentage >= 50 ? "#f59e0b" : "#ef4444"
                                    }}
                                  >
                                    <small style={{ color: "white" }}>{result.percentage.toFixed(1)}%</small>
                                  </div>
                                </div>
                              </td>
                              <td style={{ color: "#475569" }}>{new Date(result.completedAt).toLocaleDateString("fa-IR")}</td>
                              <td>
                                <button
                                  onClick={async () => {
                                    setSelectedResult(result);
                                    setShowModal(true);
                                    // Fetch answer details
                                    try {
                                      setLoadingAnswers(true);
                                      const details = await practiceExamsService.getPracticeExamResultDetails(result.id);
                                      setAnswerDetails(details);
                                    } catch (err) {
                                      console.error(err);
                                      setError("خطایی در دریافت پاسخنامه رخ داد");
                                    } finally {
                                      setLoadingAnswers(false);
                                    }
                                  }}
                                  style={{
                                    background: "#667eea",
                                    color: "white",
                                    border: "none",
                                    padding: "0.5rem 1rem",
                                    borderRadius: "0.5rem",
                                    cursor: "pointer",
                                    fontSize: "0.85rem",
                                    fontWeight: "500",
                                    transition: "all 0.3s"
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = "#5568d3";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "#667eea";
                                  }}
                                >
                                  مشاهده
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="alert alert-warning" style={{ background: "#fffbeb", border: "1px solid #fcd34d", color: "#92400e" }}>
                      هنوز نتیجه‌ای وجود ندارد.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal - Answer Sheet */}
      {showModal && selectedResult && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            zIndex: 1050,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              maxWidth: "900px",
              width: "95%",
              maxHeight: "90vh",
              overflow: "auto",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                padding: "1.5rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  border: "none",
                  color: "white",
                  fontSize: "24px",
                  cursor: "pointer",
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                ✕
              </button>
              <h5 style={{ margin: 0, fontSize: "1.1rem" }}>پاسخنامه آزمون</h5>
            </div>

            {/* Modal Body */}
            <div id="answer-sheet-content" style={{ padding: "2rem", direction: "rtl" }}>
              {/* Header Info */}
              <div className="text-center mb-4">
                <h5 style={{ color: "#1565C0", marginBottom: "0.5rem" }}>پاسخنامه آزمون</h5>
                <p style={{ fontSize: "0.95rem", color: "#666", margin: "0.5rem 0" }}>
                  دوره: <strong>{selectedResult.courseTitle}</strong> | مهارت: <strong>{selectedResult.skillTag}</strong>
                </p>
                <p style={{ fontSize: "0.95rem", color: "#666", margin: "0.5rem 0" }}>
                  نمره: <strong>{selectedResult.score.toFixed(1)}</strong> از <strong>{selectedResult.maxScore}</strong>
                  {' | '}تعداد سوالات صحیح: <strong>{selectedResult.correctCount}</strong> از <strong>{selectedResult.totalQuestions}</strong>
                </p>
              </div>

              {/* Loading or Questions */}
              {loadingAnswers ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">درحال بارگذاری...</span>
                  </div>
                  <p style={{ color: "#666", marginTop: "1rem" }}>درحال بارگذاری پاسخنامه...</p>
                </div>
              ) : answerDetails?.questions && answerDetails.questions.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {answerDetails.questions.map((q: any, idx: number) => {
                    const isCorrect = q.isCorrect;
                    return (
                      <div
                        key={q.questionId}
                        style={{
                          padding: "1rem",
                          borderRadius: "0.75rem",
                          border: `2px solid ${isCorrect ? "#10b981" : "#ef4444"}`,
                          background: isCorrect ? "#f0fdf4" : "#fef2f2",
                        }}
                      >
                        {/* Question */}
                        <div style={{ display: "flex", alignItems: "flex-start", marginBottom: "1rem" }}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: "50%",
                              marginLeft: "0.75rem",
                              flexShrink: 0,
                              width: 28,
                              height: 28,
                              fontSize: "0.8rem",
                              fontWeight: "700",
                              color: "#fff",
                              background: isCorrect ? "#10b981" : "#ef4444",
                            }}
                          >
                            {idx + 1}
                          </span>
                          <div>
                            <p style={{ margin: 0, fontWeight: 600, fontSize: "0.95rem", color: "#1e293b" }}>
                              {q.questionText}
                            </p>
                            {q.skillTag && (
                              <span
                                style={{
                                  display: "inline-block",
                                  background: "#e0e7ff",
                                  color: "#3730a3",
                                  padding: "0.25rem 0.75rem",
                                  borderRadius: "9999px",
                                  fontSize: "0.75rem",
                                  marginTop: "0.5rem"
                                }}
                              >
                                {q.skillTag}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Choices */}
                        <div style={{ marginLeft: "2.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                          {q.choices?.map((choice: any) => {
                            const isStudentChoice = choice.id === q.studentChoiceId;
                            const isCorrectChoice = choice.isCorrect;
                            
                            let bg = "#fff";
                            let border = "#e5e7eb";
                            let textColor = "#374151";
                            
                            if (isCorrectChoice) {
                              bg = "#dcfce7";
                              border = "#86efac";
                              textColor = "#166534";
                            }
                            if (isStudentChoice && !isCorrectChoice) {
                              bg = "#fee2e2";
                              border = "#fca5a5";
                              textColor = "#991b1b";
                            }

                            return (
                              <div
                                key={choice.id}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  padding: "0.75rem",
                                  borderRadius: "0.5rem",
                                  background: bg,
                                  border: `1px solid ${border}`,
                                  color: textColor,
                                  fontSize: "0.85rem"
                                }}
                              >
                                <span style={{ marginLeft: "0.75rem" }}>
                                  {isCorrectChoice ? "✅" : isStudentChoice ? "❌" : "○"}
                                </span>
                                <span>{choice.text}</span>
                                {isStudentChoice && (
                                  <span style={{ 
                                    marginLeft: "auto",
                                    display: "inline-block",
                                    background: "#dbeafe",
                                    color: "#1e40af",
                                    padding: "0.25rem 0.5rem",
                                    borderRadius: "0.25rem",
                                    fontSize: "0.7rem",
                                    fontWeight: "500"
                                  }}>
                                    پاسخ شما
                                  </span>
                                )}
                                {isCorrectChoice && (
                                  <span style={{ 
                                    marginLeft: "auto",
                                    display: "inline-block",
                                    background: "#dcfce7",
                                    color: "#166534",
                                    padding: "0.25rem 0.5rem",
                                    borderRadius: "0.25rem",
                                    fontSize: "0.7rem",
                                    fontWeight: "500"
                                  }}>
                                    پاسخ صحیح
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ padding: "2rem", textAlign: "center", color: "#666" }}>
                  <p>پاسخنامه‌ای یافت نشد</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: "1.5rem", borderTop: "1px solid #e2e8f0", display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: "transparent",
                  border: "1px solid #cbd5e1",
                  padding: "0.6rem 1.5rem",
                  borderRadius: "6px",
                  cursor: "pointer",
                  color: "#475569",
                  fontWeight: "500",
                  transition: "all 0.3s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f1f5f9";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                بستن
              </button>
              <button
                onClick={() => {
                  if (answerDetails) {
                    const el = document.getElementById("answer-sheet-content");
                    if (!el) return;
                    import("html2canvas").then(({ default: html2canvas }) => {
                      html2canvas(el).then((canvas) => {
                        const link = document.createElement("a");
                        link.download = `pasokhnameh-${selectedResult.id}.png`;
                        link.href = canvas.toDataURL("image/png");
                        link.click();
                      });
                    });
                  }
                }}
                style={{
                  background: "#667eea",
                  color: "white",
                  border: "none",
                  padding: "0.6rem 1.5rem",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "500",
                  transition: "all 0.3s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#5568d3";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#667eea";
                }}
              >
                <i className="isax isax-import me-2"></i>
                دانلود پاسخنامه
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PracticeExams;
