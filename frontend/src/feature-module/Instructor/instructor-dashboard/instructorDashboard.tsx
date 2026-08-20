import React, { useEffect, useMemo, useState } from "react";
import ProfileCard from "../common/profileCard";
import InstructorSidebar from "../common/instructorSidebar";
import { Link } from "react-router-dom";
import { all_routes } from "../../router/all_routes";
import PredefinedDateRanges from "../../../core/common/range-picker/datePicker";
import ReactApexChart from "react-apexcharts";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import api from "../../../services/api";
import courseService, {
  CourseEnrollmentReportItem,
} from "../../../services/course.service";

interface InstructorStats {
  totalStudents: number;
  publishedCourses: number;
  totalCourses: number;
}

const TOP_COURSES_LIMIT = 8;
const BAR_HEIGHT_PX = 40;
const MIN_CHART_HEIGHT = 300;
const CONTAINER_MAX_HEIGHT = 420;

const InstructorDashboard = () => {
  const earningsChartOptions: any = {
    chart: {
      height: 290,
      type: "bar",
      stacked: true,
      toolbar: { show: false },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          legend: {
            position: "bottom",
            offsetX: -10,
            offsetY: 0,
          },
        },
      },
    ],
    plotOptions: {
      bar: {
        borderRadius: 5,
        horizontal: false,
        endingShape: "rounded",
      },
    },
    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      labels: {
        style: { colors: "#4D4D4D", fontSize: "13px" },
      },
    },
    yaxis: {
      labels: {
        offsetX: -15,
        style: { colors: "#4D4D4D", fontSize: "13px" },
      },
    },
    grid: { borderColor: "#4D4D4D", strokeDashArray: 5 },
    legend: { show: false },
    dataLabels: { enabled: false },
    fill: {
      type: "gradient",
      gradient: {
        shade: "dark",
        type: "linear",
        shadeIntensity: 0.35,
        gradientToColors: ["#392C7D"],
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100],
        angle: 90,
      },
    },
  };
  const [stats, setStats] = useState<InstructorStats>({
    totalStudents: 0,
    publishedCourses: 0,
    totalCourses: 0,
  });
  const [loading, setLoading] = useState(true);

  const [enrollmentsReport, setEnrollmentsReport] = useState<
    CourseEnrollmentReportItem[]
  >([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get<InstructorStats>(
          "/api/instructor/dashboard/summary",
        );
        setStats(response.data);
      } catch (error) {
        console.error("Failed to fetch instructor stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        setLoadingEnrollments(true);
        const data = await courseService.getEnrollmentsReport();
        setEnrollmentsReport(data);
      } catch (error) {
        console.error("Failed to fetch enrollments report:", error);
      } finally {
        setLoadingEnrollments(false);
      }
    };
    fetchEnrollments();
  }, []);

  // Reduce to top N courses + an "Others" bucket, so the chart stays
  // readable no matter how many courses the instructor has.
  const chartData = useMemo(() => {
    const sorted = [...enrollmentsReport].sort(
      (a, b) => b.enrollments - a.enrollments,
    );

    if (sorted.length <= TOP_COURSES_LIMIT) {
      return sorted;
    }

    const top = sorted.slice(0, TOP_COURSES_LIMIT);
    const rest = sorted.slice(TOP_COURSES_LIMIT);
    const othersTotal = rest.reduce((sum, c) => sum + c.enrollments, 0);

    return [
      ...top,
      {
        courseId: -1,
        title: `سایر دوره‌ها (${rest.length} دوره)`,
        enrollments: othersTotal,
      },
    ];
  }, [enrollmentsReport]);

  const categories = chartData.map((c) => c.title);
  const seriesData = chartData.map((c) => c.enrollments);

  const enrollmentsChartOptions: any = {
    chart: {
      type: "bar",
      toolbar: { show: false },
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
      title: { text: "تعداد دانشجوهای ثبت‌نام‌شده" },
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
      style: { colors: ["#fff"] },
    },
    legend: { show: false },
    tooltip: {
      y: {
        formatter: (val: number) => `${val} دانشجو`,
      },
    },
    colors: [
      "#392C7D",
      "#5B4FCF",
      "#7367F0",
      "#28C76F",
      "#00CFE8",
      "#FF9F43",
      "#EA5455",
      "#82868B",
      "#A8AAAE",
    ],
  };

  const chartHeight = Math.max(
    MIN_CHART_HEIGHT,
    chartData.length * BAR_HEIGHT_PX,
  );

  return (
    <>
      <div className="content mt-5">
        <div className="container">
          <ProfileCard />

          <div className="row">
            {/* Sidebar */}
            <InstructorSidebar />
            {/* /Sidebar */}
            <div className="col-lg-12">
              <div className="row">
                <div className="col-md-6 col-xl-4">
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <span className="icon-box bg-info-transparent me-2 me-xxl-3 flex-shrink-0">
                          <ImageWithBasePath
                            src="assets/img/icon/user-octagon.svg"
                            alt=""
                          />
                        </span>
                        <div>
                          <span className="d-block">تعداد دانشجویان دوره</span>
                          <h4 className="fs-24 mt-1">
                            {loading ? "..." : stats.totalStudents}
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
                            src="assets/img/icon/book.svg"
                            alt=""
                          />
                        </span>
                        <div>
                          <span className="d-block">
                            تعداد دوره‌های منتشر شده
                          </span>
                          <h4 className="fs-24 mt-1">
                            {loading ? "..." : stats.publishedCourses}
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
                        <span className="icon-box bg-blue-transparent me-2 me-xxl-3 flex-shrink-0">
                          <ImageWithBasePath
                            src="assets/img/icon/book-2.svg"
                            alt=""
                          />
                        </span>
                        <div>
                          <span className="d-block">تعداد کل دوره‌های من</span>
                          <h4 className="fs-24 mt-1">
                            {loading ? "..." : stats.totalCourses}
                          </h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enrollments report */}
              <div className="card">
                <div className="card-body">
                  <div className="d-flex align-items-center flex-wrap gap-3 justify-content-between border-bottom mb-2 pb-3">
                    <h5 className="fw-bold">ثبت‌نام دانشجویان به تفکیک دوره</h5>
                  </div>

                  {loadingEnrollments ? (
                    <div className="text-center py-5">در حال بارگذاری...</div>
                  ) : chartData.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      هنوز دانشجویی در دوره‌های شما ثبت‌نام نکرده است.
                    </div>
                  ) : (
                    <div
                      style={{
                        maxHeight: CONTAINER_MAX_HEIGHT,
                        overflowY:
                          chartHeight > CONTAINER_MAX_HEIGHT
                            ? "auto"
                            : "visible",
                      }}
                    >
                      <ReactApexChart
                        options={enrollmentsChartOptions}
                        series={[{ name: "دانشجو", data: seriesData }]}
                        type="bar"
                        height={chartHeight}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InstructorDashboard;
