import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { all_routes } from "../../router/all_routes";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import courseService, {
  Category,
  Level,
} from "../../../services/course.service";
import toast from "react-hot-toast";
import Stepper from "./components/Stepper";
import CourseInformation from "./components/CourseInformation";
import SectionManager from "./components/SectionManager";
import CourseSummary from "./components/CourseSummary";
import InstructorQuizQuestions from "../../Instructor/instructor-quiz-question/instructorQuizQuestions";

const STEPS = [
  { label: "اطلاعات دوره", icon: "fas fa-info-circle" },
  { label: "سرفصل ها", icon: "fas fa-layer-group" },
  { label: "دروس", icon: "fas fa-book" },
  { label: "فایل های دروس", icon: "fas fa-paperclip" },
  { label: "آزمون", icon: "fas fa-question-circle" },
  { label: "انتشار", icon: "fas fa-rocket" },
];

const stepStorageKey = (courseId: number) => `course_wizard_step_${courseId}`;

const AddNewCourse = () => {
  const route = all_routes;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");

  const [currentStep, setCurrentStep] = useState(0);
  const [courseId, setCourseId] = useState<number | null>(null);
  const [courseData, setCourseData] = useState<any>(null);
  const [loadingCourse, setLoadingCourse] = useState(!!editId);

  const [categories, setCategories] = useState<Category[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, lvls] = await Promise.all([
          courseService.getCategories(),
          courseService.getLevels(),
        ]);
        setCategories(cats);
        setLevels(lvls);
      } catch {
        toast.error("بارگذاری دسته‌بندی‌ها یا سطوح با خطا مواجه شد.");
      }
    };
    fetchData();
  }, []);

  // Load the existing course when editing (?id=... in URL)
  useEffect(() => {
    if (!editId) return;

    const id = Number(editId);
    if (!id || Number.isNaN(id)) return;

    const loadCourse = async () => {
      setLoadingCourse(true);
      try {
        const course = await courseService.getCourse(id);
        setCourseId(id);
        setCourseData(course);

        // Restore whatever step the user was on before a refresh
        const savedStep = localStorage.getItem(stepStorageKey(id));
        if (savedStep !== null) {
          const parsed = Number(savedStep);
          if (!Number.isNaN(parsed) && parsed >= 0 && parsed <= 5) {
            setCurrentStep(parsed);
          }
        }
      } catch {
        toast.error("بارگذاری اطلاعات دوره با خطا مواجه شد.");
      } finally {
        setLoadingCourse(false);
      }
    };
    loadCourse();
  }, [editId]);

  const goToStep = useCallback(
    (step: number) => {
      setCurrentStep(step);
      if (courseId) {
        localStorage.setItem(stepStorageKey(courseId), String(step));
      }
    },
    [courseId],
  );

  const handleCourseCreated = useCallback(async (id: number) => {
    setCourseId(id);
    try {
      const course = await courseService.getCourse(id);
      setCourseData(course);
    } catch {}
    setCurrentStep(1);
    localStorage.setItem(stepStorageKey(id), "1");
  }, []);

  const handlePublished = useCallback(() => {
    if (courseId) {
      localStorage.removeItem(stepStorageKey(courseId));
    }
    navigate(route.instructorCourse);
  }, [navigate, route, courseId]);

  if (loadingCourse) {
    return (
      <>
        <div className="content mt-5">
          <div className="container">
            <div className="text-center py-5">
              در حال بارگذاری اطلاعات دوره...
            </div>
          </div>
        </div>
      </>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <CourseInformation
            categories={categories}
            levels={levels}
            initialData={courseData}
            onComplete={handleCourseCreated}
          />
        );
      case 1:
        return (
          <div className="form-inner wizard-form-card">
            <div className="title d-flex justify-content-between align-items-center">
              <Link
                to="#"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => goToStep(0)}
                title="ویرایش اطلاعات دوره"
              >
                <i className="fas fa-edit me-1" /> ویرایش دوره
              </Link>
            </div>
            {courseId && <SectionManager courseId={courseId} />}
            <div className="add-form-btn widget-next-btn submit-btn mb-0">
              <div className="btn-left">
                <Link
                  to="#"
                  className="btn btn-light main-btn prev_btns"
                  onClick={() => goToStep(0)}
                >
                  <i className="isax isax-arrow-right-3 me-1" /> قبلی
                </Link>
              </div>
              <div className="btn-left">
                <Link
                  to="#"
                  className="btn btn-secondary main-btn next_btns"
                  onClick={() => goToStep(2)}
                >
                  بعدی: دروس <i className="isax isax-arrow-left-2 ms-1" />
                </Link>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="form-inner wizard-form-card">
            <div className="title d-flex justify-content-between align-items-center">
              <h5 className="mb-0">دروس</h5>
              <Link
                to="#"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => goToStep(1)}
              >
                <i className="fas fa-arrow-left me-1" /> بازگشت به سرفصل ها
              </Link>
            </div>
            {courseId && <SectionManager courseId={courseId} />}
            <div className="add-form-btn widget-next-btn submit-btn mb-0">
              <div className="btn-left">
                <Link
                  to="#"
                  className="btn btn-light main-btn prev_btns"
                  onClick={() => goToStep(1)}
                >
                  <i className="isax isax-arrow-right-3 me-1" /> قبلی
                </Link>
              </div>
              <div className="btn-left">
                <Link
                  to="#"
                  className="btn btn-secondary main-btn next_btns"
                  onClick={() => goToStep(3)}
                >
                  بعدی: فایل های دروس{" "}
                  <i className="isax isax-arrow-left-2 ms-1" />
                </Link>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="form-inner wizard-form-card">
            <div className="title d-flex justify-content-between align-items-center">
              <h5 className="mb-0">فایل های دروس</h5>
              <Link
                to="#"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => goToStep(2)}
              >
                <i className="fas fa-arrow-left me-1" /> بازگشت به دروس
              </Link>
            </div>
            <p className="text-muted mb-3">
              فایل‌های مربوط به هر درس را مدیریت کنید. سرفصل ها را باز کنید تا
              درس‌ها را ببینید، سپس فایل‌ها را به هر درس اضافه کنید.
            </p>
            {courseId && <SectionManager courseId={courseId} />}
            <div className="add-form-btn widget-next-btn submit-btn mb-0">
              <div className="btn-left">
                <Link
                  to="#"
                  className="btn btn-light main-btn prev_btns"
                  onClick={() => goToStep(2)}
                >
                  <i className="isax isax-arrow-right-3 me-1" /> قبلی
                </Link>
              </div>
              <div className="btn-left">
                <Link
                  to="#"
                  className="btn btn-secondary main-btn next_btns"
                  onClick={() => goToStep(4)}
                >
                  بعدی: آزمون <i className="isax isax-arrow-left-2 ms-1" />
                </Link>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="form-inner wizard-form-card">
            <div className="title d-flex justify-content-between align-items-center">
              <h5 className="mb-0">آزمون دوره</h5>
              <Link
                to="#"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => goToStep(3)}
              >
                <i className="fas fa-arrow-left me-1" /> بازگشت به فایل های دروس
              </Link>
            </div>
            {courseId && (
              <InstructorQuizQuestions
                courseId={courseId}
                onPrev={() => goToStep(3)}
                onNext={() => goToStep(5)}
              />
            )}
          </div>
        );
      case 5:
        return (
          <div className="form-inner wizard-form-card">
            <div className="title d-flex justify-content-between align-items-center">
              <h5 className="mb-0">انتشار دوره</h5>
              <Link
                to="#"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => goToStep(4)}
              >
                <i className="fas fa-arrow-left me-1" /> بازگشت به آزمون
              </Link>
            </div>
            {courseId && (
              <CourseSummary
                courseId={courseId}
                onPublished={handlePublished}
              />
            )}
            <div className="add-form-btn widget-next-btn submit-btn mb-0">
              <div className="btn-left">
                <Link
                  to="#"
                  className="btn btn-light main-btn prev_btns"
                  onClick={() => goToStep(4)}
                >
                  <i className="isax isax-arrow-right-3 me-1" /> قبلی
                </Link>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };
  return (
    <>
      <div className="content mt-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-10 mx-auto">
              <Stepper steps={STEPS} currentStep={currentStep} />
              <div className="initialization-form-set">{renderStep()}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddNewCourse;
