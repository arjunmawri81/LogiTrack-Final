import "./Hero.css";
import hero from "../assets/images/hero.jpg";
import { useNavigate } from "react-router-dom";

function Hero() {
  const navigate = useNavigate();

  return (
    <section className="hero">
      <img src={hero} alt="LogiTrack Hero" className="hero-bg" />

      <div className="hero-overlay">
        <div className="hero-content">

          <span className="hero-tag">
            MULTI-COURIER SHIPPING PLATFORM
          </span>

          <h1>
            Ship Smarter With
            <br />
            India's Leading Courier Network
          </h1>

          <p>
            Manage orders, create shipments, compare courier rates,
            track deliveries, handle COD, NDR and returns from one
            powerful logistics dashboard.
          </p>

          <div className="hero-buttons">
            <button
              className="primary-btn"
              onClick={() => navigate("/register")}
            >
              Start Shipping
            </button>

            <button
              className="secondary-btn"
              onClick={() => navigate("/tracking")}
            >
              Track Shipment
            </button>
          </div>

          <div className="hero-stats">
            <div>
              <h3>50+</h3>
              <span>Courier Partners</span>
            </div>

            <div>
              <h3>19K+</h3>
              <span>Serviceable Pincodes</span>
            </div>

            <div>
              <h3>1M+</h3>
              <span>Shipments Processed</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default Hero;