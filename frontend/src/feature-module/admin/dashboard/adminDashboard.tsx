import React, { useEffect, useMemo, useState } from "react";
import ReactApexChart from "react-apexcharts";
import ProfileCard from "../common/profileCard";

import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import AdminSidebar from "../common/adminSidebar";
import courseService, {
  AdminPerformanceReportItem,
} from "../../../services/course.service";
import userService from "../../../services/user.service";

// Role_Id: 1 = student, 2 = teacher, 3 = admin
const ROLE_STUDENT = 1;
const ROLE_TEACHER = 2;

const TOP_COURSES_LIMIT = 8;
const PERFORMANCE_PAGE_SIZE = 10;

const CHART_COLORS = [
  "#392C7D",
  "#5B4FCF",
  "#7367F0",
  "#8280FF",
  "#00CFE8",
  "#2E9CCA",
  "#1AA053",
  "#2BC155",
  "#F8B84E",
  "#FD7E14",
];

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    publishedCourses: 0,
    students: 0,
    teachers: 0,
  });
  const [report, setReport] = useState<AdminPerformanceReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [perfPage, setPerfPage] = useState(1);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError("");
      const [courses, users, reportData] = await Promise.all([
        courseService.getAllCourses(),
        userService.getUsers(),
        courseService.getAdminPerformanceReport(),
      ]);
      setStats({
        publishedCourses: courses.length,
        students: users.filter((u: any) => u.Role_Id === ROLE_STUDENT).length,
        teachers: users.filter((u: any) => u.Role_Id === ROLE_TEACHER).length,
      });
      setReport(reportData);
    } catch (err) {
      setError("خطا در دریافت آمار داشبورد");
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (value: number) =>
    loading ? "…" : value.toLocaleString("fa-IR");

  // ---------------- Chart data ----------------
  const chartData = useMemo(() => {
    const sorted = [...report].sort((a, b) => b.enrollments - a.enrollments);
    const top = sorted.slice(0, TOP_COURSES_LIMIT);
    const rest = sorted.slice(TOP_COURSES_LIMIT);
    const othersTotal = rest.reduce((sum, c) => sum + c.enrollments, 0);

    return [
      ...top,
      ...(rest.length > 0
        ? [
            {
              courseId: -1,
              title: `سایر دوره‌ها (${rest.length} دوره)`,
              teacherName: "-",
              enrollments: othersTotal,
            } as AdminPerformanceReportItem,
          ]
        : []),
    ];
  }, [report]);

  const categories = chartData.map((c) => c.title);
  const seriesData = chartData.map((c) => c.enrollments);

  const enrollmentsChartOptions: any = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      fontFamily: "'Noto Sans', sans-serif",
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 5,
        barHeight: "60%",
        distributed: true,
      },
    },
    xaxis: {
      categories,
      labels: {
        formatter: (val: number) => Math.round(val).toString(),
        style: { colors: "#4D4D4D", fontSize: "13px" },
      },
      title: { text: "تعداد دانشجویان ثبت‌نام‌شده" },
    },
    yaxis: {
      labels: {
        style: { colors: "#4D4D4D", fontSize: "12px" },
      },
    },
    grid: {
      borderColor: "#eee",
      strokeDashArray: 5,
    },
    dataLabels: {
      enabled: true,
      style: { colors: ["#fff"], fontSize: "13px" },
    },
    legend: { show: false },
    tooltip: {
      y: {
        formatter: (val: number) => `${val.toLocaleString("fa-IR")} دانشجو`,
      },
    },
    colors: CHART_COLORS,
  };

  // ---------------- Summary numbers ----------------
  const summary = useMemo(() => {
    const totalEnrollments = report.reduce(
      (sum, c) => sum + c.enrollments,
      0,
    );
    const withQuiz = report.filter((c) => c.participants > 0);
    const avgPassRate =
      withQuiz.length > 0
        ? Math.round(
            withQuiz.reduce((sum, c) => sum + c.passRate, 0) /
              withQuiz.length,
          )
        : 0;
    const totalPassed = report.reduce((sum, c) => sum + c.passed, 0);
    return {
      totalEnrollments,
      avgPassRate,
      totalPassed,
      coursesWithQuiz: withQuiz.length,
    };
  }, [report]);

  // صفحه‌بندی جدول عملکرد
  const perfTotalPages = Math.max(1, Math.ceil(report.length / PERFORMANCE_PAGE_SIZE));
  const paginatedReport = report.slice(
    (perfPage - 1) * PERFORMANCE_PAGE_SIZE,
    perfPage * PERFORMANCE_PAGE_SIZE,
  );

  useEffect(() => {
    setPerfPage(1);
  }, [report]);

  const chartHeight = Math.max(280, chartData.length * 46);

  const passRateBar = (rate: number) => (
    <div className="d-flex align-items-center gap-2">
      <div className="progress flex-grow-1" style={{ height: 8 }}>
        <div
          className={`progress-bar ${rate >= 50 ? "bg-success" : rate >= 25 ? "bg-warning" : "bg-danger"}`}
          role="progressbar"
          style={{ width: `${rate}%` }}
        />
      </div>
      <span className="fs-14 fw-semibold">{formatNumber(rate)}٪</span>
    </div>
  );

  return (
    <>
      <div className="content mt-5">
        <div className="container">
          {/* profile box */}
          <ProfileCard />
          {/* profile box */}
          <div className="row">
            {/* sidebar */}
            <AdminSidebar />
            {/* sidebar */}
            <div className="col-lg-9">
              {error && (
                <div className="alert alert-danger mb-4" role="alert">
                  {error}
                </div>
              )}

              {/* -------------------- Chart section -------------------- */}
              <div className="row g-3 mb-3">
                <div className="col-lg-8">
                  <div className="card h-100">
                    <div className="card-body">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <div>
                          <h6 className="mb-0">ثبت‌نام دوره‌ها</h6>
                          <span className="fs-14 text-muted">
                            تعداد دانشجویان ثبت‌نام‌شده در هر دوره
                          </span>
                        </div>
                        <span className="badge bg-primary-transparent fs-12">
                          {formatNumber(summary.totalEnrollments)} ثبت‌نام
                        </span>
                      </div>
                      {loading ? (
                        <div className="text-center py-5 text-muted">
                          در حال بارگذاری نمودار...
                        </div>
                      ) : report.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                          داده‌ای برای نمایش وجود ندارد.
                        </div>
                      ) : (
                        <ReactApexChart
                          options={enrollmentsChartOptions}
                          series={[{ name: "دانشجو", data: seriesData }]}
                          type="bar"
                          height={chartHeight}
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="col-lg-4">
                  <div className="card h-100">
                    <div className="card-body">
                      <h6 className="mb-3">نمای کلی عملکرد</h6>
                      <div className="d-flex flex-column gap-3">
                        <div className="d-flex align-items-center justify-content-between bg-light rounded-2 p-3">
                          <div>
                            <span className="d-block fs-14 text-muted">
                              مجموع ثبت‌نام‌ها
                            </span>
                            <h4 className="fs-24 mt-1 mb-0">
                              {formatNumber(summary.totalEnrollments)}
                            </h4>
                          </div>
                          <i className="isax isax-profile-2user5 fs-3 text-primary" />
                        </div>
                        <div className="d-flex align-items-center justify-content-between bg-light rounded-2 p-3">
                          <div>
                            <span className="d-block fs-14 text-muted">
                              میانگین نرخ قبولی آزمون
                            </span>
                            <h4 className="fs-24 mt-1 mb-0">
                              {formatNumber(summary.avgPassRate)}٪
                            </h4>
                          </div>
                          <i className="isax isax-tick-circle fs-3 text-success" />
                        </div>
                        <div className="d-flex align-items-center justify-content-between bg-light rounded-2 p-3">
                          <div>
                            <span className="d-block fs-14 text-muted">
                              قبول‌شدگان کل
                            </span>
                            <h4 className="fs-24 mt-1 mb-0">
                              {formatNumber(summary.totalPassed)}
                            </h4>
                          </div>
                          <i className="isax isax-award fs-3 text-warning" />
                        </div>
                        <div className="d-flex align-items-center justify-content-between bg-light rounded-2 p-3">
                          <div>
                            <span className="d-block fs-14 text-muted">
                              دوره‌های دارای آزمون
                            </span>
                            <h4 className="fs-24 mt-1 mb-0">
                              {formatNumber(summary.coursesWithQuiz)}
                            </h4>
                          </div>
                          <i className="isax isax-document fs-3 text-secondary" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* -------------------- Performance table -------------------- */}
              <div className="card mb-3">
                <div className="card-body">
                  <h6 className="mb-3">
                    عملکرد دوره‌ها و مدرسان
                    <span className="text-muted fs-14 fw-normal ms-2">
                      (ثبت‌نام، آزمون و نرخ قبولی هر دوره)
                    </span>
                  </h6>
                  <div className="table-responsive">
                    <table className="table table-hover table-bordered align-middle">
                      <thead className="table-dark">
                        <tr>
                          <th>دوره</th>
                          <th>مدرس</th>
                          <th>دانشجویان</th>
                          <th>شرکت در آزمون</th>
                          <th>نرخ قبولی</th>
                          <th>میانگین نمره</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading && (
                          <tr>
                            <td colSpan={6} className="text-center py-4">
                              در حال بارگذاری...
                            </td>
                          </tr>
                        )}
                        {!loading && report.length === 0 && (
                          <tr>
                            <td colSpan={6} className="text-center py-4">
                              داده‌ای برای نمایش وجود ندارد.
                            </td>
                          </tr>
                        )}
                        {!loading &&
                          paginatedReport.map((c) => (
                            <tr key={c.courseId}>
                              <td className="fw-semibold">{c.title}</td>
                              <td>{c.teacherName || "-"}</td>
                              <td>{c.enrollments.toLocaleString("fa-IR")}</td>
                              <td>
                                <span className="fw-semibold">
                                  {c.participants.toLocaleString("fa-IR")}
                                </span>
                                <span className="text-muted fs-14">
                                  {" "}
                                  (قبول: {c.passed.toLocaleString("fa-IR")})
                                </span>
                              </td>
                              <td style={{ minWidth: 140 }}>
                                {c.participants > 0
                                  ? passRateBar(c.passRate)
                                  : "-"}
                              </td>
                              <td>
                                {c.averageScorePercent > 0 ? (
                                  <span
                                    className={`badge ${c.averageScorePercent >= 50 ? "bg-success" : "bg-danger"}`}
                                  >
                                    {c.averageScorePercent.toLocaleString(
                                      "fa-IR",
                                    )}
                                    ٪
                                  </span>
                                ) : (
                                  "-"
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mt-3">
                    <span className="fs-14 text-muted">
                      نمایش{" "}
                      {report.length > 0
                        ? `${((perfPage - 1) * PERFORMANCE_PAGE_SIZE + 1).toLocaleString("fa-IR")} تا ${Math.min(perfPage * PERFORMANCE_PAGE_SIZE, report.length).toLocaleString("fa-IR")}`
                        : "۰"}{" "}
                      از {report.length.toLocaleString("fa-IR")} دوره
                    </span>

                    {perfTotalPages > 1 && (
                      <nav>
                        <ul className="pagination pagination-sm mb-0">
                          {Array.from(
                            { length: perfTotalPages },
                            (_, i) => i + 1,
                          ).map((p) => (
                            <li
                              key={p}
                              className={`page-item ${p === perfPage ? "active" : ""}`}
                            >
                              <button
                                type="button"
                                className="page-link"
                                onClick={() => setPerfPage(p)}
                              >
                                {p.toLocaleString("fa-IR")}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </nav>
                    )}
                  </div>
                </div>
              </div>

              {/* -------------------- Stat cards -------------------- */}
              <div className="row">
                <div className="col-md-6 col-xl-4">
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <span className="icon-box bg-secondary-transparent me-2 me-xxl-3 flex-shrink-0">
                          <ImageWithBasePath
                            src="assets/img/icon/book.svg"
                            alt=""
                          />
                        </span>
                        <div>
                          <span className="d-block">دوره‌های منتشر شده</span>
                          <h4 className="fs-24 mt-1">
                            {formatNumber(stats.publishedCourses)}
                          </h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-xl-4">
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <span className="icon-box bg-primary-transparent me-2 me-xxl-3 flex-shrink-0">
                          <ImageWithBasePath
                            src="assets/img/icon/graduation.svg"
                            alt=""
                          />
                        </span>
                        <div>
                          <span className="d-block">دانشجویان</span>
                          <h4 className="fs-24 mt-1">
                            {formatNumber(stats.students)}
                          </h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-xl-4">
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <span className="icon-box bg-success-transparent me-2 me-xxl-3 flex-shrink-0">
                          <ImageWithBasePath
                            src="assets/img/icon/user-tick.svg"
                            alt=""
                          />
                        </span>
                        <div>
                          <span className="d-block">مدرسان</span>
                          <h4 className="fs-24 mt-1">
                            {formatNumber(stats.teachers)}
                          </h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
