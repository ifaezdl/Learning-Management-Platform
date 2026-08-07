import React, { useEffect, useState, useRef } from "react";
import Breadcrumb from "../../../../core/common/Breadcrumb/breadcrumb";
import ImageWithBasePath from "../../../../core/common/imageWithBasePath";
import ProfileCard from "../../common/profileCard";
import InstructorSidebar from "../../common/instructorSidebar";
import InstructorSettingsLink from "../settings-link/instructorSettingsLink";
import toast from "react-hot-toast";
import userService from "../../../../services/user.service";

interface UserProfile {
  id: number;
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
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

  // تابع برای باز کردن دیالوگ انتخاب فایل
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // تابع آپلود آواتار
  // تابع فشرده‌سازی عکس
  const compressImage = (
    base64: string,
    quality: number = 0.6,
    maxWidth: number = 150,
    maxHeight: number = 150,
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = base64;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // محدود کردن اندازه
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        // تبدیل به JPEG با کیفیت پایین‌تر
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
    });
  };

  // تابع آپلود آواتار اصلاح شده
  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // محدودیت حجم 500KB
    if (file.size > 500 * 1024) {
      toast.error("حجم فایل باید کمتر از ۵۰۰ کیلوبایت باشد");
      return;
    }

    setUploadingAvatar(true);
    try {
      // تبدیل به base64
      const base64 = await convertToBase64(file);

      // فشرده‌سازی عکس
      const compressed = await compressImage(base64, 0.5, 150, 150);

      setEditProfile((prev) => ({
        ...prev,
        avatar: compressed,
      }));

      toast.success("آواتار با موفقیت آپلود شد");
    } catch (error) {
      console.error("خطا در آپلود:", error);
      toast.error("خطا در آپلود آواتار");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // تابع تبدیل فایل به base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // تابع حذف آواتار
  const handleDeleteAvatar = () => {
    setEditProfile((prev) => ({
      ...prev,
      avatar: "",
    }));
    toast.success("آواتار با موفقیت حذف شد");
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    debugger;
    e.preventDefault();
    setIsUpdating(true);

    try {
      const updatedUser = await userService.updateProfile(editProfile);
      if (updatedUser?.user) {
        setProfile(updatedUser.user);
        const existingUser = JSON.parse(localStorage.getItem("user") || "{}");
        const updatedUserData = {
          ...existingUser,
          firstName: updatedUser.user.FirstName,
          lastName: updatedUser.user.LastName,
          email: updatedUser.user.Email,
          mobile: updatedUser.user.Mobile,
          userName: updatedUser.user.UserName,
          avatar: updatedUser.user.Avatar,
        };
        localStorage.setItem("user", JSON.stringify(updatedUserData));

        toast.success("پروفایل با موفقیت به‌روزرسانی شد!");
      } else {
        toast.error(" خطا در به‌روزرسانی پروفایل");
      }
    } catch (err: any) {
      console.error("❌ خطای کامل:", err);
      console.error("❌ پاسخ خطا:", err?.response);
      console.error("❌ داده‌های خطا:", err?.response?.data);
      console.error("❌ وضعیت خطا:", err?.response?.status);

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
            <InstructorSidebar />
            <div className="col-lg-9">
              <div className="mb-3">
                <h5>تنظیمات</h5>
              </div>
              <InstructorSettingsLink />

              <form onSubmit={handleUpdateProfile}>
                <div className="card">
                  <div className="card-body">
                    {/* بخش آواتار */}
                    <div className="profile-upload-group">
                      <div className="d-flex align-items-center">
                        <div className="avatar flex-shrink-0 avatar-xxxl avatar-rounded border me-3 position-relative">
                          <ImageWithBasePath
                            src={
                              editProfile.avatar ||
                              "assets/img/user/user-01.jpg"
                            }
                            alt="آواتار"
                            className="img-fluid"
                          />
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
                                  !editProfile.avatar || uploadingAvatar
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
