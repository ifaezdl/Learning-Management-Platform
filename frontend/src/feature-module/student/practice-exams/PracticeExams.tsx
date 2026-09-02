import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import practiceExamsService from "../../../services/practice-exams.service";
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
  allCourseSkills: string[];
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
  title: string;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  isPassed: boolean;
}

interface GeneratingState {
  isGenerating: boolean;
  courseId: number | null;
  skillTag: string | null;
}

const COURSES_PER_PAGE = 5;

const PracticeExams = () => {
  const navigate = useNavigate();

  // State management
  const [activeTab, setActiveTab] = useState<"weak-skills" | "results">(
    "weak-skills",
  );
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [weakSkillsData, setWeakSkillsData] = useState<WeakSkillByCourse[]>([]);
  const [practiceResults, setPracticeResults] = useState<
    PracticeExamResultItem[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<GeneratingState>({
    isGenerating: false,
    courseId: null,
    skillTag: null,
  });
  const [coursesPage, setCoursesPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load weak skills
      const weakSkillsResponse =
        await practiceExamsService.getWeakSkillsByCoursesForStudent();
      setWeakSkillsData(weakSkillsResponse);

      // Load practice exam results
      const resultsResponse =
        await practiceExamsService.getPracticeExamResults();
      setPracticeResults(resultsResponse);

      // Set default selected course
      if (weakSkillsResponse.length > 0) {
        setSelectedCourse(weakSkillsResponse[0].courseId);
      }
    } catch (err: any) {
      setError(err.message || "خطایی در بارگذاری داده‌ها رخ داد");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePracticeExam = async (
    courseId: number,
    skillTag: string,
  ) => {
    try {
      setGenerating({ isGenerating: true, courseId, skillTag });
      setError(null);

      const response = await practiceExamsService.generatePracticeExam(
        courseId,
        skillTag,
        10,
      );

      // Store in localStorage for use in PracticeExamTake
      localStorage.setItem(
        "practiceExamData",
        JSON.stringify({
          questions: response,
          courseId,
          skillTag,
        }),
      );

      // Navigate to practice exam page
      navigate("/student/practice-exams/take/1", {
        state: { courseId, skillTag },
      });
    } catch (err: any) {
      setError(err.message || "خطایی در ایجاد آزمون تمرینی رخ داد");
      console.error(err);
    } finally {
      setGenerating({ isGenerating: false, courseId: null, skillTag: null });
    }
  };

  const selectedCourseData = weakSkillsData.find(
    (c) => c.courseId === selectedCourse,
  );

  // Pagination
  const paginatedCourses = weakSkillsData.slice(
    (coursesPage - 1) * COURSES_PER_PAGE,
    coursesPage * COURSES_PER_PAGE,
  );
  const totalPages = Math.ceil(weakSkillsData.length / COURSES_PER_PAGE);

  if (loading) {
    return (
      <div className="container-fluid mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">درحال بارگذاری...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="practice-exams-header mb-4">
        <h2>
          <i className="isax isax-book-square me-2"></i>
          آزمون‌های تمرینی
        </h2>
        <p>آزمون‌های تمرینی برای تقویت مهارت‌های ضعیف شما</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show">
          <i className="isax isax-close-circle me-2"></i>
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError(null)}
          ></button>
        </div>
      )}

      {/* Tabs */}
      <ul className="nav nav-tabs practice-exams-tabs mb-4" role="tablist">
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === "weak-skills" ? "active" : ""}`}
            onClick={() => setActiveTab("weak-skills")}
          >
            <i className="isax isax-target me-2"></i>
            مهارت‌های ضعیف
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === "results" ? "active" : ""}`}
            onClick={() => setActiveTab("results")}
          >
            <i className="isax isax-chart-2 me-2"></i>
            نتایج تمرین
            <span className="badge bg-primary ms-2">{practiceResults.length}</span>
          </button>
        </li>
      </ul>

      {/* Weak Skills Tab */}
      {activeTab === "weak-skills" && (
        <div className="row">
          {/* Courses List */}
          <div className="col-lg-3 mb-4">
            <div className="card h-100">
              <div className="card-body">
                <h6 className="card-title mb-3">
                  <i className="isax isax-book me-2"></i>
                  دوره‌ها
                </h6>
                <div className="course-list">
                  {paginatedCourses.map((course) => (
                    <button
                      key={course.courseId}
                      className={`list-group-item list-group-item-action text-end ${
                        selectedCourse === course.courseId ? "active" : ""
                      }`}
                      onClick={() => {
                        setSelectedCourse(course.courseId);
                        setCoursesPage(1);
                      }}
                    >
                      <small className="text-muted">
                        {course.hasAttemptedMainQuiz ? (
                          <i className="isax isax-tick-circle text-success me-1"></i>
                        ) : (
                          <i className="isax isax-info-circle text-warning me-1"></i>
                        )}
                      </small>
                      <div className="text-truncate">{course.courseTitle}</div>
                      <small className="text-muted d-block mt-1">
                        {course.weakSkills.length > 0
                          ? `${course.weakSkills.length} مهارت ضعیف`
                          : "مهارت‌های ضعیف ندارد"}
                      </small>
                    </button>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-3 pt-3 border-top">
                    <nav aria-label="Page navigation">
                      <ul className="pagination pagination-sm mb-0">
                        <li
                          className={`page-item ${
                            coursesPage === 1 ? "disabled" : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() =>
                              setCoursesPage(Math.max(1, coursesPage - 1))
                            }
                            disabled={coursesPage === 1}
                          >
                            قبلی
                          </button>
                        </li>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                          (page) => (
                            <li
                              key={page}
                              className={`page-item ${
                                coursesPage === page ? "active" : ""
                              }`}
                            >
                              <button
                                className="page-link"
                                onClick={() => setCoursesPage(page)}
                              >
                                {page}
                              </button>
                            </li>
                          ),
                        )}
                        <li
                          className={`page-item ${
                            coursesPage === totalPages ? "disabled" : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() =>
                              setCoursesPage(
                                Math.min(totalPages, coursesPage + 1),
                              )
                            }
                            disabled={coursesPage === totalPages}
                          >
                            بعدی
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Skills Details */}
          <div className="col-lg-9">
            {selectedCourseData && selectedCourseData.weakSkills.length > 0 ? (
              <div>
                <div className="row">
                  {selectedCourseData.weakSkills.map((skill) => (
                    <div key={skill.tag} className="col-md-6 mb-4">
                      <div className="card skill-card">
                        <div className="card-body">
                          <h6 className="card-title">
                            <i className="isax isax-target me-2"></i>
                            {skill.tag}
                          </h6>

                          <div className="mb-3">
                            <small className="text-muted d-block mb-1">
                              میانگین نمره:
                            </small>
                            <div className="progress">
                              <div
                                className="progress-bar"
                                style={{
                                  width: `${Math.min(skill.percentage, 100)}%`,
                                }}
                              >
                                {skill.percentage.toFixed(1)}%
                              </div>
                            </div>
                          </div>

                          <small className="text-muted d-block mb-2">
                            پاسخ‌های درست: {skill.correct} / {skill.total}
                          </small>

                          <button
                            className="btn btn-primary btn-sm w-100"
                            onClick={() =>
                              handleGeneratePracticeExam(
                                selectedCourseData.courseId,
                                skill.tag,
                              )
                            }
                            disabled={
                              generating.isGenerating &&
                              generating.courseId === selectedCourseData.courseId &&
                              generating.skillTag === skill.tag
                            }
                          >
                            {generating.isGenerating &&
                            generating.courseId === selectedCourseData.courseId &&
                            generating.skillTag === skill.tag ? (
                              <>
                                <span
                                  className="spinner-border spinner-border-sm me-2"
                                  role="status"
                                  aria-hidden="true"
                                ></span>
                                درحال ایجاد...
                              </>
                            ) : (
                              <>
                                <i className="isax isax-play-circle me-2"></i>
                                شروع تمرین
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="alert alert-info">
                <i className="isax isax-info-circle me-2"></i>
                <strong>خوب‌خبری!</strong> شما هیچ مهارت ضعیفی ندارید یا هنوز
                هیچ آزمونی را شرکت نکرده‌اید.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Results Tab */}
      {activeTab === "results" && (
        <div className="row">
          <div className="col-12">
            {practiceResults.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr className="text-end">
                      <th>دوره</th>
                      <th>مهارت</th>
                      <th>تعداد سوالات</th>
                      <th>نمره</th>
                      <th>درصد</th>
                      <th>تاریخ تمرین</th>
                      <th>عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {practiceResults.map((result) => (
                      <tr key={result.id} className="text-end">
                        <td>
                          <small>{result.courseTitle}</small>
                        </td>
                        <td>
                          <small>{result.skillTag || "نامشخص"}</small>
                        </td>
                        <td>
                          <small>{result.totalQuestions}</small>
                        </td>
                        <td>
                          <small>
                            {result.score.toFixed(1)} / {result.maxScore}
                          </small>
                        </td>
                        <td>
                          <div className="progress" style={{ height: "20px" }}>
                            <div
                              className={`progress-bar ${
                                result.percentage >= 70
                                  ? "bg-success"
                                  : result.percentage >= 50
                                    ? "bg-warning"
                                    : "bg-danger"
                              }`}
                              style={{ width: `${result.percentage}%` }}
                            >
                              <small>{result.percentage.toFixed(1)}%</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <small>
                            {new Date(result.completedAt).toLocaleDateString(
                              "fa-IR",
                            )}
                          </small>
                        </td>
                        <td>
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() =>
                              navigate(
                                `/student/practice-exams/result/${result.id}`,
                              )
                            }
                          >
                            <i className="isax isax-eye"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="alert alert-warning">
                <i className="isax isax-info-circle me-2"></i>
                هنوز هیچ آزمون تمرینی تکمیل نشده‌ای ندارید.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PracticeExams;
