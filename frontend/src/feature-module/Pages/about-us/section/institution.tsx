import React from "react";
import Slider from "react-slick";
import { Link } from "react-router-dom";
import ImageWithBasePath from "../../../../core/common/imageWithBasePath";

const Institution = () => {
  const categoriesSlider = {
    slidesToShow: 6,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2200,
    speed: 1000,
    arrows: false,
    dots: false,
    infinite: true,
    responsive: [
      {
        breakpoint: 1400,
        settings: {
          slidesToShow: 5,
        },
      },
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  const categories = [
    {
      id: 1,
      title: "برنامه‌نویسی",
      courses: "دوره‌های برنامه‌نویسی",
      icon: "isax-code-1",
      bgClass: "bg-primary-transparent",
    },
    {
      id: 2,
      title: "طراحی وب",
      courses: "دوره‌های طراحی وب",
      icon: "isax-designtools",
      bgClass: "bg-secondary-transparent",
    },
    {
      id: 3,
      title: "هوش مصنوعی",
      courses: "دوره‌های هوش مصنوعی",
      icon: "isax-cpu",
      bgClass: "bg-skyblue-transparent",
    },
    {
      id: 4,
      title: "علم داده",
      courses: "دوره‌های علم داده",
      icon: "isax-chart-2",
      bgClass: "bg-lightgreen-transparent",
    },
    {
      id: 5,
      title: "طراحی UI/UX",
      courses: "دوره‌های طراحی",
      icon: "isax-pen-tool-2",
      bgClass: "bg-warning-transparent",
    },
    {
      id: 6,
      title: "بازاریابی",
      courses: "دوره‌های بازاریابی",
      icon: "isax-graph",
      bgClass: "bg-danger-transparent",
    },
    {
      id: 7,
      title: "مهارت‌های مدیریتی",
      courses: "دوره‌های مدیریتی",
      icon: "isax-briefcase",
      bgClass: "bg-primary-transparent",
    },
    {
      id: 8,
      title: "مدیریت مالی",
      courses: "دوره‌های مالی",
      icon: "isax-wallet-3",
      bgClass: "bg-secondary-transparent",
    },
  ];

  return (
    <>
      {/* Popular Categories */}
      <section className="client-section">
        <div className="container">
          <div className="section-header text-center mb-4">
            <span className="fw-medium text-secondary text-decoration-underline mb-2 d-inline-block">
              دسته‌بندی‌ها
            </span>

            <h2>دسته‌بندی‌های محبوب</h2>

            <p>
              حوزه مورد علاقه خود را انتخاب کنید و یادگیری را از همین امروز شروع
              کنید.
            </p>
          </div>

          <Slider
            {...categoriesSlider}
            className="institutions-slider lazy slider"
          >
            {categories.map((category) => (
              <div key={category.id} className="px-2">
                <Link
                  to={`/courses?category=${category.id}`}
                  className="text-decoration-none"
                >
                  <div className="card border-0 shadow-sm h-100 category-card">
                    <div className="card-body text-center p-4">
                      <div
                        className={`p-3 rounded-circle ${category.bgClass} d-inline-flex align-items-center justify-content-center mb-3`}
                        style={{
                          width: "70px",
                          height: "70px",
                        }}
                      >
                        <i className={`isax ${category.icon} fs-30`} />
                      </div>

                      <h5 className="mb-2">{category.title}</h5>

                      <p className="text-muted mb-0">{category.courses}</p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </Slider>
        </div>
      </section>
      {/* Popular Categories */}
    </>
  );
};

export default Institution;
