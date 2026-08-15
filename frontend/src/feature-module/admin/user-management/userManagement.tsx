import React, { useEffect, useMemo, useState } from "react";
import ProfileCard from "../common/profileCard";
import AdminSidebar from "../common/adminSidebar";
import userService, {
  User,
  CreateUserRequest,
  UpdateUserRequest,
} from "../../../services/user.service";
import { useAuth } from "../../../context/AuthContext";
import toast from "react-hot-toast";

const PAGE_SIZE = 10;

// Role_Id: 1 = student, 2 = teacher, 3 = admin
const ROLE_LABELS: Record<number, string> = {
  1: "دانشجو",
  2: "مدرس",
  3: "ادمین",
};
const ROLE_BADGE_CLASS: Record<number, string> = {
  1: "bg-primary",
  2: "bg-secondary",
  3: "bg-dark",
};

const emptyForm = {
  firstName: "",
  lastName: "",
  userName: "",
  email: "",
  mobile: "",
  password: "",
  roleId: 1,
  isActive: true,
};

const UserManagement = () => {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getUsers();
      setUsers(data);
    } catch (err) {
      toast.error("خطا در دریافت لیست کاربران");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      [
        u.FirstName,
        u.LastName,
        u.UserName,
        u.Email,
        u.Mobile,
      ]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(q)),
    );
  }, [users, search]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const paginatedUsers = filteredUsers.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  useEffect(() => {
    setPage(1);
  }, [search]);

  const handleCreate = async (form: typeof emptyForm) => {
    try {
      setSubmitting(true);
      setFormError("");
      const payload: CreateUserRequest = {
        firstName: form.firstName,
        lastName: form.lastName,
        userName: form.userName,
        email: form.email,
        mobile: form.mobile,
        password: form.password,
        roleId: Number(form.roleId),
      };
      await userService.createUser(payload);
      toast.success("کاربر با موفقیت ایجاد شد.");
      setShowAddModal(false);
      loadUsers();
    } catch (err: any) {
      setFormError(
        err?.response?.data?.message ||
          "خطا در ایجاد کاربر. لطفاً دوباره تلاش کنید.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (form: typeof emptyForm) => {
    if (!editingUser) return;
    try {
      setSubmitting(true);
      setFormError("");
      const payload: UpdateUserRequest = {
        firstName: form.firstName,
        lastName: form.lastName,
        userName: form.userName,
        email: form.email,
        mobile: form.mobile,
        roleId: Number(form.roleId),
        isActive: form.isActive,
      };
      if (form.password) {
        payload.password = form.password;
      }
      await userService.updateUser(editingUser.Id, payload);
      toast.success("اطلاعات کاربر با موفقیت به‌روزرسانی شد.");
      setEditingUser(null);
      loadUsers();
    } catch (err: any) {
      setFormError(
        err?.response?.data?.message ||
          "خطا در به‌روزرسانی کاربر. لطفاً دوباره تلاش کنید.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (target: User) => {
    try {
      setSubmitting(true);
      await userService.deleteUser(target.Id);
      toast.success("کاربر با موفقیت حذف شد.");
      setDeletingUser(null);
      loadUsers();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          "خطا در حذف کاربر. لطفاً دوباره تلاش کنید.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const fullName = (u: User) =>
    `${u.FirstName ?? ""} ${u.LastName ?? ""}`.trim() || "-";

  return (
    <>
      <div className="content mt-5">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <AdminSidebar />
            <div className="col-lg-9">
              <div className="page-title d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                <h5 className="fw-bold mb-0">مدیریت کاربران</h5>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <div style={{ maxWidth: 280, width: "100%" }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="جستجو بر اساس نام، ایمیل، موبایل یا نام کاربری..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary d-inline-flex align-items-center"
                    onClick={() => setShowAddModal(true)}
                  >
                    <i className="isax isax-add-circle me-1" />
                    افزودن کاربر
                  </button>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table table-hover table-bordered align-middle shadow-sm">
                  <thead className="table-dark">
                    <tr>
                      <th style={{ width: 50 }}>#</th>
                      <th>نام و نام خانوادگی</th>
                      <th>نام کاربری</th>
                      <th>ایمیل</th>
                      <th>موبایل</th>
                      <th>نقش</th>
                      <th>وضعیت</th>
                      <th>تاریخ عضویت</th>
                      <th>عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && (
                      <tr>
                        <td colSpan={9} className="text-center py-4">
                          در حال بارگذاری...
                        </td>
                      </tr>
                    )}

                    {!loading && filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={9} className="text-center py-4">
                          کاربری یافت نشد.
                        </td>
                      </tr>
                    )}

                    {!loading &&
                      paginatedUsers.map((u, index) => {
                        const isSelf = currentUser?.id === u.Id;
                        return (
                          <tr key={u.Id}>
                            <td>{(page - 1) * PAGE_SIZE + index + 1}</td>
                            <td className="fw-semibold">
                              {fullName(u)}
                              {isSelf && (
                                <span className="badge bg-info ms-2">شما</span>
                              )}
                            </td>
                            <td>{u.UserName ?? "-"}</td>
                            <td>{u.Email ?? "-"}</td>
                            <td>{u.Mobile ?? "-"}</td>
                            <td>
                              <span
                                className={`badge ${ROLE_BADGE_CLASS[u.Role_Id] ?? "bg-light text-dark"}`}
                              >
                                {ROLE_LABELS[u.Role_Id] ?? "نامشخص"}
                              </span>
                            </td>
                            <td>
                              {u.IsActive ? (
                                <span className="badge bg-success">
                                  فعال
                                </span>
                              ) : (
                                <span className="badge bg-danger">
                                  غیرفعال
                                </span>
                              )}
                            </td>
                            <td>
                              {u.CreatedAt
                                ? new Date(u.CreatedAt).toLocaleDateString(
                                    "fa-IR",
                                  )
                                : "-"}
                            </td>
                            <td>
                              <div className="d-flex gap-2">
                                <button
                                  type="button"
                                  className="btn btn-outline-primary btn-sm d-inline-flex align-items-center"
                                  onClick={() => setEditingUser(u)}
                                  title="ویرایش"
                                >
                                  <i className="isax isax-edit me-1" />
                                  ویرایش
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-outline-danger btn-sm d-inline-flex align-items-center"
                                  onClick={() => setDeletingUser(u)}
                                  disabled={isSelf || submitting}
                                  title={
                                    isSelf
                                      ? "نمی‌توانید حساب خودتان را حذف کنید"
                                      : "حذف"
                                  }
                                >
                                  <i className="isax isax-trash4 me-1" />
                                  حذف
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

      {showAddModal && (
        <UserFormModal
          mode="add"
          initialValues={emptyForm}
          submitting={submitting}
          error={formError}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreate}
        />
      )}

      {editingUser && (
        <UserFormModal
          mode="edit"
          initialValues={{
            firstName: editingUser.FirstName ?? "",
            lastName: editingUser.LastName ?? "",
            userName: editingUser.UserName ?? "",
            email: editingUser.Email ?? "",
            mobile: editingUser.Mobile ?? "",
            password: "",
            roleId: editingUser.Role_Id,
            isActive: editingUser.IsActive,
          }}
          submitting={submitting}
          error={formError}
          onClose={() => setEditingUser(null)}
          onSubmit={handleUpdate}
        />
      )}

      {deletingUser && (
        <DeleteConfirmModal
          userName={fullName(deletingUser)}
          submitting={submitting}
          onClose={() => setDeletingUser(null)}
          onConfirm={() => handleDelete(deletingUser)}
        />
      )}
    </>
  );
};

interface UserFormModalProps {
  mode: "add" | "edit";
  initialValues: typeof emptyForm;
  submitting: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (form: typeof emptyForm) => void;
}

const UserFormModal = ({
  mode,
  initialValues,
  submitting,
  error,
  onClose,
  onSubmit,
}: UserFormModalProps) => {
  const [form, setForm] = useState(initialValues);

  const set = (key: keyof typeof emptyForm, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div
      className="modal d-block"
      tabIndex={-1}
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h6 className="modal-title mb-0">
              {mode === "add" ? "افزودن کاربر جدید" : "ویرایش کاربر"}
            </h6>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="بستن"
            />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger py-2" role="alert">
                  {error}
                </div>
              )}

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">
                    <span className="text-danger me-1">*</span>
                    نام
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.firstName}
                    onChange={(e) => set("firstName", e.target.value)}
                    required
                    minLength={2}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">
                    <span className="text-danger me-1">*</span>
                    نام خانوادگی
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.lastName}
                    onChange={(e) => set("lastName", e.target.value)}
                    required
                    minLength={2}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">
                    <span className="text-danger me-1">*</span>
                    نام کاربری
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.userName}
                    onChange={(e) => set("userName", e.target.value)}
                    required
                    minLength={3}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">
                    <span className="text-danger me-1">*</span>
                    موبایل
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.mobile}
                    onChange={(e) => set("mobile", e.target.value)}
                    required
                    pattern="09[0-9]{9}"
                    title="شماره موبایل باید با 09 شروع شود (مثال: 09123456789)"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">
                    <span className="text-danger me-1">*</span>
                    ایمیل
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">
                    <span className="text-danger me-1">*</span>
                    نقش
                  </label>
                  <select
                    className="form-select"
                    value={form.roleId}
                    onChange={(e) => set("roleId", Number(e.target.value))}
                    required
                  >
                    <option value={1}>دانشجو</option>
                    <option value={2}>مدرس</option>
                    <option value={3}>ادمین</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">
                    <span className="text-danger me-1">*</span>
                    رمز عبور
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    value={form.password}
                    onChange={(e) => set("password", e.target.value)}
                    required={mode === "add"}
                    minLength={8}
                    placeholder={
                      mode === "edit"
                        ? "برای تغییر رمز، رمز جدید وارد کنید (اختیاری)"
                        : "حداقل ۸ کاراکتر"
                    }
                  />
                </div>
                {mode === "edit" && (
                  <div className="col-md-6">
                    <label className="form-label">وضعیت حساب</label>
                    <select
                      className="form-select"
                      value={form.isActive ? "1" : "0"}
                      onChange={(e) => set("isActive", e.target.value === "1")}
                    >
                      <option value="1">فعال</option>
                      <option value="0">غیرفعال</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-light"
                onClick={onClose}
                disabled={submitting}
              >
                انصراف
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting
                  ? "در حال ذخیره..."
                  : mode === "add"
                    ? "افزودن کاربر"
                    : "ذخیره تغییرات"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

interface DeleteConfirmModalProps {
  userName: string;
  submitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteConfirmModal = ({
  userName,
  submitting,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) => (
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
          <h6 className="mb-3">حذف کاربر</h6>
          <p className="mb-4">
            آیا از حذف کاربر «{userName}» مطمئن هستید؟ این عمل قابل بازگشت
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
              {submitting ? "در حال حذف..." : "حذف کاربر"}
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>
  );

export default UserManagement;
