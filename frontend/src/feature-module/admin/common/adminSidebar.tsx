import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { all_routes } from "../../router/all_routes";
import { useAuth } from "../../../context/AuthContext";
import toast from "react-hot-toast";
import { adminSidebarData } from "../../../core/common/data/json/admin-sidebar";

const AdminSidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  async function handlelogout() {
    debugger;
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
    <div className="col-lg-3 ">
      <div className="settings-sidebar theiaStickySidebar">
        <div>
          <h6 className="mb-3">منوی اصلی</h6>
          <ul className="mb-3 pb-1">
            {adminSidebarData.map((menu: any, index: any) => (
              <li key={index}>
                <Link
                  to={menu.route}
                  className={`d-inline-flex align-items-center ${location.pathname === menu.route || location.pathname === menu.subRoute ? "active" : ""}`}
                >
                  <i className={`${menu.icon} me-2`} />
                  {menu.title}
                </Link>
              </li>
            ))}
          </ul>
          <hr />
          <h6 className="mb-3">تنظیمات حساب کاربری</h6>
          <ul>
            <li>
              <Link
                to={all_routes.AdminProfileSettings}
                className={`d-inline-flex align-items-center ${location.pathname.includes("settings") ? "active" : ""}`}
              >
                <i className="isax isax-setting-25 me-2" />
                تنظیمات
              </Link>
            </li>
            <li>
              <button
                onClick={handlelogout}
                className="d-inline-flex align-items-center btn btn-secondary"
              >
                <i className="isax isax-logout5 me-2" />
                خروج
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
