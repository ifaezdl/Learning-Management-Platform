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
    title: "دوره های خریداری شده",
    icon: "isax isax-teacher5",
    route: all_routes.instructorEnrolledCourse,
  },
  {
    title: "دوره‌های ایجادشده توسط من",
    icon: "isax isax-teacher5",
    route: all_routes.instructorCourse,
  },
  {
    title: "دانشجوها",
    icon: "isax isax-profile-2user5",
    route: all_routes.studentsList,
  },
  {
    title: "گواهینامه ها",
    icon: "isax isax-note-215",
    route: all_routes.instructorCertificate,
  },
];
