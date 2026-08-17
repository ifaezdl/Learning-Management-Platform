import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import DefaultEditor from "react-simple-wysiwyg";
import courseService, {
  Category,
  Level,
} from "../../../../services/course.service";
import uploadService from "../../../../services/upload.service";
import "./course-informatoin.scss";
interface CourseInformationProps {
  categories: Category[];
  levels: Level[];
  initialData?: any;
  onComplete: (courseId: number) => void;
}

const CourseInformation: React.FC<CourseInformationProps> = ({
  categories,
  levels,
  initialData,
  onComplete,
}) => {
  const getApiUrl = () => "http://localhost:3001";

  const [title, setTitle] = useState(initialData?.Title || "");
  const [shortDescription, setShortDescription] = useState(
    initialData?.ShortDescription || "",
  );
  const [description, setDescription] = useState(
    initialData?.Description || "",
  );
  const [price, setPrice] = useState(initialData?.Price?.toString() || "");
  const [discountPrice, setDiscountPrice] = useState(
    initialData?.DiscountPrice?.toString() || "",
  );
  const [categoryId, setCategoryId] = useState(
    initialData?.CategoryId?.toString() || "",
  );
  const [levelId, setLevelId] = useState(
    initialData?.Level_Id?.toString() || "",
  );
  const [durationMinutes, setDurationMinutes] = useState(
    initialData?.DurationMinutes?.toString() || "",
  );

  const buildThumbnailUrl = (path?: string) =>
    path ? `${getApiUrl()}${path}` : "";

  const [thumbnail, setThumbnail] = useState(initialData?.Thumbnail || "");

  const [thumbnailPreview, setThumbnailPreview] = useState(
    buildThumbnailUrl(initialData?.Thumbnail),
  );

  const [learningOutcomes, setLearningOutcomes] = useState<string[]>([]);
  const [prerequisites, setPrerequisites] = useState<string[]>([]);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!initialData) return;

    setLearningOutcomes(
      initialData.CourseLearningOutcomes?.map((x: any) => x.Title) ?? [],
    );

    setPrerequisites(
      initialData.CoursePrequisties?.map((x: any) => x.Title) ?? [],
    );
  }, [initialData]);

  const addLearningOutcome = (e: React.MouseEvent) => {
    e.preventDefault();
    setLearningOutcomes((prev) => [...prev, ""]);
  };

  const updateLearningOutcome = (index: number, value: string) => {
    setLearningOutcomes((prev) =>
      prev.map((item, i) => (i === index ? value : item)),
    );
  };

  const removeLearningOutcome = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    setLearningOutcomes((prev) => prev.filter((_, i) => i !== index));
  };

  const addPrerequisite = (e: React.MouseEvent) => {
    e.preventDefault();
    setPrerequisites((prev) => [...prev, ""]);
  };

  const updatePrerequisite = (index: number, value: string) => {
    setPrerequisites((prev) =>
      prev.map((item, i) => (i === index ? value : item)),
    );
  };

  const removePrerequisite = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    setPrerequisites((prev) => prev.filter((_, i) => i !== index));
  };

  const handleThumbnailUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("فقط فایل تصویری مجاز است.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("حداکثر حجم تصویر ۵ مگابایت است.");
      return;
    }

    setThumbnailPreview(URL.createObjectURL(file));

    try {
      setUploadingImage(true);

      const result = await uploadService.uploadCourseImage(file);

      setThumbnail(result.path);
      setThumbnailPreview(`${getApiUrl()}${result.path}`);

      toast.success("تصویر با موفقیت آپلود شد.");
    } catch {
      toast.error("آپلود تصویر انجام نشد.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    debugger;
    e.preventDefault();

    if (!title.trim()) {
      toast.error("عنوان دوره اجباری است.");
      return;
    }

    if (!categoryId) {
      toast.error("لطفاً یک دسته‌بندی انتخاب کنید.");
      return;
    }
    if (!levelId) {
      toast.error("لطفا سطح دوره را وارد نمایید.");
      return;
    }

    if (!shortDescription) {
      toast.error("معرفی کوتاه دوره را وارد نمایید.");
      return;
    }
    if (!description) {
      toast.error("لطفا توضیحات دوره را وارد کنید.");
      return;
    }

    if (!price || Number(price) < 0) {
      toast.error("لطفاً یک قیمت معتبر وارد کنید.");
      return;
    }

    if (!thumbnail) {
      toast.error("لطفاً تصویر دوره را آپلود کنید.");
      return;
    }

    setSubmitting(true);

    try {
      if (initialData?.Id) {
        await courseService.updateCourse(initialData.Id, {
          title: title.trim(),
          shortDescription: shortDescription.trim() || undefined,
          description: description.trim() || undefined,
          price: Number(price),
          discountPrice: discountPrice ? Number(discountPrice) : undefined,
          categoryId: Number(categoryId),
          levelId: levelId ? Number(levelId) : undefined,
          durationMinutes: durationMinutes
            ? Number(durationMinutes)
            : undefined,
          thumbnail: thumbnail.trim() || undefined,
        });

        await courseService.saveLearningOutcomes(initialData.Id, {
          items: learningOutcomes.filter((x) => x.trim() !== ""),
        });

        await courseService.savePrerequisites(initialData.Id, {
          items: prerequisites.filter((x) => x.trim() !== ""),
        });

        toast.success("دوره با موفقیت بروزرسانی شد.");
        onComplete(initialData.Id);
      } else {
        const course = await courseService.createCourse({
          title: title.trim(),
          shortDescription: shortDescription.trim() || undefined,
          description: description.trim() || undefined,
          price: Number(price),
          discountPrice: discountPrice ? Number(discountPrice) : undefined,
          categoryId: Number(categoryId),
          levelId: levelId ? Number(levelId) : undefined,
          durationMinutes: durationMinutes
            ? Number(durationMinutes)
            : undefined,
          thumbnail: thumbnail.trim() || undefined,
        });

        await courseService.saveLearningOutcomes(course.Id, {
          items: learningOutcomes.filter((x) => x.trim() !== ""),
        });

        await courseService.savePrerequisites(course.Id, {
          items: prerequisites.filter((x) => x.trim() !== ""),
        });

        toast.success("دوره با موفقیت ایجاد شد.");
        onComplete(course.Id);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || "ذخیره دوره با خطا مواجه شد.";

      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="course-information-page" dir="rtl">
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <div className="course-form-header">
          <div>
            <div className="course-form-icon">
              <i className="isax isax-book-1" />
            </div>

            <div>
              <h4>{initialData?.Id ? "ویرایش دوره" : "ایجاد دوره جدید"}</h4>

              <p>
                اطلاعات اصلی دوره، قیمت‌گذاری و محتوای آموزشی را تکمیل کنید.
              </p>
            </div>
          </div>

          <span className="course-step-badge">مرحله ۱</span>
        </div>

        {/* Main Information */}
        <div className="course-form-card">
          <div className="course-section-title">
            <div className="section-number">۱</div>

            <div>
              <h5>اطلاعات اصلی دوره</h5>
              <p>مشخصات اولیه و دسته‌بندی دوره را وارد کنید.</p>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-md-12">
              <div className="course-input-group">
                <label>
                  <span> * </span>
                  عنوان دوره
                </label>

                <input
                  type="text"
                  className="form-control course-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثلاً آموزش جامع React از صفر تا پیشرفته"
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="col-md-6">
              <div className="course-input-group">
                <label>
                  <span> * </span>
                  دسته‌بندی
                </label>

                <div className="select-wrapper">
                  <select
                    className="form-control course-input"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    disabled={submitting}
                  >
                    <option value="">انتخاب دسته‌بندی</option>

                    {categories.map((cat) => (
                      <option key={cat.Id} value={cat.Id}>
                        {cat.Title}
                      </option>
                    ))}
                  </select>

                  <i className="isax isax-arrow-down-1" />
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="course-input-group">
                <label>
                  <span> * </span>
                  سطح دوره
                </label>

                <div className="select-wrapper">
                  <select
                    className="form-control course-input"
                    value={levelId}
                    onChange={(e) => setLevelId(e.target.value)}
                    disabled={submitting}
                  >
                    <option value="">انتخاب سطح</option>

                    {levels.map((lvl) => (
                      <option key={lvl.Id} value={lvl.Id}>
                        {lvl.LevelName}
                      </option>
                    ))}
                  </select>

                  <i className="isax isax-arrow-down-1" />
                </div>
              </div>
            </div>

            <div className="col-md-12">
              <div className="course-input-group">
                <label>
                  <span> * </span>
                  معرفی کوتاه دوره
                </label>

                <input
                  type="text"
                  className="form-control course-input"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="در یک جمله توضیح دهید این دوره چه چیزی را آموزش می‌دهد."
                  disabled={submitting}
                />

                <small>
                  این متن می‌تواند در کارت دوره و صفحه لیست دوره‌ها نمایش داده
                  شود.
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="course-form-card">
          <div className="course-section-title">
            <div className="section-number">۲</div>

            <div className="course-input-group">
              <label>
                <span>*</span>
                <span className="fs-16" style={{ color: "black" }}>
                  {" "}
                  توضیحات دوره
                </span>
              </label>
              <p>توضیحات کامل دوره را برای دانشجویان بنویسید.</p>
            </div>
          </div>

          <div className="course-input-group">
            <label>توضیحات کامل</label>

            <div className="course-editor">
              <DefaultEditor
                value={description}
                onChange={(e: any) => setDescription(e.target.value)}
                disabled={submitting}
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="course-form-card">
          <div className="course-section-title">
            <div className="section-number">۳</div>

            <div>
              <h5>قیمت و مدت دوره</h5>
              <p>اطلاعات مالی و مدت زمان دوره را مشخص کنید.</p>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="course-input-group">
                <label>
                  <span> * </span>
                  قیمت دوره
                </label>

                <div className="input-with-suffix">
                  <input
                    type="number"
                    className="form-control course-input"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0"
                    min="0"
                    disabled={submitting}
                  />

                  <span>ریال</span>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="course-input-group">
                <label>قیمت با تخفیف</label>

                <div className="input-with-suffix">
                  <input
                    type="number"
                    className="form-control course-input"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                    placeholder="اختیاری"
                    min="0"
                    disabled={submitting}
                  />

                  <span>ریال</span>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="course-input-group">
                <label>مدت دوره</label>

                <div className="input-with-suffix">
                  <input
                    type="number"
                    className="form-control course-input"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    placeholder="مثلاً 480"
                    min="0"
                    disabled={submitting}
                  />

                  <span>دقیقه</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Thumbnail */}
        <div className="course-form-card">
          <div className="course-section-title">
            <div className="section-number">۴</div>

            <div className="course-input-group">
              <label>
                <span>*</span>
                <span className="fs-16" style={{ color: "black" }}>
                  {" "}
                  تصویر کاور دوره
                </span>
              </label>
              <p>یک تصویر مناسب برای نمایش دوره انتخاب کنید.</p>
            </div>
          </div>

          <div className="course-upload-layout">
            <label
              htmlFor="course-thumbnail"
              className={`course-upload-box ${
                uploadingImage ? "uploading" : ""
              }`}
            >
              {uploadingImage ? (
                <>
                  <span className="spinner-border" />
                  <strong>در حال آپلود تصویر...</strong>
                  <small>لطفاً تا پایان آپلود صبر کنید.</small>
                </>
              ) : (
                <>
                  <div className="upload-icon">
                    <i className="isax isax-gallery-add" />
                  </div>

                  <strong>برای انتخاب تصویر کلیک کنید</strong>

                  <small>JPG، PNG یا WEBP — حداکثر ۵ مگابایت</small>
                </>
              )}

              <input
                id="course-thumbnail"
                type="file"
                accept="image/*"
                onChange={handleThumbnailUpload}
                disabled={uploadingImage || submitting}
                hidden
              />
            </label>

            {thumbnailPreview && (
              <div className="thumbnail-preview-card">
                <div className="preview-label">
                  <span>پیش‌نمایش</span>

                  <i className="isax isax-tick-circle" />
                </div>

                <img src={thumbnailPreview} alt="Course Thumbnail" />
              </div>
            )}
          </div>
        </div>

        {/* Learning Outcomes */}
        <div className="row g-4">
          <div className="col-lg-6">
            <div className="course-form-card h-100">
              <div className="course-section-title">
                <div className="section-number green">
                  <i className="isax isax-teacher" />
                </div>

                <div>
                  <h5>دانشجویان چه چیزهایی یاد می‌گیرند؟</h5>
                  <p>مهارت‌ها و نتایجی که دانشجو بعد از دوره به دست می‌آورد.</p>
                </div>
              </div>

              <div className="dynamic-items">
                {learningOutcomes.length === 0 && (
                  <div className="empty-dynamic-state">
                    <i className="isax isax-task-square" />
                    <span>هنوز موردی اضافه نشده است.</span>
                  </div>
                )}

                {learningOutcomes.map((item, index) => (
                  <div key={index} className="dynamic-input-row">
                    <span className="item-number">{index + 1}</span>

                    <input
                      type="text"
                      className="form-control course-input"
                      placeholder="مثلاً ساخت یک پروژه واقعی با React"
                      value={item}
                      onChange={(e) =>
                        updateLearningOutcome(index, e.target.value)
                      }
                    />

                    <button
                      type="button"
                      className="delete-item-btn"
                      onClick={(e) => removeLearningOutcome(e, index)}
                    >
                      <i className="isax isax-trash" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="add-item-btn"
                onClick={addLearningOutcome}
              >
                <i className="isax isax-add" />
                افزودن نتیجه یادگیری
              </button>
            </div>
          </div>

          {/* Prerequisites */}
          <div className="col-lg-6">
            <div className="course-form-card h-100">
              <div className="course-section-title">
                <div className="section-number orange">
                  <i className="isax isax-clipboard-text" />
                </div>

                <div>
                  <h5>پیش‌نیازهای دوره</h5>
                  <p>
                    دانش یا مهارت‌هایی که دانشجو بهتر است قبل از شروع داشته
                    باشد.
                  </p>
                </div>
              </div>

              <div className="dynamic-items">
                {prerequisites.length === 0 && (
                  <div className="empty-dynamic-state">
                    <i className="isax isax-document-text" />
                    <span>هنوز پیش‌نیازی اضافه نشده است.</span>
                  </div>
                )}

                {prerequisites.map((item, index) => (
                  <div key={index} className="dynamic-input-row">
                    <span className="item-number">{index + 1}</span>

                    <input
                      type="text"
                      className="form-control course-input"
                      placeholder="مثلاً آشنایی با HTML و CSS"
                      value={item}
                      onChange={(e) =>
                        updatePrerequisite(index, e.target.value)
                      }
                    />

                    <button
                      type="button"
                      className="delete-item-btn"
                      onClick={(e) => removePrerequisite(e, index)}
                    >
                      <i className="isax isax-trash" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="add-item-btn"
                onClick={addPrerequisite}
              >
                <i className="isax isax-add" />
                افزودن پیش‌نیاز
              </button>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="course-submit-bar">
          <div>
            <strong>
              {initialData?.Id
                ? "ویرایش دوره آماده ذخیره است"
                : "دوره شما آماده ایجاد است"}
            </strong>

            <span>اطلاعات وارد شده را بررسی کنید و سپس ادامه دهید.</span>
          </div>

          <button
            type="submit"
            className="course-submit-btn"
            disabled={submitting || uploadingImage}
          >
            {submitting ? (
              <>
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                />
                در حال ذخیره...
              </>
            ) : (
              <>
                <i className="isax isax-tick-circle" />

                {initialData?.Id ? "ذخیره تغییرات" : "ذخیره و ادامه"}

                <i className="isax isax-arrow-left-2" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseInformation;
