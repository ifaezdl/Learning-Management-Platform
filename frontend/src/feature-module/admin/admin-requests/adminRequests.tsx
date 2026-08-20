import { useEffect, useState } from "react";
import userService, {
  InstructorRequestItem,
} from "../../../services/user.service";
import toast from "react-hot-toast";
import ProfileCard from "../common/profileCard";
import AdminSidebar from "../common/adminSidebar";

const PAGE_SIZE = 10;

const AdminRequests = () => {
  const [requests, setRequests] = useState<InstructorRequestItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRequest, setSelectedRequest] =
    useState<InstructorRequestItem | null>(null);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await userService.getInstructorRequests({
        search,
        status: "Pending",
        page,
        pageSize: PAGE_SIZE,
      });
      setRequests(data.data);
      setTotalPages(Math.max(1, Math.ceil(data.total / data.pageSize)));
    } catch (err) {
      console.log(err);
      toast.error("خطا در دریافت لیست درخواست‌ها");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadRequests();
    }, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, page]);

  const approveRequest = async (requestId: number) => {
    try {
      await userService.approveInstructorRequest(requestId);
      toast.success("درخواست تایید شد.");
      setSelectedRequest(null);
      loadRequests();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "خطا در تایید درخواست");
    }
  };

  const rejectRequest = async (requestId: number) => {
    try {
      await userService.rejectInstructorRequest(requestId);
      toast.success("درخواست رد شد.");
      setSelectedRequest(null);
      loadRequests();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "خطا در رد درخواست");
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
                <h5 className="fw-bold mb-0">درخواست‌های تدریس</h5>
                <div style={{ maxWidth: 280, width: "100%" }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="جستجو بر اساس نام، ایمیل یا نام کاربری..."
                    value={search}
                    onChange={(e) => {
                      setPage(1);
                      setSearch(e.target.value);
                    }}
                  />
                </div>
              </div>

              <div className="table-responsive">
                <table className="table table-hover table-bordered align-middle shadow-sm">
                  <thead className="table-dark">
                    <tr>
                      <th>نام</th>
                      <th>نام کاربری</th>
                      <th>ایمیل</th>
                      <th>توضیحات</th>
                      <th>رزومه</th>
                      <th>تاریخ درخواست</th>
                      <th>عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && (
                      <tr>
                        <td colSpan={7} className="text-center py-4">
                          در حال بارگذاری...
                        </td>
                      </tr>
                    )}

                    {!loading && requests.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center py-4">
                          درخواستی یافت نشد.
                        </td>
                      </tr>
                    )}

                    {!loading &&
                      requests.map((req) => {
                        const fullName =
                          `${req.User?.FirstName ?? ""} ${req.User?.LastName ?? ""}`.trim();
                        const createdAtLabel = new Date(
                          req.CreatedAt,
                        ).toLocaleDateString("fa-IR");

                        return (
                          <tr key={req.RequestId}>
                            <td className="fw-semibold">{fullName}</td>
                            <td>{req.User?.UserName}</td>
                            <td>{req.User?.Email}</td>
                            <td>
                              {req.Description ? (
                                <button
                                  type="button"
                                  className="btn btn-outline-secondary btn-sm"
                                  onClick={() => setSelectedRequest(req)}
                                >
                                  مشاهده
                                </button>
                              ) : (
                                "-"
                              )}
                            </td>
                            <td>
                              {req.ResumeUrl ? (
                                <a
                                  href={req.ResumeUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="btn btn-outline-primary btn-sm"
                                >
                                  دانلود
                                </a>
                              ) : (
                                "-"
                              )}
                            </td>
                            <td>{createdAtLabel}</td>
                            <td>
                              <div className="d-flex gap-2">
                                <button
                                  type="button"
                                  className="btn btn-success btn-sm"
                                  onClick={() => approveRequest(req.RequestId)}
                                >
                                  تایید
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => rejectRequest(req.RequestId)}
                                >
                                  رد
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <nav>
                  <ul className="pagination justify-content-center">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (p) => (
                        <li
                          key={p}
                          className={`page-item ${p === page ? "active" : ""}`}
                        >
                          <button
                            type="button"
                            className="page-link"
                            onClick={() => setPage(p)}
                          >
                            {p}
                          </button>
                        </li>
                      ),
                    )}
                  </ul>
                </nav>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedRequest !== null && (
        <RequestModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onApprove={approveRequest}
          onReject={rejectRequest}
        />
      )}
    </>
  );
};

interface RequestModalProps {
  request: InstructorRequestItem;
  onClose: () => void;
  onApprove: (requestId: number) => void;
  onReject: (requestId: number) => void;
}

const RequestModal = ({
  request,
  onClose,
  onApprove,
  onReject,
}: RequestModalProps) => {
  const fullName =
    `${request.User?.FirstName ?? ""} ${request.User?.LastName ?? ""}`.trim();

  return (
    <div
      className="modal d-block"
      tabIndex={-1}
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h6 className="modal-title mb-0">توضیحات درخواست {fullName}</h6>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>

          <div className="modal-body">
            <p style={{ whiteSpace: "pre-wrap" }}>{request.Description}</p>

            {request.ResumeUrl && (
              <a
                href={request.ResumeUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline-primary btn-sm"
              >
                مشاهده رزومه
              </a>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-success btn-sm"
              onClick={() => onApprove(request.RequestId)}
            >
              تایید
            </button>
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={() => onReject(request.RequestId)}
            >
              رد
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRequests;
