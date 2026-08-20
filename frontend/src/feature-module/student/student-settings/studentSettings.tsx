import React, { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import SettingsLinks from "./settingsLinks/settingsLinks";
import StudentSidebar from "../common/studentSidebar";
import ProfileCard from "../common/profileCard";
import userService from "../../../services/user.service";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import { api_base_url } from "../../../environment";
import { useAuth } from "../../../context/AuthContext";

interface UserProfile {
  Id: number;
  FirstName: string;
  LastName: string;
  UserName: string;
  Email: string;
  Mobile: string;
  Sex_Id: number;
  Avatar: string;
  Role_Id: number;
}

const InstructorProfileSettings = () => {
  const { updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [editProfile, setEditProfile] = useState({
    firstName: "",
    lastName: "",
    userName: "",
    email: "",
    mobile: "",
    sexId: 1,
    avatar: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await userService.getProfile();
        setProfile(data);

        if (data) {
          setEditProfile({
            firstName: data.FirstName || "",
            lastName: data.LastName || "",
            userName: data.UserName || "",
            email: data.Email || "",
            mobile: data.Mobile || "",
            sexId: data.Sex_Id || 1,
            avatar: data.Avatar || "",
          });
        }
      } catch (err) {
        console.error("❌ خطا در بارگذاری پروفایل:", err);
        toast.error("خطا در دریافت اطلاعات پروفایل");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // پاکسازی آدرس بلاب موقت هنگام unmount شدن کامپوننت
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // تابع برای باز کردن دیالوگ انتخاب فایل
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (file.size > 500 * 1024) {
      toast.error("حجم فایل باید کمتر از ۵۰۰ کیلوبایت باشد");
      return;
    }

    // نمایش فوری تصویر انتخاب‌شده، پیش از اتمام آپلود
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    setUploadingAvatar(true);

    try {
      const result = await userService.uploadAvatar(file);

      if (result?.user) {
        setProfile(result.user);

        setEditProfile((prev) => ({
          ...prev,
          avatar: result.user.Avatar,
        }));

        const existingUser = JSON.parse(localStorage.getItem("user") || "{}");

        localStorage.setItem(
          "user",
          JSON.stringify({
            ...existingUser,
            avatar: result.user.Avatar,
          }),
        );

        toast.success("آواتار با موفقیت آپلود شد");
      }
    } catch (error: any) {
      console.error("خطا در آپلود آواتار:", error);

      toast.error(error?.response?.data?.message || "خطا در آپلود آواتار");

      // اگر آپلود شکست خورد، پیش‌نمایش موقت را پاک کن
      setPreviewUrl(null);
    } finally {
      setUploadingAvatar(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // آزادسازی حافظه بلاب موقت پس از اتمام آپلود
      URL.revokeObjectURL(localUrl);
      setPreviewUrl((current) => (current === localUrl ? null : current));
    }
  };

  // تابع حذف آواتار

  const handleDeleteAvatar = async () => {
    try {
      setUploadingAvatar(true);

      await userService.deleteAvatar();

      setEditProfile((prev) => ({
        ...prev,
        avatar: "",
      }));

      setPreviewUrl(null);

      // Update localStorage as well
      const existingUser = JSON.parse(localStorage.getItem("user") || "{}");

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...existingUser,
          avatar: "",
        }),
      );

      toast.success("آواتار با موفقیت حذف شد");
    } catch (error: any) {
      console.error("خطا در حذف آواتار:", error);

      toast.error(error?.response?.data?.message || "خطا در حذف آواتار");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const updatedUser = await userService.updateProfile(editProfile);
      if (updatedUser?.user) {
        setProfile(updatedUser.user);

        updateUser({
          id: updatedUser.user.Id,
          firstName: updatedUser.user.FirstName,
          lastName: updatedUser.user.LastName,
          userName: updatedUser.user.UserName,
          email: updatedUser.user.Email,
          mobile: updatedUser.user.Mobile,
          avatar: updatedUser.user.Avatar,
          sexId: updatedUser.user.Sex_Id,
          roleId: updatedUser.user.Role_Id,
        });

        toast.success("پروفایل با موفقیت به‌روزرسانی شد!");
      } else {
        toast.error(" خطا در به‌روزرسانی پروفایل");
      }
    } catch (err: any) {
      console.error(" خطای کامل:", err);
      console.error(" پاسخ خطا:", err?.response);
      console.error(" داده‌های خطا:", err?.response?.data);
      console.error(" وضعیت خطا:", err?.response?.status);

      toast.error(err?.response?.data?.message || "خطا در به‌روزرسانی پروفایل");
    } finally {
      setIsUpdating(false);
    }
  };

  // تابع کمکی برای تغییرات فیلدها
  const handleInputChange = (field: string, value: any) => {
    setEditProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (loading) {
    return (
      <>
        <div className="content mt-5">
          <div className="container">
            <ProfileCard />
            <StudentSidebar />
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">در حال بارگذاری...</span>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="content mt-5">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <StudentSidebar />
            <div className="col-lg-12">
              <div className="mb-3">
                <h5>تنظیمات</h5>
              </div>
              <SettingsLinks />

              <form onSubmit={handleUpdateProfile}>
                <div className="card">
                  <div className="card-body">
                    {/* بخش آواتار */}
                    <div className="profile-upload-group">
                      <div className="d-flex align-items-center">
                        <div className="avatar flex-shrink-0 avatar-xxxl avatar-rounded border me-3 position-relative">
                          {previewUrl || editProfile.avatar ? (
                            // آدرس کامل است (بلاب محلی یا آدرس سرور) - نباید از ImageWithBasePath عبور کند
                            <img
                              src={
                                previewUrl ||
                                `${api_base_url}${editProfile.avatar}`
                              }
                              alt="آواتار"
                              className="img-fluid"
                            />
                          ) : (
                            // مسیر نسبی پیش‌فرض - این یکی باید از ImageWithBasePath عبور کند
                            <ImageWithBasePath
                              src="assets/img/user/user-01.jpg"
                              alt="آواتار"
                              className="img-fluid"
                            />
                          )}
                          {uploadingAvatar && (
                            <div className="position-absolute top-50 start-50 translate-middle bg-dark bg-opacity-50 rounded-circle p-3">
                              <div
                                className="spinner-border text-light"
                                style={{ width: "1.5rem", height: "1.5rem" }}
                              />
                            </div>
                          )}
                        </div>
                        <div className="profile-upload-head">
                          <h6>آواتار شما</h6>
                          <p className="fs-14 mb-0">
                            PNG یا JPG با حداکثر عرض و ارتفاع ۸۰۰ پیکسل
                          </p>
                          <div className="new-employee-field">
                            <div className="d-flex align-items-center mt-2">
                              {/* input مخفی */}
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/jpg,image/png"
                                onChange={handleAvatarUpload}
                                style={{ display: "none" }}
                              />

                              {/* دکمه آپلود */}
                              <button
                                type="button"
                                className="btn bg-gray-100 btn-sm rounded-pill me-2"
                                onClick={handleUploadClick}
                                disabled={uploadingAvatar}
                              >
                                {uploadingAvatar ? "در حال آپلود..." : "آپلود"}
                              </button>

                              {/* دکمه حذف */}
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm rounded-pill"
                                onClick={handleDeleteAvatar}
                                disabled={
                                  (!editProfile.avatar && !previewUrl) ||
                                  uploadingAvatar
                                }
                              >
                                حذف
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* اطلاعات شخصی */}
                    <div>
                      <div className="edit-profile-info mb-3">
                        <h5 className="mb-1 fs-18">اطلاعات شخصی</h5>
                        <p>اطلاعات شخصی خود را ویرایش کنید</p>
                      </div>

                      <div className="row">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">
                              نام <span className="text-danger"> *</span>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              value={editProfile.firstName}
                              onChange={(e) =>
                                handleInputChange("firstName", e.target.value)
                              }
                              required
                            />
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">
                              نام خانوادگی{" "}
                              <span className="text-danger"> *</span>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              value={editProfile.lastName}
                              onChange={(e) =>
                                handleInputChange("lastName", e.target.value)
                              }
                              required
                            />
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">
                              نام کاربری <span className="text-danger"> *</span>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              value={editProfile.userName}
                              onChange={(e) =>
                                handleInputChange("userName", e.target.value)
                              }
                              required
                            />
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">
                              شماره موبایل{" "}
                              <span className="text-danger"> *</span>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              value={editProfile.mobile}
                              onChange={(e) =>
                                handleInputChange("mobile", e.target.value)
                              }
                              required
                            />
                          </div>
                        </div>

                        <div className="col-md-12">
                          <div className="mb-3">
                            <label className="form-label">
                              ایمیل <span className="text-danger"> *</span>
                            </label>
                            <input
                              type="email"
                              className="form-control"
                              value={editProfile.email}
                              onChange={(e) =>
                                handleInputChange("email", e.target.value)
                              }
                              required
                            />
                          </div>
                        </div>

                        <div className="col-md-12">
                          <div className="mb-4">
                            <label className="form-label">
                              جنسیت <span className="text-danger"> *</span>
                            </label>
                            <select
                              className="form-select"
                              value={editProfile.sexId}
                              onChange={(e) =>
                                handleInputChange(
                                  "sexId",
                                  Number(e.target.value),
                                )
                              }
                              required
                            >
                              <option value={5}>مرد</option>
                              <option value={6}>زن</option>
                            </select>
                          </div>
                        </div>

                        <div className="col-md-12">
                          <button
                            className="btn btn-secondary rounded-pill"
                            type="submit"
                            disabled={isUpdating || uploadingAvatar}
                          >
                            {isUpdating ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" />
                                در حال به‌روزرسانی...
                              </>
                            ) : (
                              "به‌روزرسانی پروفایل"
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InstructorProfileSettings;
