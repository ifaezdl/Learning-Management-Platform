import { useEffect, useState } from "react";
import ProfileCard from "../common/profileCard";
import InstructorSidebar from "../common/instructorSidebar";
import { Link, useNavigate } from "react-router-dom";
import Table from "../../../core/common/dataTable/index";
import courseService, { MyCourse } from "../../../services/course.service";

const InstructorCourse = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<MyCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const courses = await courseService.getMyCourses();

      setData(
        courses.map((course) => ({
          key: course.Id,
          ...course,
        })),
      );
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setSelectedCourseId(id);
  };

  const handleConfirmDelete = async () => {
    if (selectedCourseId === null) return;
    try {
      setDeleting(true);
      await courseService.deleteCourse(selectedCourseId);
      setData((prev) => prev.filter((c) => c.Id !== selectedCourseId));
    } catch (err) {
      console.log(err);
    } finally {
      setDeleting(false);
      setSelectedCourseId(null);
    }
  };

  // ---- Real stats derived from actual course data ----
  const publishedCount = data.filter((c) => c.IsPublished).length;
  const draftCount = data.filter((c) => !c.IsPublished).length;
  const freeCount = data.filter((c) => Number(c.Price) === 0).length;
  const paidCount = data.filter((c) => Number(c.Price) > 0).length;

  const columns = [
    // {
    //   title: "Thumbnail",
    //   dataIndex: "Thumbnail",
    //   render: (value: string | null) => (
    //     <img
    //       src={value || "/assets/img/course/course-01.jpg"}
    //       width={70}
    //       alt=""
    //     />
    //   ),
    // },

    {
      title: "عنوان",
      dataIndex: "Title",
    },

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
          <span className="badge bg-success">منتشر شده</span>
        ) : (
          <span className="badge bg-warning">پیش نویس</span>
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
        <>
          {/* <button
            className="btn btn-sm btn-primary me-2"
            onClick={() => navigate(`/instructor/courses/${record.Id}/manage`)}
          >
            Manage
          </button> */}

          <button
            className="btn btn-sm btn-secondary me-2"
            onClick={() => navigate(`/instructor/courses/${record.Id}/edit`)}
          >
            ویرایش
          </button>

          <button
            className="btn btn-sm btn-danger"
            data-bs-toggle="modal"
            data-bs-target="#delete_modal"
            onClick={() => handleDeleteClick(record.Id)}
          >
            حذف
          </button>
        </>
      ),
    },
  ];

  return (
    <>
      <div className="content mt-5">
        <div className="container">
          <ProfileCard />
          <div className="row">
            {/* Sidebar */}
            <InstructorSidebar />
            {/* /Sidebar */}
            <div className="col-lg-9">
              <div className="row">
                <div className="col-xxl col-lg-4 col-md-6">
                  <div className="card bg-success">
                    <div className="card-body">
                      <h6 className="fw-medium mb-1 text-white">
                        دوره های منتشر شده
                      </h6>
                      <h4 className="fw-bold text-white">
                        {loading ? "-" : publishedCount}
                      </h4>
                    </div>
                  </div>
                </div>
                <div className="col-xxl col-lg-4 col-md-6">
                  <div className="card bg-info">
                    <div className="card-body">
                      <h6 className="fw-medium mb-1 text-white">
                        دوره های پیش‌نویس
                      </h6>
                      <h4 className="fw-bold text-white">
                        {loading ? "-" : draftCount}
                      </h4>
                    </div>
                  </div>
                </div>
                <div className="col-xxl col-lg-4 col-md-6">
                  <div className="card bg-skyblue">
                    <div className="card-body">
                      <h6 className="fw-medium mb-1 text-white">
                        دوره های رایگان
                      </h6>
                      <h4 className="fw-bold text-white">
                        {loading ? "-" : freeCount}
                      </h4>
                    </div>
                  </div>
                </div>
                <div className="col-xxl col-lg-4 col-md-6">
                  <div className="card bg-purple">
                    <div className="card-body">
                      <h6 className="fw-medium mb-1 text-white">
                        دوره های پولی
                      </h6>
                      <h4 className="fw-bold text-white">
                        {loading ? "-" : paidCount}
                      </h4>
                    </div>
                  </div>
                </div>
              </div>
              <div className="page-title d-flex align-items-center justify-content-between">
                <h5 className="fw-bold">دوره ها</h5>
              </div>
              <div className="row">
                <div className="col-md-8">
                  <div className="mb-3">
                    <div className="dropdown">
                      <Link
                        to="#"
                        className="dropdown-toggle text-gray-6 btn  rounded border d-inline-flex align-items-center"
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
      <>
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
                      className="btn btn-secondary rounded-pill"
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
        {/* /Delete Modal */}
      </>
    </>
  );
};

export default InstructorCourse;
