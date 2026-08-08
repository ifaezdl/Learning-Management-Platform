import React from "react";
import ImageWithBasePath from "../../../../core/common/imageWithBasePath";

const AboutSection = () => {
  return (
    <>
      {/* about */}
      <section className="about-section-two pb-0 mt-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <div className="p-3 p-sm-4 position-relative">
                <div className="position-absolute top-0 start-0 z-n1">
                  <ImageWithBasePath
                    src="assets/img/shapes/shape-1.svg"
                    alt="img"
                  />
                </div>
                <div className="position-absolute bottom-0 end-0 z-n1">
                  <ImageWithBasePath
                    src="assets/img/shapes/shape-2.svg"
                    alt="img"
                  />
                </div>
                <div className="position-absolute bottom-0 start-0 mb-md-5 ms-md-n5">
                  <ImageWithBasePath
                    src="assets/img/icons/icon-1.svg"
                    alt="img"
                  />
                </div>
                <ImageWithBasePath
                  className="img-fluid img-radius"
                  src="./assets/img/about-us.png"
                  alt="img"
                  width={500}
                />
              </div>
            </div>
            <div className="col-lg-6">
              <div className="ps-0 ps-lg-2 pt-4 pt-lg-0 ps-xl-5">
                <div className="section-header">
                  <span className="fw-medium text-secondary text-decoration-underline mb-2 d-inline-block">
                    درباره ما
                  </span>
                  <h2>توانمندسازی یادگیری، الهام‌بخشی به رشد</h2>
                  <p>
                    در Mentorito ما با بهره‌گیری از دوره‌های تعاملی و محتوای
                    ارائه‌شده توسط متخصصان، آموزش را برای همگان در دسترس
                    می‌سازیم. در هر زمان و هر مکان بیاموزید و به‌سادگی به اهداف
                    خود دست یابید.
                  </p>
                </div>
                <div className="d-flex align-items-center about-us-banner">
                  <div>
                    <span className="bg-primary-transparent rounded-3 p-2 about-icon d-flex justify-content-center align-items-center">
                      <i className="isax isax-book-1 fs-24" />
                    </span>
                  </div>
                  <div className="ps-3">
                    <h6 className="mb-2">از هر کجا که هستید، یاد بگیرید</h6>
                    <p>
                      یادگیری از هر مکان به جنبه‌ای تحول‌آفرین در آموزش مدرن
                      تبدیل شده و به افراد امکان می‌دهد...
                    </p>
                  </div>
                </div>
                <div className="d-flex align-items-center about-us-banner">
                  <div>
                    <span className="bg-secondary-transparent rounded-3 p-2 about-icon d-flex justify-content-center align-items-center">
                      <i className="isax isax-bookmark5 fs-24" />
                    </span>
                  </div>
                  <div className="ps-3">
                    <h6 className="mb-2">مربیان متخصص</h6>
                    <p>
                      مربیان خبره در هر حوزه‌ای سرمایه‌هایی ارزشمند محسوب
                      می‌شوند و راهنمایی‌ها و دانشِ برخاسته از تجربه را ارائه
                      می‌دهند.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* about */}
    </>
  );
};

export default AboutSection;
