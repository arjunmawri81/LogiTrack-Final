import "./Stats.css";
import {
  FaTruck,
  FaWarehouse,
  FaBoxes,
  FaMapMarkedAlt,
  FaBuilding,
  FaShippingFast,
} from "react-icons/fa";

function Stats() {
  const statsData = [
    {
      icon: <FaTruck />,
      number: "2M+",
      title: "Deliveries",
    },
    {
      icon: <FaWarehouse />,
      number: "260+",
      title: "Hubs",
    },
    {
      icon: <FaBoxes />,
      number: "4500+",
      title: "Centers",
    },
    {
      icon: <FaMapMarkedAlt />,
      number: "19000+",
      title: "Pin Codes",
    },
    {
      icon: <FaBuilding />,
      number: "40+",
      title: "Warehouses",
    },
    {
      icon: <FaShippingFast />,
      number: "35K+",
      title: "Clients",
    },
  ];

  return (
    <section className="stats">
      <div className="stats-header">
        <span>OUR ACHIEVEMENTS</span>
        <h2>Numbers That Define Us</h2>
      </div>

      <div className="stats-container">
        {statsData.map((item, index) => (
          <div className="stat-card" key={index}>
            <div className="stat-icon">{item.icon}</div>

            <h2>{item.number}</h2>

            <p>{item.title}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Stats;