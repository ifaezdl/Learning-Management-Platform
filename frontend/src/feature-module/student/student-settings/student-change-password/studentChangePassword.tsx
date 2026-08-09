import React, { useEffect, useState } from "react";
import Breadcrumb from "../../../../core/common/Breadcrumb/breadcrumb";
import SettingsLinks from "../settingsLinks/settingsLinks";
import ProfileCard from "../../common/profileCard";
import StudentSidebar from "../../common/studentSidebar";
import ImageWithBasePath from "../../../../core/common/imageWithBasePath";
import { Link } from "react-router-dom";
import userService from "../../../../services/user.service";

const hasNumber = (value: string): boolean => {
  return /[0-9]/.test(value);
};

const hasMixed = (value: string): boolean => {
  return /[a-z]/.test(value) && /[A-Z]/.test(value);
};

const hasSpecial = (value: string): boolean => {
  return /[!#@$%^&*)(+=._-]/.test(value);
};

const strengthColor = (count: number): string => {
  if (count < 1) return "poor";
  if (count < 2) return "weak";
  if (count < 3) return "strong";
  if (count < 4) return "heavy";
  return "poor"; // Default return to ensure it's always a string
};

const StudentChangePassword = () => {
  const [eye, setEye] = useState<boolean>(true);
  const [password, setPassword] = useState<string>("");
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [validationError, setValidationError] = useState<number>(0);
  const [strength, setStrength] = useState<string>("");
  const [eyeConfirmPassword, setEyeConfirmPassword] = useState<boolean>(true);

  const [isPasswordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible((prevState) => !prevState);
  };

  const onEyeClick = () => {
    setEye((prev) => !prev);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    debugger;
    const newPassword = event.target.value;
    setPassword(newPassword);
    validatePassword(newPassword);
  };

  const onsubmitPasswordChange = async (e: any) => {
    debugger;
    const Parameters = {
      currentPassword: currentPassword,
      newPassword: confirmPassword,
    };
    try {
      const response = await userService.changePassword(Parameters);
      console.log(response);
    } catch (err) {
      console.log(err);
    }
  };

  const validatePassword = (value: string) => {
    if (!value) {
      setValidationError(1);
    } else if (value.length < 8) {
      setValidationError(2);
    } else if (!/[0-9]/.test(value)) {
      setValidationError(3);
    } else if (!/[!@#$%^&*()]/.test(value)) {
      setValidationError(4);
    } else {
      setValidationError(5);
    }
  };

  const messages = () => {
    switch (validationError) {
      case 2:
        return (
          <span
            id="poor"
            className="active mt-2"
            style={{ fontSize: 14, color: "#DC3545", marginTop: "8px" }}
          >
            ضعیف است. رمز عبور باید حداقل ۸ کاراکتر باشد.{" "}
          </span>
        );
      case 3:
        return (
          <span
            id="weak"
            className="active mt-2"
            style={{ fontSize: 14, color: "#FFC107", marginTop: "8px" }}
          >
            متوسط است. رمز عبور باید حداقل شامل یک حرف یا عدد باشد.{" "}
          </span>
        );
      case 4:
        return (
          <span
            id="strong"
            className="active mt-2"
            style={{ fontSize: 14, color: "#0D6EFD", marginTop: "8px" }}
          >
            تقریباً کامل است. رمز عبور باید شامل یک نماد خاص باشد.{" "}
          </span>
        );
      case 5:
        return (
          <span
            id="heavy"
            className="active mt-2"
            style={{ fontSize: 14, color: "#4BB543", marginTop: "8px" }}
          >
            عالی است! رمز عبور شما ایمن است.{" "}
          </span>
        );
      default:
        return null;
    }
  };

  const strengthIndicator = (value: string): number => {
    let strengths = 0;
    if (value.length >= 8) strengths = 1;
    if (hasNumber(value) && value.length >= 8) strengths = 2;
    if (hasSpecial(value) && value.length >= 8 && hasNumber(value))
      strengths = 3;
    if (
      hasMixed(value) &&
      hasSpecial(value) &&
      value.length >= 8 &&
      hasNumber(value)
    )
      strengths = 3;
    return strengths;
  };

  useEffect(() => {
    if (password) {
      let strengthValue = strengthIndicator(password);
      let color = strengthColor(strengthValue);
      setStrength(color);
    } else {
      setStrength("");
    }
  }, [password]);

  useEffect(() => {
    if (password) {
      let strengthValue = strengthIndicator(password);
      let color = strengthColor(strengthValue);
      setStrength(color);
    } else {
      setStrength("");
    }
  }, [password]);

  return (
    <>
      <div className="content mt-5">
        <div className="container">
          {/* profile box */}
          <ProfileCard />
          {/* profile box */}
          <div className="row">
            {/* sidebar */}
            <StudentSidebar />
            {/* sidebar */}
            <div className="col-lg-9">
              <div className="mb-3">
                <h5>تنظیمات</h5>
              </div>
              <SettingsLinks />
              <div className="card mb-0">
                <div className="card-body">
                  <div className="border-bottom mb-4 pb-4">
                    <div className="row">
                      <div className="col-md-8">
                        <div className="mb-3">
                          <h5 className="mb-1 fs-18">تغییر رمز عبور</h5>
                          <p>
                            رمز عبور فعلی خود را به خاطر نمی‌آورید؟&nbsp;
                            <Link to="#" className="text-decoration-underline">
                              رمز عبور خود را از طریق ایمیل بازنشانی کنید.
                            </Link>
                          </p>
                        </div>
                        <form onSubmit={onsubmitPasswordChange}>
                          <div className="mb-3 position-relative">
                            <label className="form-label">
                              <span className="text-danger"> * </span>
                              رمز عبور فعلی{" "}
                            </label>
                            <div className="position-relative">
                              <input
                                value={currentPassword}
                                type={isPasswordVisible ? "text" : "password"}
                                className="form-control form-control-lg pass-input"
                                onChange={(e) =>
                                  setCurrentPassword(e.target.value)
                                }
                              />
                              <span
                                className={`input-icon-addon toggle-password fs-14`}
                                onClick={togglePasswordVisibility}
                              >
                                <i
                                  className={`isax ${
                                    isPasswordVisible
                                      ? "isax-eye"
                                      : "isax-eye-slash"
                                  }`}
                                ></i>
                              </span>
                            </div>
                          </div>
                          <div className="mb-3 position-relative">
                            <label className="form-label">
                              <span className="text-danger"> * </span>
                              رمز عبور جدید{" "}
                            </label>
                            <div
                              className="position-relative"
                              id="passwordInput"
                            >
                              <input
                                className="form-control pass-input"
                                type={eye ? "password" : "text"}
                                onChange={handlePasswordChange}
                              />
                              <span
                                onClick={onEyeClick}
                                className={`toggle-passwords text-gray-7 fs-14 isax isax-eye-slash" ${
                                  eye ? "isax-eye-slash" : "isax-eye"
                                }`}
                              />
                            </div>
                            <div
                              id="passwordStrength"
                              style={{ display: "flex" }}
                              className={`password-strength ${
                                strength === "poor"
                                  ? "poor-active"
                                  : strength === "weak"
                                    ? "avg-active"
                                    : strength === "strong"
                                      ? "strong-active"
                                      : strength === "heavy"
                                        ? "heavy-active"
                                        : ""
                              }`}
                            >
                              <span id="poor" className="active"></span>
                              <span id="weak" className="active"></span>
                              <span id="strong" className="active"></span>
                              <span id="heavy" className="active"></span>
                            </div>
                            <div id="passwordInfo">{messages()}</div>
                          </div>
                          <div>
                            <button className="btn btn-secondary" type="submit">
                              تغییر رمز عبور
                            </button>
                          </div>
                        </form>
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

export default StudentChangePassword;
