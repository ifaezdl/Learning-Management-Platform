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

const STEPS = [
  { label: "اطلاعات دوره", icon: "fas fa-info-circle" },
  { label: "سرفصل ها", icon: "fas fa-layer-group" },
  { label: "دروس", icon: "fas fa-book" },
  { label: "فایل های دروس", icon: "fas fa-paperclip" },
  { label: "ایجاد آزمون", icon: "fas fa-paperclip" },
  { label: "انتشار", icon: "fas fa-rocket" },
];

const AddNewCourse = () => {
  const route = all_routes;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");
  const [loadingCourse, setLoadingCourse] = useState(!!editId);
  const [currentStep, setCurrentStep] = useState(0);
  const [courseId, setCourseId] = useState<number | null>(null);
  const [courseData, setCourseData] = useState<any>(null);

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
  useEffect(() => {
    if (!editId) return;
    const loadCourse = async () => {
      try {
        setLoadingCourse(true);
        const course = await courseService.getCourse(Number(editId));
        setCourseData(course);
        setCourseId(course.Id);
      } catch {
        toast.error("بارگذاری اطلاعات دوره با خطا مواجه شد.");
        navigate(route.instructorCourse);
      } finally {
        setLoadingCourse(false);
      }
    };
    loadCourse();
  }, [editId, navigate, route]);
  const handleCourseCreated = useCallback(async (id: number) => {
    setCourseId(id);
    try {
      const course = await courseService.getCourse(id);
      setCourseData(course);
    } catch {}
    setCurrentStep(1);
  }, []);

  const handlePublished = useCallback(() => {
    navigate(route.instructorCourse);
  }, [navigate, route]);

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
              <h5 className="mb-0">سرفصل های دوره</h5>
              <Link
                to="#"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setCurrentStep(0)}
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
                  onClick={() => setCurrentStep(0)}
                >
                  <i className="isax isax-arrow-right-3 me-1" /> قبلی
                </Link>
              </div>
              <div className="btn-left">
                <Link
                  to="#"
                  className="btn btn-secondary main-btn next_btns"
                  onClick={() => setCurrentStep(2)}
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
                onClick={() => setCurrentStep(1)}
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
                  onClick={() => setCurrentStep(1)}
                >
                  <i className="isax isax-arrow-right-3 me-1" /> قبلی
                </Link>
              </div>
              <div className="btn-left">
                <Link
                  to="#"
                  className="btn btn-secondary main-btn next_btns"
                  onClick={() => setCurrentStep(3)}
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
                onClick={() => setCurrentStep(2)}
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
                  onClick={() => setCurrentStep(2)}
                >
                  <i className="isax isax-arrow-right-3 me-1" /> قبلی
                </Link>
              </div>
              <div className="btn-left">
                <Link
                  to="#"
                  className="btn btn-secondary main-btn next_btns"
                  onClick={() => setCurrentStep(4)}
                >
                  بعدی: انتشار <i className="isax isax-arrow-left-2 ms-1" />
                </Link>
              </div>
            </div>
          </div>
        );
      case 4:
        return <></>;
      case 5:
        return (
          <div className="form-inner wizard-form-card">
            <div className="title d-flex justify-content-between align-items-center">
              <h5 className="mb-0">انتشار دوره</h5>
              <Link
                to="#"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setCurrentStep(3)}
              >
                <i className="fas fa-arrow-left me-1" /> بازگشت به فایل های دروس
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
                  onClick={() => setCurrentStep(3)}
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

  if (loadingCourse) {
    return (
      <div className="content mt-5">
        <div className="container text-center py-5">
          در حال بارگذاری اطلاعات دوره...
        </div>
      </div>
    );
  }
  return (
    <>
      <div className="content mt-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-10 mx-auto">
              <div className="add-course-item">
                <Stepper steps={STEPS} currentStep={currentStep} />
                <div className="initialization-form-set">{renderStep()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddNewCourse;
