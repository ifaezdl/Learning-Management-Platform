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

            <h2>مهارت‌هایی را یاد بگیرید که مسیر شغلی شما را متحول می‌کنند</h2>

            <p>
              یک دوره آموزشی مناسب، با راهنمایی یک مربی متخصص، می‌تواند دانش
              ارزشمند و مهارت‌های عملی مورد نیاز شما را فراهم کند.
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
                    ما باور داریم که آموزش باکیفیت باید برای همه در دسترس باشد.
                    دوره‌های آموزشی ما با هدف فراهم کردن تجربه‌ای مناسب و
                    مقرون‌به‌صرفه برای یادگیری طراحی شده‌اند.
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
                    با ثبت‌نام در دوره‌های ما، فقط برای یک تجربه آموزشی موقت
                    ثبت‌نام نمی‌کنید؛ بلکه دسترسی شما به محتوای دوره برای مدت
                    طولانی در اختیار شما خواهد بود.
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
                    مدرسان ما از متخصصان باتجربه‌ای هستند که سال‌ها در حوزه‌های
                    تخصصی خود فعالیت کرده‌اند و دانش و تجربه عملی خود را در
                    اختیار شما قرار می‌دهند.
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
