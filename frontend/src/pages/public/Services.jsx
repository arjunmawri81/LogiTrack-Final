import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import CTA from "../../components/CTA";
import "./Services.css";

const Services = () => {
  const services = [
    {
      title: "Order Management",
      desc: "Create and manage customer orders from a centralized dashboard."
    },
    {
      title: "Shipment Creation",
      desc: "Generate shipments and assign courier partners instantly."
    },
    {
      title: "AWB Generation",
      desc: "Automatically generate AWB numbers and shipping labels."
    },
    {
      title: "Real-Time Tracking",
      desc: "Track shipments with live delivery updates."
    },
    {
      title: "COD Management",
      desc: "Monitor cash-on-delivery collections and settlements."
    },
    {
      title: "Warehouse Management",
      desc: "Manage inventory, dispatches and warehouse operations."
    },
    {
      title: "NDR Management",
      desc: "Handle delivery exceptions and customer follow-ups."
    },
    {
      title: "Reports & Analytics",
      desc: "Get actionable logistics insights and performance reports."
    }
  ];

  return (
    <>
      <Navbar />

      <section className="services-page-hero">
        <div className="services-container">
          <span>OUR SERVICES</span>

          <h1>
            Everything You Need
            <br />
            To Manage Logistics
          </h1>

          <p>
            Powerful shipping and logistics tools designed
            for modern businesses.
          </p>
        </div>
      </section>

      <section className="services-grid-section">
        <div className="services-container">

          <div className="services-grid">
            {services.map((service, index) => (
              <div className="service-card" key={index}>
                <h3>{service.title}</h3>
                <p>{service.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      <CTA />
      <Footer />
    </>
  );
};

export default Services;