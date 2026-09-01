import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import practiceExamsService from "../../../services/practice-exams.service";
import "./practice-exams.scss";

interface ResultDetail {
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
}

const PracticeExamResult = () => {
  const { resultId } = useParams<{ resultId: string }>();
  const navigate = useNavigate();

  // State management
  const [result, setResult] = useState<ResultDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load result details on mount
  useEffect(() => {
    loadResultDetails();
  }, [resultId]);

  const loadResultDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!resultId) {
        setError("شناسه نتیجه یافت نشد");
        return;
      }

      const response =
        await practiceExamsService.getPracticeExamResultDetails(
          parseInt(resultId),
        );

      setResult(response);
    } catch (err: any) {
      setError(err.message || "خطایی در بارگذاری نتایج رخ داد");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

  if (error) {
    return (
      <div className="container-fluid mt-5">
        <div className="alert alert-danger">
          <i className="isax isax-close-circle me-2"></i>
          <strong>خطا:</strong> {error}
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/student/practice-exams")}
        >
          <i className="isax isax-arrow-left me-2"></i>
          بازگشت
        </button>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="container-fluid mt-5">
        <div className="alert alert-warning">
          <i className="isax isax-info-circle me-2"></i>
          نتیجه‌ای یافت نشد
        </div>
      </div>
    );
  }

  const scorePercentage = result.percentage;
  const scoreColor =
    scorePercentage >= 70 ? "success" : scorePercentage >= 50 ? "warning" : "danger";

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="practice-exams-header mb-4">
        <h2>
          <i className="isax isax-document-text me-2"></i>
          نتایج آزمون تمرینی
        </h2>
        <p>دوره: {result.courseTitle} | مهارت: {result.skillTag || "نامشخص"}</p>
      </div>

      {/* Score Summary */}
      <div className="row mb-4">
        <div className="col-lg-8 mx-auto">
          <div className="card">
            <div className="card-body text-center">
              <h4 className="mb-3">نمره شما</h4>

              {/* Circular Score */}
              <div className="mb-4">
                <div
                  className={`display-4 text-${scoreColor}`}
                  style={{ fontWeight: "bold" }}
                >
                  {result.percentage.toFixed(1)}%
                </div>
              </div>

              {/* Score Details */}
              <div className="row">
                <div className="col-md-4">
                  <small className="text-muted d-block mb-1">نمره کسب‌شده</small>
                  <h5 className="text-primary">
                    {result.score.toFixed(1)} / {result.maxScore.toFixed(1)}
                  </h5>
                </div>
                <div className="col-md-4">
                  <small className="text-muted d-block mb-1">پاسخ‌های درست</small>
                  <h5 className="text-success">
                    {result.correctCount} / {result.totalQuestions}
                  </h5>
                </div>
                <div className="col-md-4">
                  <small className="text-muted d-block mb-1">تاریخ تلاش</small>
                  <h5>
                    {new Date(result.completedAt).toLocaleDateString("fa-IR")}
                  </h5>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="progress" style={{ height: "20px" }}>
                  <div
                    className={`progress-bar bg-${scoreColor}`}
                    style={{ width: `${scorePercentage}%` }}
                  >
                    {scorePercentage.toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mt-3">
                {result.isPassed ? (
                  <span className="badge bg-success">
                    <i className="isax isax-tick-circle me-1"></i>
                    موفق
                  </span>
                ) : (
                  <span className="badge bg-danger">
                    <i className="isax isax-close-circle me-1"></i>
                    نامموفق
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Info */}
      <div className="row mb-4">
        <div className="col-lg-8 mx-auto">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-4">خلاصه نتایج</h5>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <small className="text-muted d-block">تعداد سوالات</small>
                      <h6 className="mb-0">{result.totalQuestions} سوال</h6>
                    </div>
                    <i className="isax isax-document-text text-primary" style={{ fontSize: "2rem" }}></i>
                  </div>
                </div>

                <div className="col-md-6 mb-3">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <small className="text-muted d-block">پاسخ‌های درست</small>
                      <h6 className="mb-0">{result.correctCount} پاسخ</h6>
                    </div>
                    <i className="isax isax-tick-circle text-success" style={{ fontSize: "2rem" }}></i>
                  </div>
                </div>

                <div className="col-md-6 mb-3">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <small className="text-muted d-block">پاسخ‌های غلط</small>
                      <h6 className="mb-0">{result.wrongCount} پاسخ</h6>
                    </div>
                    <i className="isax isax-close-circle text-danger" style={{ fontSize: "2rem" }}></i>
                  </div>
                </div>

                <div className="col-md-6 mb-3">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <small className="text-muted d-block">درصد موفقیت</small>
                      <h6 className="mb-0">{result.percentage.toFixed(1)}%</h6>
                    </div>
                    <i className="isax isax-chart-2 text-info" style={{ fontSize: "2rem" }}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="row mb-4">
        <div className="col-lg-8 mx-auto text-center">
          <button
            className="btn btn-primary me-2"
            onClick={() => navigate("/student/practice-exams")}
          >
            <i className="isax isax-arrow-left me-2"></i>
            بازگشت به صفحه اصلی
          </button>
          <button
            className="btn btn-outline-primary"
            onClick={() => window.print()}
          >
            <i className="isax isax-printer me-2"></i>
            چاپ نتایج
          </button>
        </div>
      </div>
    </div>
  );
};

export default PracticeExamResult;
