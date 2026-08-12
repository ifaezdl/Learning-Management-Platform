import React from "react";
import ImageWithBasePath from "../../../../core/common/imageWithBasePath";

const Benefits = () => {
  return (
    <>
      {/* benefits */}
      <section className="benefit-section">
        <div className="container">
          <div className="section-header text-center">
            <span className="fw-medium text-secondary text-decoration-underline mb-2 d-inline-block">
              مزایای ما
            </span>
            <h2>مهارت‌های خود را برای پیشرفت در مسیر شغلی تقویت کنید</h2>
            <p>
              انتخاب دوره مناسب با راهنمایی یک مربی متخصص می‌تواند بینش‌های
              ارزشمند و مهارت‌های عملی را در اختیار شما قرار دهد.
            </p>
          </div>

          <div className="row">
            <div className="col-lg-4 col-md-6">
              <div className="card shadow-sm">
                <div className="card-body p-4">
                  <div className="position-absolute top-0 end-0 mt-n3 me-n4">
                    <ImageWithBasePath
                      src="./assets/img/shapes/bg-1.png"
                      alt="img"
                    />
                  </div>

                  <div className="p-4 rounded-pill bg-primary-transparent d-inline-flex">
                    <i className="isax isax-book-1 fs-24" />
                  </div>

                  <h5 className="mt-3 mb-1">یادگیری انعطاف‌پذیر</h5>
                  <p>
                    ما معتقدیم آموزش باکیفیت باید برای همه در دسترس باشد.
                    مدل‌های قیمت‌گذاری ما به گونه‌ای طراحی شده‌اند که امکان
                    دسترسی آسان‌تر به آموزش را فراهم کنند.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="card shadow-sm">
                <div className="card-body p-4">
                  <div className="position-absolute top-0 end-0 mt-n3 me-n4">
                    <ImageWithBasePath
                      src="assets/img/shapes/bg-2.png"
                      alt="img"
                    />
                  </div>

                  <div className="p-4 rounded-pill bg-secondary-transparent d-inline-flex">
                    <i className="isax isax-bookmark5 fs-24" />
                  </div>

                  <h5 className="mt-3 mb-1">دسترسی مادام‌العمر</h5>
                  <p>
                    وقتی در دوره‌های ما ثبت‌نام می‌کنید، فقط برای یک تجربه
                    آموزشی موقت ثبت‌نام نکرده‌اید؛ بلکه به محتوای آموزشی خود
                    برای مدت طولانی دسترسی خواهید داشت.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="card shadow-sm">
                <div className="card-body p-4">
                  <div className="position-absolute top-0 end-0 mt-n3 me-n4">
                    <ImageWithBasePath
                      src="assets/img/shapes/bg-3.png"
                      alt="img"
                    />
                  </div>

                  <div className="p-4 rounded-pill bg-skyblue-transparent d-inline-flex">
                    <i className="isax isax-chart-26 fs-24" />
                  </div>

                  <h5 className="mt-3 mb-1">آموزش توسط متخصصان</h5>
                  <p>
                    مدرسین ما متخصصانی باتجربه هستند که سال‌ها در حوزه تخصصی خود
                    فعالیت کرده‌اند و دانش و تجربه ارزشمند خود را در اختیار شما
                    قرار می‌دهند.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* benefits */}
    </>
  );
};

export default Benefits;
