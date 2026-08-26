import { all_routes } from "../../../../feature-module/router/all_routes";

export const studentSidebarData = [
  {
    title: "داشبورد",
    icon: "isax isax-grid-35",
    route: all_routes.studentDashboard,
  },
  {
    title: "پروفایل من",
    icon: "fa-solid fa-user",
    route: all_routes.studentProfile,
  },
  {
    title: "دوره های من",
    icon: "isax isax-teacher5",
    route: all_routes.studentCourses,
  },
  {
    title: "گفتگوهای دوره",
    icon: "isax isax-message-text-1",
    route: all_routes.chat,
  },
  {
    title: "آزمون های پیش رو",
    icon: "isax isax-teacher5",
    route: all_routes.studentQuiz,
  },
  {
    title: "گواهینامه های من",
    icon: "isax isax-teacher5",
    route: all_routes.studentCertificates,
  },
  {
    title: "تحلیل یادگیری",
    icon: "isax isax-chart-2",
    route: all_routes.studentAnalytics,
  },
  // {
  //   title: "تاریخچه سفارشات",
  //   icon: "isax isax-shopping-cart5",
  //   route: all_routes.studentOrderHistory,
  // },
];
