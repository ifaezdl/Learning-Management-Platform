import React, { useEffect, useState } from "react";
import ProfileCard from "../common/profileCard";

import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import AdminSidebar from "../common/adminSidebar";
import courseService from "../../../services/course.service";
import userService from "../../../services/user.service";

// Role_Id: 1 = student, 2 = teacher, 3 = admin
const ROLE_STUDENT = 1;
const ROLE_TEACHER = 2;

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    publishedCourses: 0,
    students: 0,
    teachers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError("");
      const [courses, users] = await Promise.all([
        courseService.getAllCourses(),
        userService.getUsers(),
      ]);
      setStats({
        publishedCourses: courses.length,
        students: users.filter((u: any) => u.Role_Id === ROLE_STUDENT).length,
        teachers: users.filter((u: any) => u.Role_Id === ROLE_TEACHER).length,
      });
    } catch (err) {
      setError("خطا در دریافت آمار داشبورد");
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (value: number) =>
    loading ? "…" : value.toLocaleString("fa-IR");

  return (
    <>
      <div className="content mt-5">
        <div className="container">
          {/* profile box */}
          <ProfileCard />
          {/* profile box */}
          <div className="row">
            {/* sidebar */}
            <AdminSidebar />
            {/* sidebar */}
            <div className="col-lg-9">
              {error && (
                <div className="alert alert-danger mb-4" role="alert">
                  {error}
                </div>
              )}
              <div className="row">
                <div className="col-md-6 col-xl-4">
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <span className="icon-box bg-secondary-transparent me-2 me-xxl-3 flex-shrink-0">
                          <ImageWithBasePath
                            src="assets/img/icon/book.svg"
                            alt=""
                          />
                        </span>
                        <div>
                          <span className="d-block">دوره‌های منتشر شده</span>
                          <h4 className="fs-24 mt-1">
                            {formatNumber(stats.publishedCourses)}
                          </h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-xl-4">
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <span className="icon-box bg-primary-transparent me-2 me-xxl-3 flex-shrink-0">
                          <ImageWithBasePath
                            src="assets/img/icon/graduation.svg"
                            alt=""
                          />
                        </span>
                        <div>
                          <span className="d-block">دانشجویان</span>
                          <h4 className="fs-24 mt-1">
                            {formatNumber(stats.students)}
                          </h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-xl-4">
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <span className="icon-box bg-success-transparent me-2 me-xxl-3 flex-shrink-0">
                          <ImageWithBasePath
                            src="assets/img/icon/user-tick.svg"
                            alt=""
                          />
                        </span>
                        <div>
                          <span className="d-block">مدرسان</span>
                          <h4 className="fs-24 mt-1">
                            {formatNumber(stats.teachers)}
                          </h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
