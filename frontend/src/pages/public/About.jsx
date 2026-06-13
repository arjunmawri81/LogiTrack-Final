import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import CTA from "../../components/CTA";
import "./About.css";

const About = () => {
  return (
    <>
      <Navbar />

      <section className="about-hero">
        <div className="about-container">
          <span>ABOUT LOGITRACK</span>

          <h1>
            Simplifying Logistics
            <br />
            For Modern Businesses
          </h1>

          <p>
            LogiTrack is a multi-courier shipping platform that helps
            businesses manage orders, create shipments, track deliveries,
            automate logistics operations and improve customer experience.
          </p>
        </div>
      </section>

      <section className="about-company">
        <div className="about-container">

          <div className="about-content">
            <h2>Who We Are</h2>

            <p>
              LogiTrack provides businesses with a centralized logistics
              management platform. From order creation to shipment delivery,
              we help merchants streamline operations using automation and
              real-time shipment visibility.
            </p>

            <p>
              Our platform enables courier aggregation, shipment tracking,
              AWB generation, COD management and logistics analytics from a
              single dashboard.
            </p>
          </div>

        </div>
      </section>

      <section className="about-features">
        <div className="about-container">

          <h2>Why Businesses Choose Us</h2>

          <div className="feature-grid">

            <div className="feature-card">
              <h3>Multi Courier Support</h3>
              <p>
                Connect with multiple courier partners from one platform.
              </p>
            </div>

            <div className="feature-card">
              <h3>Real Time Tracking</h3>
              <p>
                Track every shipment with live status updates.
              </p>
            </div>

            <div className="feature-card">
              <h3>Fast Shipping</h3>
              <p>
                Deliver products faster with optimized courier selection.
              </p>
            </div>

            <div className="feature-card">
              <h3>Secure Operations</h3>
              <p>
                Enterprise grade security and shipment management.
              </p>
            </div>

          </div>

        </div>
      </section>

      <section className="about-stats">

        <div className="stat-box">
          <h3>50K+</h3>
          <p>Orders Processed</p>
        </div>

        <div className="stat-box">
          <h3>150+</h3>
          <p>Cities Covered</p>
        </div>

        <div className="stat-box">
          <h3>99%</h3>
          <p>Delivery Success</p>
        </div>

        <div className="stat-box">
          <h3>24/7</h3>
          <p>Support</p>
        </div>

      </section>

      <CTA />
      <Footer />
    </>
  );
};

export default About;