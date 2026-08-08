import { all_routes } from "../../../../feature-module/router/all_routes";

export const getHeader = (roleId: number) => {
  if (roleId === 1) {
    return [
      {
        tittle: "دوره ها",
        route: all_routes.courseGrid,
        hasSubRoute: false,
        showSubRoute: false,
        menu: [],
      },
      {
        tittle: "داشبورد دانشجو",
        hasSubRoute: true,
        showSubRoute: true,
        showAsTab2: true,
        base: "student",
        menu: [
          {
            menuValue: "پروفایل من",
            route: all_routes.studentProfile,
            hasSubRoute: false,
            showSubRoute: false,
            subMenus: [],
          },
          {
            menuValue: "دوره های من",
            route: all_routes.studentCourses,
            hasSubRoute: false,
            showSubRoute: false,
            subMenus: [],
          },
          // {
          //   menuValue: "My Certificates",
          //   route: all_routes.studentCertificates,
          //   hasSubRoute: false,
          //   showSubRoute: false,
          //   subMenus: [],
          // },
          {
            menuValue: "تاریخچه سفارشات",
            route: all_routes.studentOrderHistory,
            hasSubRoute: false,
            showSubRoute: false,
            subMenus: [],
          },
          {
            menuValue: "تنظیمات حساب کاربری",
            route: all_routes.studentSettings,
            hasSubRoute: false,
            showSubRoute: false,
            subMenus: [],
          },
        ],
      },
      {
        tittle: "درباره ما",
        route: all_routes.about_us,
        hasSubRoute: false,
        showSubRoute: false,
        menu: [],
      },
      {
        tittle: "تماس با ما",
        route: all_routes.contactUs,
        hasSubRoute: false,
        showSubRoute: false,
        menu: [],
      },
    ];
  }
  if (roleId === 2) {
    return [
      {
        tittle: "دوره ها",
        route: all_routes.courseGrid,
        hasSubRoute: false,
        showSubRoute: false,
        menu: [],
      },
      {
        tittle: "داشبورد مدرس",
        base: "instructor",
        base2: "student",
        showAsTab: false,
        separateRoute: false,
        menu: [
          {
            menuValue: "داشبورد",
            route: all_routes.instructorDashboard,
            hasSubRoute: false,
            showSubRoute: false,
            subMenus: [],
          },
          {
            menuValue: "دوره های من",
            route: all_routes.instructorCourse,
            hasSubRoute: false,
            showSubRoute: false,
            subMenus: [],
          },
          {
            menuValue: "دانشجویان",
            route: all_routes.studentsList,
            hasSubRoute: false,
            showSubRoute: false,
            subMenus: [],
          },
          {
            menuValue: "تنظیمات حساب کاربری",
            route: all_routes.instructorsettings,
            hasSubRoute: false,
            showSubRoute: false,
            subMenus: [],
          },
        ],
      },
      {
        tittle: "درباره ما",
        route: all_routes.about_us,
        hasSubRoute: false,
        showSubRoute: false,
        menu: [],
      },
      {
        tittle: "تماس با ما",
        route: all_routes.contactUs,
        hasSubRoute: false,
        showSubRoute: false,
        menu: [],
      },
    ];
  }
  if (roleId === 3) {
    return [
      {
        tittle: "دوره ها",
        route: all_routes.courseGrid,
        hasSubRoute: false,
        showSubRoute: false,
        menu: [],
      },
      {
        tittle: "داشبورد ادمین",
        base: "instructor",
        base2: "student",
        showAsTab: false,
        separateRoute: false,
        menu: [
          {
            menuValue: "مدیریت کاربران",
            route: all_routes.adminDashboard,
            hasSubRoute: false,
            showSubRoute: false,
            subMenus: [],
          },
        ],
      },
    ];
  }
};

// Profile dropdown items, keyed by role. Header.tsx reads this instead of
// hardcoding student/instructor links, so adding or changing a role's
// profile links only means editing this list.
export const getProfileMenu = (roleId: number) => {
  if (roleId === 1) {
    return [
      {
        label: "پروفایل من",
        route: all_routes.studentProfile,
        icon: "isax isax-security-user",
      },
      {
        label: "دوره های من",
        route: all_routes.studentCourses,
        icon: "isax isax-teacher",
      },
      {
        label: "تنظیمات پروفایل",
        route: all_routes.studentSettings,
        icon: "isax isax-setting-2",
      },
    ];
  }
  if (roleId === 2) {
    return [
      {
        label: "پروفایل من",
        route: all_routes.instructorProfile,
        icon: "isax isax-security-user",
      },
      {
        label: "دوره های من",
        route: all_routes.instructorCourse,
        icon: "isax isax-teacher",
      },
      {
        label: "تنظیمات پروفایل",
        route: all_routes.instructorsettings,
        icon: "isax isax-setting-2",
      },
    ];
  }
  if (roleId === 3) {
    return [
      {
        label: "مدیریت کاربران",
        route: all_routes.adminDashboard,
        icon: "isax isax-security-user",
      },
    ];
  }
  return [];
};
