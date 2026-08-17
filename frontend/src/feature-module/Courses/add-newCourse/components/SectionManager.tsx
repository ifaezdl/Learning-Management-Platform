import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import courseService, {
  Section,
  Lesson,
} from "../../../../services/course.service";
import LessonManager from "./LessonManager";
import "./section-manager.scss";

interface SectionManagerProps {
  courseId: number;
}

const SectionManager: React.FC<SectionManagerProps> = ({ courseId }) => {
  const [sections, setSections] = useState<
    (Section & { Lessons?: Lesson[] })[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);

  const [sectionTitle, setSectionTitle] = useState("");
  const [sectionOrder, setSectionOrder] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchSections = useCallback(async () => {
    setLoading(true);
    try {
      const data = await courseService.getSections(courseId);
      setSections(data);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || "بارگذاری سرفصل‌ها با خطا مواجه شد.";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionTitle.trim()) {
      toast.error("عنوان سرفصل اجباری میباشد.");
      return;
    }
    setSaving(true);
    try {
      await courseService.createSection(courseId, {
        title: sectionTitle.trim(),
        displayOrder: sectionOrder ? Number(sectionOrder) : undefined,
      });
      toast.success("سرفصل با موفقیت ایجاد شد.");
      setShowAddModal(false);
      setSectionTitle("");
      setSectionOrder("");
      fetchSections();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || "ایجاد سرفصل با خطا مواجه شد.";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSection) return;
    if (!sectionTitle.trim()) {
      toast.error("عنوان سرفصل اجباری میباشد.");
      return;
    }
    setSaving(true);
    try {
      await courseService.updateSection(selectedSection.Id, {
        title: sectionTitle.trim(),
        displayOrder: sectionOrder ? Number(sectionOrder) : undefined,
      });
      toast.success("سرفصل با موفقیت بروزرسانی شد.");
      setShowEditModal(false);
      setSelectedSection(null);
      setSectionTitle("");
      setSectionOrder("");
      fetchSections();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || "بروزرسانی سرفصل با خطا مواجه شد.";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSection) return;
    setSaving(true);
    try {
      await courseService.deleteSection(selectedSection.Id);
      toast.success("سرفصل با موفقیت حذف شد.");
      setShowDeleteModal(false);
      setSelectedSection(null);
      fetchSections();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "حذف سرفصل با خطا مواجه شد.";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (section: Section) => {
    setSelectedSection(section);
    setSectionTitle(section.Title);
    setSectionOrder(section.DisplayOrder?.toString() || "");
    setShowEditModal(true);
  };

  const openDeleteModal = (section: Section) => {
    setSelectedSection(section);
    setShowDeleteModal(true);
  };

  const toggleExpand = (sectionId: number) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  return (
    <>
      <div className="section-manager">
        {/* Header */}
        <div className="section-manager-header">
          <div className="section-manager-heading">
            <div className="section-manager-icon">
              <i className="isax isax-folder-2" />
            </div>

            <div>
              <h6>مدیریت سرفصل‌ها</h6>
              <p>
                سرفصل‌های دوره را ایجاد کنید و درس‌های مربوط به هر سرفصل را
                مدیریت کنید.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="section-add-btn"
            onClick={() => {
              setSectionTitle("");
              setSectionOrder("");
              setShowAddModal(true);
            }}
          >
            <i className="isax isax-add" />
            <span>افزودن سرفصل</span>
          </button>
        </div>

        {/* Content */}
        <div className="section-manager-body">
          {loading ? (
            <div className="section-loading">
              <div
                className="spinner-border"
                role="status"
                aria-label="در حال بارگذاری"
              />

              <span>در حال دریافت سرفصل‌ها...</span>
            </div>
          ) : sections.length === 0 ? (
            <div className="section-empty-state">
              <div className="section-modal-icon">
                <i className="isax isax-folder-add" />
              </div>

              <h6>هنوز سرفصلی ایجاد نشده است</h6>

              <p>برای شروع ساختار دوره، اولین سرفصل خود را ایجاد کنید.</p>

              <button
                type="button"
                className="section-empty-btn"
                onClick={() => {
                  setSectionTitle("");
                  setSectionOrder("");
                  setShowAddModal(true);
                }}
              >
                <i className="isax isax-add" />
                افزودن اولین سرفصل
              </button>
            </div>
          ) : (
            <div className="sections-list">
              {sections.map((section, index) => {
                const isExpanded = expandedSection === section.Id;
                const lessonCount = section.Lessons?.length || 0;

                return (
                  <div
                    className={`section-item ${
                      isExpanded ? "is-expanded" : ""
                    }`}
                    key={section.Id}
                  >
                    {/* Section Header */}
                    <div className="section-item-header">
                      <button
                        type="button"
                        className="section-toggle"
                        onClick={() => toggleExpand(section.Id)}
                      >
                        <div className="section-number">
                          {String(index + 1).padStart(2, "0")}
                        </div>

                        <div className="section-main-info">
                          <div className="section-title-row">
                            <span className="section-label">
                              سرفصل {index + 1}
                            </span>

                            <span className="section-lesson-count">
                              <i className="isax isax-book-1" />
                              {lessonCount} درس
                            </span>
                          </div>

                          <strong>{section.Title}</strong>
                        </div>

                        <div
                          className={`section-chevron ${
                            isExpanded ? "expanded" : ""
                          }`}
                        >
                          <i className="isax isax-arrow-down-1" />
                        </div>
                      </button>

                      <div className="section-actions">
                        <button
                          type="button"
                          className="section-action-btn edit"
                          title="ویرایش سرفصل"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(section);
                          }}
                        >
                          <i className="isax isax-edit-2" />
                        </button>

                        <button
                          type="button"
                          className="section-action-btn delete"
                          title="حذف سرفصل"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteModal(section);
                          }}
                        >
                          <i className="isax isax-trash" />
                        </button>
                      </div>
                    </div>

                    {/* Lessons */}
                    {isExpanded && (
                      <div className="section-lessons">
                        <LessonManager
                          courseId={courseId}
                          sectionId={section.Id}
                          onLessonsChanged={fetchSections}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* =========================
        ADD SECTION MODAL
    ========================= */}
      {showAddModal && (
        <div className="section-modal-backdrop">
          <div
            className="section-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-section-title"
          >
            <div className="section-modal-header">
              <div className="section-modal-title">
                <div className="section-modal-icon">
                  <i className="isax isax-folder-add" />
                </div>

                <div>
                  <h5 id="add-section-title">افزودن سرفصل</h5>
                  <span>یک سرفصل جدید به دوره اضافه کنید.</span>
                </div>
              </div>

              <button
                type="button"
                className="section-modal-close"
                onClick={() => setShowAddModal(false)}
                disabled={saving}
              >
                <i className="isax isax-close-circle" />
              </button>
            </div>

            <form onSubmit={handleAdd}>
              <div className="section-modal-body">
                <div className="section-form-group">
                  <label>
                    <span> * </span>
                    عنوان سرفصل
                  </label>

                  <input
                    type="text"
                    className="section-form-control"
                    value={sectionTitle}
                    onChange={(e) => setSectionTitle(e.target.value)}
                    placeholder="مثلاً: مبانی برنامه‌نویسی"
                    disabled={saving}
                    autoFocus
                  />
                </div>

                <div className="section-form-group">
                  <label>ترتیب نمایش</label>

                  <input
                    type="number"
                    className="section-form-control"
                    value={sectionOrder}
                    onChange={(e) => setSectionOrder(e.target.value)}
                    placeholder="به صورت خودکار تعیین می‌شود"
                    min="1"
                    disabled={saving}
                  />

                  <small>
                    در صورت خالی گذاشتن، ترتیب به صورت خودکار تعیین می‌شود.
                  </small>
                </div>
              </div>

              <div className="section-modal-footer">
                <button
                  type="button"
                  className="section-modal-btn cancel"
                  onClick={() => setShowAddModal(false)}
                  disabled={saving}
                >
                  لغو
                </button>

                <button
                  type="submit"
                  className="section-modal-btn primary"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm" />
                      در حال ذخیره...
                    </>
                  ) : (
                    <>
                      <i className="isax isax-add" />
                      افزودن سرفصل
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================
        EDIT SECTION MODAL
    ========================= */}
      {showEditModal && (
        <div className="section-modal-backdrop">
          <div
            className="section-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-section-title"
          >
            <div className="section-modal-header">
              <div className="section-modal-title">
                <div className="section-modal-icon edit">
                  <i className="isax isax-edit-2" />
                </div>

                <div>
                  <h5 id="edit-section-title">ویرایش سرفصل</h5>
                  <span>اطلاعات سرفصل را ویرایش کنید.</span>
                </div>
              </div>

              <button
                type="button"
                className="section-modal-close"
                onClick={() => setShowEditModal(false)}
                disabled={saving}
              >
                <i className="isax isax-close-circle" />
              </button>
            </div>

            <form onSubmit={handleEdit}>
              <div className="section-modal-body">
                <div className="section-form-group">
                  <label>
                    عنوان سرفصل
                    <span>*</span>
                  </label>

                  <input
                    type="text"
                    className="section-form-control"
                    value={sectionTitle}
                    onChange={(e) => setSectionTitle(e.target.value)}
                    placeholder="عنوان سرفصل را وارد کنید"
                    disabled={saving}
                    autoFocus
                  />
                </div>

                <div className="section-form-group">
                  <label>ترتیب نمایش</label>

                  <input
                    type="number"
                    className="section-form-control"
                    value={sectionOrder}
                    onChange={(e) => setSectionOrder(e.target.value)}
                    placeholder="به صورت خودکار تعیین می‌شود"
                    min="1"
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="section-modal-footer">
                <button
                  type="button"
                  className="section-modal-btn cancel"
                  onClick={() => setShowEditModal(false)}
                  disabled={saving}
                >
                  لغو
                </button>

                <button
                  type="submit"
                  className="section-modal-btn primary"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm" />
                      در حال ذخیره...
                    </>
                  ) : (
                    <>
                      <i className="isax isax-tick-circle" />
                      ذخیره تغییرات
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================
        DELETE MODAL
    ========================= */}
      {showDeleteModal && (
        <div className="section-modal-backdrop">
          <div
            className="section-modal section-delete-modal"
            role="dialog"
            aria-modal="true"
          >
            <div className="section-modal-header">
              <div className="section-modal-title">
                <div className="section-modal-icon danger">
                  <i className="isax isax-trash" />
                </div>

                <div>
                  <h5>حذف سرفصل</h5>
                  <span>این عملیات قابل بازگشت نیست.</span>
                </div>
              </div>

              <button
                type="button"
                className="section-modal-close"
                onClick={() => setShowDeleteModal(false)}
                disabled={saving}
              >
                <i className="isax isax-close-circle" />
              </button>
            </div>

            <div className="section-delete-body">
              <p>
                آیا از حذف سرفصل
                <strong> «{selectedSection?.Title}» </strong>
                اطمینان دارید؟
              </p>

              <div className="section-delete-warning">
                <i className="isax isax-warning-2" />

                <span>
                  با حذف این سرفصل، تمام درس‌های مربوط به آن نیز حذف خواهند شد.
                </span>
              </div>
            </div>

            <div className="section-modal-footer">
              <button
                type="button"
                className="section-modal-btn cancel"
                onClick={() => setShowDeleteModal(false)}
                disabled={saving}
              >
                لغو
              </button>

              <button
                type="button"
                className="section-modal-btn danger"
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
                    حذف سرفصل
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SectionManager;
