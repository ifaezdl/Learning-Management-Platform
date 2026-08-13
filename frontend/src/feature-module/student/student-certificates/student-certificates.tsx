import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import { Link } from "react-router-dom";
import StudentSidebar from "../common/studentSidebar";
import { useEffect, useState } from "react";
import certificateService, {
  Certificate,
} from "../../../services/certificate.service";
import ProfileCard from "../common/profileCard";

const StudentCertificates = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  useEffect(() => {
    certificateService.myCertificates().then(setCertificates);
  }, []);
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
                <h5>گواهینامه های من</h5>
              </div>
              <div className="table-responsive custom-table">
                <table className="table">
                  <thead className="thead-light">
                    <tr>
                      <th>ردیف</th>
                      <th>نام دوره</th>
                      <th>تاریخ اخذ گواهینامه </th>
                      <th>نمره</th>

                      <th />
                    </tr>
                  </thead>
                  <tbody>
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
                        <td>{c.Score}</td>

                        <td>
                          <div className="d-flex align-items-center">
                            <Link
                              to="#"
                              className="d-inline-flex fs-14 me-1 action-icon"
                              data-bs-toggle="modal"
                              data-bs-target="#view_certificate"
                            >
                              <i className="isax isax-eye" />
                            </Link>
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
      <div className="modal fade" id="view_certificate">
        <div className="modal-dialog modal-dialog-centered modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h5>View Certificate</h5>
              <button
                type="button"
                className="btn-close custom-btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="isax isax-close-circle5" />
              </button>
            </div>
            <div className="modal-body">
              <div>
                <ImageWithBasePath
                  src="assets/img/icon/certificate.svg"
                  className="img-fluid"
                  alt=""
                />
              </div>
              <div className="text-end mt-4">
                <Link to="#" className="btn btn-secondary rounded-pill">
                  <i className="isax isax-import me-2" />
                  Download
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /View Certificate */}
    </>
  );
};

export default StudentCertificates;
