import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { Link } from "react-router-dom";
import ProfileCard from "../common/profileCard";
import InstructorSidebar from "../common/instructorSidebar";
import analyticsService, {
  CourseStudentAnalytic,
  SkillStat,
} from "../../../services/analytics.service";
import courseService from "../../../services/course.service";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function fullName(s: CourseStudentAnalytic) {
  return `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim() || "دانشجو";
}

function avatarUrl(avatar: string | null) {
  if (!avatar) return null;
  if (avatar.startsWith("http")) return avatar;
  return `${process.env.REACT_APP_API_URL || "http://localhost:3000"}/${avatar}`;
}

// ---------------------------------------------------------------------------
// Skill bar mini-widget used inside the expandable row
// ---------------------------------------------------------------------------
function SkillMiniBar({ skills }: { skills: SkillStat[] }) {
  if (skills.length === 0)
    return <span className="text-muted small">سوالی با برچسب مهارتی ندارد</span>;

  return (
    <div className="d-flex flex-column gap-1" style={{ minWidth: 260 }}>
      {skills.map((s) => (
        <div key={s.tag}>
          <div className="d-flex justify-content-between" style={{ fontSize: 12 }}>
            <span>{s.tag}</span>
            <span className="text-muted">
              {s.correct}/{s.total} ({s.percentage}٪)
            </span>
          </div>
          <div
            className="progress"
            style={{ height: 5, borderRadius: 3 }}
            role="progressbar"
            aria-valuenow={s.percentage}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className={`progress-bar ${
                s.percentage >= 70
                  ? "bg-success"
                  : s.percentage >= 40
                    ? "bg-warning"
                    : "bg-danger"
              }`}
              style={{ width: `${s.percentage}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Scatter / bubble overview chart
// X = progressPercent, Y = quizScorePercent, label = name
// ---------------------------------------------------------------------------
function StudentOverviewChart({
  students,
}: {
  students: CourseStudentAnalytic[];
}) {
  const attempted = students.filter((s) => s.hasAttempted);

  if (attempted.length === 0) {
    return (
      <div className="text-center py-4 text-muted">
        هنوز هیچ دانشجویی در آزمون شرکت نکرده است.
      </div>
    );
  }

  const series = [
    {
      name: "دانشجو",
      data: attempted.map((s) => ({
        x: s.progressPercent,
        y: s.quizScorePercent ?? 0,
        name: fullName(s),
      })),
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: "scatter",
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
    xaxis: {
      title: {
        text: "درصد تکمیل دوره",
        style: {
          fontSize: "13px",
          fontWeight: 600,
          color: "#64748b",
        },
      },
      min: 0,
      max: 100,
      tickAmount: 5,
      labels: {
        formatter: (v) => `${v}٪`,
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
    },
    yaxis: {
      title: {
        text: "نمره آزمون",
        style: {
          fontSize: "13px",
          fontWeight: 600,
          color: "#64748b",
        },
      },
      min: 0,
      max: 100,
      tickAmount: 5,
      labels: {
        formatter: (v: number) => `${v}٪`,
        style: {
          fontSize: "12px",
          colors: "#64748b",
          fontWeight: 500,
        },
      },
    },
    tooltip: {
      custom: ({ seriesIndex, dataPointIndex, w }: any) => {
        const d = w.globals.initialSeries[seriesIndex].data[dataPointIndex];
        return `<div class="px-3 py-2 small" style="direction: rtl;"><strong>${d.name}</strong><br/>پیشرفت: ${d.x}٪ | نمره: ${d.y}٪</div>`;
      },
      style: {
        fontSize: "13px",
      },
    },
    markers: {
      size: 8,
      strokeWidth: 2,
      strokeColors: "#fff",
      hover: {
        size: 10,
      },
    },
    colors: ["#7c3aed"],
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
    },
  };

  return (
    <ReactApexChart
      type="scatter"
      options={options}
      series={series}
      height={480}
    />
  );
}

// ---------------------------------------------------------------------------
// Class-wide skill radar
// ---------------------------------------------------------------------------
function ClassSkillRadar({ students }: { students: CourseStudentAnalytic[] }) {
  // Aggregate all skill breakdowns into one unified map
  const map = new Map<string, { correct: number; total: number }>();
  for (const s of students) {
    for (const sk of s.skillBreakdown) {
      const b = map.get(sk.tag) ?? { correct: 0, total: 0 };
      b.correct += sk.correct;
      b.total += sk.total;
      map.set(sk.tag, b);
    }
  }

  const tags = Array.from(map.keys());
  const percentages = tags.map((t) => {
    const b = map.get(t)!;
    return b.total > 0 ? Math.round((b.correct / b.total) * 100) : 0;
  });

  if (tags.length === 0) {
    return (
      <div className="text-center py-4 text-muted">
        داده مهارتی موجود نیست.
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
      categories: tags,
      labels: {
        style: {
          colors: Array(tags.length).fill("#64748b"),
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
      colors: ["#10b981"],
    },
    stroke: {
      width: 3,
      colors: ["#10b981"],
    },
    markers: {
      size: 5,
      colors: ["#10b981"],
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 7,
      },
    },
    colors: ["#10b981"],
    tooltip: {
      y: {
        formatter: (val: number) => `${val}٪ تسلط میانگین`,
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

  return (
    <ReactApexChart
      type="radar"
      options={options}
      series={[{ name: "میانگین کلاس", data: percentages }]}
      height={480}
    />
  );
}

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------
const InstructorCourseAnalytics: React.FC = () => {
  interface CourseOption {
    id: number;
    title: string;
  }

  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | "">("");
  const [students, setStudents] = useState<CourseStudentAnalytic[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  // Load instructor's courses for the filter dropdown
  useEffect(() => {
    courseService
      .getMyCourses()
      .then((list) =>
        setCourses(list.map((c: any) => ({ id: c.Id, title: c.Title }))),
      )
      .catch(() => setCourses([]));
  }, []);

  const handleCourseChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const val = e.target.value;
    setSelectedCourse(val === "" ? "" : Number(val));
    setStudents([]);
    setExpandedRow(null);

    if (!val) return;

    setLoading(true);
    try {
      const data = await analyticsService.getCourseStudentAnalytics(
        Number(val),
      );
      setStudents(data);
    } catch {
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  // Derived summary stats
  const attempted = students.filter((s) => s.hasAttempted);
  const passed = students.filter((s) => s.isPassed === true);
  const avgQuizScore =
    attempted.length > 0
      ? Math.round(
          attempted.reduce((sum, s) => sum + (s.quizScorePercent ?? 0), 0) /
            attempted.length,
        )
      : 0;
  const avgProgress =
    students.length > 0
      ? Math.round(
          students.reduce((sum, s) => sum + s.progressPercent, 0) /
            students.length,
        )
      : 0;

  // Weakest skills across class
  const classSkillMap = new Map<string, { correct: number; total: number }>();
  for (const s of students) {
    for (const sk of s.skillBreakdown) {
      const b = classSkillMap.get(sk.tag) ?? { correct: 0, total: 0 };
      b.correct += sk.correct;
      b.total += sk.total;
      classSkillMap.set(sk.tag, b);
    }
  }
  const classSkills = Array.from(classSkillMap.entries())
    .map(([tag, { correct, total }]) => ({
      tag,
      correct,
      total,
      percentage: total > 0 ? Math.round((correct / total) * 100) : 0,
    }))
    .sort((a, b) => a.percentage - b.percentage);

  return (
    <div className="content mt-5">
      <div className="container">
        <ProfileCard />
        <div className="row">
          <InstructorSidebar />
          <div className="col-lg-12">
            {/* Header */}
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
                        داشبورد تحلیل یادگیری دانشجویان
                      </h4>
                      <p className="mb-0 text-white-50 small">
                        بررسی عملکرد و پیشرفت دانشجویان در هر دوره
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
                      انتخاب دوره:
                    </label>
                    <select
                      id="courseFilter"
                      className="form-select"
                      style={{
                        minWidth: 220,
                        background: "rgba(255,255,255,0.95)",
                        border: "none",
                        fontWeight: 500,
                      }}
                      value={selectedCourse}
                      onChange={handleCourseChange}
                    >
                      <option value="">— انتخاب کنید —</option>
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

            {/* Empty / loading state */}
            {!selectedCourse && (
              <div
                className="card text-center py-5 text-muted"
                style={{ border: "2px dashed #e2e8f0" }}
              >
                <i className="isax isax-chart-2 fs-24 mb-2 d-block" />
                یک دوره را از منوی بالا انتخاب کنید.
              </div>
            )}

            {selectedCourse && loading && (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" />
                <div className="mt-2 text-muted small">در حال بارگذاری...</div>
              </div>
            )}

            {selectedCourse && !loading && students.length === 0 && (
              <div className="card text-center py-5 text-muted">
                هیچ دانشجویی در این دوره ثبت‌نام نکرده است.
              </div>
            )}

            {selectedCourse && !loading && students.length > 0 && (
              <>
                {/* ---- Summary cards ---- */}
                <div className="row g-3 mb-4">
                  {[
                    {
                      label: "دانشجوی ثبت‌نامی",
                      value: students.length,
                      gradient: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
                      icon: "isax-profile-2user",
                    },
                    {
                      label: "شرکت‌کننده در آزمون",
                      value: attempted.length,
                      gradient: "linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)",
                      icon: "isax-clipboard-text",
                    },
                    {
                      label: "قبول‌شده",
                      value: passed.length,
                      gradient: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
                      icon: "isax-medal-star",
                    },
                    {
                      label: "میانگین نمره",
                      value: `${avgQuizScore}٪`,
                      gradient: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
                      icon: "isax-chart-21",
                    },
                    {
                      label: "میانگین پیشرفت",
                      value: `${avgProgress}٪`,
                      gradient: "linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)",
                      icon: "isax-teacher",
                    },
                  ].map((card) => (
                    <div key={card.label} className="col-6 col-md-4 col-xl">
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-body p-4">
                          <div className="d-flex align-items-center">
                            <div
                              className="d-flex align-items-center justify-content-center rounded-3 me-3"
                              style={{
                                width: 56,
                                height: 56,
                                background: card.gradient,
                              }}
                            >
                              <i className={`isax ${card.icon} text-white`} style={{ fontSize: 24 }} />
                            </div>
                            <div className="flex-grow-1">
                              <div style={{ fontSize: 28 }} className="fw-bold text-dark mb-1">
                                {card.value}
                              </div>
                              <div className="text-muted small fw-medium">
                                {card.label}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ---- Weak skill banner ---- */}
                {classSkills.length > 0 && classSkills.slice(0, 3).some(s => s.percentage < 70) && (
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
                            ضعیف‌ترین مهارت‌های کلاس
                          </h6>
                          <div className="d-flex flex-wrap gap-2 mb-2">
                            {classSkills.filter(s => s.percentage < 70).slice(0, 3).map((s) => (
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
                          <small className="text-muted d-block">
                            <i className="isax isax-info-circle me-1" />
                            این مهارت‌ها نیاز به تدریس مجدد یا تمرین بیشتر دارند.
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ---- Charts row ---- */}
                <div className="row mb-4">
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
                            <h5 className="card-title mb-1">
                              پراکنش عملکرد دانشجویان
                            </h5>
                            <p className="text-muted small mb-0">
                              هر نقطه یک دانشجو — محور X: پیشرفت دوره، محور Y: نمره آزمون
                            </p>
                          </div>
                        </div>
                        <StudentOverviewChart students={students} />
                      </div>
                    </div>
                  </div>
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
                            <h5 className="card-title mb-1">
                              میانگین تسلط مهارتی کلاس
                            </h5>
                            <p className="text-muted small mb-0">
                              تجمیع پاسخ‌های همه دانشجویان به تفکیک مهارت
                            </p>
                          </div>
                        </div>
                        <ClassSkillRadar students={students} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ---- Per-student table ---- */}
                <div className="card shadow-sm border-0">
                  <div className="card-header bg-white border-0 p-4">
                    <h5 className="mb-0">
                      <i className="isax isax-people me-2 text-primary" />
                      لیست دانشجویان و تحلیل تفکیکی
                    </h5>
                  </div>
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                          <tr>
                            <th className="border-0 px-4 py-3" style={{ width: 36 }} />
                            <th className="border-0 px-4 py-3">دانشجو</th>
                            <th className="text-center border-0 px-4 py-3">پیشرفت دوره</th>
                            <th className="text-center border-0 px-4 py-3">نمره آزمون</th>
                            <th className="text-center border-0 px-4 py-3">وضعیت</th>
                            <th className="text-center border-0 px-4 py-3">گواهینامه</th>
                          </tr>
                        </thead>
                        <tbody>
                          {students.map((s) => (
                            <React.Fragment key={s.studentId}>
                              <tr
                                style={{
                                  cursor: "pointer",
                                  transition: "all 0.2s",
                                }}
                                onClick={() =>
                                  setExpandedRow(
                                    expandedRow === s.studentId
                                      ? null
                                      : s.studentId,
                                  )
                                }
                                className="border-bottom"
                              >
                                {/* Expand toggle */}
                                <td className="text-center px-4 py-3">
                                  <i
                                    className={`isax ${
                                      expandedRow === s.studentId
                                        ? "isax-arrow-up-2"
                                        : "isax-arrow-down-2"
                                    }`}
                                    style={{ fontSize: 16, color: "#64748b" }}
                                  />
                                </td>

                                {/* Name + avatar */}
                                <td className="px-4 py-3">
                                  <div className="d-flex align-items-center gap-2">
                                    {avatarUrl(s.avatar) ? (
                                      <img
                                        src={avatarUrl(s.avatar)!}
                                        alt=""
                                        className="rounded-circle"
                                        style={{
                                          width: 32,
                                          height: 32,
                                          objectFit: "cover",
                                        }}
                                      />
                                    ) : (
                                      <span
                                        className="rounded-circle bg-secondary-subtle d-inline-flex align-items-center justify-content-center"
                                        style={{
                                          width: 32,
                                          height: 32,
                                          fontSize: 13,
                                          color: "#6c757d",
                                        }}
                                      >
                                        {(s.firstName ?? "؟")[0]}
                                      </span>
                                    )}
                                    <div>
                                      <div className="fw-semibold small">
                                        {fullName(s)}
                                      </div>
                                      <div
                                        className="text-muted"
                                        style={{ fontSize: 11 }}
                                      >
                                        {s.email}
                                      </div>
                                    </div>
                                  </div>
                                </td>

                                {/* Progress */}
                                <td className="text-center px-4 py-3" style={{ minWidth: 120 }}>
                                  <div className="d-flex align-items-center gap-1 justify-content-center">
                                    <div
                                      className="progress flex-grow-1"
                                      style={{ height: 6, maxWidth: 80 }}
                                      role="progressbar"
                                      aria-valuenow={s.progressPercent}
                                      aria-valuemin={0}
                                      aria-valuemax={100}
                                    >
                                      <div
                                        className="progress-bar bg-primary"
                                        style={{ width: `${s.progressPercent}%` }}
                                      />
                                    </div>
                                    <small>{s.progressPercent}٪</small>
                                  </div>
                                  <div style={{ fontSize: 10 }} className="text-muted">
                                    {s.completedLessons}/{s.totalLessons} درس
                                  </div>
                                </td>

                                {/* Quiz score */}
                                <td className="text-center px-4 py-3">
                                  {s.hasAttempted ? (
                                    <span
                                      className={`badge ${
                                        (s.quizScorePercent ?? 0) >= 70
                                          ? "bg-success-subtle text-success"
                                          : (s.quizScorePercent ?? 0) >= 40
                                            ? "bg-warning-subtle text-warning"
                                            : "bg-danger-subtle text-danger"
                                      }`}
                                    >
                                      {s.quizScorePercent}٪
                                    </span>
                                  ) : (
                                    <span className="text-muted small">
                                      شرکت نکرده
                                    </span>
                                  )}
                                </td>

                                {/* Pass/fail */}
                                <td className="text-center px-4 py-3">
                                  {s.isPassed === true ? (
                                    <span className="badge bg-success-subtle text-success">
                                      قبول
                                    </span>
                                  ) : s.isPassed === false ? (
                                    <span className="badge bg-danger-subtle text-danger">
                                      مردود
                                    </span>
                                  ) : (
                                    <span className="badge bg-secondary-subtle text-secondary">
                                      —
                                    </span>
                                  )}
                                </td>

                                {/* Certificate */}
                                <td className="text-center px-4 py-3">
                                  {s.certificate ? (
                                    <span className="badge bg-primary-subtle text-primary">
                                      <i className="isax isax-medal-star5 me-1" />
                                      دارد
                                    </span>
                                  ) : (
                                    <span className="text-muted small">—</span>
                                  )}
                                </td>
                              </tr>

                              {/* Expanded skill row */}
                              {expandedRow === s.studentId && (
                                <tr style={{ background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)" }} className="border-bottom">
                                  <td colSpan={6} className="px-5 py-4">
                                    <div
                                      className="d-flex flex-wrap gap-4"
                                      style={{ direction: "rtl" }}
                                    >
                                      <div>
                                        <div className="fw-semibold small mb-2">
                                          <i className="isax isax-chart-2 me-1 text-primary" />
                                          تحلیل مهارتی
                                        </div>
                                        <SkillMiniBar
                                          skills={s.skillBreakdown}
                                        />
                                      </div>

                                      {s.certificate && (
                                        <div>
                                          <div className="fw-semibold small mb-2">
                                            <i className="isax isax-medal-star5 me-1 text-warning" />
                                            گواهینامه
                                          </div>
                                          <div className="small">
                                            <div>
                                              نمره:{" "}
                                              {Number(s.certificate.Score)}/
                                              {Number(s.certificate.MaxScore)}
                                            </div>
                                            <div className="text-muted">
                                              {new Date(
                                                s.certificate.IssuedAt,
                                              ).toLocaleDateString("fa-IR")}
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                      <div>
                                        <div className="fw-semibold small mb-2">
                                          <i className="isax isax-book5 me-1 text-info" />
                                          پیشرفت درسی
                                        </div>
                                        <div className="small">
                                          {s.completedLessons} از{" "}
                                          {s.totalLessons} درس تکمیل شده
                                        </div>
                                        <div className="text-muted small">
                                          تاریخ ثبت‌نام:{" "}
                                          {s.enrollmentDate
                                            ? new Date(
                                                s.enrollmentDate,
                                              ).toLocaleDateString("fa-IR")
                                            : "—"}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorCourseAnalytics;
