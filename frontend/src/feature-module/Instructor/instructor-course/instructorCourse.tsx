import { useEffect, useState } from "react";
import ProfileCard from "../common/profileCard";
import InstructorSidebar from "../common/instructorSidebar";
import { Link } from "react-router-dom";
import Table from "../../../core/common/dataTable/index";
import courseService, { MyCourse } from "../../../services/course.service";

const InstructorCourse = () => {
  const [data, setData] = useState<MyCourse[]>([]);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const courses = await courseService.getMyCourses();

      setData(
        courses.map((course) => ({
          key: course.Id,
          ...course,
        })),
      );
    } catch (err) {
      console.log(err);
    }
  };

  const columns = [
    {
      title: "Thumbnail",
      dataIndex: "Thumbnail",
      render: (value: string | null) => (
        <img
          src={value || "/assets/img/course/course-01.jpg"}
          width={70}
          alt=""
        />
      ),
    },

    {
      title: "Title",
      dataIndex: "Title",
    },

    {
      title: "Category",
      render: (_: any, record: MyCourse) => record.Category.Title,
    },

    {
      title: "Level",
      render: (_: any, record: MyCourse) => record.Level?.LevelName ?? "-",
    },

    {
      title: "Price",
      dataIndex: "Price",
      render: (price: number) => `$${price}`,
    },

    {
      title: "Discount",
      dataIndex: "DiscountPrice",
      render: (price: number | null) => (price ? `$${price}` : "-"),
    },

    {
      title: "Published",
      dataIndex: "IsPublished",
      render: (value: boolean) =>
        value ? (
          <span className="badge bg-success">Published</span>
        ) : (
          <span className="badge bg-warning">Draft</span>
        ),
    },

    {
      title: "Created",
      dataIndex: "CreatedAt",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },

    {
      title: "Rating",
      dataIndex: "AverageRating",
    },

    {
      title: "Action",
      render: () => (
        <>
          <button className="btn btn-sm btn-primary me-2">Manage</button>

          <button className="btn btn-sm btn-secondary me-2">Edit</button>

          <button className="btn btn-sm btn-danger">Delete</button>
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
                        دوره های فعال
                      </h6>
                      <h4 className="fw-bold text-white">45</h4>
                    </div>
                  </div>
                </div>
                <div className="col-xxl col-lg-4 col-md-6">
                  <div className="card bg-info">
                    <div className="card-body">
                      <h6 className="fw-medium mb-1 text-white">
                        Draft Courses
                      </h6>
                      <h4 className="fw-bold text-white">15</h4>
                    </div>
                  </div>
                </div>
                <div className="col-xxl col-lg-4 col-md-6">
                  <div className="card bg-skyblue">
                    <div className="card-body">
                      <h6 className="fw-medium mb-1 text-white">
                        Free Courses
                      </h6>
                      <h4 className="fw-bold text-white">16</h4>
                    </div>
                  </div>
                </div>
                <div className="col-xxl col-lg-4 col-md-6">
                  <div className="card bg-purple">
                    <div className="card-body">
                      <h6 className="fw-medium mb-1 text-white">
                        Paid Courses
                      </h6>
                      <h4 className="fw-bold text-white">21</h4>
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
                            Published
                          </Link>
                        </li>
                        <li>
                          <Link to="#" className="dropdown-item rounded-1">
                            Pending
                          </Link>
                        </li>
                        <li>
                          <Link to="#" className="dropdown-item rounded-1">
                            Draft
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="col-md-4"></div>
              </div>
              <Table dataSource={data} columns={columns} Search={true} />
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
                  <h4 className="mb-2">Delete Course</h4>
                  <p className="mb-3">
                    Are you sure you want to delete course?
                  </p>
                  <div className="d-flex align-items-center justify-content-center">
                    <Link
                      to="#"
                      className="btn bg-gray-100 rounded-pill me-2"
                      data-bs-dismiss="modal"
                    >
                      Cancel
                    </Link>
                    <Link
                      to="#"
                      className="btn btn-secondary rounded-pill"
                      data-bs-dismiss="modal"
                    >
                      Yes, Delete
                    </Link>
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
