import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import courseService, { LessonFile } from "../../../../services/course.service";
import uploadService from "../../../../services/upload.service";
import "./lessonfile-manager.scss";
interface LessonFileManagerProps {
  lessonId: number;
}

const formatFileSize = (bytes: number): string => {
  return `${(bytes / 1024 / 1024).toFixed(2)}MB`;
};

const getFileIcon = (ext?: string): string => {
  switch ((ext || "").toLowerCase()) {
    case "pdf":
      return "fa-file-pdf";
    case "zip":
    case "rar":
      return "fa-file-archive";
    case "doc":
    case "docx":
      return "fa-file-word";
    case "ppt":
    case "pptx":
      return "fa-file-powerpoint";
    case "xls":
    case "xlsx":
      return "fa-file-excel";
    case "jpg":
    case "jpeg":
    case "png":
      return "fa-file-image";
    default:
      return "fa-file";
  }
};

const LessonFileManager: React.FC<LessonFileManagerProps> = ({ lessonId }) => {
  const getApiUrl = () => "http://localhost:3001";
  const [files, setFiles] = useState<LessonFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<LessonFile | null>(null);

  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fileSource, setFileSource] = useState<"upload" | "link">("upload");
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(
    null,
  );
  const [fileExtension, setFileExtension] = useState("");
  const [fileSize, setFileSize] = useState(0);
  useEffect(() => {
    if (showAddModal || showDeleteModal) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [showAddModal, showDeleteModal]);
  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await courseService.getLessonFiles(lessonId);
      setFiles(data);
    } catch {
      // Silent fail for files
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const resetForm = () => {
    setFileName("");
    setFileUrl("");
    setSelectedUploadFile(null);
    setFileExtension("");
    setFileSize(0);
    setFileSource("upload");
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  const handleSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedUploadFile(file);
    setFileExtension(file.name.split(".").pop() || "");
    setFileSize(file.size);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fileName.trim()) {
      toast.error("عنوان فایل را وارد کنید");
      return;
    }

    if (fileSource === "upload" && !selectedUploadFile) {
      toast.error("یک فایل انتخاب کنید");
      return;
    }

    if (fileSource === "link" && !fileUrl.trim()) {
      toast.error("لینک فایل را وارد کنید");
      return;
    }

    let finalUrl = fileUrl;
    let finalSize = 0;
    let finalExtension = "";

    try {
      setSaving(true);

      if (fileSource === "upload" && selectedUploadFile) {
        setUploading(true);
        const upload = await uploadService.uploadLessonFile(selectedUploadFile);
        finalUrl = upload.path;
        finalSize = selectedUploadFile.size;
        finalExtension = selectedUploadFile.name.split(".").pop() || "";
      }

      await courseService.createLessonFile(lessonId, {
        fileName,
        fileUrl: finalUrl,
        fileType: fileSource === "upload",
        fileSize: finalSize,
        fileExtension: finalExtension,
      });

      toast.success("فایل با موفقیت اضافه شد");
      closeAddModal();
      fetchFiles();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string | string[] } } })
          ?.response?.data?.message || "خطا در افزودن فایل";
      toast.error(Array.isArray(message) ? message[0] : message);
    } finally {
      setUploading(false);
      setSaving(false);
    }
  };

  const openDeleteModal = (file: LessonFile) => {
    setSelectedFile(file);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedFile(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedFile) return;

    try {
      setSaving(true);
      await courseService.deleteLessonFile(selectedFile.Id);
      toast.success("فایل حذف شد");
      closeDeleteModal();
      fetchFiles();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string | string[] } } })
          ?.response?.data?.message || "خطا در حذف فایل";
      toast.error(Array.isArray(message) ? message[0] : message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="lesson-files-manager">
        <div className="lesson-files-header">
          <div className="lesson-files-title">
            <div className="lesson-files-icon">
              <i className="fas fa-paperclip" />
            </div>

            <div>
              <h6>فایل‌های آموزشی</h6>
              <span>
                {files.length > 0
                  ? `${files.length} فایل آموزشی`
                  : "فایل‌های مرتبط با این درس"}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="lesson-file-add-btn"
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
          >
            <i className="fas fa-plus" />
            افزودن فایل
          </button>
        </div>

        {loading ? (
          <div className="lesson-files-loading">
            <span className="spinner-border spinner-border-sm" />
            <span>در حال بارگذاری فایل‌ها...</span>
          </div>
        ) : files.length === 0 ? (
          <div className="lesson-files-empty">
            <div className="lesson-files-empty-icon">
              <i className="fas fa-folder-open" />
            </div>

            <div>
              <h6>هنوز فایلی اضافه نشده است</h6>
              <p>
                می‌توانید جزوه، PDF، فایل ارائه یا سایر فایل‌های آموزشی این درس
                را اضافه کنید.
              </p>
            </div>
          </div>
        ) : (
          <div className="lesson-file-list">
            {files.map((file) => (
              <div className="lesson-file-item" key={file.Id}>
                <div className="lesson-file-info">
                  <div className="lesson-file-type">
                    <i className={`fas ${getFileIcon(file.FileExtension)}`} />
                  </div>

                  <div className="lesson-file-details">
                    <a
                      href={
                        file.FileType
                          ? `${getApiUrl()}${file.FileUrl}`
                          : file.FileUrl
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="lesson-file-name"
                      title={file.FileName}
                    >
                      {file.FileName}
                    </a>

                    <div className="lesson-file-meta">
                      {file.FileExtension && (
                        <span>{file.FileExtension.toUpperCase()}</span>
                      )}

                      <span className="lesson-file-meta-separator">•</span>

                      <span>{formatFileSize(file.FileSize)}</span>

                      <span className="lesson-file-meta-separator">•</span>

                      <span>
                        {file.FileType ? "فایل آپلود شده" : "لینک خارجی"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="lesson-file-actions">
                  <a
                    href={
                      file.FileType
                        ? `${getApiUrl()}${file.FileUrl}`
                        : file.FileUrl
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="lesson-file-action view"
                    title="مشاهده فایل"
                  >
                    <i className="fas fa-external-link-alt" />
                  </a>

                  <button
                    type="button"
                    className="lesson-file-action delete"
                    aria-label={`حذف ${file.FileName}`}
                    title="حذف فایل"
                    onClick={() => openDeleteModal(file)}
                  >
                    <i className="fas fa-trash" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal &&
        createPortal(
          <div
            className="lesson-file-manager-modal"
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content lesson-file-modal">
                <div className="modal-header">
                  <h5>افزودن فایل آموزشی</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={closeAddModal}
                  ></button>
                </div>

                <form onSubmit={handleAdd}>
                  <div className="modal-body">
                    <div className="row">
                      <div className="col-md-12">
                        <div className="input-block">
                          <label>
                            <span className="text-danger"> * </span>
                            عنوان فایل
                          </label>
                          <input
                            className="form-control"
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                            placeholder="مثال: جزوه جلسه اول"
                          />
                        </div>
                      </div>

                      <div className="col-md-12">
                        <div className="input-block">
                          <label>روش افزودن</label>
                          <select
                            className="form-control"
                            value={fileSource}
                            onChange={(e) =>
                              setFileSource(e.target.value as "upload" | "link")
                            }
                          >
                            <option value="upload">آپلود فایل</option>
                            <option value="link">لینک فایل</option>
                          </select>
                        </div>
                      </div>

                      {fileSource === "upload" && (
                        <div className="col-md-12">
                          <div className="input-block">
                            <label>انتخاب فایل</label>
                            <input
                              type="file"
                              className="form-control"
                              onChange={handleSelectFile}
                            />
                          </div>
                        </div>
                      )}

                      {fileSource === "link" && (
                        <div className="col-md-12">
                          <div className="input-block">
                            <label>لینک فایل</label>
                            <input
                              className="form-control"
                              value={fileUrl}
                              onChange={(e) => setFileUrl(e.target.value)}
                              placeholder="https://..."
                            />
                          </div>
                        </div>
                      )}

                      {selectedUploadFile && (
                        <div className="col-md-12">
                          <div className="lesson-file-selected">
                            <div className="lesson-file-selected-icon">
                              <i
                                className={`fas ${getFileIcon(fileExtension)}`}
                              />
                            </div>

                            <div className="lesson-file-selected-details">
                              <strong title={selectedUploadFile.name}>
                                {selectedUploadFile.name}
                              </strong>

                              <span>
                                {fileExtension.toUpperCase()} &nbsp;•&nbsp;{" "}
                                {formatFileSize(fileSize)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-light"
                      onClick={closeAddModal}
                    >
                      انصراف
                    </button>
                    <button
                      className="btn btn-primary"
                      disabled={saving}
                      type="submit"
                    >
                      {saving && (
                        <span className="spinner-border spinner-border-sm me-2"></span>
                      )}
                      {uploading ? "در حال آپلود..." : "ثبت فایل"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {showDeleteModal &&
        selectedFile &&
        createPortal(
          <div
            className="lesson-file-manager-modal"
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content lesson-file-modal">
                <div className="modal-header">
                  <h5>حذف فایل</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={closeDeleteModal}
                  ></button>
                </div>

                <div className="modal-body">
                  <div className="lesson-file-delete-message">
                    آیا از حذف فایل <strong>«{selectedFile.FileName}»</strong>{" "}
                    مطمئن هستید؟
                    <br />
                    این عملیات قابل بازگشت نیست.
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={closeDeleteModal}
                  >
                    انصراف
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    disabled={saving}
                    onClick={handleDeleteConfirm}
                  >
                    {saving && (
                      <span className="spinner-border spinner-border-sm me-2"></span>
                    )}
                    حذف فایل
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export default LessonFileManager;
