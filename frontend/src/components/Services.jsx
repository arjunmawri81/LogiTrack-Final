import { useState } from "react";
import "./Services.css";
import servicesData from "../data/servicesData";
import serviceImg from "../assets/images/services.jpg";

function Services() {
  const [active, setActive] = useState(0);

  return (
    <section className="services-section">
      <div className="services-title">
        <span>PLATFORM FEATURES</span>
        <h2>Everything You Need To Manage Shipping</h2>
        <p>
          Simplify logistics operations with multi-courier integration,
          shipment tracking, warehouse management, billing, COD handling,
          NDR resolution and powerful analytics.
        </p>
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

          <button className="learn-btn">
            Explore Feature
          </button>
        </div>

        <div className="service-image">
          <img
            src={serviceImg}
            alt={servicesData[active].title}
          />
        </div>
      </div>
    </section>
  );
}

export default Services;