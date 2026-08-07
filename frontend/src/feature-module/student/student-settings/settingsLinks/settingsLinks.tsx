import React from "react";
import { Link, useLocation } from "react-router-dom";
import { all_routes } from "../../../router/all_routes";

const SettingsLinks = () => {
  debugger;
  const route = all_routes;
  const location = useLocation();
  return (
    <>
      <ul className="settings-nav d-flex align-items-center flex-wrap border bg-light-900 rounded">
        <li>
          <Link
            to={route.studentSettings}
            className={`${location.pathname === "/student/student-settings" ? "active" : ""}`}
          >
            ویرایش پروفایل
          </Link>
        </li>
        <li>
          <Link
            to={route.studentChangePassword}
            className={`${location.pathname === "/student/student-change-password" ? "active" : ""}`}
          >
            تغییر رمز عبور
          </Link>
        </li>
      </ul>
    </>
  );
};

export default SettingsLinks;
