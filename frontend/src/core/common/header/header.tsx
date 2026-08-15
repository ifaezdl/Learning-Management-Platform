import React, { useEffect, useState } from "react";
import ImageWithBasePath from "../imageWithBasePath";
import { getHeader, getProfileMenu } from "../data/json/header";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { all_routes } from "../../../feature-module/router/all_routes";
import { setDataTheme } from "../../redux/themeSettingSlice";
import { refreshCartCount, setCartCount } from "../../redux/cartSlice";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../../../context/AuthContext";
import { api_base_url } from "../../../environment";

const Header = () => {
  const { user, logout } = useAuth();

  const avatarUrl = user?.avatar
    ? `${api_base_url}${user.avatar}`
    : "assets/img/user/user-02.jpg";
  const header = getHeader(user?.roleId ?? 1);
  const profileMenu = getProfileMenu(user?.roleId ?? 1);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [scrolled, setScrolled] = useState(false);
  const [isMegaMenu, setIsMegaMenu] = useState(false);
  const [subOpen, setSubopen] = useState<any>("");
  const [subsidebar, setSubsidebar] = useState("");
  const [subsidebar2, setSubsidebar2] = useState("");

  const dataTheme = useSelector((state: any) => state.themeSetting.dataTheme);
  const cartCount = useSelector((state: any) => state.cart.cartCount);

  const handleDataThemeChange = (theme: string) => {
    dispatch(setDataTheme(theme));
  };

  const onHandleMobileMenu = () => {
    document.getElementsByTagName("html")[0].classList.add("menu-opened");
  };

  const onhandleCloseMenu = () => {
    document.getElementsByTagName("html")[0].classList.remove("menu-opened");
  };

  const toggleSidebar = (title: any) => {
    localStorage.setItem("menuOpened", title);
    setSubopen(title === subOpen ? "" : title);
  };

  const toggleSubsidebar = (subitem: any) => {
    setSubsidebar(subitem === subsidebar ? "" : subitem);
  };

  const toggleSubsidebar2 = (subitem: any) => {
    setSubsidebar2(subitem === subsidebar2 ? "" : subitem);
  };

  const handleLogOut = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("class", dataTheme);
  }, [dataTheme]);

  // Keep the cart badge in sync with the real cart contents whenever the
  // header mounts (or the logged-in user changes).
  useEffect(() => {
    if (user) {
      dispatch(refreshCartCount() as any);
    } else {
      dispatch(setCartCount(0));
    }
  }, [user]);

  const DarkButton = () => (
    <div className="icon-btn">
      <Link
        to="#"
        id="dark-mode-toggle"
        className={`theme-toggle ${dataTheme === "light" && "activate"}`}
        onClick={() => handleDataThemeChange("dark-mode")}
      >
        <i className="isax isax-sun-15" />
      </Link>
      <Link
        to="#"
        id="light-mode-toggle"
        className={`theme-toggle ${dataTheme === "dark-mode" && "activate"}`}
        onClick={() => handleDataThemeChange("light")}
      >
        <i className="isax isax-moon" />
      </Link>
    </div>
  );

  return (
    <header className={`header-one ${scrolled ? "fixed" : ""}`}>
      <div className="container">
        <div className="header-nav">
          <div className="navbar-header">
            <Link id="mobile_btn" to="#" onClick={onHandleMobileMenu}>
              <span className="bar-icon">
                <i className="isax isax-menu"></i>
              </span>
            </Link>
            <div className="navbar-logo">
              <Link className="logo-white header-logo" to={all_routes.homeone}>
                <ImageWithBasePath
                  width={200}
                  src="assets/img/logo-side.png"
                  className="logo"
                  alt="Logo"
                />
              </Link>
              <Link className="logo-dark header-logo" to={all_routes.homeone}>
                <ImageWithBasePath
                  width={200}
                  src="assets/img/logo-side.png"
                  className="logo"
                  alt="Logo"
                />
              </Link>
            </div>
          </div>

          <div className={`main-menu-wrapper ${isMegaMenu ? "active" : ""}`}>
            <div className="menu-header">
              <Link to={all_routes.homeone} className="menu-logo">
                <ImageWithBasePath
                  width={200}
                  src="assets/img/logo-side.png"
                  className="img-fluid"
                  alt="Logo"
                />
              </Link>
              <Link
                id="menu_close"
                className="menu-close"
                to="#"
                onClick={onhandleCloseMenu}
              >
                <i className="fas fa-times" />
              </Link>
            </div>
            <ul className={`main-nav ${isMegaMenu ? "active" : ""}`}>
              {header?.map((mainMenus: any, mainIndex) => {
                const hasChildren = mainMenus.menu && mainMenus.menu.length > 0;

                return (
                  <React.Fragment key={mainIndex}>
                    {mainMenus.separateRoute ? (
                      <li
                        className={`has-submenu megamenu ${location.pathname.includes("index") ? "active" : ""}`}
                        onClick={() => toggleSidebar(mainMenus.tittle)}
                        onMouseOver={() => setIsMegaMenu(true)}
                        onMouseLeave={() => setIsMegaMenu(false)}
                      >
                        <Link to="#">
                          {mainMenus.tittle}
                          <i className="fas fa-chevron-down" />
                        </Link>
                        <ul
                          className={`submenu mega-submenu ${subOpen === mainMenus.tittle ? "d-block" : ""}`}
                          onMouseOver={() => setIsMegaMenu(true)}
                          onMouseLeave={() => setIsMegaMenu(false)}
                        >
                          <li>
                            <div className="megamenu-wrapper">
                              <div className="row">
                                {mainMenus.menu.map((menu: any, idx: any) => (
                                  <div className="col-lg-2" key={idx}>
                                    <div
                                      className={`single-demo ${location.pathname === menu.route ? "active" : ""}`}
                                    >
                                      <div className="demo-img">
                                        <Link
                                          to={menu.route}
                                          className="inner-demo-img"
                                        >
                                          <ImageWithBasePath
                                            src={menu.img}
                                            className="img-fluid"
                                            alt="img"
                                          />
                                        </Link>
                                      </div>
                                      <div className="demo-info">
                                        <Link
                                          to={menu.route}
                                          className="inner-demo-img"
                                        >
                                          {menu.menuValue}
                                        </Link>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </li>
                        </ul>
                      </li>
                    ) : hasChildren ? (
                      <li className="has-submenu">
                        <Link
                          to="#"
                          onClick={() => toggleSidebar(mainMenus.tittle)}
                        >
                          {mainMenus.tittle}{" "}
                          <i className="fas fa-chevron-down"></i>
                        </Link>
                        <ul
                          className={`submenu ${subOpen === mainMenus.tittle ? "d-block" : ""}`}
                        >
                          {mainMenus.menu.map((menu: any, menuIndex: any) => {
                            const hasSubChildren =
                              menu.hasSubRoute && menu.subMenus?.length > 0;

                            return (
                              <React.Fragment key={`${mainIndex}-${menuIndex}`}>
                                {hasSubChildren ? (
                                  <li className="has-submenu">
                                    <Link
                                      to="#"
                                      className="hideonmob"
                                      onClick={() =>
                                        toggleSubsidebar(menu.menuValue)
                                      }
                                    >
                                      {menu.menuValue}
                                    </Link>
                                    <ul
                                      className={`submenu showonmob ${subsidebar === menu.menuValue ? "d-block" : ""}`}
                                    >
                                      {menu.subMenus?.map(
                                        (subMenu: any, subMenuIndex: any) => {
                                          const hasDeepChildren =
                                            subMenu.hasSubRoute &&
                                            subMenu.subMenus?.length > 0;

                                          return (
                                            <React.Fragment
                                              key={`${mainIndex}-${menuIndex}-${subMenuIndex}`}
                                            >
                                              {hasDeepChildren ? (
                                                <li className="has-submenu">
                                                  <Link
                                                    to="#"
                                                    onClick={() =>
                                                      toggleSubsidebar2(
                                                        subMenu.menuValue,
                                                      )
                                                    }
                                                  >
                                                    {subMenu.menuValue}
                                                  </Link>
                                                  <ul
                                                    className={`submenu ${subsidebar2 === subMenu.menuValue ? "d-block" : ""}`}
                                                  >
                                                    {subMenu.subMenus?.map(
                                                      (
                                                        menu: any,
                                                        menuIndex2: any,
                                                      ) => (
                                                        <li
                                                          key={menuIndex2}
                                                          className={
                                                            location.pathname ===
                                                            menu.route
                                                              ? "active"
                                                              : ""
                                                          }
                                                        >
                                                          <Link to={menu.route}>
                                                            {menu.menuValue}
                                                          </Link>
                                                        </li>
                                                      ),
                                                    )}
                                                  </ul>
                                                </li>
                                              ) : (
                                                <li
                                                  className={
                                                    location.pathname ===
                                                    subMenu.route
                                                      ? "active"
                                                      : ""
                                                  }
                                                >
                                                  <Link to={subMenu.route}>
                                                    {subMenu.menuValue}
                                                  </Link>
                                                </li>
                                              )}
                                            </React.Fragment>
                                          );
                                        },
                                      )}
                                    </ul>
                                  </li>
                                ) : (
                                  <li
                                    className={
                                      location.pathname.includes(
                                        menu.route || "",
                                      )
                                        ? "active"
                                        : ""
                                    }
                                  >
                                    <Link to={menu.route}>
                                      {menu.menuValue}
                                    </Link>
                                  </li>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </ul>
                      </li>
                    ) : (
                      <li
                        className={
                          location.pathname === mainMenus.route ? "active" : ""
                        }
                      >
                        <Link to={mainMenus.route}>{mainMenus.tittle}</Link>
                      </li>
                    )}
                  </React.Fragment>
                );
              })}
            </ul>
          </div>

          <div className="header-btn d-flex align-items-center">
            {user ? (
              <div className="dropdown profile-dropdown">
                <Link
                  to="#"
                  className="d-flex align-items-center"
                  data-bs-toggle="dropdown"
                >
                  <span className="avatar avatar-xxl avatar-rounded me-3 border border-white border-2 position-relative">
                    {user?.avatar ? (
                      <img
                        src={avatarUrl}
                        alt={`${user?.firstName || ""} ${user?.lastName || ""}`}
                        className="img-fluid"
                      />
                    ) : (
                      <img
                        src="assets/img/user/profileavatar.png"
                        alt={`${user?.firstName || ""} ${user?.lastName || ""}`}
                        className="img-fluid"
                      />
                    )}
                  </span>
                </Link>
                <div className="dropdown-menu dropdown-menu-end">
                  <div className="profile-header d-flex align-items-center">
                    <div className="w-100">
                      <h6>
                        {user?.firstName} - {user?.lastName}
                      </h6>
                      <p>{user?.userName}</p>
                    </div>
                  </div>
                  <ul className="profile-body">
                    {profileMenu?.map((item, idx) => (
                      <li key={idx}>
                        <Link
                          className="dropdown-item d-inline-flex align-items-center rounded fw-medium"
                          to={item.route}
                        >
                          <i className={`${item.icon} me-2`} />
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <div className="profile-footer">
                    <button
                      onClick={handleLogOut}
                      className="btn btn-secondary d-inline-flex align-items-center justify-content-center w-100"
                    >
                      <i className="isax isax-logout me-2" />
                      خروج
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            <DarkButton />

            <div className="icon-btn">
              <Link to={all_routes.courseCart} className="position-relative">
                <i className="isax isax-shopping-cart5" />
                {cartCount > 0 && (
                  <span className="count-icon bg-success p-1 rounded-pill text-white fs-10 fw-bold">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>

            {!user && (
              <>
                <Link
                  to={all_routes.login}
                  className="btn btn-primary d-inline-flex align-items-center me-2"
                >
                  ورود
                </Link>
                <Link
                  to={all_routes.register}
                  className="btn btn-secondary me-0"
                >
                  ثبت نام
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
