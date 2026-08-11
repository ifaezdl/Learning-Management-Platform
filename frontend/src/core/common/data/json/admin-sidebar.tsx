import { all_routes } from "../../../../feature-module/router/all_routes";

export const adminSidebarData = [
  {
    title: "داشبورد",
    icon: "isax isax-grid-35",
    route: all_routes.adminDashboard,
  },
  {
    title: "پروفایل من",
    icon: "fa-solid fa-user",
    route: all_routes.AdminProfile,
  },
  {
    title: "لیست کاربران",
    icon: "isax isax-teacher5",
    route: all_routes.AdminRequests,
  },
  // {
  //   title: "گواهینمامه ها",
  //   icon: "isax isax-note-215",
  //   route: all_routes.studentCertificates,
  // },
];
