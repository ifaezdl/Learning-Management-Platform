import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { adminSidebarData } from "../../../core/common/data/json/admin-sidebar";
import { all_routes } from "../../router/all_routes";
import { useAuth } from "../../../context/AuthContext";
import "../../Instructor/common/sidebarstyle.scss";
import toast from "react-hot-toast";

const AdminSidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
    } catch (err) {
      toast.error("خطا در خروج از حساب کاربری");
    } finally {
      toast.success("از حساب کاربری خود خارج شدید");
      navigate("/login");
    }
  }

  return (
    <div className="student-tabs-wrapper">
      <div className="student-tabs">
        {/* =================================================
            ADMIN MENU
        ================================================== */}

        {adminSidebarData.map((menu: any, index: number) => {
          const isActive =
            location.pathname === menu.route ||
            location.pathname === menu.subRoute;

          return (
            <Link
              key={index}
              to={menu.route}
              className={`student-tab ${isActive ? "active" : ""}`}
            >
              <span className="student-tab-icon">
                <i className={menu.icon} />
              </span>

              <span className="student-tab-title">{menu.title}</span>
            </Link>
          );
        })}

        {/* =================================================
            SETTINGS
        ================================================== */}

        <Link
          to={all_routes.AdminProfileSettings}
          className={`student-tab ${
            location.pathname.includes("settings") ? "active" : ""
          }`}
        >
          <span className="student-tab-icon">
            <i className="isax isax-setting-25" />
          </span>

          <span className="student-tab-title">تنظیمات</span>
        </Link>

        {/* =================================================
            LOGOUT
        ================================================== */}

        <button
          type="button"
          onClick={handleLogout}
          className="student-tab student-tab-logout"
        >
          <span className="student-tab-icon">
            <i className="isax isax-logout5" />
          </span>

          <span className="student-tab-title">خروج</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
