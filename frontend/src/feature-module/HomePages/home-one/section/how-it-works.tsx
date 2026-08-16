import React from "react";
import ImageWithBasePath from "../../../../core/common/imageWithBasePath";

const Howitworks = () => {
  return (
    <>
      {/* how it works */}
      <div className="how-it-works-sec-two">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <div className="me-5" data-aos="fade-up">
                <ImageWithBasePath
                  src="assets/img/learning-steps.png"
                  className="img-fluid rounded-5"
                  alt="img"
                />
              </div>
            </div>
            <div className="col-lg-6">
              <div className="how-it-works-content aos" data-aos="fade-up">
                <div className="section-header">
                  <span className="fw-medium text-secondary text-decoration-underline mb-2 d-inline-block">
                    مراحل شروع
                  </span>
                  <h2 className="mb-1">در چهار گام یادگیری خود را آغاز کنید</h2>
                  <p>
                    تنها با چند مرحله ساده می‌توانید در دوره‌های آموزشی ثبت‌نام
                    کنید، به محتوای تخصصی دسترسی داشته باشید و پیشرفت خود را
                    به‌صورت مستمر دنبال کنید.
                  </p>
                </div>

                <div className="d-flex align-items-center works-items">
                  <span className="count">01</span>
                  <div>
                    <h5 className="mb-1">ایجاد حساب کاربری</h5>
                    <p>
                      با ثبت‌نام در سامانه، حساب کاربری خود را ایجاد کنید و با
                      توجه به نقش خود (دانشجو یا مدرس) وارد پنل اختصاصی شوید.
                    </p>
                  </div>
                </div>

                <div className="d-flex align-items-center works-items">
                  <span className="count">02</span>
                  <div>
                    <h5 className="mb-1">جستجو و انتخاب دوره</h5>
                    <p>
                      دوره‌های آموزشی را بر اساس دسته‌بندی، مدرس یا موضوع بررسی
                      کنید و مناسب‌ترین دوره را برای مسیر یادگیری خود انتخاب
                      نمایید.
                    </p>
                  </div>
                </div>

                <div className="d-flex align-items-center works-items">
                  <span className="count">03</span>
                  <div>
                    <h5 className="mb-1">ثبت‌نام و شروع آموزش</h5>
                    <p>
                      پس از ثبت‌نام در دوره، به ویدئوها، فایل‌های آموزشی، جلسات
                      و سایر منابع یادگیری دسترسی خواهید داشت و آموزش خود را
                      آغاز می‌کنید.
                    </p>
                  </div>
                </div>

                <div className="d-flex align-items-center works-items mb-0 pb-0 border-0">
                  <span className="count">04</span>
                  <div>
                    <h5 className="mb-1">پیگیری پیشرفت و دریافت گواهی</h5>
                    <p>
                      روند یادگیری خود را از طریق داشبورد شخصی دنبال کنید،
                      دوره‌ها را تکمیل نمایید و در صورت موفقیت، گواهی پایان دوره
                      را دریافت کنید.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* how it works */}
    </>
  );
};

export default Howitworks;
