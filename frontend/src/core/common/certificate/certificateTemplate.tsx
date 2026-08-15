import html2canvas from "html2canvas";
import { Certificate } from "../../../services/certificate.service";

// ------------------------------------------------------------------
// گواهینامه — الگوی مشترک صفحه دانشجو و صفحه مدیریت
// برای تغییر لوگو: فایل public/assets/img/logo.png را جایگزین کنید
// برای تغییر امضا: فایل public/assets/img/sign.svg را جایگزین کنید
// نکته: از letter-spacing در متن فارسی استفاده نکنید — html2canvas
// حروف چسبیده فارسی را جدا می‌کند و کلمه بهم می‌ریزد
// ------------------------------------------------------------------

interface CertificateTemplateProps {
  certificate: Pick<
    Certificate,
    "IssuedAt" | "Score" | "MaxScore" | "CertificateCode" | "Courses"
  >;
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
            }}
          >
            گواهینامه
          </h2>
          <p style={{ margin: "0 0 28px", fontSize: 16, color: "#8a6d1a" }}>
            گواهی پایان دوره
          </p>

          <p style={{ margin: "0 0 4px", fontSize: 15, color: "#444" }}>
            این گواهینامه به‌منظور قدردانی به
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
              <div>کد گواهینامه:</div>
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

// تبدیل عنصر گواهینامه به تصویر PNG و دانلود آن
const downloadElementAsPng = async (
  node: HTMLElement,
  filename: string,
): Promise<void> => {
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
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export { CertificateTemplate, downloadElementAsPng };
