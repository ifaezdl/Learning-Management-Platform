import React, { useState } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { Modal } from "react-bootstrap";
import type { TrendClassification } from "../../../services/analytics.service";

interface TrendBadgeProps {
  trendStatus: TrendClassification["status"];
  slope: number;
  quizScores?: Array<{ date: string; percentage: number }>;
  studentName?: string;
}

const TrendBadge: React.FC<TrendBadgeProps> = ({
  trendStatus,
  slope,
  quizScores = [],
  studentName,
}) => {
  const [showModal, setShowModal] = useState(false);

  // رنگ‌بندی و آیکون بر اساس وضعیت
  const getBadgeStyle = () => {
    switch (trendStatus) {
      case "صعودی":
        return {
          bg: "bg-success-subtle",
          text: "text-success",
          icon: "isax-arrow-up-3",
          emoji: "🟢",
        };
      case "نزولی":
        return {
          bg: "bg-danger-subtle",
          text: "text-danger",
          icon: "isax-arrow-down-2",
          emoji: "🔴",
        };
      case "ثابت":
        return {
          bg: "bg-secondary-subtle",
          text: "text-secondary",
          icon: "isax-minus",
          emoji: "⚪",
        };
      default:
        return {
          bg: "bg-light",
          text: "text-muted",
          icon: "isax-info-circle",
          emoji: "—",
        };
    }
  };

  const style = getBadgeStyle();

  // Sparkline کوچک (فقط 5 نمره آخر)
  const sparklineData = quizScores.slice(-5).map((q) => q.percentage);

  const sparklineOptions: ApexOptions = {
    chart: {
      type: "line",
      sparkline: { enabled: true },
      animations: { enabled: false },
    },
    stroke: {
      curve: "smooth",
      width: 2,
      colors:
        trendStatus === "صعودی"
          ? ["#10b981"]
          : trendStatus === "نزولی"
            ? ["#ef4444"]
            : ["#94a3b8"],
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: (val: number) => `${val}٪`,
      },
      style: { fontSize: "11px" },
    },
    markers: {
      size: 0,
    },
  };

  // نمودار کامل در مودال
  const fullChartOptions: ApexOptions = {
    chart: {
      type: "line",
      toolbar: { show: false },
      fontFamily: "inherit",
      zoom: { enabled: false },
      animations: { enabled: true, speed: 800 },
    },
    stroke: {
      curve: "smooth",
      width: 3,
      colors:
        trendStatus === "صعودی"
          ? ["#10b981"]
          : trendStatus === "نزولی"
            ? ["#ef4444"]
            : ["#94a3b8"],
    },
    xaxis: {
      categories: quizScores.map((q, i) => `آزمون ${i + 1}`),
      labels: {
        rotate: -30,
        style: { fontSize: "12px", colors: "#64748b", fontWeight: 500 },
      },
    },
    yaxis: {
      min: 0,
      max: 100,
      tickAmount: 5,
      labels: {
        formatter: (v) => `${v}٪`,
        style: { fontSize: "12px", colors: "#64748b", fontWeight: 500 },
      },
    },
    tooltip: {
      y: { formatter: (val: number) => `${val}٪` },
      style: { fontSize: "13px" },
    },
    markers: {
      size: 5,
      strokeWidth: 2,
      strokeColors: "#fff",
      hover: { size: 7 },
    },
    grid: {
      borderColor: "#f1f5f9",
      strokeDashArray: 3,
    },
    dataLabels: { enabled: false },
  };

  return (
    <>
      <div
        className="d-flex align-items-center gap-2"
        style={{ cursor: quizScores.length > 0 ? "pointer" : "default" }}
        onClick={() => quizScores.length > 0 && setShowModal(true)}
      >
        <span
          className={`badge ${style.bg} ${style.text} px-2 py-1`}
          style={{ fontSize: "11px", minWidth: 70 }}
        >
          <span className="me-1">{style.emoji}</span>
          {trendStatus}
        </span>

        {sparklineData.length >= 2 && (
          <div style={{ width: 60, height: 24 }}>
            <ReactApexChart
              type="line"
              options={sparklineOptions}
              series={[{ data: sparklineData }]}
              height={24}
              width={60}
            />
          </div>
        )}
      </div>

      {/* مودال جزئیات */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="h5">
            <i className="isax isax-chart-21 me-2 text-primary" />
            تحلیل روند یادگیری
            {studentName && <span className="text-muted small ms-2">• {studentName}</span>}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          <div
            className={`alert ${style.bg} ${style.text} mb-4`}
            style={{ border: "none" }}
          >
            <div className="d-flex align-items-center gap-2 mb-2">
              <i className={`isax ${style.icon}`} style={{ fontSize: 20 }} />
              <strong>وضعیت روند: {trendStatus}</strong>
            </div>
            <div className="small">
              شیب خط روند: <strong>{slope.toFixed(2)}</strong> واحد درصد به
              ازای هر آزمون
            </div>
          </div>

          {quizScores.length >= 2 ? (
            <>
              <h6 className="mb-3">نمودار پیشرفت نمرات</h6>
              <ReactApexChart
                type="line"
                options={fullChartOptions}
                series={[
                  {
                    name: "نمره آزمون",
                    data: quizScores.map((q) => q.percentage),
                  },
                ]}
                height={300}
              />

              <div className="mt-4">
                <h6 className="mb-3">جزئیات آزمون‌ها</h6>
                <div className="table-responsive">
                  <table className="table table-sm table-hover">
                    <thead className="table-light">
                      <tr>
                        <th className="border-0">#</th>
                        <th className="border-0">تاریخ</th>
                        <th className="text-center border-0">نمره</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quizScores.map((q, i) => (
                        <tr key={i}>
                          <td>{i + 1}</td>
                          <td className="small">
                            {new Date(q.date).toLocaleDateString("fa-IR")}
                          </td>
                          <td className="text-center">
                            <span
                              className={`badge ${
                                q.percentage >= 70
                                  ? "bg-success-subtle text-success"
                                  : q.percentage >= 40
                                    ? "bg-warning-subtle text-warning"
                                    : "bg-danger-subtle text-danger"
                              }`}
                            >
                              {q.percentage}٪
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-muted py-4">
              <i className="isax isax-info-circle fs-24 d-block mb-2" />
              داده کافی برای نمایش نمودار وجود ندارد.
            </div>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default TrendBadge;
