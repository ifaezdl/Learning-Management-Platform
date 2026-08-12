import AboutSection from "./section/aboutSection";
import Benefits from "./section/benefits";
import Institution from "./section/institution";
import Counter from "./section/counter";

import Faq from "./section/faq";

const AboutUs = () => {
  return (
    <>
      <AboutSection />
      <Benefits />
      <Institution />
      <Counter />
      {/* <Testimonials /> */}
      <Faq />
    </>
  );
};

export default AboutUs;
