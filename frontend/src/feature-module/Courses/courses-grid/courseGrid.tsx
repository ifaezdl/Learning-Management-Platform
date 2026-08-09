import React, { useEffect, useState } from "react";
import type { SliderSingleProps } from "antd";
import { Link, useSearchParams } from "react-router-dom";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import { all_routes } from "../../router/all_routes";
import courseService, {
  Category,
  Course,
  Level,
} from "../../../services/course.service";
import { api_base_url } from "../../../environment";

const CourseGrid = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);

  const [page, setPage] = useState(1);
  const pageSize = 12;

  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");

  const [selectedCategory, setSelectedCategory] = useState<
    number | undefined
  >();
  const [selectedLevel, setSelectedLevel] = useState<number | undefined>();
  const [searchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState("newest");
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [cats, lvls] = await Promise.all([
          courseService.getCategories(),
          courseService.getLevels(),
        ]);

        setCategories(cats);
        setLevels(lvls);
      } catch (error) {
        console.error(error);
      }
    };

    loadFilters();
  }, []);
  useEffect(() => {
    const search = searchParams.get("search");
    const categoryId = searchParams.get("categoryId");

    setSearch(search ?? "");
    setSelectedCategory(categoryId ? Number(categoryId) : undefined);

    setInitialized(true);
  }, [searchParams]);
  useEffect(() => {
    if (!initialized) return;

    loadCourses();
  }, [initialized, page, search, selectedCategory, selectedLevel]);

  const loadCourses = async () => {
    try {
      debugger;
      setLoading(true);

      const result = await courseService.browseCourses({
        page,
        pageSize,
        search: search || undefined,
        categoryId: selectedCategory,
        levelId: selectedLevel,
      });

      setCourses(result.data);
      setTotalItems(result.pagination.totalItems);
      setTotalPages(result.pagination.totalPages);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Course */}
      <section className="course-content mt-5">
        <div className="container mt-3">
          <div className="row align-items-baseline">
            <div className="col-lg-3 theiaStickySidebar">
              <div className="filter-clear">
                <div className="clear-filter mb-4 pb-lg-2 d-flex align-items-center justify-content-between">
                  <h5>
                    <i className="feather-filter me-2" />
                    فیلترها
                  </h5>
                  <Link
                    to="#"
                    className="clear-text"
                    onClick={(e) => {
                      e.preventDefault();

                      setSearch("");
                      setSelectedCategory(undefined);
                      setSelectedLevel(undefined);
                      setSortBy("newest");
                      setPage(1);
                    }}
                  >
                    پاک کردن
                  </Link>
                </div>
                <div className="accordion accordion-customicon1 accordions-items-seperate">
                  <div className="accordion-item">
                    <h2 className="accordion-header" id="headingcustomicon1One">
                      <Link
                        to="#"
                        className="accordion-button"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapsecustomicon1One"
                        aria-expanded="false"
                        aria-controls="collapsecustomicon1One"
                      >
                        دسته بندی ها <i className="fa-solid fa-chevron-down" />
                      </Link>
                    </h2>
                    <div
                      id="collapsecustomicon1One"
                      className="accordion-collapse collapse show"
                      aria-labelledby="headingcustomicon1One"
                      data-bs-parent="#accordioncustomicon1Example"
                      style={{}}
                    >
                      <div className="accordion-body">
                        {categories?.map((category) => (
                          <div key={category.Id}>
                            <label className="custom_check">
                              <input
                                type="checkbox"
                                checked={selectedCategory === category.Id}
                                onChange={() => {
                                  setPage(1);

                                  setSelectedCategory((prev) =>
                                    prev === category.Id
                                      ? undefined
                                      : category.Id,
                                  );
                                }}
                              />
                              <span className="checkmark" />
                              {category.Title}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="accordion-item">
                    <h2
                      className="accordion-header"
                      id="headingcustomicon1Five"
                    >
                      <Link
                        to="#"
                        className="accordion-button"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapsecustomicon1Five"
                        aria-expanded="false"
                        aria-controls="collapsecustomicon1Five"
                      >
                        سطح دوره
                        <i className="fa-solid fa-chevron-down" />
                      </Link>
                    </h2>
                    <div
                      id="collapsecustomicon1Five"
                      className="accordion-collapse collapse show"
                      aria-labelledby="headingcustomicon1Five"
                      data-bs-parent="#accordioncustomicon1Example"
                    >
                      <div className="accordion-body">
                        {levels?.map((level) => (
                          <div key={level.Id}>
                            <label className="custom_check custom_one">
                              <input
                                type="checkbox"
                                name="select_specialist"
                                checked={selectedLevel === level.Id}
                                onChange={() => {
                                  setPage(1);

                                  setSelectedLevel((prev) =>
                                    prev === level.Id ? undefined : level.Id,
                                  );
                                }}
                              />
                              <span className="checkmark" />
                              {level.LevelName}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-9">
              {/* Filter */}
              <div className="showing-list mb-4">
                <div className="row align-items-center">
                  <div className="col-lg-12">
                    <div className="show-filter add-course-info">
                      <form action="#">
                        <div className="row g-2">
                          <div className="col-3">
                            {" "}
                            <select
                              className="form-select w-100"
                              value={sortBy}
                              onChange={(e) => {
                                setPage(1);
                                setSortBy(e.target.value);
                              }}
                            >
                              <option value="newest">جدیدترین ها</option>
                              <option value="priceAsc">قیمت صعودی</option>
                              <option value="priceDesc">قیمت نزولی</option>
                            </select>
                          </div>

                          <div className="search-group col-9">
                            <i className="isax isax-search-normal-1" />
                            <input
                              type="text"
                              className="form-control"
                              placeholder="جستجوی دوره "
                              value={search}
                              onChange={(e) => {
                                setPage(1);
                                setSearch(e.target.value);
                              }}
                            />
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
              {/* /Filter */}
              <div className="row">
                {courses?.map((course) => {
                  return (
                    <div key={course.Id} className="col-xl-4 col-md-6">
                      <Link to={`${all_routes.courseDetails}/${course.Id}`}>
                        <div className="course-item-two course-item mx-0 h-100 shadow-sm border-0 rounded-4 overflow-hidden transition-all">
                          <div className="course-img position-relative overflow-hidden">
                            <img
                              src={
                                course.Thumbnail
                                  ? `${api_base_url}${course.Thumbnail}`
                                  : "/assets/img/course/course-09.jpg"
                              }
                              alt={course.Title}
                              className="img-fluid"
                            />
                          </div>

                          <div className="course-content p-3">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                              <div className="d-flex align-items-center">
                                <ImageWithBasePath
                                  src="assets/img/user/user-36.jpg"
                                  alt="img"
                                  className="img-fluid avatar avatar-sm rounded-circle"
                                />

                                <div className="ms-2">
                                  <span
                                    className="fs-14 fw-medium d-block"
                                    style={{ maxWidth: "120px" }}
                                  >
                                    {course?.Users?.FirstName}{" "}
                                    {course?.Users?.LastName}
                                  </span>
                                </div>
                              </div>
                              <div className="d-flex flex-column align-items-end gap-1">
                                <span className="badge rounded-pill bg-light text-dark fs-13 fw-medium px-3 py-1">
                                  {course?.Category?.Title}
                                </span>
                                <span className="badge rounded-pill bg-primary-subtle text-primary fs-13 fw-medium px-3 py-1">
                                  {course?.Level?.LevelName}
                                </span>
                              </div>
                            </div>

                            <h6 className="title mb-3 lh-base">
                              <Link
                                to={all_routes.courseDetails}
                                className="text-dark stretched-link-hover"
                              >
                                {course.Title}
                              </Link>
                            </h6>

                            <div className="d-flex align-items-center justify-content-between pt-2 border-top">
                              <h5 className="text-secondary fw-bold mb-0">
                                {Number(course.Price).toLocaleString("fa-IR")}{" "}
                                ریال
                              </h5>
                              <Link
                                to={`${all_routes.courseDetails}/${course.Id}`}
                                className="btn btn-primary btn-sm rounded-pill d-inline-flex align-items-center px-3"
                              >
                                مشاهده دوره
                                <i className="isax isax-arrow-left-2 ms-1" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
              {/* /pagination */}
              <div className="row align-items-center">
                <div className="col-md-3"></div>

                <div className="col-md-9">
                  <ul className="pagination lms-page justify-content-center justify-content-md-end mt-2 mt-md-0">
                    {/* Previous */}
                    <li
                      className={`page-item prev ${page === 1 ? "disabled" : ""}`}
                    >
                      <Link
                        className="page-link"
                        to="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (page > 1) {
                            setPage(page - 1);
                          }
                        }}
                      >
                        <i className="fas fa-angle-right" />
                      </Link>
                    </li>

                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }, (_, index) => (
                      <li
                        key={index + 1}
                        className={`page-item ${page === index + 1 ? "active" : ""}`}
                      >
                        <Link
                          className="page-link"
                          to="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setPage(index + 1);
                          }}
                        >
                          {index + 1}
                        </Link>
                      </li>
                    ))}

                    {/* Next */}
                    <li
                      className={`page-item next ${
                        page === totalPages || totalPages === 0
                          ? "disabled"
                          : ""
                      }`}
                    >
                      <Link
                        className="page-link"
                        to="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (page < totalPages) {
                            setPage(page + 1);
                          }
                        }}
                      >
                        <i className="fas fa-angle-left" />
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              {/* /pagination */}
            </div>
          </div>
        </div>
      </section>
      {/* /Course */}
    </>
  );
};

export default CourseGrid;
