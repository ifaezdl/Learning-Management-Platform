import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Slider from "react-slick";
import { all_routes } from "../../router/all_routes";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import { useAuth } from "../../../context/AuthContext";
import toast from "react-hot-toast";
type PasswordField = "password" | "confirmPassword";
export interface LoginRequest {
  userName: string;
  password: string;
}
const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(all_routes.homeone);
    }
  }, [isAuthenticated, navigate]);

  const loginSLider = {
    dots: true,
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
  };

  const [passwordVisibility, setPasswordVisibility] = useState({
    password: false,
    confirmPassword: false,
  });

  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");

  const togglePasswordVisibility = (field: PasswordField) => {
    setPasswordVisibility((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  const route = all_routes;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    debugger;
    e.preventDefault();
    setLoading(true);

    try {
      await login({ userName, password });
      if (isAuthenticated) {
        navigate(route.homeone, { replace: true });
      }
      toast.success("با موفقیت وارد حساب کاربری خود شدید");
    } catch (err: any) {
      debugger;
      toast.error(
        err.response?.data?.message || "Invalid username or password.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="main-wrapper">
        <div className="login-content">
          <div className="row">
            <div className="col-md-6 login-bg d-none d-lg-flex">
              <Slider {...loginSLider} className="login-carousel">
                <div>
                  <div className="login-carousel-section mb-3">
                    <div className="login-banner">
                      <ImageWithBasePath
                        src="assets/img/logo-side.png"
                        className="img-fluid"
                        alt="Logo"
                      />
                    </div>
                    <div className="mentor-course text-center">
                      <h3 className="mb-2">
                        به <span className="text-secondary"> منتوریتو </span>خوش
                        آمدید
                      </h3>
                      <p>
                        پلتفرمی که برای کمک به سازمان‌ها، مربیان و فراگیران در
                        مدیریت، ارائه و پیگیری فعالیت‌های یادگیری و آموزشی طراحی
                        شده است.
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="login-carousel-section mb-3">
                    <div className="login-banner">
                      <ImageWithBasePath
                        src="assets/img/auth/auth-1.svg"
                        className="img-fluid"
                        alt="Logo"
                      />
                    </div>
                    <div className="mentor-course text-center">
                      <h3 className="mb-2">
                        با <span className="text-secondary"> منتوریتو</span>{" "}
                        همراه باشید
                      </h3>
                      <p>
                        پلتفرمی که برای کمک به سازمان‌ها، مربیان و فراگیران در
                        مدیریت، ارائه و پیگیری فعالیت‌های یادگیری و آموزشی طراحی
                        شده است.
                      </p>
                    </div>
                  </div>
                </div>
              </Slider>
            </div>
            <div className="col-md-6 login-wrap-bg">
              <div className="login-wrapper">
                <div className="loginbox">
                  <div className="w-100">
                    <div className="d-flex align-items-center  flex-column">
                      <div>
                        <h1 className="fs-32 fw-bold">
                          {" "}
                          به حساب کاربری خود وارد شوید
                        </h1>
                      </div>
                      <div>
                        <Link to={route.homeone} className="link-1">
                          بازگشت به خانه
                        </Link>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="mb-3 pb-3">
                      <div className="mb-3 position-relative">
                        <label className="form-label">
                          <span className="text-danger ms-1">*</span> نام کاربری
                        </label>
                        <div className="position-relative">
                          <input
                            type="text"
                            className="form-control form-control-lg"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            required
                          />
                          <span>
                            <i className="isax isax-user input-icon text-gray-7 fs-14" />
                          </span>
                        </div>
                      </div>
                      <div className="mb-3 position-relative">
                        <label className="form-label">
                          <span className="text-danger ms-1">* </span> رمز عبور
                        </label>
                        <div className="position-relative" id="passwordInput">
                          <input
                            type={
                              passwordVisibility.password ? "text" : "password"
                            }
                            className="form-control form-control-lg pass-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                          <span
                            className={`isax toggle-passwords fs-14 ${
                              passwordVisibility.password
                                ? "isax-eye"
                                : "isax-eye-slash"
                            }`}
                            onClick={() => togglePasswordVisibility("password")}
                          ></span>
                        </div>
                      </div>
                      <div className="d-flex align-items-center justify-content-between mb-4">
                        {/* <div className="remember-me d-flex align-items-center">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="flexCheckDefault"
                          />
                          <label
                            className="form-check-label ms-2"
                            htmlFor="flexCheckDefault"
                          >
                            مرا به خاطر بسپار 
                          </label>
                        </div> */}
                        <div className="">
                          <Link to={route.forgotpassword} className="link-2">
                            فراموشی رمز ؟
                          </Link>
                        </div>
                      </div>
                      <div className="d-grid">
                        <button
                          className="btn btn-secondary btn-lg"
                          type="submit"
                          disabled={loading}
                        >
                          {loading ? "درحال ورود ..." : "ورود"}
                        </button>
                      </div>
                    </form>
                    {/* <div className="d-flex align-items-center justify-content-center or fs-14 mb-3">
                      یا
                    </div> */}
                    <div className="d-flex align-items-center justify-content-center mb-3">
                      <Link to="#" className="btn btn-light me-2">
                        <ImageWithBasePath
                          src="assets/img/icons/google.svg"
                          alt="img"
                          className="me-2"
                        />
                        ورود با حساب گوگل
                      </Link>
                    </div>
                    <div className="fs-14 fw-normal d-flex align-items-center justify-content-center">
                      آیا حساب کاربری ندارید؟
                      <Link to={route.register} className="link-2 ms-1">
                        {" "}
                        ثبت نام
                      </Link>
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

export default Login;
