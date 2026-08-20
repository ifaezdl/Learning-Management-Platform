import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { all_routes } from "../../router/all_routes";
import courseService, { Course } from "../../../services/course.service"; // adjust path if needed
import { api_base_url } from "../../../environment";
import ProfileCard from "../common/profileCard";
import InstructorSidebar from "../common/instructorSidebar";

const InstructorEnrolledCourse = () => {
  const route = all_routes;

  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedItems, setSelectedItems] = useState<Record<number, boolean>>(
    {},
  );
  const handleItemClick = (id: number) => {
    setSelectedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    debugger;
    const fetchEnrolled = async () => {
      try {
        setLoading(true);
        const data = await courseService.getEnrolledCourses();
        setEnrolledCourses(data);
        setError(null);
      } catch (err) {
        console.error("Failed to load enrolled courses", err);
        setError("Could not load your enrolled courses.");
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolled();
  }, []);

  return (
    <>
      <div className="content mt-5">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <InstructorSidebar />
            <div className="col-lg-9">
              <div className="page-title d-flex flex-wrap gap-3 align-items-center justify-content-between">
                <h5>دوره های من</h5>
              </div>

              <div>
                  {loading && (
                    <div
                      className="d-flex justify-content-center align-items-center"
                      style={{ minHeight: "300px" }}
                    >
                      <span className="fw-semibold text-muted">
                        در حال بارگذاری دوره‌ها...
                      </span>
                    </div>
                  )}

                  {!loading && error && <p className="text-danger">{error}</p>}

                  {!loading && !error && enrolledCourses.length === 0 && (
                    <div
                      className="d-flex justify-content-center align-items-center"
                      style={{ minHeight: "300px" }}
                    >
                      <span className="fw-semibold text-muted">
                        دوره‌ای یافت نشد.
                      </span>
                    </div>
                  )}

                  {!loading && !error && enrolledCourses.length > 0 && (
                    <div className="row">
                      {enrolledCourses.map((course) => (
                        <div className="col-xl-4 col-md-6" key={course.Id}>
                          <div className="course-item-two course-item mx-0">
                            <div className="course-img">
                              <Link
                                to={`${all_routes.courseDetails}/${course.Id}`}
                              >
                                <img
                                  src={
                                    course.Thumbnail
                                      ? `${api_base_url}${course.Thumbnail}`
                                      : "/assets/img/course/course-09.jpg"
                                  }
                                  alt={course.Title}
                                  className="img-fluid"
                                />
                              </Link>
                              <div
                                className="position-absolute start-0 top-0 d-flex align-items-start w-100 z-index-2 p-3"
                                onClick={() => handleItemClick(course.Id)}
                              >
                                {course.DiscountPrice != null && (
                                  <div className="badge text-bg-danger">
                                    {Math.round(
                                      ((course.Price - course.DiscountPrice) /
                                        course.Price) *
                                        100,
                                    )}
                                    % off
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="course-content">
                              <div className="d-flex justify-content-between mb-2">
                                <div className="d-flex align-items-center">
                                  <div className="ms-2">
                                    <span className="link-default fs-14">
                                      {course.Users
                                        ? `${course.Users.FirstName} ${course.Users.LastName}`
                                        : "Unknown Instructor"}
                                    </span>
                                  </div>
                                </div>
                                <span className="badge badge-light rounded-pill bg-light d-inline-flex align-items-center fs-13 fw-medium mb-0">
                                  {course.Category?.Title}
                                </span>
                              </div>
                              <h6 className="title mb-2">
                                <Link
                                  to={`${all_routes.courseDetails}/${course.Id}`}
                                >
                                  {course.Title}
                                </Link>
                              </h6>

                              <div className="d-flex align-items-center justify-content-between">
                                <h5 className="text-secondary mb-0">
                                  {course.DiscountPrice ?? course.Price} ریال
                                </h5>
                                <Link
                                  to={`${all_routes.courseDetails}/${course.Id}`}
                                  className="btn btn-primary btn-sm d-inline-flex align-items-center"
                                >
                                  مشاهده دوره
                                  <i className="isax isax-arrow-left-2 ms-1" />
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InstructorEnrolledCourse;
