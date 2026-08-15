import { all_routes } from "../../../../feature-module/router/all_routes";

export const instructorSidebarData = [
  {
    title: "داشبورد",
    icon: "isax isax-grid-35",
    route: all_routes.instructorDashboard,
  },
  {
    title: "پروفایل من",
    icon: "fa-solid fa-user",
    route: all_routes.instructorProfile,
  },

  {
    title: "دوره‌های ایجادشده توسط من",
    icon: "isax isax-teacher5",
    route: all_routes.instructorCourse,
  },
  {
    title: "وضعیت دانشجوهای من",
    icon: "isax isax-profile-2user5",
    route: all_routes.studentsList,
  },
];
