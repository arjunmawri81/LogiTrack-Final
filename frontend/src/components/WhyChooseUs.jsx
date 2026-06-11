import "./WhyChooseUs.css";
import whychoose from "../assets/images/whychoose.jpg";

function WhyChooseUs() {
  return (
    <section className="why-section">
      <div className="why-container">
        <div className="why-image">
          <img src={whychoose} alt="Logistics infrastructure" />
        </div>

        <div className="why-content">
          <span className="section-tag">WHY CHOOSE US</span>
          <h2>Trusted Logistics Partner For Businesses Across India</h2>
          <p>
            We provide end-to-end logistics solutions with fast delivery, 
            secure transportation, and real-time shipment tracking for 
            businesses of all sizes.
          </p>

          <div className="features">
            <Feature title="Fast Delivery" desc="Quick and reliable nationwide shipping." />
            <Feature title="Secure Transport" desc="Safe handling for every shipment." />
            <Feature title="Live Tracking" desc="Monitor your package in real time." />
            <Feature title="24/7 Support" desc="Dedicated customer assistance." />
          </div>

          <div className="why-stats">
            <Stat val="2M+" label="Deliveries" />
            <Stat val="500+" label="Vehicles" />
            <Stat val="100+" label="Cities" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* Helper components to keep code clean */
const Feature = ({ title, desc }) => (
  <div className="feature-card">
    <h3>{title}</h3>
    <p>{desc}</p>
  </div>
);

const Stat = ({ val, label }) => (
  <div>
    <h3>{val}</h3>
    <p>{label}</p>
  </div>
);

export default WhyChooseUs;