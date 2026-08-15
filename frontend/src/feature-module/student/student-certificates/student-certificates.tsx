import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import html2canvas from "html2canvas";
import StudentSidebar from "../common/studentSidebar";
import certificateService, {
  Certificate,
} from "../../../services/certificate.service";
import ProfileCard from "../common/profileCard";
import { useAuth } from "../../../context/AuthContext";
import toast from "react-hot-toast";

// ------------------------------------------------------------------
// گواهینامه
// برای تغییر لوگو: فایل public/assets/img/logo.png را جایگزین کنید
// برای تغییر امضا: فایل public/assets/img/sign.svg را جایگزین کنید
// ------------------------------------------------------------------

interface CertificateTemplateProps {
  certificate: Certificate;
  studentName: string;
}

const CertificateTemplate = ({
  certificate,
  studentName,
}: CertificateTemplateProps) => {
  const issuedDate = new Date(certificate.IssuedAt).toLocaleDateString("fa-IR");

  return (
    <div
      dir="rtl"
      style={{
        width: 720,
        maxWidth: "100%",
        margin: "0 auto",
        background: "#fff",
        color: "#1a1a1a",
        fontFamily: "'Noto Sans', sans-serif",
        padding: 10,
      }}
    >
      <div
        style={{
          border: "3px solid #B8860B",
          borderRadius: 12,
          padding: 6,
          background:
            "linear-gradient(135deg, #fffdf5 0%, #fff8e1 50%, #fffdf5 100%)",
        }}
      >
        <div
          style={{
            border: "1px dashed #C9A227",
            borderRadius: 8,
            padding: "36px 40px",
            textAlign: "center",
            position: "relative",
          }}
        >
          {/* لوگو */}
          <img
            src="assets/img/logo.png"
            alt="لوگو"
            style={{ width: 150, margin: "0 auto 18px", display: "block" }}
          />

          <h2
            style={{
              margin: "0 0 6px",
              fontSize: 34,
              fontWeight: 800,
              color: "#1a1a1a",
              letterSpacing: 1,
            }}
          >
            گواهینامه
          </h2>
          <p style={{ margin: "0 0 28px", fontSize: 16, color: "#8a6d1a" }}>
            گواهی پایان دوره
          </p>

          <p style={{ margin: "0 0 4px", fontSize: 15, color: "#444" }}>
            این گواهی‌نامه به‌منظور قدردانی به
          </p>
          <h3
            style={{
              margin: "8px 0",
              fontSize: 26,
              fontWeight: 700,
              color: "#B8860B",
            }}
          >
            {studentName || "-"}
          </h3>
          <p style={{ margin: "0 0 4px", fontSize: 15, color: "#444" }}>
            اعطا می‌شود که دوره
          </p>
          <h4
            style={{
              margin: "8px 0",
              fontSize: 22,
              fontWeight: 700,
              color: "#1a1a1a",
            }}
          >
            {certificate.Courses?.Title || "-"}
          </h4>
          <p style={{ margin: "0 0 24px", fontSize: 15, color: "#444" }}>
            را با موفقیت به پایان رسانده است.
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 40,
              marginBottom: 30,
              fontSize: 14,
              color: "#333",
            }}
          >
            <div>
              <strong>نمره: </strong>
              {certificate.Score} از {certificate.MaxScore}
            </div>
            <div>
              <strong>تاریخ صدور: </strong>
              {issuedDate}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <div style={{ textAlign: "center", fontSize: 12, color: "#777" }}>
              <div
                style={{
                  border: "1px dashed #ccc",
                  borderRadius: 8,
                  width: 120,
                  height: 52,
                  margin: "0 auto 6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  color: "#aaa",
                }}
              >
                محل مهر
              </div>
              مهر و امضای مرکز
            </div>

            <div style={{ textAlign: "center" }}>
              {/* محل امضا — فایل assets/img/sign.svg را جایگزین کنید */}
              <img
                src="assets/img/sign.svg"
                alt="امضا"
                style={{ width: 150, height: 60, objectFit: "contain" }}
              />
              <div style={{ fontSize: 12, color: "#777", marginTop: 4 }}>
                امضا و مهر
              </div>
            </div>

            <div style={{ textAlign: "right", fontSize: 11, color: "#777" }}>
              <div>کد گواهی‌نامه:</div>
              <div style={{ direction: "ltr", fontWeight: 600, color: "#555" }}>
                {certificate.CertificateCode}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StudentCertificates = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [viewingCert, setViewingCert] = useState<Certificate | null>(null);
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
      const canvas = await html2canvas(node, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
      });

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      );
      if (!blob) {
        throw new Error("Could not create image");
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `certificate-${cert.CertificateCode || cert.Id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("گواهی‌نامه با موفقیت دانلود شد.");
    } catch (err) {
      console.error(err);
      toast.error("خطا در دانلود گواهی‌نامه. لطفاً دوباره تلاش کنید.");
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
            <div className="col-lg-9">
              <div className="page-title d-flex align-items-center justify-content-between">
                <h5>گواهی‌نامه‌های من</h5>
              </div>
              <div className="table-responsive custom-table">
                <table className="table">
                  <thead className="thead-light">
                    <tr>
                      <th>ردیف</th>
                      <th>نام دوره</th>
                      <th>تاریخ اخذ گواهی‌نامه</th>
                      <th>نمره</th>
                      <th>عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {certificates?.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-4">
                          گواهی‌نامه‌ای یافت نشد.
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
                        <td>
                          {new Date(c.IssuedAt).toLocaleDateString("fa-IR")}
                        </td>
                        <td>
                          {c.Score} از {c.MaxScore}
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <button
                              type="button"
                              className="d-inline-flex fs-14 me-2 action-icon btn p-0 border-0 bg-transparent"
                              onClick={() => openView(c)}
                              title="مشاهده گواهی‌نامه"
                            >
                              <i className="isax isax-eye" />
                            </button>
                            <button
                              type="button"
                              className="d-inline-flex fs-14 action-icon btn p-0 border-0 bg-transparent"
                              onClick={() => openView(c, true)}
                              title="دانلود گواهی‌نامه"
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
                <h5 className="mb-0">مشاهده گواهی‌نامه</h5>
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
                <div className="text-end mt-4">
                  <button
                    type="button"
                    className="btn btn-secondary rounded-pill d-inline-flex align-items-center"
                    onClick={() => downloadCertificate(viewingCert)}
                    disabled={downloading}
                  >
                    <i className="isax isax-import me-2" />
                    {downloading ? "در حال دانلود..." : "دانلود گواهی‌نامه"}
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
