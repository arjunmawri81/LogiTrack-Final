import "./Fleet.css";
import fleet from "../assets/images/fleet.jpg";

function Fleet() {
  return (
    <section className="fleet">
      <div className="fleet-content">
        <span className="section-tag">OUR NETWORK</span>
        <h2>Powerful Fleet Network Across The Country</h2>
        <p>
          Our extensive transportation network ensures secure and on-time 
          delivery to every destination.
        </p>

        <div className="fleet-stats">
          <div className="stat-item">
            <h3>500+</h3>
            <p>Vehicles</p>
          </div>
          <div className="stat-item">
            <h3>150+</h3>
            <p>Cities</p>
          </div>
          <div className="stat-item">
            <h3>24/7</h3>
            <p>Support</p>
          </div>
        </div>
      </div>

      <div className="fleet-image">
        <img src={fleet} alt="Fleet" />
      </div>
    </section>
  );
}

export default Fleet;