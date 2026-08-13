import React, { useState } from "react";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import { Link } from "react-router-dom";
import CountUp from "react-countup";
import toast from "react-hot-toast";
import instructorRequestService from "../../../services/instructor-requests.service";

const BecomeInstructor = () => {
  const [description, setDescription] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await instructorRequestService.create({
        description,
        resume,
      });

      toast.success(response.message);

      setDescription("");
      setResume(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "مشکلی پیش آمد.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    if (file) {
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error("فقط فایل‌های PDF، DOC یا DOCX مجاز هستند.");
        e.target.value = "";
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("حجم فایل نباید بیشتر از ۵ مگابایت باشد.");
        e.target.value = "";
        return;
      }
    }

    setResume(file);
  };

  return (
    <>
      <>
        {/* اشتراک‌گذاری دانش */}
        <div className="share-your-knowledge">
          <div className="container">
            <div className="row">
              <div className="col-lg-7 pe-xl-5">
                <div className="mt-5">
                  <div className="section-header">
                    <span className="fw-medium text-secondary text-decoration-underline mb-2 d-inline-block">
                      اشتراک‌گذاری دانش
                    </span>
                    <h2>
                      دانش خود را به اشتراک بگذارید. آینده را الهام بخشید.
                    </h2>
                    <p>
                      دانش خود را به اشتراک بگذارید، به زبان‌آموزان در سراسر
                      جهان الهام بخشید و در حالی که کاری را که دوست دارید انجام
                      می‌دهید، درآمد کسب کنید. به جامعه‌ای از متخصصان بپیوندید
                      که از طریق محتوای جذاب و قابل دسترس، آموزش را متحول
                      می‌کنند.
                    </p>
                  </div>
                  <div className="row">
                    <div className="col-lg-6">
                      <div className="card">
                        <div className="card-body">
                          <div className="d-flex align-items-center">
                            <div className="me-2">
                              <span className="bg-secondary-transparent d-flex justify-content-center align-items-center p-3 rounded-pill">
                                <ImageWithBasePath
                                  src="./assets/img/icons/instructor-icon1.svg"
                                  alt="img"
                                />
                              </span>
                            </div>
                            <div>
                              <h6 className="mb-1">کار انعطاف‌پذیر</h6>
                              <p className="text-truncate line-clamb-1">
                                با سرعت خودتان تدریس کنید.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="card">
                        <div className="card-body">
                          <div className="d-flex align-items-center">
                            <div className="me-2">
                              <span className="bg-secondary-transparent d-flex justify-content-center align-items-center p-3 rounded-pill">
                                <ImageWithBasePath
                                  src="./assets/img/icons/instructor-icon2.svg"
                                  alt="img"
                                />
                              </span>
                            </div>
                            <div>
                              <h6 className="mb-1">پتانسیل درآمدزایی</h6>
                              <p className="text-truncate line-clamb-1">
                                از تخصص خود درآمدزایی کنید.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="card">
                        <div className="card-body">
                          <div className="d-flex align-items-center">
                            <div className="me-2">
                              <span className="bg-secondary-transparent d-flex justify-content-center align-items-center p-3 rounded-pill">
                                <ImageWithBasePath
                                  src="./assets/img/icons/instructor-icon3.svg"
                                  alt="img"
                                />
                              </span>
                            </div>
                            <div>
                              <h6 className="mb-1">تأثیرگذاری</h6>
                              <p className="text-truncate line-clamb-1">
                                دسترسی و آموزش
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="card">
                        <div className="card-body">
                          <div className="d-flex align-items-center">
                            <div className="me-2">
                              <span className="bg-secondary-transparent d-flex justify-content-center align-items-center p-3 rounded-pill">
                                <ImageWithBasePath
                                  src="./assets/img/icons/instructor-icon4.svg"
                                  alt="img"
                                />
                              </span>
                            </div>
                            <div>
                              <h6 className="mb-1">پشتیبانی</h6>
                              <p className="text-truncate line-clamb-1">
                                دسترسی به پشتیبانی اختصاصی
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-5 mt-5">
                <div className="share-your-knowledge-img d-none d-lg-flex mt-3">
                  <ImageWithBasePath
                    src="assets/img/shapes/shape-3.png"
                    alt="img"
                    className="img-fluid become-instructor-bg-03"
                  />
                  <ImageWithBasePath
                    src="assets/img/become-instructor.png"
                    alt="img"
                    className="img-fluid rounded-4 become-instructor-bg-04 mt-5"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* اشتراک‌گذاری دانش */}
        {/* نحوه عملکرد */}
        <div className="how-it-works-sec bg-light-900">
          <div className="container">
            <div className="section-header">
              <span className="fw-medium text-secondary text-decoration-underline mb-2 d-inline-block">
                فرآیند کاری ما
              </span>
              <h2>نحوه عملکرد</h2>
              <p>تخصص خود را در تنها ۳ مرحله ساده به تأثیرگذاری تبدیل کنید!</p>
            </div>
            <div className="row row-gap-4">
              <div className="col-lg-4">
                <div className="share-knowledge-item-2">
                  <ImageWithBasePath
                    src="./assets/img/icons/how-it-works-1.svg"
                    alt="img"
                  />
                  <h5 className="mt-3 mb-2">درخواست و تأیید</h5>
                  <p className="text-truncate line-clamb-2">
                    درخواست خود را ارسال کنید و برای دسترسی به پلتفرم تأیید شوید
                  </p>
                </div>
              </div>
              <div className="col-lg-4">
                <div className="share-knowledge-item-2">
                  <ImageWithBasePath
                    src="./assets/img/icons/how-it-works-2.svg"
                    alt="img"
                  />
                  <h5 className="mt-3 mb-2">ایجاد و آپلود محتوا</h5>
                  <p className="text-truncate line-clamb-2">
                    دوره‌های خود را شامل ویدئوها، درس‌ها، آزمون‌ها و تکالیف
                    توسعه و آپلود کنید.
                  </p>
                </div>
              </div>
              <div className="col-lg-4">
                <div className="share-knowledge-item-2">
                  <ImageWithBasePath
                    src="./assets/img/icons/how-it-works-3.svg"
                    alt="img"
                  />
                  <h5 className="mt-3 mb-2">تدریس و درآمدزایی</h5>
                  <p className="text-truncate line-clamb-2">
                    به زبان‌آموزان در سراسر جهان دسترسی پیدا کنید، تدریس کنید و
                    در حالی که تأثیر می‌گذارید، درآمد کسب کنید.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* نحوه عملکرد */}
        {/* شمارنده */}
        <div className="counter-sec">
          <div className="container">
            <div className="row row-gap-4">
              <div className="col-xl-3 col-md-6">
                <div className="become-instructor-item-3 mb-0">
                  <div className="d-flex align-items-center">
                    <div className="counter-icon">
                      <ImageWithBasePath
                        src="./assets/img/icons/counter-icon1.svg"
                        alt="img"
                      />
                    </div>
                    <div className="count-content ps-1 pb-2">
                      <h4 className="text-info">
                        <span className="count-digit">
                          <CountUp end={10} />
                        </span>
                        هزار
                      </h4>
                      <p className="fw-medium text-truncate">دوره آنلاین</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-3 col-md-6">
                <div className="become-instructor-item-3 mb-0">
                  <div className="d-flex align-items-center">
                    <div className="counter-icon">
                      <ImageWithBasePath
                        src="./assets/img/icons/counter-icon2.svg"
                        alt="img"
                      />
                    </div>
                    <div className="count-content ps-1 pb-2">
                      <h4 className="text-warning">
                        <span className="count-digit">
                          <CountUp end={200} />
                        </span>
                        +
                      </h4>
                      <p className="fw-medium text-truncate">مدرس متخصص</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-3 col-md-6">
                <div className="become-instructor-item-3 mb-0">
                  <div className="d-flex align-items-center">
                    <div className="counter-icon">
                      <ImageWithBasePath
                        src="./assets/img/icons/counter-icon3.svg"
                        alt="img"
                      />
                    </div>
                    <div className="count-content ps-1 pb-2">
                      <h4 className="text-skyblue">
                        <span className="count-digit">
                          <CountUp end={6} />
                        </span>
                        هزار+
                      </h4>
                      <p className="fw-medium text-truncate">دوره گواهی‌دار</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-3 col-md-6">
                <div className="become-instructor-item-3 mb-0">
                  <div className="d-flex align-items-center">
                    <div className="counter-icon">
                      <ImageWithBasePath
                        src="./assets/img/icons/counter-icon4.svg"
                        alt="img"
                      />
                    </div>
                    <div className="count-content ps-1 pb-2">
                      <h4 className="text-lightgreen">
                        <span className="count-digit">
                          <CountUp end={60} />
                        </span>
                        هزار+
                      </h4>
                      <p className="fw-medium text-truncate">دانشجوی آنلاین</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* شمارنده */}
        {/* ثبت‌نام */}
        <div className="register-sec">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-6">
                <div className="rounded-4 pe-lg-5">
                  <ImageWithBasePath
                    className="img-fluid rounded-5 d-none d-lg-flex"
                    src="assets/img/about-us.png"
                    alt="img"
                  />
                </div>
              </div>
              <div className="col-lg-6">
                <div className="register-section p-4 p-sm-5 p-md-6">
                  {/* Header */}
                  <div className="mb-4">
                    <span className="badge bg-primary-transparent text-primary mb-2">
                      همکاری با منتوریتو
                    </span>

                    <h4 className="mb-2">به جمع مدرسان منتوریتو بپیوندید</h4>

                    <p className="text-muted mb-0">
                      اگر در حوزه تخصصی خود دانش و تجربه ارزشمندی دارید،
                      می‌توانید با پیوستن به جمع مدرسان منتوریتو، دانش خود را با
                      دیگران به اشتراک بگذارید و در مسیر رشد و یادگیری آن‌ها نقش
                      داشته باشید.
                    </p>
                  </div>

                  {/* Information Box */}
                  <div className="bg-light rounded-3 p-3 mb-4">
                    <div className="d-flex align-items-start">
                      <div className="avatar avatar-md bg-primary-transparent rounded-circle me-3 flex-shrink-0">
                        <i className="isax isax-info-circle5 text-primary fs-20" />
                      </div>

                      <div>
                        <h6 className="mb-1">فرآیند بررسی درخواست</h6>
                        <p className="text-muted fs-14 mb-0">
                          پس از ارسال درخواست، اطلاعات و رزومه شما توسط تیم
                          منتوریتو بررسی خواهد شد. در صورت تأیید اولیه، برای
                          ادامه مراحل همکاری با شما تماس گرفته می‌شود.
                        </p>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      {/* Description */}
                      <div className="col-lg-12">
                        <label className="form-label fw-medium">
                          درباره خود و زمینه تخصصی‌تان
                          <span className="text-danger ms-1">*</span>
                        </label>

                        <p className="text-muted fs-13 mb-2">
                          لطفاً درباره سوابق کاری، تخصص، تجربه تدریس و حوزه‌هایی
                          که قصد دارید در آن‌ها آموزش ارائه دهید، توضیح دهید.
                        </p>

                        <textarea
                          className="form-control"
                          rows={6}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="مثلاً: زمینه تخصصی، میزان سابقه کاری، تجربه تدریس، مهارت‌ها و موضوعاتی که قصد آموزش آن‌ها را دارید..."
                        />
                      </div>

                      {/* Resume */}
                      <div className="col-lg-12 mt-4">
                        <label className="form-label fw-medium">
                          رزومه حرفه‌ای
                          <span className="text-danger ms-1">*</span>
                        </label>

                        <div
                          className="border rounded-3 p-4"
                          style={{ backgroundColor: "#fafafa" }}
                        >
                          <div className="d-flex align-items-center">
                            <div className="avatar avatar-lg bg-primary-transparent rounded-3 me-3 flex-shrink-0">
                              <i className="isax isax-document-text5 text-primary fs-24" />
                            </div>

                            <div className="flex-grow-1">
                              <h6 className="mb-1">ارسال رزومه</h6>

                              <p className="text-muted fs-13 mb-2">
                                رزومه خود را شامل سوابق تحصیلی، کاری، مهارت‌ها،
                                گواهینامه‌ها و تجربیات آموزشی بارگذاری کنید.
                              </p>

                              <small className="text-muted">
                                فرمت‌های مجاز: PDF، DOC و DOCX
                              </small>
                            </div>
                          </div>

                          <div className="mt-3">
                            <input
                              type="file"
                              className="form-control"
                              accept=".pdf,.doc,.docx"
                              onChange={handleFileChange}
                            />
                          </div>

                          {resume && (
                            <div className="d-flex align-items-center mt-3 p-2 bg-white border rounded">
                              <i className="isax isax-document-text text-primary fs-18 me-2" />

                              <small className="text-muted">
                                فایل انتخاب‌شده:
                                <span className="text-dark fw-medium ms-1">
                                  {resume.name}
                                </span>
                              </small>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Requirements */}
                      <div className="col-lg-12 mt-4">
                        <div className="d-flex align-items-start">
                          <i className="isax isax-tick-circle5 text-success fs-18 me-2 mt-1" />

                          <p className="text-muted fs-13 mb-0">
                            لطفاً اطمینان حاصل کنید اطلاعات واردشده دقیق و رزومه
                            ارسال‌شده به‌روز باشد. بررسی درخواست‌ها بر اساس
                            تخصص، تجربه و کیفیت سوابق آموزشی و حرفه‌ای انجام
                            می‌شود.
                          </p>
                        </div>
                      </div>

                      {/* Submit */}
                      <div className="col-lg-12 mt-4">
                        <button
                          type="submit"
                          className="btn btn-primary w-100"
                          disabled={loading}
                        >
                          {loading ? (
                            "در حال بررسی و ارسال درخواست..."
                          ) : (
                            <>
                              ارسال درخواست همکاری
                              <i className="isax isax-arrow-left-2 ms-2" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            {/* ... rest unchanged ... */}
          </div>
        </div>
        {/* ثبت‌نام */}
      </>
    </>
  );
};

export default BecomeInstructor;
