import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import courseService, { Lesson } from "../../../../services/course.service";
import LessonFileManager from "./LessonFileManager";
import uploadService from "../../../../services/upload.service";
import "./lesson-manager.scss";
interface LessonManagerProps {
  courseId: number;
  sectionId: number;
  onLessonsChanged: () => void;
}

const LessonManager: React.FC<LessonManagerProps> = ({
  sectionId,
  onLessonsChanged,
}) => {
  const getApiUrl = () => "http://localhost:3001";
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDescription, setLessonDescription] = useState("");
  const [lessonVideoUrl, setLessonVideoUrl] = useState("");
  const [videoType, setVideoType] = useState(false);

  const [videoPreview, setVideoPreview] = useState("");

  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [lessonDuration, setLessonDuration] = useState("");
  const [lessonOrder, setLessonOrder] = useState("");
  const [lessonFreePreview, setLessonFreePreview] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchLessons = useCallback(async () => {
    setLoading(true);
    try {
      const data = await courseService.getLessons(sectionId);
      setLessons(data);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || "بارگذاری درس‌ها با مشکل مواجه شد.";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  }, [sectionId]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  // قفل کردن اسکرول پس‌زمینه وقتی هر یک از مودال‌ها باز است
  useEffect(() => {
    if (showAddModal || showEditModal || showDeleteModal) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [showAddModal, showEditModal, showDeleteModal]);

  const resetForm = () => {
    setLessonTitle("");
    setLessonDescription("");
    setLessonVideoUrl("");
    setVideoPreview("");
    setVideoType(false);
    setLessonDuration("");
    setLessonOrder("");
    setLessonFreePreview(false);
  };
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("فقط فایل ویدیویی مجاز است.");
      return;
    }

    setVideoPreview(URL.createObjectURL(file));

    try {
      setUploadingVideo(true);

      const result = await uploadService.uploadVideo(file);

      setLessonVideoUrl(result.path);
      setVideoType(true);
      toast.success("ویدیو با موفقیت آپلود شد.");
    } catch {
      toast.error("آپلود ویدیو انجام نشد.");
    } finally {
      setUploadingVideo(false);
    }
  };
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!lessonTitle.trim()) {
      toast.error("عنوان درس اجباری است.");
      return;
    }

    if (!lessonVideoUrl) {
      toast.error("لطفاً ویدیو را انتخاب کنید.");
      return;
    }
    setSaving(true);
    try {
      await courseService.createLesson(sectionId, {
        title: lessonTitle.trim(),
        description: lessonDescription.trim() || undefined,
        videoUrl: lessonVideoUrl.trim() || undefined,
        videoType: videoType,
        durationMinutes: lessonDuration ? Number(lessonDuration) : undefined,
        displayOrder: lessonOrder ? Number(lessonOrder) : undefined,
        isFreePreview: lessonFreePreview,
      });
      toast.success("درس با موفقیت ایجاد شد.");
      setShowAddModal(false);
      resetForm();
      fetchLessons();
      onLessonsChanged();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "ایجاد درس با مشکل مواجه شد.";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLesson) return;
    if (!lessonTitle.trim()) {
      toast.error("عنوان درس اجباری است.");
      return;
    }
    setSaving(true);
    try {
      await courseService.updateLesson(selectedLesson.Id, {
        title: lessonTitle.trim(),
        description: lessonDescription.trim() || undefined,
        videoUrl: lessonVideoUrl.trim() || undefined,
        videoType: videoType,
        durationMinutes: lessonDuration ? Number(lessonDuration) : undefined,
        displayOrder: lessonOrder ? Number(lessonOrder) : undefined,
        isFreePreview: lessonFreePreview,
      });
      toast.success("درس با موفقیت بروزرسانی شد.");
      setShowEditModal(false);
      setSelectedLesson(null);
      resetForm();
      fetchLessons();
      onLessonsChanged();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || "به‌روزرسانی درس با مشکل مواجه شد.";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedLesson) return;
    setSaving(true);
    try {
      await courseService.deleteLesson(selectedLesson.Id);
      toast.success("درس با موفقیت حذف شد.");
      setShowDeleteModal(false);
      setSelectedLesson(null);
      fetchLessons();
      onLessonsChanged();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "حذف درس با مشکل مواجه شد.";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setLessonTitle(lesson.Title);
    setLessonDescription(lesson.Description || "");

    setVideoType(lesson.VideoType);
    setLessonVideoUrl(lesson.VideoUrl || "");

    if (lesson.VideoType) {
      // فقط برای ویدیوهای آپلودی پیش‌نمایش بساز
      setVideoPreview(`${getApiUrl()}${lesson.VideoUrl}`);
    } else {
      // برای لینک، پیش‌نمایش لازم نیست
      setVideoPreview("");
    }

    setLessonDuration(lesson.DurationMinutes?.toString() || "");
    setLessonOrder(lesson.SortOrder?.toString() || "");
    setLessonFreePreview(lesson.IsFreePreview);

    setShowEditModal(true);
  };

  const openDeleteModal = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setShowDeleteModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedLesson(null);
    resetForm();
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedLesson(null);
  };

  const lessonForm = (
    <form onSubmit={showEditModal ? handleEdit : handleAdd}>
      <div className="lesson-modal-body">
        <div className="lesson-form-group">
          <label>
            عنوان درس
            <span>*</span>
          </label>
          <input
            type="text"
            className="lesson-form-control"
            value={lessonTitle}
            onChange={(e) => setLessonTitle(e.target.value)}
            placeholder="عنوان درس را وارد کنید"
            disabled={saving}
            autoFocus
          />
        </div>

        <div className="lesson-form-group">
          <label>توضیحات</label>
          <textarea
            className="lesson-form-control lesson-textarea"
            rows={3}
            value={lessonDescription}
            onChange={(e) => setLessonDescription(e.target.value)}
            placeholder="توضیح مختصری از درس بنویسید"
            disabled={saving}
          />
        </div>

        <div className="lesson-form-row">
          <div className="lesson-form-group">
            <label>نوع ویدیو</label>
            <select
              className="lesson-form-control"
              value={videoType ? "1" : "0"}
              onChange={(e) => setVideoType(e.target.value === "1")}
              disabled={saving}
            >
              <option value="0">لینک ویدیو</option>
              <option value="1">فایل آپلود شده</option>
            </select>
          </div>

          <div className="lesson-form-group">
            <label>مدت زمان (دقیقه)</label>
            <input
              type="number"
              className="lesson-form-control"
              value={lessonDuration}
              onChange={(e) => setLessonDuration(e.target.value)}
              placeholder="0"
              min="0"
              disabled={saving}
            />
          </div>
        </div>

        {videoType ? (
          <div className="lesson-form-group">
            <label>ویدیوی درس</label>
            <input
              type="file"
              accept="video/*"
              className="lesson-form-control"
              onChange={handleVideoUpload}
              disabled={saving}
            />

            {uploadingVideo && (
              <small className="lesson-uploading-text">
                در حال آپلود ویدیو...
              </small>
            )}

            {videoPreview && (
              <div className="lesson-video-preview">
                <video controls src={videoPreview} />
              </div>
            )}
          </div>
        ) : (
          <div className="lesson-form-group">
            <label>لینک ویدیو</label>
            <input
              type="text"
              className="lesson-form-control"
              value={lessonVideoUrl}
              onChange={(e) => setLessonVideoUrl(e.target.value)}
              placeholder="https://..."
              disabled={saving}
            />
          </div>
        )}

        <div className="lesson-form-row">
          <div className="lesson-form-group">
            <label>ترتیب نمایش</label>
            <input
              type="number"
              className="lesson-form-control"
              value={lessonOrder}
              onChange={(e) => setLessonOrder(e.target.value)}
              placeholder="به صورت خودکار تعیین می‌شود"
              min="1"
              disabled={saving}
            />
          </div>

          <div className="lesson-form-group lesson-form-group-checkbox">
            <label>&nbsp;</label>
            <div className="lesson-checkbox-row">
              <input
                type="checkbox"
                id="freePreviewCheck"
                checked={lessonFreePreview}
                onChange={(e) => setLessonFreePreview(e.target.checked)}
                disabled={saving}
              />
              <label
                htmlFor="freePreviewCheck"
                className="lesson-checkbox-label"
              >
                قابل مشاهده به‌صورت رایگان
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="lesson-modal-footer">
        <button
          type="button"
          className="lesson-modal-btn cancel"
          onClick={showEditModal ? closeEditModal : closeAddModal}
          disabled={saving}
        >
          لغو
        </button>

        <button
          type="submit"
          className="lesson-modal-btn primary"
          disabled={saving}
        >
          {saving ? (
            <>
              <span className="spinner-border spinner-border-sm" />
              در حال ذخیره...
            </>
          ) : showEditModal ? (
            <>
              <i className="isax isax-tick-circle" />
              ذخیره تغییرات
            </>
          ) : (
            <>
              <i className="isax isax-add" />
              افزودن درس
            </>
          )}
        </button>
      </div>
    </form>
  );

  return (
    <>
      <div className="lesson-manager-header">
        <div className="lesson-manager-title">
          <div className="lesson-manager-icon">
            <i className="fas fa-book-open" />
          </div>

          <div>
            <h6>دروس</h6>
            <span>درس‌های این سرفصل را مدیریت کنید</span>
          </div>
        </div>

        <button
          className="lesson-add-btn"
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
        >
          <i className="fas fa-plus" />
          افزودن درس
        </button>
      </div>

      {loading ? (
        <div className="lesson-loading">
          <div className="spinner-border spinner-border-sm" />
          <span>در حال بارگذاری درس‌ها...</span>
        </div>
      ) : lessons.length === 0 ? (
        <div className="lesson-empty-state">
          <div className="lesson-empty-icon">
            <i className="fas fa-book-open" />
          </div>

          <h6>هنوز درسی اضافه نشده است</h6>

          <p>
            برای این سرفصل هنوز هیچ درسی ایجاد نشده است.
            <br />
            اولین درس را اضافه کنید.
          </p>

          <button
            className="lesson-empty-btn"
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
          >
            <i className="fas fa-plus me-1" />
            افزودن اولین درس
          </button>
        </div>
      ) : (
        <div className="lesson-list">
          {lessons.map((lesson, index) => (
            <div className="lesson-card" key={lesson.Id}>
              <div className="lesson-card-main">
                <div className="lesson-number">{index + 1}</div>

                <div className="lesson-content">
                  <div className="lesson-title-row">
                    <h6>{lesson.Title}</h6>

                    {lesson.IsFreePreview && (
                      <span className="lesson-free-badge">
                        <i className="fas fa-unlock-alt" />
                        پیش‌نمایش رایگان
                      </span>
                    )}
                  </div>

                  {lesson.Description && (
                    <p className="lesson-description">{lesson.Description}</p>
                  )}

                  <div className="lesson-meta">
                    {lesson.DurationMinutes != null && (
                      <span>
                        <i className="fas fa-clock" />
                        {lesson.DurationMinutes} دقیقه
                      </span>
                    )}

                    {lesson.VideoUrl && (
                      <span>
                        <i className="fas fa-video" />
                        ویدیو
                      </span>
                    )}

                    <span>
                      <i className="fas fa-paperclip" />
                      {lesson.LessonFiles?.length || 0} فایل
                    </span>
                  </div>
                </div>

                <div className="lesson-actions">
                  <button
                    className="lesson-action edit"
                    title="ویرایش درس"
                    onClick={() => openEditModal(lesson)}
                  >
                    <i className="fas fa-pen" />
                  </button>

                  <button
                    className="lesson-action delete"
                    title="حذف درس"
                    onClick={() => openDeleteModal(lesson)}
                  >
                    <i className="fas fa-trash" />
                  </button>
                </div>
              </div>

              <div className="lesson-files">
                <LessonFileManager lessonId={lesson.Id} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =========================
        ADD LESSON MODAL
      ========================= */}
      {showAddModal &&
        createPortal(
          <div className="lesson-modal-backdrop">
            <div
              className="lesson-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="add-lesson-title"
            >
              <div className="lesson-modal-header">
                <div className="lesson-modal-title">
                  <div className="lesson-modal-icon">
                    <i className="isax isax-book-1" />
                  </div>

                  <div>
                    <h5 id="add-lesson-title">افزودن درس</h5>
                    <span>یک درس جدید به این سرفصل اضافه کنید.</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="lesson-modal-close"
                  onClick={closeAddModal}
                  disabled={saving}
                >
                  <i className="isax isax-close-circle" />
                </button>
              </div>

              {lessonForm}
            </div>
          </div>,
          document.body,
        )}

      {/* =========================
        EDIT LESSON MODAL
      ========================= */}
      {showEditModal &&
        createPortal(
          <div className="lesson-modal-backdrop">
            <div
              className="lesson-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="edit-lesson-title"
            >
              <div className="lesson-modal-header">
                <div className="lesson-modal-title">
                  <div className="lesson-modal-icon edit">
                    <i className="isax isax-edit-2" />
                  </div>

                  <div>
                    <h5 id="edit-lesson-title">ویرایش درس</h5>
                    <span>اطلاعات این درس را ویرایش کنید.</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="lesson-modal-close"
                  onClick={closeEditModal}
                  disabled={saving}
                >
                  <i className="isax isax-close-circle" />
                </button>
              </div>

              {lessonForm}
            </div>
          </div>,
          document.body,
        )}

      {/* =========================
        DELETE LESSON MODAL
      ========================= */}
      {showDeleteModal &&
        createPortal(
          <div className="lesson-modal-backdrop">
            <div
              className="lesson-modal lesson-delete-modal"
              role="dialog"
              aria-modal="true"
            >
              <div className="lesson-modal-header">
                <div className="lesson-modal-title">
                  <div className="lesson-modal-icon danger">
                    <i className="isax isax-trash" />
                  </div>

                  <div>
                    <h5>حذف درس</h5>
                    <span>این عملیات قابل بازگشت نیست.</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="lesson-modal-close"
                  onClick={closeDeleteModal}
                  disabled={saving}
                >
                  <i className="isax isax-close-circle" />
                </button>
              </div>

              <div className="lesson-delete-body">
                <p>
                  آیا از حذف درس
                  <strong> «{selectedLesson?.Title}» </strong>
                  اطمینان دارید؟
                </p>

                <div className="lesson-delete-warning">
                  <i className="isax isax-warning-2" />
                  <span>
                    با حذف این درس، فایل‌های آموزشی مرتبط با آن نیز حذف خواهند
                    شد.
                  </span>
                </div>
              </div>

              <div className="lesson-modal-footer">
                <button
                  type="button"
                  className="lesson-modal-btn cancel"
                  onClick={closeDeleteModal}
                  disabled={saving}
                >
                  لغو
                </button>

                <button
                  type="button"
                  className="lesson-modal-btn danger"
                  onClick={handleDelete}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm" />
                      در حال حذف...
                    </>
                  ) : (
                    <>
                      <i className="isax isax-trash" />
                      حذف درس
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export default LessonManager;
