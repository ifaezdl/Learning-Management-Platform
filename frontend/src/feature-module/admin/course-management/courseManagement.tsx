import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ProfileCard from "../common/profileCard";
import AdminSidebar from "../common/adminSidebar";
import courseService, {
  Course,
  Category,
  Level,
} from "../../../services/course.service";
import userService from "../../../services/user.service";
import { all_routes } from "../../router/all_routes";
import toast from "react-hot-toast";

const PAGE_SIZE = 10;

const CourseManagement = () => {
  const route = all_routes;
  const navigate = useNavigate();

  const [courses, setCourses] = useState<Course[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [levelId, setLevelId] = useState<number | "">("");
  const [teacherId, setTeacherId] = useState<number | "">("");
  const [page, setPage] = useState(1);

  const [categories, setCategories] = useState<Category[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);

  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [cats, lvls, users] = await Promise.all([
          courseService.getCategories(),
          courseService.getLevels(),
          userService.getUsers(),
        ]);
        setCategories(cats);
        setLevels(lvls);
        // Role_Id: 2 = teacher
        setTeachers(users.filter((u: any) => u.Role_Id === 2));
      } catch {
        toast.error("خطا در دریافت اطلاعات فیلترها");
      }
    };
    fetchMeta();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await courseService.browseAdminCourses({
        search: search.trim() || undefined,
        categoryId: categoryId === "" ? undefined : categoryId,
        levelId: levelId === "" ? undefined : levelId,
        teacherId: teacherId === "" ? undefined : teacherId,
        page,
        pageSize: PAGE_SIZE,
      });
      setCourses(data.data);
      setTotalPages(Math.max(1, data.pagination.totalPages));
    } catch (err) {
      toast.error("خطا در دریافت لیست دوره‌ها");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadCourses();
    }, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, categoryId, levelId, teacherId, page]);

  const handleFilterChange = (setter: any) => (value: any) => {
    setPage(1);
    setter(value);
  };

  const handleDelete = async (target: Course) => {
    try {
      setSubmitting(true);
      await courseService.deleteCourse(target.Id);
      toast.success("دوره با موفقیت حذف شد.");
      setDeletingCourse(null);
      loadCourses();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "خطا در حذف دوره. لطفاً دوباره تلاش کنید.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const teacherName = (course: Course) => {
    const t = course.Users;
    if (!t) return "-";
    return `${t.FirstName ?? ""} ${t.LastName ?? ""}`.trim() || "-";
  };

  const priceLabel = (course: Course) => {
    const price = Number(course.DiscountPrice ?? course.Price);
    if (price === 0) return "رایگان";
    return `${price.toLocaleString("fa-IR")} ریال`;
  };

  return (
    <>
      <div className="content mt-5">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <AdminSidebar />
            <div className="col-lg-9">
              <div className="page-title d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                <h5 className="fw-bold mb-0">مدیریت دوره‌ها</h5>
                <Link
                  to={route.addNewCourse}
                  className="btn btn-primary d-inline-flex align-items-center"
                >
                  <i className="isax isax-add-circle me-1" />
                  افزودن دوره
                </Link>
              </div>

              {/* Filters */}
              <div className="card mb-3">
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-4">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="جستجو بر اساس عنوان دوره..."
                        value={search}
                        onChange={(e) => handleFilterChange(setSearch)(e.target.value)}
                      />
                    </div>
                    <div className="col-md-2">
                      <select
                        className="form-select"
                        value={categoryId}
                        onChange={(e) =>
                          handleFilterChange(setCategoryId)(
                            e.target.value === ""
                              ? ""
                              : Number(e.target.value),
                          )
                        }
                      >
                        <option value="">همه دسته‌بندی‌ها</option>
                        {categories.map((c) => (
                          <option key={c.Id} value={c.Id}>
                            {c.Title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-2">
                      <select
                        className="form-select"
                        value={levelId}
                        onChange={(e) =>
                          handleFilterChange(setLevelId)(
                            e.target.value === "" ? "" : Number(e.target.value),
                          )
                        }
                      >
                        <option value="">همه سطوح</option>
                        {levels.map((l) => (
                          <option key={l.Id} value={l.Id}>
                            {l.LevelName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-2">
                      <select
                        className="form-select"
                        value={teacherId}
                        onChange={(e) =>
                          handleFilterChange(setTeacherId)(
                            e.target.value === ""
                              ? ""
                              : Number(e.target.value),
                          )
                        }
                      >
                        <option value="">همه مدرسان</option>
                        {teachers.map((t: any) => (
                          <option key={t.Id} value={t.Id}>
                            {`${t.FirstName ?? ""} ${t.LastName ?? ""}`.trim()}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-2 d-flex align-items-end">
                      <button
                        type="button"
                        className="btn btn-light w-100"
                        onClick={() => {
                          setSearch("");
                          setCategoryId("");
                          setLevelId("");
                          setTeacherId("");
                          setPage(1);
                        }}
                      >
                        پاک کردن فیلترها
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table table-hover table-bordered align-middle shadow-sm">
                  <thead className="table-dark">
                    <tr>
                      <th style={{ width: 50 }}>#</th>
                      <th>عنوان دوره</th>
                      <th>مدرس</th>
                      <th>دسته‌بندی</th>
                      <th>سطح</th>
                      <th>قیمت</th>
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

                    {!loading && courses.length === 0 && (
                      <tr>
                        <td colSpan={8} className="text-center py-4">
                          دوره‌ای یافت نشد.
                        </td>
                      </tr>
                    )}

                    {!loading &&
                      courses.map((course, index) => (
                        <tr key={course.Id}>
                          <td>{(page - 1) * PAGE_SIZE + index + 1}</td>
                          <td className="fw-semibold">
                            <Link
                              to={route.courseDetails.replace(
                                ":id",
                                String(course.Id),
                              )}
                            >
                              {course.Title}
                            </Link>
                          </td>
                          <td>{teacherName(course)}</td>
                          <td>{course.Category?.Title ?? "-"}</td>
                          <td>{course.Level?.LevelName ?? "-"}</td>
                          <td>{priceLabel(course)}</td>
                          <td>
                            {course.IsPublished ? (
                              <span className="badge bg-success">
                                منتشر شده
                              </span>
                            ) : (
                              <span className="badge bg-warning text-dark">
                                پیش‌نویس
                              </span>
                            )}
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <button
                                type="button"
                                className="btn btn-outline-primary btn-sm d-inline-flex align-items-center"
                                onClick={() =>
                                  navigate(`${route.addNewCourse}?id=${course.Id}`)
                                }
                                title="ویرایش"
                              >
                                <i className="isax isax-edit me-1" />
                                ویرایش
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline-danger btn-sm d-inline-flex align-items-center"
                                onClick={() => setDeletingCourse(course)}
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

      {deletingCourse && (
        <DeleteCourseModal
          courseTitle={deletingCourse.Title}
          submitting={submitting}
          onClose={() => setDeletingCourse(null)}
          onConfirm={() => handleDelete(deletingCourse)}
        />
      )}
    </>
  );
};

interface DeleteCourseModalProps {
  courseTitle: string;
  submitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteCourseModal = ({
  courseTitle,
  submitting,
  onClose,
  onConfirm,
}: DeleteCourseModalProps) => (
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
          <h6 className="mb-3">حذف دوره</h6>
          <p className="mb-4">
            آیا از حذف دوره «{courseTitle}» مطمئن هستید؟ این عمل قابل بازگشت
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
              {submitting ? "در حال حذف..." : "حذف دوره"}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default CourseManagement;
