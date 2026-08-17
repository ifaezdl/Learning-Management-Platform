import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { all_routes } from "../../router/all_routes";
import "./coursecreate.scss";
import courseService, {
  Category,
  Level,
} from "../../../services/course.service";
import { useAuth } from "../../../context/AuthContext";
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
  const { user } = useAuth();
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
    // Admins manage courses from the admin panel; teachers go to their course list
    navigate(
      user?.roleId === 3 ? route.adminCourseManagement : route.instructorCourse,
    );
  }, [navigate, route, courseId, user?.roleId]);

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
    const stepConfig = {
      1: {
        title: "سرفصل‌های دوره",
        description:
          "سرفصل‌های اصلی دوره را ایجاد و ساختار آموزشی آن را مشخص کنید.",
        backText: "اطلاعات دوره",
        nextText: "دروس",
        nextStep: 2,
      },

      2: {
        title: "دروس دوره",
        description:
          "درس‌های مربوط به هر سرفصل را ایجاد و محتوای آموزشی دوره را سازماندهی کنید.",
        backText: "سرفصل‌ها",
        nextText: "فایل‌های دروس",
        nextStep: 3,
      },

      3: {
        title: "فایل‌های دروس",
        description:
          "فایل‌های آموزشی مربوط به هر درس را مدیریت و به درس موردنظر اضافه کنید.",
        backText: "دروس",
        nextText: "آزمون دوره",
        nextStep: 4,
      },
    };

    const renderNavigation = ({
      prevStep,
      nextStep,
      nextText,
      showNext = true,
    }: {
      prevStep: number;
      nextStep?: number;
      nextText?: string;
      showNext?: boolean;
    }) => {
      return (
        <div className="course-wizard-navigation">
          <button
            type="button"
            className="wizard-nav-btn wizard-prev-btn"
            onClick={() => goToStep(prevStep)}
          >
            <i className="isax isax-arrow-right-3" />
            <span>قبلی</span>
          </button>

          {showNext && nextStep !== undefined && (
            <button
              type="button"
              className="wizard-nav-btn wizard-next-btn"
              onClick={() => goToStep(nextStep)}
            >
              <span>{nextText}</span>
              <i className="isax isax-arrow-left-2" />
            </button>
          )}
        </div>
      );
    };

    const renderManagementStep = (
      step: 1 | 2 | 3,
      content: React.ReactNode,
    ) => {
      const config = stepConfig[step];

      return (
        <div className="course-wizard-card">
          <div className="course-wizard-card-header">
            <div className="wizard-card-heading">
              <div className="wizard-card-icon">
                <i
                  className={
                    step === 1
                      ? "isax isax-folder-2"
                      : step === 2
                        ? "isax isax-book-1"
                        : "isax isax-document"
                  }
                />
              </div>

              <div>
                <h5>{config.title}</h5>
                <p>{config.description}</p>
              </div>
            </div>

            <button
              type="button"
              className="wizard-edit-btn"
              onClick={() => goToStep(step - 1)}
            >
              <i className="isax isax-arrow-right-3" />
              {config.backText}
            </button>
          </div>

          <div className="course-wizard-content">{content}</div>

          {renderNavigation({
            prevStep: step - 1,
            nextStep: config.nextStep,
            nextText: `بعدی: ${config.nextText}`,
          })}
        </div>
      );
    };

    switch (currentStep) {
      case 0:
        return (
          <div className="course-wizard-step">
            <CourseInformation
              categories={categories}
              levels={levels}
              initialData={courseData}
              onComplete={handleCourseCreated}
            />
          </div>
        );

      case 1:
        return renderManagementStep(
          1,
          courseId ? <SectionManager courseId={courseId} /> : null,
        );

      case 2:
        return renderManagementStep(
          2,
          courseId ? <SectionManager courseId={courseId} /> : null,
        );

      case 3:
        return renderManagementStep(
          3,
          courseId ? <SectionManager courseId={courseId} /> : null,
        );

      case 4:
        return (
          <div className="course-wizard-card">
            <div className="course-wizard-card-header">
              <div className="wizard-card-heading">
                <div className="wizard-card-icon quiz-icon">
                  <i className="isax isax-clipboard-text" />
                </div>

                <div>
                  <h5>آزمون دوره</h5>
                  <p>سوالات آزمون دوره را ایجاد و مدیریت کنید.</p>
                </div>
              </div>

              <button
                type="button"
                className="wizard-edit-btn"
                onClick={() => goToStep(3)}
              >
                <i className="isax isax-arrow-right-3" />
                فایل‌های دروس
              </button>
            </div>

            <div className="course-wizard-content">
              {courseId && (
                <InstructorQuizQuestions
                  courseId={courseId}
                  onPrev={() => goToStep(3)}
                  onNext={() => goToStep(5)}
                />
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="course-wizard-card">
            <div className="course-wizard-card-header">
              <div className="wizard-card-heading">
                <div className="wizard-card-icon publish-icon">
                  <i className="isax isax-send-2" />
                </div>

                <div>
                  <h5>انتشار دوره</h5>
                  <p>اطلاعات نهایی دوره را بررسی کرده و آن را منتشر کنید.</p>
                </div>
              </div>

              <button
                type="button"
                className="wizard-edit-btn"
                onClick={() => goToStep(4)}
              >
                <i className="isax isax-arrow-right-3" />
                آزمون دوره
              </button>
            </div>

            <div className="course-wizard-content">
              {courseId && (
                <CourseSummary
                  courseId={courseId}
                  onPublished={handlePublished}
                />
              )}
            </div>

            {renderNavigation({
              prevStep: 4,
              showNext: false,
            })}
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
