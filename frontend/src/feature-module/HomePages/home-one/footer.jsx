import React from "react";
import { Link } from "react-router-dom";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import { all_routes } from "../../router/all_routes";
import { useAuth } from "../../../context/AuthContext";

const Footer = () => {
  const { isAuthenticated, user } = useAuth();
  return (
    <footer className="footer footer-one">
      <div className="footer-top">
        <div className="container">
          <div className="row row-gap-4">
            <div className="col-lg-4">
              <div className="footer-about">
                <div className="footer-logo">
                  <ImageWithBasePath src="assets/img/logo-white.svg" alt="" />
                </div>
                <p>
                  پلتفرمی که برای کمک به سازمان‌ها، مربیان و فراگیران در مدیریت،
                  ارائه و پیگیری فعالیت‌های یادگیری و آموزشی طراحی شده است.
                </p>
                <div className="d-flex align-items-center">
                  <Link to={all_routes.homeone}>
                    <ImageWithBasePath
                      src="assets/img/logo/logo-side.png"
                      alt=""
                    />
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="row row-gap-4">
                <div className="col-lg-4 col-md-4">
                  <div className="footer-widget footer-menu">
                    <h5 className="footer-title">دسترسی سریع</h5>

                    <ul>
                      <li>
                        <Link to={all_routes.homeone}>صفحه اصلی</Link>
                      </li>

                      <li>
                        <Link to={all_routes.courseGrid}>دوره‌ها</Link>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="col-lg-4 col-md-4">
                  <div className="footer-widget footer-menu">
                    <h5 className="footer-title">اطلاعات</h5>

                    <ul>
                      <li>
                        <Link to={all_routes.about_us}>درباره ما</Link>
                      </li>

                      <li>
                        <Link to={all_routes.contactUs}>تماس با ما</Link>
                      </li>

                      <li>
                        <Link to={all_routes.FAQ}>سوالات متداول</Link>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="col-lg-4 col-md-4">
                  <div className="footer-widget footer-menu">
                    <h5 className="footer-title">حساب کاربری</h5>
                    {!isAuthenticated ? (
                      <>
                        <ul>
                          <li>
                            <Link to={all_routes.login}>ورود</Link>
                          </li>
                          <li>
                            <Link to={all_routes.register}>ثبت نام</Link>
                          </li>
                        </ul>
                      </>
                    ) : (
                      <>
                        {user?.roleId === 1 && (
                          <ul>
                            <li>
                              <Link to={all_routes.studentDashboard}>
                                پنل دانشجو
                              </Link>
                            </li>
                          </ul>
                        )}

                        {user?.roleId === 2 && (
                          <ul>
                            <li>
                              <Link to={all_routes.instructorDashboard}>
                                پنل مدرس
                              </Link>
                            </li>
                          </ul>
                        )}

                        {user?.roleId === 3 && (
                          <ul>
                            <li>
                              <Link to={all_routes.adminDashboard}>
                                پنل مدیریت
                              </Link>
                            </li>
                          </ul>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-3">
              <div className="footer-widget footer-contact">
                <h5 className="footer-title">ارتباط با ما</h5>

                <div className="footer-newsletter">
                  <p>
                    در صورت داشتن هرگونه سوال یا پیشنهاد با ما در ارتباط باشید.
                  </p>

                  <ul className="list-unstyled">
                    <li className="mb-3">
                      <i className="isax isax-call me-2"></i>
                      <a
                        href="tel:+982188772460"
                        dir="ltr"
                        className="text-gray-5 text-primary-hover text-decoration-underline"
                      >
                        ۰۲۱-۸۸۷۷-۲۴۶۰
                      </a>
                    </li>

                    <li className="mb-3">
                      <i className="isax isax-sms me-2"></i>
                      <a
                        href="mailto:info@mentorito.example"
                        dir="ltr"
                        className="text-gray-5 text-primary-hover text-decoration-underline"
                      >
                        info@mentorito.example
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <div className="row row-gap-2">
            <div className="col-lg-5">
              <div className="text-center text-lg-start">
                <p>© 2026 سامانه مدیریت یادگیری - تمامی حقوق محفوظ است.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
