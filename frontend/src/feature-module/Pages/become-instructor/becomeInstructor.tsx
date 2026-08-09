import React, { useState } from "react";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import { Link } from "react-router-dom";
import CountUp from "react-countup";
import toast from "react-hot-toast";
import instructorRequestService from "../../../services/instructor-requests.service";

const BecomeInstructor = () => {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    debugger;
    e.preventDefault();
    setLoading(true);

    try {
      const response = await instructorRequestService.create({
        description,
      });

      toast.success(response.message);

      setDescription("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "مشکلی پیش آمد.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <>
        {/* اشتراک‌گذاری دانش */}
        <div className="share-your-knowledge">
          <div className="container">
            <div className="row">
              <div className="col-lg-7 pe-xl-5">
                <div className="share-knowledge-content">
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
              <div className="col-lg-5">
                <div className="share-your-knowledge-img d-none d-lg-flex">
                  <ImageWithBasePath
                    src="assets/img/shapes/shape-4.png"
                    alt="img"
                    className="img-fluid become-instructor-bg-02"
                  />
                  <ImageWithBasePath
                    src="assets/img/shapes/shape-5.png"
                    alt="img"
                    className="img-fluid become-instructor-bg-01"
                  />
                  <ImageWithBasePath
                    src="assets/img/shapes/shape-3.png"
                    alt="img"
                    className="img-fluid become-instructor-bg-03"
                  />
                  <ImageWithBasePath
                    src="assets/img/feature/feature-5.jpg"
                    alt="img"
                    className="img-fluid rounded-4 become-instructor-bg-04"
                  />
                  <ImageWithBasePath
                    src="assets/img/feature/feature-6.jpg"
                    alt="img"
                    className="img-fluid rounded-4 become-instructor-bg-05"
                  />
                  <ImageWithBasePath
                    src="assets/img/shapes/shape-7.svg"
                    alt="img"
                    className="img-fluid become-instructor-bg-06"
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
                    src="assets/img/feature/feature-4.jpg"
                    alt="img"
                  />
                </div>
              </div>
              <div className="col-lg-6">
                <div className="register-section p-4 p-sm-5 p-md-6">
                  <h5 className="mb-2">ثبت‌نام</h5>
                  <p>زمان آن رسیده که در منتوریتو مدرس شوید</p>
                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-lg-12">
                        <textarea
                          className="form-control"
                          rows={5}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="به ما بگویید چرا می‌خواهید مدرس شوید..."
                        />
                      </div>
                      <div className="col-lg-12">
                        <button
                          type="submit"
                          className="btn btn-primary mt-2"
                          disabled={loading}
                        >
                          {loading ? "در حال ارسال..." : "ارسال درخواست"}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            <div className="become-an-instructor rounded-2 bg-primary position-relative mt-5 p-5">
              <ImageWithBasePath
                src="./assets/img/shapes/instructor-bg-1.png"
                alt="img"
                className="instructor-bg-1"
              />
              <ImageWithBasePath
                src="./assets/img/shapes/instructor-bg-2.png"
                alt="img"
                className="instructor-bg-2"
              />
              <div className="row align-items-center">
                <div className="col-lg-8">
                  <h3 className="text-white mb-2 mblg-3">مدرس شوید</h3>
                  <p className="text-light">
                    تخصص خود را به دوره‌های تأثیرگذار تبدیل کنید و به
                    زبان‌آموزان در سراسر جهان الهام بخشید. به جامعه مدرسان ما
                    بپیوندید و امروز سفر خود را آغاز کنید!
                  </p>
                </div>
                <div className="col-lg-4 d-flex justify-content-lg-end justify-content-center">
                  <Link
                    to="#"
                    className="btn btn-secondary btn-lg mt-3 mt-lg-0"
                  >
                    امروز تدریس را شروع کنید
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* ثبت‌نام */}
      </>
    </>
  );
};

export default BecomeInstructor;
