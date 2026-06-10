import Navbar from "../../components/Navbar";
import Hero from "../../components/Hero";
import Tracking from "../../components/Tracking";
import WhyChooseUs from "../../components/WhyChooseUs";
import Services from "../../components/Services";
import Fleet from "../../components/Fleet";
import Testimonials from "../../components/Testimonials";
import Footer from "../../components/Footer";
import Stats from "../../components/Stats";
import Clients from "../../components/Clients";
import CTA from "../../components/CTA";

function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Tracking />
      <Stats />
      <WhyChooseUs />
      <Services />
      <Fleet />
      <Clients />
      <Testimonials />
      <CTA />
      <Footer />
    </>
  );
}

export default Home;