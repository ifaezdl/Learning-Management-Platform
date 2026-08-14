import { useEffect, useState } from "react";
import ProfileCard from "../common/profileCard";
import InstructorSidebar from "../common/instructorSidebar";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import { Link, useSearchParams } from "react-router-dom";
import { all_routes } from "../../router/all_routes";
import Table from "../../../core/common/dataTable/index";
import courseService, {
  CourseStudent,
  MyCourse,
} from "../../../services/course.service";

const StudentList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [myCourses, setMyCourses] = useState<MyCourse[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [students, setStudents] = useState<CourseStudent[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMyCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      loadStudents(selectedCourseId);
      setSearchParams({ courseId: String(selectedCourseId) });
    }
  }, [selectedCourseId]);

  const loadMyCourses = async () => {
    try {
      setLoadingCourses(true);
      const courses = await courseService.getMyCourses();
      setMyCourses(courses);

      const courseIdFromUrl = searchParams.get("courseId");
      const initialId = courseIdFromUrl
        ? Number(courseIdFromUrl)
        : (courses[0]?.Id ?? null);

      setSelectedCourseId(initialId);
    } catch {
      setError("خطا در دریافت دوره‌ها");
    } finally {
      setLoadingCourses(false);
    }
  };

  const loadStudents = async (courseId: number) => {
    try {
      setLoadingStudents(true);
      setError("");
      const data = await courseService.getCourseStudents(courseId);
      setStudents(data);
    } catch {
      setError("خطا در دریافت دانشجوها");
    } finally {
      setLoadingStudents(false);
    }
  };

  const columns = [
    {
      title: "نام دانشجو",
      dataIndex: "firstName",
      render: (_: string, record: CourseStudent) => (
        <div className="d-flex align-items-center">
          <span className="avatar avatar-md avatar-rounded flex-shrink-0 me-2">
            <ImageWithBasePath
              src={
                record.avatar ? record.avatar : "assets/img/user/user-01.jpg"
              }
              alt=""
            />
          </span>
          <p className="fs-14 mb-0">
            {record.firstName} {record.lastName}
          </p>
        </div>
      ),
      sorter: (a: CourseStudent, b: CourseStudent) =>
        `${a.firstName}${a.lastName}`.localeCompare(
          `${b.firstName}${b.lastName}`,
        ),
    },
    {
      title: "تاریخ ثبت‌نام",
      dataIndex: "enrollmentDate",
      render: (text: string | null) =>
        text ? new Date(text).toLocaleDateString("fa-IR") : "-",
      sorter: (a: CourseStudent, b: CourseStudent) =>
        (a.enrollmentDate ?? "").localeCompare(b.enrollmentDate ?? ""),
    },
    {
      title: "پیشرفت دوره",
      dataIndex: "progressPercent",
      render: (_: number, record: CourseStudent) => (
        <div className="d-flex align-items-center">
          <div
            className="progress progress-xs flex-shrink-0"
            role="progressbar"
            style={{ height: 4, width: 110 }}
          >
            <div
              className="progress-bar bg-success"
              style={{ width: `${record.progressPercent}%` }}
            />
          </div>
          <span className="ms-2">
            {record.progressPercent}% ({record.completedLessons}/
            {record.totalLessons})
          </span>
        </div>
      ),
      sorter: (a: CourseStudent, b: CourseStudent) =>
        a.progressPercent - b.progressPercent,
    },
    {
      title: "شرکت در آزمون",
      dataIndex: "hasParticipatedInExam",
      render: (value: boolean) =>
        value ? (
          <span className="badge bg-success-transparent">شرکت کرده</span>
        ) : (
          <span className="badge bg-secondary-transparent">شرکت نکرده</span>
        ),
      sorter: (a: CourseStudent, b: CourseStudent) =>
        Number(a.hasParticipatedInExam) - Number(b.hasParticipatedInExam),
    },
    {
      title: "نمره",
      dataIndex: "score",
      render: (_: number, record: CourseStudent) =>
        record.hasParticipatedInExam
          ? `${record.score} از ${record.maxScore}`
          : "-",
    },
    {
      title: "وضعیت قبولی",
      dataIndex: "isPassed",
      render: (_: boolean | null, record: CourseStudent) => {
        if (!record.hasParticipatedInExam) return "-";
        return record.isPassed ? (
          <span className="badge bg-success">قبول</span>
        ) : (
          <span className="badge bg-danger">مردود</span>
        );
      },
    },
    // {
    //   title: "عملیات",
    //   dataIndex: "",
    //   render: (_: any, record: CourseStudent) => (
    //     <div className="d-flex align-items-center">
    //       <Link
    //         to={`${all_routes.studentsDetails}?studentId=${record.studentId}&courseId=${selectedCourseId}`}
    //         className="d-inline-flex fs-14 me-1 action-icon"
    //       >
    //         <i className="isax isax-eye" />
    //       </Link>
    //       <Link to="#" className="d-inline-flex fs-14 action-icon">
    //         <i className="isax isax-messages-3" />
    //       </Link>
    //     </div>
    //   ),
    // },
  ];

  return (
    <>
      <div className="content mt-5">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <InstructorSidebar />
            <div className="col-lg-9">
              <div className="page-title d-flex align-items-center justify-content-between">
                <h5 className="fw-bold">دانشجوهای من</h5>
              </div>

              <div className="row justify-content-between mb-5 bp-5">
                <div className="col-md-4 pb-3">
                  <select
                    className="form-select"
                    value={selectedCourseId ?? ""}
                    disabled={loadingCourses}
                    onChange={(e) =>
                      setSelectedCourseId(Number(e.target.value))
                    }
                  >
                    {myCourses.map((course) => (
                      <option key={course.Id} value={course.Id}>
                        {course.Title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {error && (
                <div className="alert alert-danger py-2 fs-14">{error}</div>
              )}

              {loadingStudents ? (
                <div className="text-center py-5">در حال بارگذاری...</div>
              ) : students.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  دانشجویی برای این دوره ثبت‌نام نکرده است.
                </div>
              ) : (
                <Table dataSource={students} columns={columns} Search={true} />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentList;
