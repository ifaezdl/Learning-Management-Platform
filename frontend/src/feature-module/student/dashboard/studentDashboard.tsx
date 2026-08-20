import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import ProfileCard from "../common/profileCard";
import StudentSidebar from "../common/studentSidebar";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import { all_routes } from "../../router/all_routes";
import dashboardService, {
  DashboardSummary,
} from "../../../services/dashboard.service";
import quizService from "../../../services/quiz.service";
import certificateService, {
  Certificate,
} from "../../../services/certificate.service";

const StudentDashboard = () => {
  const route = all_routes;
  const navigate = useNavigate();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [resuming, setResuming] = useState(false);

  useEffect(() => {
    Promise.all([
      dashboardService.getSummary(),
      certificateService.myCertificates(),
    ])
      .then(([s, certs]) => {
        setSummary(s);
        setCertificates(certs);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleContinueQuiz = async () => {
    if (!summary?.inProgressAttempt) return;
    setResuming(true);
    try {
      const attempt = await quizService.startQuiz(
        summary.inProgressAttempt.courseId,
      );
      navigate(route.studentQuizQuestion, { state: { attempt } });
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "ادامه آزمون با خطا مواجه شد.",
      );
    } finally {
      setResuming(false);
    }
  };

  const latestCertificate = certificates[0];

  return (
    <div className="content mt-5">
      <div className="container">
        <ProfileCard />
        <div className="row">
          <StudentSidebar />
          <div className="col-lg-12">
            {summary?.inProgressAttempt && (
              <div className="card bg-light quiz-ans-card">
                <ImageWithBasePath
                  src="./assets/img/shapes/withdraw-bg1.svg"
                  className="quiz-ans-bg1"
                  alt="img"
                />
                <ImageWithBasePath
                  src="./assets/img/shapes/withdraw-bg2.svg"
                  className="quiz-ans-bg2"
                  alt="img"
                />
                <div className="card-body">
                  <div className="row align-items-center">
                    <div className="col-md-8">
                      <div>
                        <h6 className="mb-1">
                          آزمون ناتمام: {summary?.inProgressAttempt.quizTitle}
                        </h6>
                        <p>{summary?.inProgressAttempt.courseTitle}</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="text-end">
                        <button
                          type="button"
                          className="btn btn-primary rounded-pill"
                          disabled={resuming}
                          onClick={handleContinueQuiz}
                        >
                          {resuming ? "در حال بارگذاری..." : "ادامه آزمون"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="row">
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
                        <span className="d-block">دوره های من</span>
                        <h4 className="fs-24 mt-1">
                          {loading ? "…" : (summary?.enrolledCount ?? 0)}
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
                      <span className="icon-box bg-secondary-transparent me-2 me-xxl-3 flex-shrink-0">
                        <ImageWithBasePath
                          src="assets/img/icon/book.svg"
                          alt=""
                        />
                      </span>
                      <div>
                        <span className="d-block">آزمون های پیش رو</span>
                        <h4 className="fs-24 mt-1">
                          {loading
                            ? "…"
                            : (summary?.availableQuizzesCount ?? 0)}
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
                          src="assets/img/icon/bookmark.svg"
                          alt=""
                        />
                      </span>
                      <div>
                        <span className="d-block">گواهینامه کسب شده</span>
                        <h4 className="fs-24 mt-1">
                          {loading ? "…" : (summary?.certificatesCount ?? 0)}
                        </h4>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-12">
                <div className="card mb-0">
                  <div className="card-body">
                    <h5 className="mb-3 fs-18 border-bottom pb-3">
                      آخرین گواهینامه
                    </h5>
                    {latestCertificate ? (
                      <div className="d-flex align-items-center flex-wrap justify-content-between row-gap-2">
                        <div>
                          <h6 className="mb-1">
                            {latestCertificate.Courses.Title}
                          </h6>
                          <p>
                            نمره: {latestCertificate.Score}/
                            {latestCertificate.MaxScore}
                          </p>
                        </div>
                        <Link
                          to={route.studentCertificates}
                          className="btn btn-sm btn-outline-secondary"
                        >
                          مشاهده همه
                        </Link>
                      </div>
                    ) : (
                      <p className="text-muted mb-0">
                        هنوز گواهینامه‌ای کسب نکرده‌اید.
                      </p>
                    )}
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

export default StudentDashboard;
