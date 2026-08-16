import React, { useCallback, useEffect, useState } from "react";
import ProfileCard from "../common/profileCard";
import AdminSidebar from "../common/adminSidebar";
import toast from "react-hot-toast";
import contactService, {
  ContactMessage,
  ContactMessagesPage,
} from "../../../services/contact.service";

const PAGE_SIZE = 10;

const SUBJECT_LABELS: Record<string, string> = {
  course: "سوال درباره دوره",
  account: "مشکل حساب کاربری",
  payment: "مشکل پرداخت",
  technical: "مشکل فنی",
  suggestion: "پیشنهاد و انتقاد",
  other: "سایر موارد",
};

const faNum = (n: number) => n.toLocaleString("fa-IR");

const ContactMessages = () => {
  const [data, setData] = useState<ContactMessagesPage | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "unread" | "read">("all");
  const [page, setPage] = useState(1);

  const [viewing, setViewing] = useState<ContactMessage | null>(null);
  const [deleting, setDeleting] = useState<ContactMessage | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      const res = await contactService.getMessages({
        search: search.trim() || undefined,
        status,
        page,
        pageSize: PAGE_SIZE,
      });
      setData(res);
    } catch (err) {
      toast.error("خطا در دریافت پیام‌ها");
    } finally {
      setLoading(false);
    }
  }, [search, status, page]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    setPage(1);
  }, [search, status]);

  const openMessage = (msg: ContactMessage) => {
    setViewing(msg);
    if (!msg.IsRead) {
      contactService
        .markRead(msg.Id)
        .then(() => {
          setData((prev) =>
            prev
              ? {
                  ...prev,
                  items: prev.items.map((m) =>
                    m.Id === msg.Id ? { ...m, IsRead: true } : m,
                  ),
                }
              : prev,
          );
        })
        .catch(() => {});
    }
  };

  const handleToggleRead = async (msg: ContactMessage) => {
    try {
      if (msg.IsRead) {
        await contactService.markUnread(msg.Id);
      } else {
        await contactService.markRead(msg.Id);
      }
      setData((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((m) =>
                m.Id === msg.Id ? { ...m, IsRead: !m.IsRead } : m,
              ),
            }
          : prev,
      );
      setViewing((prev) => (prev && prev.Id === msg.Id ? { ...prev, IsRead: !prev.IsRead } : prev));
    } catch {
      toast.error("خطا در به‌روزرسانی وضعیت پیام");
    }
  };

  const handleDelete = async (msg: ContactMessage) => {
    try {
      setSubmitting(true);
      await contactService.deleteMessage(msg.Id);
      toast.success("پیام با موفقیت حذف شد.");
      setDeleting(null);
      setViewing(null);
      loadMessages();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "خطا در حذف پیام");
    } finally {
      setSubmitting(false);
    }
  };

  const totalPages = data?.totalPages ?? 1;

  return (
    <>
      <div className="content mt-5">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <AdminSidebar />
            <div className="col-lg-9">
              <div className="page-title d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                <h5 className="fw-bold mb-0">پیام‌های کاربران</h5>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <input
                    type="text"
                    className="form-control"
                    style={{ maxWidth: 260 }}
                    placeholder="جستجو بر اساس نام، ایمیل یا متن پیام..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <select
                    className="form-select"
                    style={{ maxWidth: 160 }}
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as "all" | "unread" | "read")
                    }
                  >
                    <option value="all">همه پیام‌ها</option>
                    <option value="unread">خوانده‌نشده</option>
                    <option value="read">خوانده‌شده</option>
                  </select>
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-4">
                  <div className="card card-body shadow-sm">
                    <div className="d-flex align-items-center justify-content-between">
                      <div>
                        <h6 className="mb-1 text-muted fs-13">کل پیام‌ها</h6>
                        <h4 className="mb-0">{faNum(data?.total ?? 0)}</h4>
                      </div>
                      <i className="isax isax-message-text-1 fs-3 text-primary" />
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card card-body shadow-sm">
                    <div className="d-flex align-items-center justify-content-between">
                      <div>
                        <h6 className="mb-1 text-muted fs-13">
                          خوانده‌نشده
                        </h6>
                        <h4 className="mb-0">
                          {faNum(
                            data?.items.filter((m) => !m.IsRead).length ?? 0,
                          )}
                        </h4>
                      </div>
                      <i className="isax isax-message-notif fs-3 text-warning" />
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card card-body shadow-sm">
                    <div className="d-flex align-items-center justify-content-between">
                      <div>
                        <h6 className="mb-1 text-muted fs-13">خوانده‌شده</h6>
                        <h4 className="mb-0">
                          {faNum(
                            data?.items.filter((m) => m.IsRead).length ?? 0,
                          )}
                        </h4>
                      </div>
                      <i className="isax isax-message-tick fs-3 text-success" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table table-hover table-bordered align-middle shadow-sm">
                  <thead className="table-dark">
                    <tr>
                      <th style={{ width: 50 }}>#</th>
                      <th>نام فرستنده</th>
                      <th>ایمیل</th>
                      <th>موضوع</th>
                      <th>متن پیام</th>
                      <th>تاریخ</th>
                      <th>وضعیت</th>
                      <th>عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && (
                      <tr>
                        <td colSpan={8} className="text-center py-4">
                          در حال بارگذاری...
                        </td>
                      </tr>
                    )}

                    {!loading && (data?.items.length ?? 0) === 0 && (
                      <tr>
                        <td colSpan={8} className="text-center py-4">
                          پیامی یافت نشد.
                        </td>
                      </tr>
                    )}

                    {!loading &&
                      data?.items.map((m, index) => (
                        <tr
                          key={m.Id}
                          className={m.IsRead ? "" : "table-warning"}
                        >
                          <td>{(page - 1) * PAGE_SIZE + index + 1}</td>
                          <td className="fw-semibold">{m.FullName}</td>
                          <td dir="ltr">{m.Email}</td>
                          <td>
                            {m.Subject
                              ? (SUBJECT_LABELS[m.Subject] ?? m.Subject)
                              : "-"}
                          </td>
                          <td className="text-truncate" style={{ maxWidth: 240 }}>
                            {m.Message}
                          </td>
                          <td>
                            {new Date(m.CreatedAt).toLocaleDateString("fa-IR")}
                            <div className="fs-12 text-muted">
                              {new Date(m.CreatedAt).toLocaleTimeString(
                                "fa-IR",
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </div>
                          </td>
                          <td>
                            {m.IsRead ? (
                              <span className="badge bg-success">خوانده‌شده</span>
                            ) : (
                              <span className="badge bg-warning text-dark">
                                جدید
                              </span>
                            )}
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <button
                                type="button"
                                className="btn btn-outline-primary btn-sm d-inline-flex align-items-center"
                                onClick={() => openMessage(m)}
                                title="مشاهده"
                              >
                                <i className="isax isax-eye me-1" />
                                مشاهده
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline-danger btn-sm d-inline-flex align-items-center"
                                onClick={() => setDeleting(m)}
                                disabled={submitting}
                                title="حذف"
                              >
                                <i className="isax isax-trash4 me-1" />
                                حذف
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
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
                            {faNum(p)}
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

      {viewing && (
        <MessageViewModal
          message={viewing}
          onClose={() => setViewing(null)}
          onToggleRead={() => handleToggleRead(viewing)}
          onDelete={() => setDeleting(viewing)}
        />
      )}

      {deleting && (
        <DeleteConfirmModal
          senderName={deleting.FullName}
          submitting={submitting}
          onClose={() => setDeleting(null)}
          onConfirm={() => handleDelete(deleting)}
        />
      )}
    </>
  );
};

const MessageViewModal: React.FC<{
  message: ContactMessage;
  onClose: () => void;
  onToggleRead: () => void;
  onDelete: () => void;
}> = ({ message, onClose, onToggleRead, onDelete }) => (
  <div
    className="modal d-block"
    tabIndex={-1}
    style={{ background: "rgba(0,0,0,0.5)" }}
    onClick={onClose}
  >
    <div
      className="modal-dialog modal-dialog-centered"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="modal-content">
        <div className="modal-header">
          <h6 className="modal-title mb-0">پیام کاربر</h6>
          <button
            type="button"
            className="btn-close"
            onClick={onClose}
            aria-label="بستن"
          />
        </div>
        <div className="modal-body">
          <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
            <div className="d-flex align-items-center">
              <span className="avatar avatar-md avatar-rounded me-2 bg-primary text-white d-flex align-items-center justify-content-center fw-semibold">
                {message.FullName.charAt(0)}
              </span>
              <div>
                <div className="fw-semibold">{message.FullName}</div>
                <div className="fs-13 text-muted" dir="ltr">
                  {message.Email}
                </div>
              </div>
            </div>
            <span
              className={`badge ${message.IsRead ? "bg-success" : "bg-warning text-dark"}`}
            >
              {message.IsRead ? "خوانده‌شده" : "جدید"}
            </span>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-sm-6">
              <div className="bg-light rounded-3 p-3 h-100">
                <div className="fs-12 text-muted mb-1">شماره تماس</div>
                <div dir="ltr">{message.Phone || "-"}</div>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="bg-light rounded-3 p-3 h-100">
                <div className="fs-12 text-muted mb-1">موضوع</div>
                <div>
                  {message.Subject
                    ? (SUBJECT_LABELS[message.Subject] ?? message.Subject)
                    : "-"}
                </div>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="bg-light rounded-3 p-3 h-100">
                <div className="fs-12 text-muted mb-1">تاریخ ارسال</div>
                <div>
                  {new Date(message.CreatedAt).toLocaleDateString("fa-IR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  <span className="text-muted fs-13">
                    {" "}
                    -{" "}
                    {new Date(message.CreatedAt).toLocaleTimeString("fa-IR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="bg-light rounded-3 p-3 h-100">
                <div className="fs-12 text-muted mb-1">فرستنده</div>
                <div>{message.User_Id ? `کاربر ${message.User_Id}` : "کاربر مهمان"}</div>
              </div>
            </div>
          </div>

          <div className="bg-light rounded-3 p-3">
            <div className="fs-12 text-muted mb-1">متن پیام</div>
            <p className="mb-0" style={{ whiteSpace: "pre-wrap" }}>
              {message.Message}
            </p>
          </div>
        </div>
        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={onToggleRead}
          >
            <i
              className={`isax me-1 ${
                message.IsRead ? "isax-message-remove" : "isax-message-tick"
              }`}
            />
            {message.IsRead ? "علامت‌گذاری به‌عنوان نخوانده" : "علامت‌گذاری به‌عنوان خوانده‌شده"}
          </button>
          <button type="button" className="btn btn-danger" onClick={onDelete}>
            <i className="isax isax-trash4 me-1" />
            حذف
          </button>
          <button type="button" className="btn btn-light" onClick={onClose}>
            بستن
          </button>
        </div>
      </div>
    </div>
  </div>
);

const DeleteConfirmModal: React.FC<{
  senderName: string;
  submitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}> = ({ senderName, submitting, onClose, onConfirm }) => (
  <div
    className="modal d-block"
    tabIndex={-1}
    style={{ background: "rgba(0,0,0,0.5)" }}
    onClick={onClose}
  >
    <div
      className="modal-dialog modal-dialog-centered modal-sm"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="modal-content">
        <div className="modal-body text-center py-4">
          <h6 className="mb-3">حذف پیام</h6>
          <p className="mb-4">
            آیا از حذف پیام «{senderName}» مطمئن هستید؟ این عمل قابل بازگشت
            نیست.
          </p>
          <div className="d-flex align-items-center justify-content-center gap-2">
            <button
              type="button"
              className="btn btn-light"
              onClick={onClose}
              disabled={submitting}
            >
              انصراف
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={onConfirm}
              disabled={submitting}
            >
              {submitting ? "در حال حذف..." : "حذف پیام"}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default ContactMessages;
