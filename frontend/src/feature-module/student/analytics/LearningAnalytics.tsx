import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import StudentSidebar from "../common/studentSidebar";
import ProfileCard from "../common/profileCard";
import analyticsService, {
  SkillStat,
  QuizScorePoint,
  CompletionPoint,
} from "../../../services/analytics.service";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface CourseOption {
  id: number;
  title: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatDate(d: string | Date): string {
  return new Date(d).toLocaleDateString("fa-IR", {
    month: "short",
    day: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Weak-skills textual summary
// ---------------------------------------------------------------------------
function WeakSkillsSummary({ skills }: { skills: SkillStat[] }) {
  // Only show skills below 70% mastery threshold
  const weakSkills = skills.filter((s) => s.percentage < 70);
  const weakest = weakSkills.slice(0, 3);
  if (weakest.length === 0) return null;
  return (
    <div
      className="card border-0 shadow-sm mb-4"
      style={{
        background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
        border: "2px solid #fed7aa !important",
      }}
    >
      <div className="card-body p-4">
        <div className="d-flex align-items-start">
          <div
            className="d-flex align-items-center justify-content-center rounded-3 me-3 flex-shrink-0"
            style={{
              width: 48,
              height: 48,
              background: "linear-gradient(135deg, #f97316 0%, #fb923c 100%)",
            }}
          >
            <i className="isax isax-warning-2 text-white" style={{ fontSize: 22 }} />
          </div>
          <div className="flex-grow-1" style={{ direction: "rtl" }}>
            <h6 className="mb-2 fw-bold" style={{ color: "#c2410c" }}>
              <i className="isax isax-book me-1" />
              نیاز به مرور بیشتر در:
            </h6>
            <div className="d-flex flex-wrap gap-2">
              {weakest.map((s) => (
                <span
                  key={s.tag}
                  className="badge px-3 py-2"
                  style={{
                    background: "#fff",
                    color: "#ea580c",
                    border: "1px solid #fed7aa",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  <i className="isax isax-tag-2 me-1" style={{ fontSize: 11 }} />
                  {s.tag}
                  <span className="ms-1 opacity-75">({s.percentage}٪)</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Radar chart — skill gap
// ---------------------------------------------------------------------------
function SkillRadarChart({ skills }: { skills: SkillStat[] }) {
  if (skills.length === 0) {
    return (
      <div className="text-center py-5 text-muted">
        داده‌ای برای نمایش وجود ندارد.
      </div>
    );
  }

  const options: ApexOptions = {
    chart: {
      type: "radar",
      toolbar: { show: false },
      fontFamily: "inherit",
      dropShadow: {
        enabled: true,
        blur: 4,
        left: 0,
        top: 0,
        opacity: 0.1,
      },
    },
    xaxis: {
      categories: skills.map((s) => s.tag),
      labels: {
        style: {
          colors: Array(skills.length).fill("#64748b"),
          fontSize: "13px",
          fontWeight: 600,
        },
      },
    },
    yaxis: {
      min: 0,
      max: 100,
      tickAmount: 5,
      labels: {
        style: {
          colors: "#94a3b8",
          fontSize: "12px",
        },
        formatter: (val: number) => `${val}٪`,
      },
    },
    fill: {
      opacity: 0.25,
      colors: ["#7c3aed"],
    },
    stroke: {
      width: 3,
      colors: ["#7c3aed"],
    },
    markers: {
      size: 5,
      colors: ["#7c3aed"],
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 7,
      },
    },
    colors: ["#7c3aed"],
    tooltip: {
      y: {
        formatter: (val: number) => `${val}٪ تسلط`,
      },
      style: {
        fontSize: "13px",
      },
    },
    plotOptions: {
      radar: {
        size: 140,
        polygons: {
          strokeColors: "#e2e8f0",
          strokeWidth: "1",
          fill: {
            colors: ["#f8fafc", "#ffffff"],
          },
        },
      },
    },
    legend: {
      show: true,
      position: "bottom",
      fontSize: "13px",
      fontWeight: 500,
      markers: {
        size: 12,
      },
    },
  };

  const series = [
    {
      name: "درصد تسلط",
      data: skills.map((s) => s.percentage),
    },
  ];

  return (
    <ReactApexChart
      type="radar"
      options={options}
      series={series}
      height={480}
    />
  );
}

// ---------------------------------------------------------------------------
// Line chart — progress trend
// ---------------------------------------------------------------------------
function ProgressTrendChart({
  quizScores,
  courseCompletion,
}: {
  quizScores: QuizScorePoint[];
  courseCompletion: CompletionPoint[];
}) {
  const hasData = quizScores.length > 0 || courseCompletion.length > 0;

  if (!hasData) {
    return (
      <div className="text-center py-5 text-muted">
        داده‌ای برای نمایش وجود ندارد.
      </div>
    );
  }

  const options: ApexOptions = {
    chart: {
      type: "line",
      toolbar: { show: false },
      fontFamily: "inherit",
      zoom: { enabled: false },
      animations: {
        enabled: true,
        speed: 800,
      },
      dropShadow: {
        enabled: true,
        blur: 3,
        opacity: 0.1,
      },
    },
    stroke: {
      curve: "smooth",
      width: [4, 4],
    },
    colors: ["#7c3aed", "#10b981"],
    xaxis: {
      type: "category",
      categories: (() => {
        const all = [
          ...quizScores.map((p) => formatDate(p.date)),
          ...courseCompletion.map((p) => formatDate(p.date)),
        ];
        return all.filter((v, i, arr) => arr.indexOf(v) === i);
      })(),
      labels: {
        rotate: -30,
        style: {
          fontSize: "12px",
          colors: "#64748b",
          fontWeight: 500,
        },
      },
      axisBorder: {
        show: true,
        color: "#e2e8f0",
      },
      axisTicks: {
        show: true,
        color: "#e2e8f0",
      },
    },
    yaxis: {
      min: 0,
      max: 100,
      tickAmount: 5,
      labels: {
        formatter: (v) => `${v}٪`,
        style: {
          colors: "#64748b",
          fontSize: "12px",
          fontWeight: 500,
        },
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (val: number) => `${val ?? 0}٪`,
      },
      style: {
        fontSize: "13px",
      },
      x: {
        show: true,
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      fontFamily: "inherit",
      fontSize: "13px",
      fontWeight: 600,
      markers: {
        size: 12,
      },
      itemMargin: {
        horizontal: 10,
      },
    },
    markers: {
      size: 6,
      strokeWidth: 2,
      strokeColors: "#fff",
      hover: {
        size: 8,
      },
    },
    grid: {
      borderColor: "#f1f5f9",
      strokeDashArray: 3,
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
      padding: {
        top: 0,
        right: 10,
        bottom: 0,
        left: 10,
      },
    },
    dataLabels: { enabled: false },
  };

  const series = [
    {
      name: "نمره آزمون",
      data: quizScores.map((p) => ({
        x: formatDate(p.date),
        y: p.percentage,
      })),
    },
    {
      name: "پیشرفت دوره",
      data: courseCompletion.map((p) => ({
        x: formatDate(p.date),
        y: p.percentage,
      })),
    },
  ];

  return (
    <ReactApexChart
      type="line"
      options={options}
      series={series}
      height={480}
    />
  );
}

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------
const LearningAnalytics: React.FC = () => {
  const [skills, setSkills] = useState<SkillStat[]>([]);
  const [quizScores, setQuizScores] = useState<QuizScorePoint[]>([]);
  const [courseCompletion, setCourseCompletion] = useState<CompletionPoint[]>(
    [],
  );
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | undefined>(
    undefined,
  );
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [loadingTrend, setLoadingTrend] = useState(true);

  // Extract unique courses from the trend data for the filter dropdown — populated via the enrolled-courses fetch below.

  const fetchSkills = async (courseId?: number) => {
    setLoadingSkills(true);
    try {
      const data = await analyticsService.getMySkillProfile(courseId);
      setSkills(data.skills);
    } catch {
      setSkills([]);
    } finally {
      setLoadingSkills(false);
    }
  };

  const fetchTrend = async (courseId?: number) => {
    setLoadingTrend(true);
    try {
      const data = await analyticsService.getProgressTrend(courseId);
      setQuizScores(data.quizScores);
      setCourseCompletion(data.courseCompletion);

      // Build course options from trend response (first fetch only)
      if (!courseId) {
        // Course options are fetched separately via getEnrolledCourses()
      }
    } catch {
      setQuizScores([]);
      setCourseCompletion([]);
    } finally {
      setLoadingTrend(false);
    }
  };

  // Fetch enrolled courses once for the filter dropdown
  useEffect(() => {
    import("../../../services/course.service").then(({ default: cs }) => {
      cs.getEnrolledCourses()
        .then((enrolled) => {
          setCourses(
            enrolled.map((c) => ({ id: c.Id, title: c.Title })),
          );
        })
        .catch(() => setCourses([]));
    });
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchSkills();
    fetchTrend();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value ? Number(e.target.value) : undefined;
    setSelectedCourse(val);
    fetchSkills(val);
    fetchTrend(val);
  };

  return (
    <div className="content mt-5">
      <div className="container">
        <ProfileCard />
        <div className="row">
          <StudentSidebar />
          <div className="col-lg-12">
            {/* Page header + course filter */}
            <div
              className="card shadow-sm border-0 mb-4"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
            >
              <div className="card-body p-4">
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                  <div className="d-flex align-items-center">
                    <div
                      className="d-flex align-items-center justify-content-center rounded-3 me-3"
                      style={{
                        width: 56,
                        height: 56,
                        background: "rgba(255,255,255,0.2)",
                        backdropFilter: "blur(10px)",
                      }}
                    >
                      <i className="isax isax-chart-2 text-white" style={{ fontSize: 28 }} />
                    </div>
                    <div>
                      <h4 className="mb-1 text-white fw-bold">
                        داشبورد تحلیل یادگیری
                      </h4>
                      <p className="mb-0 text-white-50 small">
                        تحلیل جامع عملکرد و پیشرفت تحصیلی شما
                      </p>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <label
                      htmlFor="courseFilter"
                      className="mb-0 text-white small fw-semibold"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      <i className="isax isax-filter me-1" />
                      فیلتر دوره:
                    </label>
                    <select
                      id="courseFilter"
                      className="form-select"
                      style={{
                        minWidth: 200,
                        background: "rgba(255,255,255,0.95)",
                        border: "none",
                        fontWeight: 500,
                      }}
                      value={selectedCourse ?? ""}
                      onChange={handleCourseChange}
                    >
                      <option value="">همه دوره‌ها</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Weak skills summary text */}
            {!loadingSkills && skills.length > 0 && (
              <WeakSkillsSummary skills={skills} />
            )}

            <div className="row">
              {/* ---- Radar chart ---- */}
              <div className="col-xl-6 col-lg-12 mb-4">
                <div className="card h-100 shadow-sm border-0">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center mb-3">
                      <div
                        className="d-flex align-items-center justify-content-center rounded-3 me-3"
                        style={{
                          width: 48,
                          height: 48,
                          background: "linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)",
                        }}
                      >
                        <i className="isax isax-diagram text-white" style={{ fontSize: 20 }} />
                      </div>
                      <div>
                        <h5 className="card-title mb-1">تحلیل شکاف مهارتی</h5>
                        <p className="text-muted small mb-0">
                          درصد تسلط به تفکیک مهارت در آزمون‌های شرکت‌شده
                        </p>
                      </div>
                    </div>
                    {loadingSkills ? (
                      <div className="text-center py-5">
                        <div className="spinner-border spinner-border-sm text-primary" />
                        <span className="ms-2 small text-muted">
                          در حال بارگذاری...
                        </span>
                      </div>
                    ) : (
                      <>
                        <SkillRadarChart skills={skills} />
                        {/* Skill legend table below radar */}
                        {skills.length > 0 && (
                          <div className="mt-4">
                            <div className="table-responsive">
                              <table className="table table-sm table-hover align-middle mb-0">
                                <thead className="table-light">
                                  <tr>
                                    <th className="border-0 px-3 py-2">
                                      <i className="isax isax-tag-2 me-1" />
                                      مهارت
                                    </th>
                                    <th className="text-center border-0 px-3 py-2">صحیح</th>
                                    <th className="text-center border-0 px-3 py-2">کل</th>
                                    <th className="text-center border-0 px-3 py-2">درصد</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {skills.map((s) => (
                                    <tr key={s.tag}>
                                      <td className="px-3 py-2 fw-semibold">
                                        {s.tag}
                                      </td>
                                      <td className="text-center px-3 py-2">
                                        {s.correct}
                                      </td>
                                      <td className="text-center px-3 py-2">{s.total}</td>
                                      <td className="text-center px-3 py-2">
                                        <span
                                          className={`badge rounded-pill px-3 py-2 ${
                                            s.percentage >= 70
                                              ? "bg-success-subtle text-success"
                                              : s.percentage >= 40
                                                ? "bg-warning-subtle text-warning"
                                                : "bg-danger-subtle text-danger"
                                          }`}
                                          style={{ minWidth: 60 }}
                                        >
                                          {s.percentage}٪
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* ---- Line chart ---- */}
              <div className="col-xl-6 col-lg-12 mb-4">
                <div className="card h-100 shadow-sm border-0">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center mb-3">
                      <div
                        className="d-flex align-items-center justify-content-center rounded-3 me-3"
                        style={{
                          width: 48,
                          height: 48,
                          background: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
                        }}
                      >
                        <i className="isax isax-chart-21 text-white" style={{ fontSize: 20 }} />
                      </div>
                      <div>
                        <h5 className="card-title mb-1">روند پیشرفت در طول زمان</h5>
                        <p className="text-muted small mb-0">
                          نمرات آزمون و درصد تکمیل دوره بر اساس تاریخ
                        </p>
                      </div>
                    </div>
                    {loadingTrend ? (
                      <div className="text-center py-5">
                        <div className="spinner-border spinner-border-sm text-primary" />
                        <span className="ms-2 small text-muted">
                          در حال بارگذاری...
                        </span>
                      </div>
                    ) : (
                      <ProgressTrendChart
                        quizScores={quizScores}
                        courseCompletion={courseCompletion}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ---- Summary stat cards ---- */}
            {!loadingSkills && !loadingTrend && (
              <div className="row g-3">
                <div className="col-md-4">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body p-4">
                      <div className="d-flex align-items-center">
                        <div
                          className="d-flex align-items-center justify-content-center rounded-3 me-3"
                          style={{
                            width: 56,
                            height: 56,
                            background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
                          }}
                        >
                          <i className="isax isax-clipboard-text text-white" style={{ fontSize: 24 }} />
                        </div>
                        <div className="flex-grow-1">
                          <div style={{ fontSize: 28 }} className="fw-bold text-dark mb-1">
                            {quizScores.length}
                          </div>
                          <div className="text-muted small fw-medium">
                            آزمون تکمیل‌شده
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body p-4">
                      <div className="d-flex align-items-center">
                        <div
                          className="d-flex align-items-center justify-content-center rounded-3 me-3"
                          style={{
                            width: 56,
                            height: 56,
                            background: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
                          }}
                        >
                          <i className="isax isax-medal-star text-white" style={{ fontSize: 24 }} />
                        </div>
                        <div className="flex-grow-1">
                          <div style={{ fontSize: 28 }} className="fw-bold text-dark mb-1">
                            {quizScores.length > 0
                              ? Math.round(
                                  quizScores.reduce(
                                    (acc, p) => acc + p.percentage,
                                    0,
                                  ) / quizScores.length,
                                )
                              : 0}
                            <span style={{ fontSize: 18 }}>٪</span>
                          </div>
                          <div className="text-muted small fw-medium">
                            میانگین نمره آزمون
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body p-4">
                      <div className="d-flex align-items-center">
                        <div
                          className="d-flex align-items-center justify-content-center rounded-3 me-3"
                          style={{
                            width: 56,
                            height: 56,
                            background: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
                          }}
                        >
                          <i className="isax isax-chart-success text-white" style={{ fontSize: 24 }} />
                        </div>
                        <div className="flex-grow-1">
                          <div style={{ fontSize: 28 }} className="fw-bold text-dark mb-1">
                            {skills.length > 0
                              ? Math.round(
                                  skills.reduce(
                                    (acc, s) => acc + s.percentage,
                                    0,
                                  ) / skills.length,
                                )
                              : 0}
                            <span style={{ fontSize: 18 }}>٪</span>
                          </div>
                          <div className="text-muted small fw-medium">
                            میانگین تسلط مهارتی
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningAnalytics;
