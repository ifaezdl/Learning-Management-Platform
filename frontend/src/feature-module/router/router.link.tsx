import React, { useEffect } from "react";
import { Navigate, Route, useParams } from "react-router";
import { all_routes } from "./all_routes";
import HomeOne from "../HomePages/home-one/homeone";
import CourseGrid from "../Courses/courses-grid/courseGrid";
import CourseList from "../Courses/course-list/courseList";
import CourseCategory from "../Courses/course-category/courseCategory";
import CourseCategoryThree from "../Courses/course-category-three/courseCategoryThree";
import CourseResume from "../Courses/course-resume/courseResume";
import CourseWatch from "../Courses/course-watch/courseWatch";
import CourseCart from "../Courses/course-cart/courseCart";
import CourseCheckout from "../Courses/course-checkout/courseCheckout";
import AddNewCourse from "../Courses/add-newCourse/addNewCourse";
import InstructorDashboard from "../Instructor/instructor-dashboard/instructorDashboard";
import InstructorProfile from "../Instructor/instructor-profile/instructorProfile";
import InstructorCertificate from "../Instructor/instructor-certificate/instructorCertificate";
import InstructorCourse from "../Instructor/instructor-course/instructorCourse";
import InstructorAnnouncements from "../Instructor/instructor-announcements/instructorAnnouncements";
import InstructorAssignment from "../Instructor/instructor-assignment/instructorAssignment";
import StudentGrid from "../Instructor/student-grid/studentGrid";
import StudentList from "../Instructor/student-list/studentList";
import InstructorQuiz from "../Instructor/instructor-quiz/instructorQuiz";
import InstructorQuizResult from "../Instructor/instructor-quiz-result/instructorQuizResult";
import InstructorEarning from "../Instructor/instructor-earning/instructorEarning";
import InstructorPayout from "../Instructor/instructor-payout/instructorPayout";
import InstructorStatement from "../Instructor/instructor-statement/instructorStatement";
import InstructorMessage from "../Instructor/instructor-message/instructorMessage";
import InstructorTickets from "../Instructor/instructor-tickets/instructorTickets";
import InstructorChangePassoword from "../Instructor/instructor-settings/instructor-change-password/instructorChangePassoword";
import InstructorPlanSettings from "../Instructor/instructor-settings/instructor-plans-settings/instructorPlanSettings";
import InstructorSocialprofileSettings from "../Instructor/instructor-settings/instructor-socialprofile-settings/instructorSocialprofileSettings";
import InstructorLinkedAccounts from "../Instructor/instructor-settings/instructor-linked-accounts/instructorLinkedAccounts";
import InstructorNotification from "../Instructor/instructor-settings/instructor-notification/instructorNotification";
import InstructorIntegrations from "../Instructor/instructor-settings/instructor-integrations/instructorIntegrations";
import InstructorWithdraw from "../Instructor/instructor-settings/instructor-withdraw/instructorWithdraw";
import CourseDetails from "../Courses/course-details/courseDetails";
import CourseDetailsTwo from "../Courses/course-details-2/courseDetailsTwo";
import CourseCategoryTwo from "../Courses/course-category-two/courseCategoryTwo";
import StudentDashboard from "../student/dashboard/studentDashboard";
import InstructorGrid from "../Pages/instructor/instructor-grid/instructorGrid";
import InstructorList from "../Pages/instructor/instructor-list/instructorList";
import InstructorDetails from "../Pages/instructor/instructor-details/instructor-details";
import AboutUs from "../Pages/about-us/aboutUs";
import ContactUs from "../Pages/contact-us/contactUs";
import Notification from "../Pages/notification/notification";
import BecomeInstructor from "../Pages/become-instructor/becomeInstructor";
import Testimonials from "../Pages/testimonials/testimonials";
import PricePlanning from "../Pages/price-planning/pricePlanning";
import Faq from "../Pages/faq/faq";
import TermsCondition from "../Pages/terms-condition/termsCondition";
import PrivacyPolicy from "../Pages/privacy-policy/privacyPolicy";
import Login from "../auth/login/login";
import ForgortPassword from "../auth/forgot-password/forgortPassword";
import SetPassword from "../auth/set-password/setPassword";
import Otp from "../auth/otp/otp";
import LockScreen from "../auth/lock-screen/lockScreen";
import Error404 from "../auth/error/error-404/error400";
import Error500 from "../auth/error/error-500/error500";
import ComingSoon from "../auth/coming-soon/comingSoon";
import UnderConstruction from "../auth/underconstruction/underConstruction";
import InstructorCourseGrid from "../Instructor/instructor-course/instructorCourseGrid";

import StudentProfile from "../student/student-profile/studentProfile";
import StudentCourse from "../student/student-course/studentCourse";
import StudentCertificates from "../student/student-certificates/student-certificates";
import StudentWishlist from "../student/student-wishlist/studentWishlist";
import StudentReviews from "../student/student-reviews/studentReviews";
import StudentQuiz from "../student/student-quiz/studentQuiz";
import StudentOrder from "../student/student-order-history/studentOrder";
import StudentRefferal from "../student/student-refferal/studentRefferal";
import StudentMessage from "../student/student-message/studentMessage";
import StudentsDetails from "../Instructor/student-details/studentsDetails";
import InstructorQuizQuestions from "../Instructor/instructor-quiz-question/instructorQuizQuestions";
import StudentTickets from "../student/student-tickets/studentTickets";
import StudentSettings from "../student/student-settings/studentSettings";
import StudentChangePassword from "../student/student-settings/student-change-password/studentChangePassword";
import StudentSocialProfile from "../student/student-settings/student-social-profile/studentSocialProfile";
import StudentLinkedAccounts from "../student/student-settings/student-linked-accounts/studentLinkedAccounts";
import StudentNotification from "../student/student-settings/student-notifications/studentNotification";
import StudentQuizQuestion from "../student/student-quiz-question/studentQuizQuestion";
import InstructorProfileSettings from "../Instructor/instructor-settings/instructor-profile-settings/instructorProfile";
import PublicRoute from "./publicRoute";
import RoleRoute from "./roleRoutes";
import PaymentSuccess from "../Courses/course-checkout/paymentSuccess";
import PaymentFailure from "../Courses/course-checkout/paymentFailure";
import InstructorEnrolledCourse from "../Instructor/instructor-course/instructorEnrolledCourse";
import AdminDashboard from "../admin/dashboard/adminDashboard";
import AdminRequests from "../admin/admin-requests/adminRequests";
import UserManagement from "../admin/user-management/userManagement";
import CourseManagement from "../admin/course-management/courseManagement";
import AdminProfile from "../admin/admin-profile/adminProfile";
import AdminProfileSettings from "../admin/admin-setting/adminSetting";
import AdminChangePassword from "../admin/admin-change-password/adminChangePassword";
import GoogleCallback from "../auth/Google/google-callback";
import Register from "../auth/register/register";
const routes = all_routes;

export const publicRoutes = [
  {
    path: "/",
    name: "Root",
    element: <Navigate to="/index" />,
    route: Route,
  },
  {
    path: "/google-callback",
    name: "GoogleCallback",
    element: <GoogleCallback />,
    route: Route,
  },
  {
    path: routes.homeone,
    element: <HomeOne />,
    route: Route,
  },
  {
    path: routes.courseGrid,
    element: <CourseGrid />,
    route: Route,
  },
  {
    path: routes.courseList,
    element: <CourseList />,
    route: Route,
  },
  {
    path: routes.courseCategory,
    element: <CourseCategory />,
    route: Route,
  },
  {
    path: routes.courseCategory2,
    element: <CourseCategoryTwo />,
    route: Route,
  },
  {
    path: routes.courseCategory3,
    element: <CourseCategoryThree />,
    route: Route,
  },
  {
    path: routes.courseResume,
    element: <CourseResume />,
    route: Route,
  },
  {
    path: routes.courseWatch,
    element: <CourseWatch />,
    route: Route,
  },
  {
    path: routes.courseCart,
    element: <CourseCart />,
    route: Route,
  },
  {
    path: routes.courseCheckout,
    element: <CourseCheckout />,
    route: Route,
  },
  { path: routes.paymentSuccess, element: <PaymentSuccess />, route: Route },
  { path: routes.paymentFailure, element: <PaymentFailure />, route: Route },
  {
    path: routes.addNewCourse,
    element: (
      <RoleRoute roles={[2, 3]}>
        <AddNewCourse />
      </RoleRoute>
    ),
    route: Route,
  },
  {
    path: routes.adminDashboard,
    element: (
      <RoleRoute roles={[3]}>
        <AdminDashboard />
      </RoleRoute>
    ),
    route: Route,
  },
  {
    path: routes.AdminChangePassword,
    element: (
      <RoleRoute roles={[3]}>
        <AdminChangePassword />
      </RoleRoute>
    ),
    route: Route,
  },
  {
    path: routes.AdminProfileSettings,
    element: (
      <RoleRoute roles={[3]}>
        <AdminProfileSettings />
      </RoleRoute>
    ),
    route: Route,
  },

  {
    path: routes.AdminProfile,
    element: (
      <RoleRoute roles={[3]}>
        <AdminProfile />
      </RoleRoute>
    ),
    route: Route,
  },
  {
    path: routes.AdminRequests,
    element: (
      <RoleRoute roles={[3]}>
        <AdminRequests />
      </RoleRoute>
    ),
    route: Route,
  },
  {
    path: routes.adminUserManagement,
    element: (
      <RoleRoute roles={[3]}>
        <UserManagement />
      </RoleRoute>
    ),
    route: Route,
  },
  {
    path: routes.adminCourseManagement,
    element: (
      <RoleRoute roles={[3]}>
        <CourseManagement />
      </RoleRoute>
    ),
    route: Route,
  },
  {
    path: routes.instructorDashboard,
    element: (
      <RoleRoute roles={[2]}>
        <InstructorDashboard />
      </RoleRoute>
    ),
    route: Route,
  },
  {
    path: routes.instructorProfile,
    element: (
      <RoleRoute roles={[2]}>
        <InstructorProfile />
      </RoleRoute>
    ),
    route: Route,
  },
  {
    path: routes.instructorCourse,
    element: (
      <RoleRoute roles={[2]}>
        <InstructorCourse />
      </RoleRoute>
    ),
    route: Route,
  },
  {
    path: routes.instructorAnnouncements,
    element: (
      <RoleRoute roles={[2]}>
        <InstructorAnnouncements />
      </RoleRoute>
    ),
    route: Route,
  },
  {
    path: routes.instructorAssignment,
    element: (
      <RoleRoute roles={[2]}>
        <InstructorAssignment />
      </RoleRoute>
    ),
    route: Route,
  },
  {
    path: routes.studentsGrid,
    element: <StudentGrid />,
    route: Route,
  },
  {
    path: routes.studentsList,
    element: <StudentList />,
    route: Route,
  },
  {
    path: routes.instructorQuiz,
    element: <InstructorQuiz />,
    route: Route,
  },
  {
    path: routes.instructorQuizResult,
    element: <InstructorQuizResult />,
    route: Route,
  },
  {
    path: routes.instructorCertificate,
    element: <InstructorCertificate />,
    route: Route,
  },
  {
    path: routes.instructorEarning,
    element: <InstructorEarning />,
    route: Route,
  },
  {
    path: routes.instructorPayout,
    element: <InstructorPayout />,
    route: Route,
  },
  {
    path: routes.instructorStatements,
    element: <InstructorStatement />,
    route: Route,
  },
  {
    path: routes.instructorMessage,
    element: <InstructorMessage />,
    route: Route,
  },
  {
    path: routes.instructorTickets,
    element: <InstructorTickets />,
    route: Route,
  },
  {
    path: routes.instructorProfile,
    element: <InstructorProfile />,
    route: Route,
  },
  {
    path: routes.instructorChangePassword,
    element: <InstructorChangePassoword />,
    route: Route,
  },
  {
    path: routes.instructorPlan,
    element: <InstructorPlanSettings />,
    route: Route,
  },
  {
    path: routes.instructorSocialProfiles,
    element: <InstructorSocialprofileSettings />,
    route: Route,
  },
  {
    path: routes.instructorLinkedAccounts,
    element: <InstructorLinkedAccounts />,
    route: Route,
  },
  {
    path: routes.instructorNotification,
    element: <InstructorNotification />,
    route: Route,
  },
  {
    path: routes.instructorIntegrations,
    element: <InstructorIntegrations />,
    route: Route,
  },
  {
    path: routes.instructorWithdraw,
    element: <InstructorWithdraw />,
    route: Route,
  },
  {
    path: `${routes.courseDetails}/:id`,
    element: <CourseDetails />,
    route: Route,
  },
  {
    path: routes.courseDetails2,
    element: <CourseDetailsTwo />,
    route: Route,
  },
  {
    path: routes.studentDashboard,
    element: (
      <RoleRoute roles={[1]}>
        <StudentDashboard />
      </RoleRoute>
    ),
    route: Route,
  },
  {
    path: routes.instructorGrid,
    element: <InstructorGrid />,
    route: Route,
  },
  {
    path: routes.instructorList,
    element: <InstructorList />,
    route: Route,
  },
  {
    path: routes.instructorDetails,
    element: <InstructorDetails />,
    route: Route,
  },
  {
    path: routes.about_us,
    element: <AboutUs />,
    route: Route,
  },
  {
    path: routes.contactUs,
    element: <ContactUs />,
    route: Route,
  },
  {
    path: routes.notification,
    element: <Notification />,
    route: Route,
  },
  {
    path: routes.becomeAnInstructor,
    element: <BecomeInstructor />,
    route: Route,
  },
  {
    path: routes.testimonials,
    element: <Testimonials />,
    route: Route,
  },
  {
    path: routes.pricingPlan,
    element: <PricePlanning />,
    route: Route,
  },
  {
    path: routes.FAQ,
    element: <Faq />,
    route: Route,
  },
  {
    path: routes.termsConditions,
    element: <TermsCondition />,
    route: Route,
  },
  {
    path: routes.privacyPolicy,
    element: <PrivacyPolicy />,
    route: Route,
  },
  {
    path: routes.studentProfile,
    element: (
      <RoleRoute roles={[1]}>
        <StudentProfile />
      </RoleRoute>
    ),
    route: Route,
  },
  {
    path: routes.studentCourses,
    element: (
      <RoleRoute roles={[1]}>
        <StudentCourse />
      </RoleRoute>
    ),
    route: Route,
  },
  {
    path: routes.instructorEnrolledCourse,
    element: (
      <RoleRoute roles={[2]}>
        <InstructorEnrolledCourse />
      </RoleRoute>
    ),
  },
  {
    path: routes.studentCertificates,
    element: (
      <RoleRoute roles={[1]}>
        <StudentCertificates />
      </RoleRoute>
    ),
    route: Route,
  },
  {
    path: routes.studentWishlist,
    element: (
      <RoleRoute roles={[1]}>
        {" "}
        <StudentWishlist />
      </RoleRoute>
    ),
    route: Route,
  },
  {
    path: routes.studentReviews,
    element: (
      <RoleRoute roles={[1]}>
        {" "}
        <StudentReviews />
      </RoleRoute>
    ),
    route: Route,
  },
  {
    path: routes.studentQuiz,
    element: (
      <RoleRoute roles={[1]}>
        <StudentQuiz />
      </RoleRoute>
    ),
    route: Route,
  },
  {
    path: routes.studentOrderHistory,
    element: (
      <RoleRoute roles={[1]}>
        <StudentOrder />
      </RoleRoute>
    ),
    route: Route,
  },
  {
    path: routes.studentReferral,
    element: (
      <RoleRoute roles={[1]}>
        <StudentRefferal />
      </RoleRoute>
    ),
    route: Route,
  },
  {
    path: routes.studentMessage,
    element: (
      <RoleRoute roles={[1]}>
        <StudentMessage />
      </RoleRoute>
    ),
    route: Route,
  },
  {
    path: routes.instructorCourseGrid,
    element: (
      <RoleRoute roles={[2]}>
        <InstructorCourseGrid />
      </RoleRoute>
    ),
    route: Route,
  },
  {
    path: routes.studentsDetails,
    element: <StudentsDetails />,
    route: Route,
  },

  {
    path: routes.studentTickets,
    element: <StudentTickets />,
    route: Route,
  },
  {
    path: routes.studentSettings,
    element: <StudentSettings />,
    route: Route,
  },
  {
    path: routes.studentChangePassword,
    element: <StudentChangePassword />,
    route: Route,
  },
  {
    path: routes.studentSocialProfile,
    element: <StudentSocialProfile />,
    route: Route,
  },
  {
    path: routes.studentLinkedAccounts,
    element: <StudentLinkedAccounts />,
    route: Route,
  },
  {
    path: routes.studentNotification,
    element: <StudentNotification />,
    route: Route,
  },
  {
    path: routes.studentQuizQuestion,
    element: <StudentQuizQuestion />,
    route: Route,
  },
  {
    path: routes.instructorsettings,
    element: <InstructorProfileSettings />,
    route: Route,
  },
];

export const authRoutes = [
  {
    path: routes.login,
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
    route: Route,
  },
  {
    path: routes.register,
    element: (
      <PublicRoute>
        {" "}
        <Register />
      </PublicRoute>
    ),
    route: Route,
  },
  {
    path: routes.forgotpassword,
    element: <ForgortPassword />,
    route: Route,
  },
  {
    path: routes.setpassowrd,
    element: <SetPassword />,
    route: Route,
  },
  {
    path: routes.otp,
    element: <Otp />,
    route: Route,
  },
  {
    path: routes.lockscreen,
    element: <LockScreen />,
    route: Route,
  },
  {
    path: routes.Error404,
    element: <Error404 />,
    route: Route,
  },
  {
    path: routes.Error500,
    element: <Error500 />,
    route: Route,
  },
  {
    path: routes.underconstruction,
    element: <UnderConstruction />,
    route: Route,
  },
  {
    path: routes.comingSoon,
    element: <ComingSoon />,
    route: Route,
  },
];
