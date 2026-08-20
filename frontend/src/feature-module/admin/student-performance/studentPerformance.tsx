import React, { useEffect, useRef, useState } from "react";
import ProfileCard from "../common/profileCard";
import AdminSidebar from "../common/adminSidebar";
import courseService, {
  Course,
  CourseStudent,
} from "../../../services/course.service";
import {
  CertificateTemplate,
  downloadElementAsPng,
} from "../../../core/common/certificate/certificateTemplate";
import toast from "react-hot-toast";

interface ViewingCert {
  studentName: string;
  courseTitle: string;
  certificate: NonNullable<CourseStudent["certificate"]>;
}

const StudentPerformance = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | "">("");
  const [students, setStudents] = useState<CourseStudent[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [viewingCert, setViewingCert] = useState<ViewingCert | null>(null);
  const [downloading, setDownloading] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoadingCourses(true);
        // تمام دوره‌ها (منتشرشده و پیش‌نویس)
        const data = await courseService.browseAdminCourses({
          page: 1,
          pageSize: 500,
        });
        setCourses(data.data);
        if (data.data.length > 0) {
          setSelectedCourseId(data.data[0].Id);
        }
      } catch {
        toast.error("خطا در دریافت لیست دوره‌ها");
      } finally {
        setLoadingCourses(false);
      }
    };
    loadCourses();
  }, []);

  const loadStudents = async (courseId: number) => {
    try {
      setLoadingStudents(true);
      const data = await courseService.getCourseStudents(courseId);
      setStudents(data);
    } catch {
      setStudents([]);
      toast.error("خطا در دریافت عملکرد دانشجویان");
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    if (selectedCourseId !== "") {
      loadStudents(Number(selectedCourseId));
    }
  }, [selectedCourseId]);

  const selectedCourse = courses.find(
    (c) => c.Id === Number(selectedCourseId),
  );

  const totalStudents = students.length;
  const participated = students.filter((s) => s.hasParticipatedInExam).length;
  const passed = students.filter((s) => s.isPassed === true).length;

  const fullName = (s: CourseStudent) =>
    `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim() || s.email || "-";

  const downloadCertificate = async (v: ViewingCert) => {
    const node = certRef.current;
    if (!node) return;
    try {
      setDownloading(true);
      await downloadElementAsPng(
        node,
        `certificate-${v.certificate.CertificateCode || v.certificate.Id}.png`,
      );
      toast.success("گواهینامه با موفقیت دانلود شد.");
    } catch (err) {
      console.error(err);
      toast.error("خطا در دانلود گواهینامه. لطفاً دوباره تلاش کنید.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <div className="content mt-5">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <AdminSidebar />
            <div className="col-lg-12">
              <div className="page-title d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                <h5 className="fw-bold mb-0">عملکرد دانشجویان</h5>
                <div style={{ minWidth: 300, maxWidth: 420 }}>
                  <select
                    className="form-select"
                    value={selectedCourseId}
                    onChange={(e) =>
                      setSelectedCourseId(
                        e.target.value === "" ? "" : Number(e.target.value),
                      )
                    }
                    disabled={loadingCourses}
                  >
                    <option value="">انتخاب دوره...</option>
                    {courses.map((c) => (
                      <option key={c.Id} value={c.Id}>
                        {c.Title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedCourse && (
                <div className="row g-3 mb-3">
                  <div className="col-md-4">
                    <div className="card">
                      <div className="card-body d-flex align-items-center justify-content-between">
                        <div>
                          <span className="d-block fs-14 text-muted">
                            تعداد دانشجویان
                          </span>
                          <h4 className="fs-24 mt-1 mb-0">
                            {totalStudents.toLocaleString("fa-IR")}
                          </h4>
                        </div>
                        <i className="isax isax-profile-2user5 fs-3 text-primary" />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card">
                      <div className="card-body d-flex align-items-center justify-content-between">
                        <div>
                          <span className="d-block fs-14 text-muted">
                            شرکت‌کنندگان در آزمون
                          </span>
                          <h4 className="fs-24 mt-1 mb-0">
                            {participated.toLocaleString("fa-IR")}
                          </h4>
                        </div>
                        <i className="isax isax-tick-square fs-3 text-secondary" />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card">
                      <div className="card-body d-flex align-items-center justify-content-between">
                        <div>
                          <span className="d-block fs-14 text-muted">
                            قبول‌شدگان
                          </span>
                          <h4 className="fs-24 mt-1 mb-0">
                            {passed.toLocaleString("fa-IR")}
                          </h4>
                        </div>
                        <i className="isax isax-award fs-3 text-success" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="table-responsive">
                <table className="table table-hover table-bordered align-middle shadow-sm">
                  <thead className="table-dark">
                    <tr>
                      <th style={{ width: 50 }}>#</th>
                      <th>دانشجو</th>
                      <th>پیشرفت</th>
                      <th>آزمون</th>
                      <th>نمره</th>
                      <th>وضعیت</th>
                      <th>گواهینامه</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingStudents && (
                      <tr>
                        <td colSpan={7} className="text-center py-4">
                          در حال بارگذاری...
                        </td>
                      </tr>
                    )}

                    {!loadingStudents && selectedCourseId === "" && (
                      <tr>
                        <td colSpan={7} className="text-center py-4">
                          یک دوره را انتخاب کنید.
                        </td>
                      </tr>
                    )}

                    {!loadingStudents &&
                      selectedCourseId !== "" &&
                      students.length === 0 && (
                        <tr>
                          <td colSpan={7} className="text-center py-4">
                            دانشجویی برای این دوره یافت نشد.
                          </td>
                        </tr>
                      )}

                    {!loadingStudents &&
                      students.map((s, index) => (
                        <tr key={s.studentId}>
                          <td>{index + 1}</td>
                          <td>
                            <div className="fw-semibold">{fullName(s)}</div>
                            <div className="fs-14 text-muted">
                              {s.email ?? "-"}
                            </div>
                          </td>
                          <td style={{ minWidth: 140 }}>
                            <div className="d-flex align-items-center gap-2">
                              <div className="progress flex-grow-1" style={{ height: 8 }}>
                                <div
                                  className="progress-bar bg-success"
                                  role="progressbar"
                                  style={{ width: `${s.progressPercent}%` }}
                                />
                              </div>
                              <span className="fs-14">
                                {s.progressPercent}٪
                              </span>
                            </div>
                            <div className="fs-12 text-muted mt-1">
                              {s.completedLessons} از {s.totalLessons} درس
                            </div>
                          </td>
                          <td>
                            {s.hasParticipatedInExam ? (
                              <span className="badge bg-info">شرکت کرده</span>
                            ) : (
                              <span className="badge bg-secondary">
                                شرکت نکرده
                              </span>
                            )}
                          </td>
                          <td>
                            {s.score !== null && s.maxScore !== null ? (
                              <span className="fw-semibold">
                                {Number(s.score).toLocaleString("fa-IR")} از{" "}
                                {Number(s.maxScore).toLocaleString("fa-IR")}
                              </span>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td>
                            {s.isPassed === true ? (
                              <span className="badge bg-success">قبول</span>
                            ) : s.isPassed === false ? (
                              <span className="badge bg-danger">مردود</span>
                            ) : (
                              <span className="badge bg-secondary">-</span>
                            )}
                          </td>
                          <td>
                            {s.certificate ? (
                              <button
                                type="button"
                                className="btn btn-outline-primary btn-sm d-inline-flex align-items-center"
                                onClick={() =>
                                  setViewingCert({
                                    studentName: fullName(s),
                                    courseTitle: selectedCourse?.Title ?? "",
                                    certificate: s.certificate!,
                                  })
                                }
                              >
                                <i className="isax isax-eye me-1" />
                                مشاهده
                              </button>
                            ) : (
                              "-"
                            )}
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

      {/* Certificate modal */}
      {viewingCert && (
        <div
          className="modal d-block"
          tabIndex={-1}
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="mb-0">گواهینامه {viewingCert.studentName}</h5>
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
                    certificate={{
                      ...viewingCert.certificate,
                      Courses: { Title: viewingCert.courseTitle },
                    }}
                    studentName={viewingCert.studentName}
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
                    {downloading ? "در حال دانلود..." : "دانلود گواهینامه"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StudentPerformance;
