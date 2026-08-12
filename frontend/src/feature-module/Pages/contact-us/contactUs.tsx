import React from "react";
import { Link } from "react-router-dom";
import { all_routes } from "../../router/all_routes";

const Contact = () => {
  return (
    <section className="contact-sec mt-5">
      <div className="container">
        {/* Page Header */}
        <div className="section-header text-center mb-5">
          <span className="fw-medium text-secondary text-decoration-underline mb-2 d-inline-block">
            ارتباط با ما
          </span>

          <h2>با Mentorito در ارتباط باشید</h2>

          <p>
            اگر درباره دوره‌ها، ثبت‌نام، پرداخت یا حساب کاربری خود سوالی دارید،
            ما آماده پاسخگویی و راهنمایی شما هستیم.
          </p>
        </div>

        {/* Contact Information */}
        <div className="contact-info mb-5">
          <div className="row row-gap-3">
            {/* Address */}
            <div className="col-lg-3 col-md-6">
              <div className="card card-body border h-100 p-sm-4">
                <div className="d-flex align-items-center">
                  <div className="contact-icon">
                    <span className="bg-primary fs-24 rounded-3 d-flex justify-content-center align-items-center">
                      <i className="isax isax-location5 text-white" />
                    </span>
                  </div>

                  <div className="ps-3">
                    <h5 className="mb-1">آدرس</h5>

                    <address className="mb-0">
                      تهران، خیابان ولیعصر، بالاتر از میدان ونک، خیابان عطار،
                      پلاک ۲۴
                    </address>
                  </div>
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="col-lg-3 col-md-6">
              <div className="card card-body border h-100 p-sm-4">
                <div className="d-flex align-items-center">
                  <div className="contact-icon">
                    <span className="bg-primary fs-24 rounded-3 d-flex justify-content-center align-items-center">
                      <i className="isax isax-headphone5 text-white" />
                    </span>
                  </div>

                  <div className="ps-3">
                    <h5 className="mb-1">تلفن پشتیبانی</h5>

                    <p className="mb-0">
                      <a
                        href="tel:+982188772460"
                        dir="ltr"
                        className="text-gray-5 text-primary-hover text-decoration-underline"
                      >
                        ۰۲۱-۸۸۷۷-۲۴۶۰
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="col-lg-3 col-md-6">
              <div className="card card-body border h-100 p-sm-4">
                <div className="d-flex align-items-center">
                  <div className="contact-icon">
                    <span className="bg-primary fs-24 rounded-3 d-flex justify-content-center align-items-center">
                      <i className="isax isax-message5 text-white" />
                    </span>
                  </div>

                  <div className="ps-3">
                    <h5 className="mb-1">ایمیل</h5>

                    <p className="mb-0">
                      <a
                        href="mailto:info@mentorito.example"
                        dir="ltr"
                        className="text-gray-5 text-primary-hover text-decoration-underline"
                      >
                        info@mentorito.example
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Working Hours */}
            <div className="col-lg-3 col-md-6">
              <div className="card card-body border h-100 p-sm-4">
                <div className="d-flex align-items-center">
                  <div className="contact-icon">
                    <span className="bg-primary fs-24 rounded-3 d-flex justify-content-center align-items-center">
                      <i className="isax isax-clock5 text-white" />
                    </span>
                  </div>

                  <div className="ps-3">
                    <h5 className="mb-1">ساعات پاسخگویی</h5>

                    <p className="mb-0">
                      شنبه تا چهارشنبه
                      <br />
                      ۹:۰۰ تا ۱۷:۰۰
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-light border rounded-4 p-4 p-sm-5 p-md-6 mb-5">
          <div className="row align-items-center">
            <div className="col-lg-5 mb-4 mb-lg-0">
              <div className="contact-details">
                <div className="section-header mb-0">
                  <span className="fw-medium text-secondary text-decoration-underline mb-2 d-inline-block">
                    پشتیبانی Mentorito
                  </span>

                  <h2>سوال یا پیشنهادی دارید؟</h2>

                  <p>
                    اگر سوالی درباره دوره‌ها، ثبت‌نام، پرداخت یا حساب کاربری خود
                    دارید، پیام خود را برای ما ارسال کنید. تیم پشتیبانی
                    Mentorito در اولین فرصت درخواست شما را بررسی خواهد کرد.
                  </p>

                  <div className="mt-4">
                    <div className="d-flex align-items-start mb-3">
                      <div className="me-3">
                        <span className="avatar avatar-md bg-primary rounded-circle d-flex align-items-center justify-content-center">
                          <i className="isax isax-message-question5 text-white" />
                        </span>
                      </div>

                      <div>
                        <h6 className="mb-1">پاسخگویی به سوالات</h6>
                        <p className="mb-0 text-muted">
                          پاسخ به سوالات مربوط به دوره‌ها و حساب کاربری
                        </p>
                      </div>
                    </div>

                    <div className="d-flex align-items-start">
                      <div className="me-3">
                        <span className="avatar avatar-md bg-secondary rounded-circle d-flex align-items-center justify-content-center">
                          <i className="isax isax-call text-white" />
                        </span>
                      </div>

                      <div>
                        <h6 className="mb-1">پشتیبانی سریع</h6>
                        <p className="mb-0 text-muted">
                          ارتباط با تیم پشتیبانی در ساعات کاری
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="col-lg-7">
              <div className="card mb-0 shadow-sm">
                <div className="card-body p-4 p-sm-5">
                  <h4 className="mb-4">ارسال پیام</h4>

                  <form>
                    <div className="row">
                      {/* Name */}
                      <div className="col-sm-6">
                        <div className="mb-4">
                          <label className="form-label">
                            نام و نام خانوادگی
                            <span className="ms-1 text-danger">*</span>
                          </label>

                          <input
                            type="text"
                            className="form-control form-control-lg"
                            placeholder="نام و نام خانوادگی"
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div className="col-sm-6">
                        <div className="mb-4">
                          <label className="form-label">
                            آدرس ایمیل
                            <span className="ms-1 text-danger">*</span>
                          </label>

                          <input
                            type="email"
                            className="form-control form-control-lg"
                            placeholder="example@email.com"
                            dir="ltr"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      {/* Phone */}
                      <div className="col-sm-6">
                        <div className="mb-4">
                          <label className="form-label">شماره تماس</label>

                          <input
                            type="tel"
                            className="form-control form-control-lg"
                            placeholder="۰۹۱۲۱۲۳۴۵۶۷"
                            dir="ltr"
                          />
                        </div>
                      </div>

                      {/* Subject */}
                      <div className="col-sm-6">
                        <div className="mb-4">
                          <label className="form-label">موضوع</label>

                          <select className="form-select form-select-lg">
                            <option value="">موضوع پیام را انتخاب کنید</option>
                            <option value="course">سوال درباره دوره</option>
                            <option value="account">مشکل حساب کاربری</option>
                            <option value="payment">مشکل پرداخت</option>
                            <option value="technical">مشکل فنی</option>
                            <option value="suggestion">پیشنهاد و انتقاد</option>
                            <option value="other">سایر موارد</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Message */}
                    <div className="mb-4">
                      <label className="form-label">
                        پیام شما
                        <span className="ms-1 text-danger">*</span>
                      </label>

                      <textarea
                        className="form-control form-control-lg"
                        rows={5}
                        placeholder="پیام خود را وارد کنید..."
                      />
                    </div>

                    <div className="d-grid">
                      <button
                        type="submit"
                        className="btn btn-secondary btn-lg"
                      >
                        <i className="isax isax-send-2 me-2" />
                        ارسال پیام
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Student Support */}
        <div className="section-header text-center mb-4">
          <span className="fw-medium text-secondary text-decoration-underline mb-2 d-inline-block">
            مرکز پشتیبانی
          </span>

          <h2>در چه زمینه‌ای به کمک نیاز دارید؟</h2>

          <p>
            موضوع مورد نظر خود را انتخاب کنید تا سریع‌تر به بخش مربوطه دسترسی
            پیدا کنید.
          </p>
        </div>

        <div className="row row-gap-3 mb-5">
          {/* Courses */}
          <div className="col-lg-4 col-md-6">
            <div className="card border h-100">
              <div className="card-body p-4 text-center">
                <div className="p-3 rounded-circle bg-primary-transparent d-inline-flex mb-3">
                  <i className="isax isax-book-1 fs-30 text-primary" />
                </div>

                <h5>دوره‌ها و آموزش</h5>

                <p className="text-muted mb-3">
                  درباره ثبت‌نام، دسترسی به دوره‌ها و محتوای آموزشی سوال دارید؟
                </p>

                <Link
                  to={all_routes.courseGrid}
                  className="text-primary text-decoration-underline"
                >
                  مشاهده دوره‌ها
                  <i className="isax isax-arrow-left-2 ms-2" />
                </Link>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="col-lg-4 col-md-6">
            <div className="card border h-100">
              <div className="card-body p-4 text-center">
                <div className="p-3 rounded-circle bg-skyblue-transparent d-inline-flex mb-3">
                  <i className="isax isax-award fs-30 text-info" />
                </div>

                <h5>گواهینامه دوره‌ها</h5>

                <p className="text-muted mb-3">
                  درباره دریافت گواهینامه، شرایط صدور مدرک یا دانلود آن سوال
                  دارید؟
                </p>

                <Link
                  to="/pages/about-us#certificate-help"
                  className="text-primary text-decoration-underline"
                >
                  مشاهده راهنما
                  <i className="isax isax-arrow-left-2 ms-2" />
                </Link>
              </div>
            </div>
          </div>

          {/* Account */}
          <div className="col-lg-4 col-md-6">
            <div className="card border h-100">
              <div className="card-body p-4 text-center">
                <div className="p-3 rounded-circle bg-skyblue-transparent d-inline-flex mb-3">
                  <i className="isax isax-user fs-30 text-info" />
                </div>

                <h5>حساب کاربری</h5>

                <p className="text-muted mb-3">
                  برای ورود، پروفایل یا مدیریت حساب خود به کمک نیاز دارید؟
                </p>

                <Link
                  to="/pages/about-us#account-help"
                  className="text-primary text-decoration-underline"
                >
                  مشاهده راهنما
                  <i className="isax isax-arrow-left-2 ms-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="section-header text-center mb-4">
          <span className="fw-medium text-secondary text-decoration-underline mb-2 d-inline-block">
            موقعیت ما
          </span>

          <h2>ما را پیدا کنید</h2>

          <p>
            دفتر Mentorito در تهران، خیابان ولیعصر، بالاتر از میدان ونک قرار
            دارد.
          </p>
        </div>

        <div className="contact-map rounded-4 overflow-hidden mb-5">
          <iframe
            src="https://www.google.com/maps?q=Vanak%20Square%2C%20Tehran%2C%20Iran&output=embed"
            width="100%"
            height="450"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="موقعیت دفتر Mentorito در تهران"
          />
        </div>

        {/* FAQ CTA */}
        <div className="bg-primary rounded-4 p-4 p-sm-5 text-center">
          <div className="mb-3">
            <i className="isax isax-message-question5 text-white fs-40" />
          </div>

          <h3 className="text-white">پاسخ سوال خود را پیدا نکردید؟</h3>

          <p className="text-white mb-4">
            سوالات متداول را بررسی کنید؛ شاید پاسخ سوال شما از قبل در مرکز
            راهنمای Mentorito قرار گرفته باشد.
          </p>

          <Link to="/pages/about-us#faq" className="btn btn-light">
            مشاهده سوالات متداول
            <i className="isax isax-arrow-left-2 ms-2" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Contact;
