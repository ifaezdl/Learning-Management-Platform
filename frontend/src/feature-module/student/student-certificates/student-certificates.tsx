import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import StudentSidebar from "../common/studentSidebar";
import certificateService, {
  Certificate,
} from "../../../services/certificate.service";
import analyticsService, {
  SkillStat,
} from "../../../services/analytics.service";
import ProfileCard from "../common/profileCard";
import { useAuth } from "../../../context/AuthContext";
import {
  CertificateTemplate,
  downloadElementAsPng,
} from "../../../core/common/certificate/certificateTemplate";
import toast from "react-hot-toast";

// Inline skill breakdown widget shown inside the certificate modal
function SkillBreakdownWidget({ skills }: { skills: SkillStat[] }) {
  if (skills.length === 0) return null;

  // Only show skills below 70% mastery threshold in the alert
  const weakSkills = skills.filter((s) => s.percentage < 70);
  const weakest = weakSkills.slice(0, 3);

  return (
    <div
      className="mt-4 p-3 rounded"
      style={{
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        direction: "rtl",
      }}
    >
      <h6 className="mb-2" style={{ fontSize: 14 }}>
        <i className="isax isax-chart-2 me-1 text-primary" />
        تحلیل مهارتی این آزمون
      </h6>

      {/* Weakest tags alert */}
      {weakest.length > 0 && (
        <div
          className="mb-3 px-3 py-2 rounded small"
          style={{ background: "#fff7ed", border: "1px solid #fed7aa" }}
        >
          <span style={{ fontWeight: 600, color: "#c2410c" }}>
            نیاز به مرور بیشتر در:{" "}
          </span>
          {weakest.map((s, i) => (
            <span key={s.tag}>
              <strong>{s.tag}</strong>
              {` (${s.percentage}٪)`}
              {i < weakest.length - 1 ? "، " : ""}
            </span>
          ))}
        </div>
      )}

      {/* Mini bar chart via progress elements */}
      <div className="d-flex flex-column gap-2">
        {skills.map((s) => (
          <div key={s.tag}>
            <div className="d-flex justify-content-between small mb-1">
              <span>{s.tag}</span>
              <span className="text-muted">
                {s.correct}/{s.total} ({s.percentage}٪)
              </span>
            </div>
            <div
              className="progress"
              style={{ height: 6, borderRadius: 4 }}
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
    </div>
  );
}

const StudentCertificates = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [viewingCert, setViewingCert] = useState<Certificate | null>(null);
  const [skillBreakdown, setSkillBreakdown] = useState<SkillStat[]>([]);
  const [downloading, setDownloading] = useState(false);
  const [autoDownload, setAutoDownload] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    certificateService.myCertificates().then(setCertificates);
  }, []);

  const studentName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();

  const downloadCertificate = async (cert: Certificate) => {
    const node = certRef.current;
    if (!node) return;

    try {
      setDownloading(true);
      await downloadElementAsPng(
        node,
        `certificate-${cert.CertificateCode || cert.Id}.png`,
      );
      toast.success("گواهینامه با موفقیت دانلود شد.");
    } catch (err) {
      console.error(err);
      toast.error("خطا در دانلود گواهینامه. لطفاً دوباره تلاش کنید.");
    } finally {
      setDownloading(false);
    }
  };

  // وقتی از آیکون دانلود ردیف استفاده می‌شود، مودال باز می‌شود و پس از رندر، دانلود اجرا می‌شود
  useEffect(() => {
    if (autoDownload && viewingCert && certRef.current) {
      const t = setTimeout(() => {
        downloadCertificate(viewingCert);
        setAutoDownload(false);
      }, 300);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoDownload, viewingCert]);

  const openView = (cert: Certificate, download = false) => {
    setViewingCert(cert);
    setAutoDownload(download);
    // Fetch the enriched certificate to get skillBreakdown
    setSkillBreakdown([]);
    certificateService
      .getCertificate(cert.Id)
      .then((enriched: any) => {
        if (Array.isArray(enriched.skillBreakdown)) {
          setSkillBreakdown(enriched.skillBreakdown);
        }
      })
      .catch(() => {
        // Non-fatal: skill breakdown is optional
      });
  };

  return (
    <>
      <div className="content mt-5">
        <div className="container">
          {/* Profile */}
          <ProfileCard />
          {/* /Profile */}
          <div className="row">
            {/* Sidebar */}
            <StudentSidebar />
            {/* sidebar */}
            <div className="col-lg-12">
              <div className="page-title d-flex align-items-center justify-content-between">
                <h5>گواهینامه‌های من</h5>
              </div>
              <div className="table-responsive custom-table">
                <table className="table">
                  <thead className="thead-light">
                    <tr>
                      <th>ردیف</th>
                      <th>نام دوره</th>
                      <th>تاریخ اخذ گواهینامه</th>
                      <th>نمره</th>
                      <th>عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {certificates?.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-4">
                          گواهینامه‌ای یافت نشد.
                        </td>
                      </tr>
                    )}
                    {certificates?.map((c, i) => (
                      <tr key={c.Id}>
                        <td>{String(i + 1).padStart(2, "0")}</td>
                        <td>
                          <Link to="#" className="fw-semibold">
                            {c.Courses.Title}
                          </Link>
                        </td>
                        <td>{new Date(c.IssuedAt).toLocaleDateString("fa-IR")}</td>
                        <td>
                          {c.Score} از {c.MaxScore}
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <button
                              type="button"
                              className="d-inline-flex fs-14 me-2 action-icon btn p-0 border-0 bg-transparent"
                              onClick={() => openView(c)}
                              title="مشاهده گواهینامه"
                            >
                              <i className="isax isax-eye" />
                            </button>
                            <button
                              type="button"
                              className="d-inline-flex fs-14 action-icon btn p-0 border-0 bg-transparent"
                              onClick={() => openView(c, true)}
                              title="دانلود گواهینامه"
                            >
                              <i className="isax isax-import" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Certificate */}
      {viewingCert && (
        <div
          className="modal d-block"
          tabIndex={-1}
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="mb-0">مشاهده گواهینامه</h5>
                <button
                  type="button"
                  className="btn-close custom-btn-close"
                  onClick={() => setViewingCert(null)}
                  aria-label="بستن"
                >
                  <i className="isax isax-close-circle5" />
                </button>
              </div>
              <div className="modal-body">
                <div ref={certRef} style={{ background: "#fff" }}>
                  <CertificateTemplate
                    certificate={viewingCert}
                    studentName={studentName}
                  />
                </div>
                {/* Skill breakdown widget — shown below the certificate */}
                <SkillBreakdownWidget skills={skillBreakdown} />
                <div className="text-end mt-4">
                  <button
                    type="button"
                    className="btn btn-secondary rounded-pill d-inline-flex align-items-center"
                    onClick={() => downloadCertificate(viewingCert)}
                    disabled={downloading}
                  >
                    <i className="isax isax-import me-2" />
                    {downloading ? "در حال دانلود..." : "دانلود گواهینامه"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* /View Certificate */}
    </>
  );
};

export default StudentCertificates;
