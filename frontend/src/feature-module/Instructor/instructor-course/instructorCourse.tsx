import { useEffect, useState } from "react";
import ProfileCard from "../common/profileCard";
import InstructorSidebar from "../common/instructorSidebar";
import { Link, useNavigate } from "react-router-dom";
import Table from "../../../core/common/dataTable/index";
import courseService, { MyCourse } from "../../../services/course.service";
import toast from "react-hot-toast";
import { all_routes } from "../../router/all_routes";

const InstructorCourse = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<MyCourse[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [publishCourseId, setPublishCourseId] = useState<number | null>(null);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const courses = await courseService.getMyCourses();
      setData(courses.map((course) => ({ key: course.Id, ...course })));
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // ---- Delete ----
  const handleDeleteClick = (id: number) => setSelectedCourseId(id);

  const handleConfirmDelete = async () => {
    if (selectedCourseId === null) return;
    try {
      setDeleting(true);
      await courseService.deleteCourse(selectedCourseId);
      setData((prev) => prev.filter((c) => c.Id !== selectedCourseId));
      toast.success("دوره حذف شد.");
    } catch (err) {
      console.log(err);
      toast.error("حذف دوره با خطا مواجه شد.");
    } finally {
      setDeleting(false);
      setSelectedCourseId(null);
    }
  };

  // ---- Publish ----
  const handlePublishClick = (id: number) => setPublishCourseId(id);

  const handleConfirmPublish = async () => {
    if (publishCourseId === null) return;
    try {
      setPublishing(true);
      await courseService.publishCourse(publishCourseId);
      setData((prev) =>
        prev.map((c) =>
          c.Id === publishCourseId ? { ...c, IsPublished: true } : c,
        ),
      );
      toast.success("دوره منتشر شد.");
    } catch (err: any) {
      console.log(err);
      // publish() throws 400 if course has no sections/lessons yet
      toast.error(
        err?.response?.data?.message ||
          "انتشار دوره با خطا مواجه شد. ابتدا سرفصل و درس اضافه کنید.",
      );
    } finally {
      setPublishing(false);
      setPublishCourseId(null);
    }
  };

  // ---- Stats ----
  const publishedCount = data.filter((c) => c.IsPublished).length;
  const draftCount = data.filter((c) => !c.IsPublished).length;
  const freeCount = data.filter((c) => Number(c.Price) === 0).length;
  const paidCount = data.filter((c) => Number(c.Price) > 0).length;

  const columns = [
    { title: "عنوان", dataIndex: "Title" },
    {
      title: "دسته بندی",
      render: (_: any, record: MyCourse) => record.Category?.Title ?? "-",
    },
    {
      title: "سطح",
      render: (_: any, record: MyCourse) => record.Level?.LevelName ?? "-",
    },
    {
      title: "هزینه (ریال)",
      dataIndex: "Price",
      render: (price: number) => `$${price}`,
    },
    {
      title: "مبلغ با تخفیف",
      dataIndex: "DiscountPrice",
      render: (price: number | null) => (price ? `$${price}` : "-"),
    },
    {
      title: "وضعیت انتشار",
      dataIndex: "IsPublished",
      render: (value: boolean) =>
        value ? (
          <span className="badge bg-success-transparent text-success">
            منتشر شده
          </span>
        ) : (
          <span className="badge bg-light text-muted border">پیش نویس</span>
        ),
    },
    {
      title: "تاریخ ایجاد",
      dataIndex: "CreatedAt",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "عملیات",
      render: (_: any, record: MyCourse) => (
        <div className="d-flex align-items-center gap-2">
          {!record.IsPublished && (
            <button
              className="btn btn-sm btn-outline-success"
              data-bs-toggle="modal"
              data-bs-target="#publish_modal"
              onClick={() => handlePublishClick(record.Id)}
              title="انتشار دوره"
            >
              انتشار
            </button>
          )}

          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() =>
              navigate(`${all_routes.addNewCourse}?id=${record.Id}`)
            }
          >
            ویرایش
          </button>

          <button
            className="btn btn-sm btn-outline-danger"
            data-bs-toggle="modal"
            data-bs-target="#delete_modal"
            onClick={() => handleDeleteClick(record.Id)}
          >
            حذف
          </button>
        </div>
      ),
    },
  ];

  const stats = [
    {
      label: "منتشر شده",
      value: publishedCount,
      icon: "isax-tick-circle",
    },
    {
      label: "پیش‌نویس",
      value: draftCount,
      icon: "isax-edit-2",
    },
    {
      label: "دوره‌های رایگان",
      value: freeCount,
      icon: "isax-gift",
    },
    {
      label: "دوره‌های فروشی",
      value: paidCount,
      icon: "isax-wallet",
    },
  ];

  return (
    <>
      <div className="content mt-5">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <InstructorSidebar />
            <div className="col-lg-9">
              {/* Stat cards — one accent color, white background, no rainbow */}
              <div className="row">
                {stats.map((s) => (
                  <div className="col-xxl col-lg-4 col-md-6 mb-3" key={s.label}>
                    <div className="card border h-100">
                      <div className="card-body d-flex align-items-center gap-3">
                        <span className="avatar avatar-lg bg-primary-transparent rounded-circle">
                          <i className={`isax ${s.icon} fs-20 text-primary`} />
                        </span>
                        <div>
                          <h6 className="fw-medium mb-1 text-muted">
                            {s.label}
                          </h6>
                          <h4 className="fw-bold mb-0">
                            {loading ? "-" : s.value}
                          </h4>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="row">
                <div className="col-md-8">
                  <div className="mb-3">
                    <div className="dropdown">
                      <Link
                        to="#"
                        className="dropdown-toggle text-gray-6 btn rounded border d-inline-flex align-items-center"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        Status
                      </Link>
                      <ul className="dropdown-menu dropdown-menu-end p-3">
                        <li>
                          <Link to="#" className="dropdown-item rounded-1">
                            منتشر شده
                          </Link>
                        </li>
                        <li>
                          <Link to="#" className="dropdown-item rounded-1">
                            پیش نویس
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="col-md-4"></div>
              </div>

              {loading ? (
                <div className="text-center py-5">در حال بارگذاری...</div>
              ) : data.length === 0 ? (
                <div className="text-center py-5">
                  هنوز دوره‌ای ایجاد نکرده‌اید.
                </div>
              ) : (
                <Table dataSource={data} columns={columns} Search={true} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <div className="modal fade" id="delete_modal">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body text-center custom-modal-body">
              <span className="avatar avatar-lg bg-danger-transparent rounded-circle mb-2">
                <i className="isax isax-trash fs-24 text-danger" />
              </span>
              <div>
                <h4 className="mb-2">حذف دوره</h4>
                <p className="mb-3">آیا از حذف دوره اطمینان دارید ؟</p>
                <div className="d-flex align-items-center justify-content-center">
                  <button
                    type="button"
                    className="btn bg-gray-100 rounded-pill me-2"
                    data-bs-dismiss="modal"
                    onClick={() => setSelectedCourseId(null)}
                  >
                    لغو
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger rounded-pill"
                    data-bs-dismiss="modal"
                    disabled={deleting}
                    onClick={handleConfirmDelete}
                  >
                    {deleting ? "در حال حذف..." : "بله, حذف"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Publish Modal */}
      <div className="modal fade" id="publish_modal">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body text-center custom-modal-body">
              <span className="avatar avatar-lg bg-success-transparent rounded-circle mb-2">
                <i className="isax isax-tick-circle fs-24 text-success" />
              </span>
              <div>
                <h4 className="mb-2">انتشار دوره</h4>
                <p className="mb-3">
                  آیا مطمئن هستید که می‌خواهید این دوره را منتشر کنید؟ پس از
                  انتشار، دوره برای دانشجویان قابل مشاهده خواهد بود.
                </p>
                <div className="d-flex align-items-center justify-content-center">
                  <button
                    type="button"
                    className="btn bg-gray-100 rounded-pill me-2"
                    data-bs-dismiss="modal"
                    onClick={() => setPublishCourseId(null)}
                  >
                    لغو
                  </button>
                  <button
                    type="button"
                    className="btn btn-success rounded-pill"
                    data-bs-dismiss="modal"
                    disabled={publishing}
                    onClick={handleConfirmPublish}
                  >
                    {publishing ? "در حال انتشار..." : "بله, منتشر شود"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InstructorCourse;
