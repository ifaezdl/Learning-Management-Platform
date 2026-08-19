import React from "react";
import BannerSection from "./section/banner";
import Benefits from "./section/benefits";
import Topcourses from "./section/top-courses";
import Featuredcourse from "./section/featured-course";
import Clinet from "./section/clinet";
import Howitworks from "./section/how-it-works";
import Featureinstructor from "./section/feature-instructor";
import Footer from "./footer";

const HomeOne = () => {
  return (
    <div>
      <BannerSection />
      <Benefits />
      {/* <Institutions /> */}
      <Topcourses />
      {/* <Trust /> */}
      <Featuredcourse />
      {/* <Community /> */}
      {/* <Clinet /> */}
      <Howitworks />
      {/* <Featureinstructor /> */}
      {/* <Testimonials /> */}
      {/* <Faq /> */}
      <Footer />
    </div>
  );
};

export default HomeOne;
