import { useState } from "react";
import "./Services.css";
import servicesData from "../data/servicesData";
import serviceImg from "../assets/images/services.jpg";

function Services() {
  const [active, setActive] = useState(0);

  return (
    <section className="services-section">
      <div className="services-title">
        <span>OUR SERVICES</span>
        <h2>Comprehensive Logistics Solutions</h2>
      </div>

      <div className="service-tabs">
        {servicesData.map((item, index) => (
          <button
            key={item.id}
            className={active === index ? "active-tab" : ""}
            onClick={() => setActive(index)}
          >
            {item.title}
          </button>
        ))}
      </div>

      <div className="service-content">
        <div className="service-text">
          <h3>{servicesData[active].title}</h3>
          <p>{servicesData[active].description}</p>
          <button className="learn-btn">Learn More</button>
        </div>
        <div className="service-image">
          <img src={serviceImg} alt="service" />
        </div>
      </div>
    </section>
  );
}

export default Services;