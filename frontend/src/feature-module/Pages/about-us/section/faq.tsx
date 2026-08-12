import React from "react";
import { Link } from "react-router-dom";
import ImageWithBasePath from "../../../../core/common/imageWithBasePath";
import { useEffect } from "react";
const Faq = () => {
  useEffect(() => {
    if (window.location.hash === "#faq") {
      const element = document.getElementById("faq");

      if (element) {
        setTimeout(() => {
          element.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 100);
      }
    }
    const hash = window.location.hash;
    if (hash === "#certificate-help") {
      const faqElement = document.getElementById("certificate-help");
      const collapseElement = document.getElementById(
        "collapseCertificateHelp",
      );

      if (faqElement && collapseElement) {
        setTimeout(() => {
          faqElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });

          collapseElement.classList.add("show");

          const button = faqElement.querySelector(".accordion-button");

          if (button) {
            button.classList.remove("collapsed");
            button.setAttribute("aria-expanded", "true");
          }
        }, 300);
      }
    }
    if (hash === "#account-help") {
      const faqElement = document.getElementById("account-help");
      const collapseElement = document.getElementById("collapseAccountHelp");

      if (faqElement && collapseElement) {
        setTimeout(() => {
          faqElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });

          collapseElement.classList.add("show");

          const button = faqElement.querySelector(".accordion-button");

          if (button) {
            button.classList.remove("collapsed");
            button.setAttribute("aria-expanded", "true");
          }
        }, 300);
      }
    }
  }, []);

  return (
    <>
      {/* faq */}
      <section className="faq-section" id="faq">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-5 pe-md-5">
              <div className="position-relative">
                <ImageWithBasePath
                  className="img-fluid rounded-4"
                  src="assets/img/faq.png"
                  alt="img"
                />

                <div className="bg-warning text-center p-3 rounded-5 position-absolute top-0 end-0 z-index-1 d-none d-sm-block my-3 mx-3">
                  <i className="isax isax-message-question5 heading-color fs-46" />
                </div>
              </div>
            </div>

            <div className="col-lg-7">
              <div className="section-header">
                <span className="fw-medium text-secondary text-decoration-underline mb-2 d-inline-block">
                  سوالات متداول
                </span>

                <h2>سوالات متداول</h2>

                <p>
                  پاسخ‌های دقیق به رایج‌ترین پرسش‌ها درباره پلتفرم آموزشی
                  Mentorito را بررسی کنید.
                </p>
              </div>

              <div className="faq-content">
                <div
                  className="accordion accordion-customicon1 accordions-items-seperate"
                  id="accordioncustomicon1Example"
                >
                  {/* FAQ 1 */}
                  <div className="accordion-item" data-aos="fade-up">
                    <h2 className="accordion-header" id="headingcustomicon1One">
                      <Link
                        to="#"
                        className="accordion-button"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapsecustomicon1One"
                        aria-expanded="true"
                        aria-controls="collapsecustomicon1One"
                      >
                        Mentorito می‌خواهد چه چیزی به شما ارائه دهد؟{" "}
                        <i className="isax isax-add fs-20 fw-semibold ms-1" />
                      </Link>
                    </h2>

                    <div
                      id="collapsecustomicon1One"
                      className="accordion-collapse collapse show"
                      aria-labelledby="headingcustomicon1One"
                      data-bs-parent="#accordioncustomicon1Example"
                    >
                      <div className="accordion-body pt-0">
                        <p>
                          Mentorito یک پلتفرم آموزش آنلاین است که با هدف فراهم
                          کردن دسترسی آسان به دوره‌های آموزشی باکیفیت ایجاد شده
                          است. کاربران می‌توانند دوره‌های مختلف را مشاهده کنند،
                          مهارت‌های جدید یاد بگیرند و مسیر یادگیری خود را متناسب
                          با اهداف آموزشی و شغلی خود پیش ببرند.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* FAQ 2 */}
                  <div
                    className="accordion-item"
                    data-aos="fade-up"
                    data-aos-delay={250}
                  >
                    <h2 className="accordion-header" id="headingcustomicon1Two">
                      <Link
                        to="#"
                        className="accordion-button collapsed"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapsecustomicon1Two"
                        aria-expanded="false"
                        aria-controls="collapsecustomicon1Two"
                      >
                        چرا ما را برای تحصیل خود انتخاب کنید؟{" "}
                        <i className="isax isax-add fs-20 fw-semibold ms-1" />
                      </Link>
                    </h2>

                    <div
                      id="collapsecustomicon1Two"
                      className="accordion-collapse collapse"
                      aria-labelledby="headingcustomicon1Two"
                      data-bs-parent="#accordioncustomicon1Example"
                    >
                      <div className="accordion-body pt-0">
                        <p>
                          Mentorito تلاش می‌کند تجربه‌ای ساده، کاربردی و قابل
                          دسترس برای یادگیری فراهم کند. تنوع دوره‌ها، محتوای
                          آموزشی ساختاریافته و امکان یادگیری در هر زمان و مکان
                          به شما کمک می‌کند بدون محدودیت زمانی و مکانی مهارت‌های
                          مورد نیاز خود را توسعه دهید.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* FAQ 3 */}
                  <div
                    className="accordion-item"
                    data-aos="fade-up"
                    data-aos-delay={250}
                  >
                    <h2
                      className="accordion-header"
                      id="headingcustomicon1Three"
                    >
                      <Link
                        to="#"
                        className="accordion-button collapsed"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapsecustomicon1Three"
                        aria-expanded="false"
                        aria-controls="collapsecustomicon1Three"
                      >
                        چگونه به شما خدمات ارائه می‌دهیم؟{" "}
                        <i className="isax isax-add fs-20 fw-semibold ms-1" />
                      </Link>
                    </h2>

                    <div
                      id="collapsecustomicon1Three"
                      className="accordion-collapse collapse"
                      aria-labelledby="headingcustomicon1Three"
                      data-bs-parent="#accordioncustomicon1Example"
                    >
                      <div className="accordion-body pt-0">
                        <p>
                          شما می‌توانید در Mentorito دوره مورد نظر خود را از
                          میان دسته‌بندی‌های مختلف پیدا کنید، جزئیات و محتوای
                          دوره را بررسی کرده و پس از ثبت‌نام، یادگیری را آغاز
                          کنید. دوره‌ها به صورت آنلاین در اختیار شما قرار
                          می‌گیرند تا بتوانید با سرعت و برنامه زمانی مناسب
                          خودتان پیش بروید.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* FAQ 4 */}
                  <div
                    className="accordion-item"
                    data-aos="fade-up"
                    data-aos-delay={250}
                  >
                    <h2
                      className="accordion-header"
                      id="headingcustomicon1Four"
                    >
                      <Link
                        to="#"
                        className="accordion-button collapsed"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapsecustomicon1Four"
                        aria-expanded="false"
                        aria-controls="collapsecustomicon1Four"
                      >
                        آیا طرح ماهانه دارید؟{" "}
                        <i className="isax isax-add fs-20 fw-semibold ms-1" />
                      </Link>
                    </h2>

                    <div
                      id="collapsecustomicon1Four"
                      className="accordion-collapse collapse"
                      aria-labelledby="headingcustomicon1Four"
                      data-bs-parent="#accordioncustomicon1Example"
                    >
                      <div className="accordion-body pt-0">
                        <p>
                          در حال حاضر Mentorito تمرکز خود را بر ارائه دوره‌های
                          آموزشی متنوع با امکان خرید و دسترسی به دوره‌ها قرار
                          داده است. در صورت ارائه طرح‌های اشتراکی یا ماهانه،
                          جزئیات مربوط به آن از طریق پلتفرم اطلاع‌رسانی خواهد
                          شد.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* FAQ 5 */}
                  <div
                    className="accordion-item"
                    data-aos="fade-up"
                    data-aos-delay={250}
                  >
                    <h2
                      className="accordion-header"
                      id="headingcustomicon1Five"
                    >
                      <Link
                        to="#"
                        className="accordion-button collapsed"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapsecustomicon1Five"
                        aria-expanded="false"
                        aria-controls="collapsecustomicon1Five"
                      >
                        آیا هزینه دوره‌های شما مناسب و مقرون‌به‌صرفه است؟{" "}
                        <i className="isax isax-add fs-20 fw-semibold ms-1" />
                      </Link>
                    </h2>

                    <div
                      id="collapsecustomicon1Five"
                      className="accordion-collapse collapse"
                      aria-labelledby="headingcustomicon1Five"
                      data-bs-parent="#accordioncustomicon1Example"
                    >
                      <div className="accordion-body pt-0">
                        <p>
                          ما تلاش می‌کنیم دوره‌ها با قیمت‌هایی ارائه شوند که در
                          مقایسه با ارزش آموزشی و مهارت‌هایی که به دست می‌آورید،
                          مقرون‌به‌صرفه باشند. همچنین تنوع دوره‌ها و وجود
                          گزینه‌های مختلف به شما امکان می‌دهد متناسب با نیاز و
                          بودجه خود انتخاب کنید.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div
                    id="account-help"
                    className="accordion-item"
                    data-aos="fade-up"
                    data-aos-delay={250}
                  >
                    <h2 className="accordion-header" id="headingAccountHelp">
                      <Link
                        to="#"
                        className="accordion-button collapsed"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapseAccountHelp"
                        aria-expanded="false"
                        aria-controls="collapseAccountHelp"
                      >
                        برای ورود، پروفایل یا مدیریت حساب کاربری خود چه کاری
                        باید انجام دهم؟{" "}
                        <i className="isax isax-add fs-20 fw-semibold ms-1" />
                      </Link>
                    </h2>

                    <div
                      id="collapseAccountHelp"
                      className="accordion-collapse collapse"
                      aria-labelledby="headingAccountHelp"
                      data-bs-parent="#accordioncustomicon1Example"
                    >
                      <div className="accordion-body pt-0">
                        <p>
                          برای ورود به حساب کاربری، از گزینه «ورود» در منوی سایت
                          استفاده کنید و اطلاعات حساب خود را وارد کنید. پس از
                          ورود می‌توانید از بخش پروفایل، اطلاعات شخصی، رمز عبور
                          و سایر تنظیمات حساب خود را مدیریت کنید.
                        </p>

                        <p className="mb-0">
                          اگر در ورود به حساب، تغییر اطلاعات پروفایل یا مدیریت
                          حساب خود با مشکلی مواجه شدید، می‌توانید با تیم
                          پشتیبانی Mentorito تماس بگیرید تا شما را راهنمایی
                          کنند.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    id="certificate-help"
                    className="accordion-item"
                    data-aos="fade-up"
                    data-aos-delay={250}
                  >
                    <h2
                      className="accordion-header"
                      id="headingCertificateHelp"
                    >
                      <Link
                        to="#"
                        className="accordion-button collapsed"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapseCertificateHelp"
                        aria-expanded="false"
                        aria-controls="collapseCertificateHelp"
                      >
                        چگونه می‌توانم گواهینامه پایان دوره خود را دریافت کنم؟
                        <i className="isax isax-add fs-20 fw-semibold ms-1" />
                      </Link>
                    </h2>

                    <div
                      id="collapseCertificateHelp"
                      className="accordion-collapse collapse"
                      aria-labelledby="headingCertificateHelp"
                      data-bs-parent="#accordioncustomicon1Example"
                    >
                      <div className="accordion-body pt-0">
                        <p>
                          پس از تکمیل تمامی بخش‌های دوره و مشاهده محتوای آموزشی،
                          گواهینامه پایان دوره به صورت خودکار در حساب کاربری شما
                          فعال خواهد شد.
                        </p>

                        <p className="mb-0">
                          برای دانلود گواهینامه، به داشبورد دانشجویی مراجعه کرده
                          و از بخش «گواهینامه‌ها» فایل خود را دریافت کنید.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* faq */}
    </>
  );
};

export default Faq;
