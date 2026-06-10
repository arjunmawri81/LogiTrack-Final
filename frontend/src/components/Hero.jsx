import "./Hero.css";
import hero from "../assets/images/hero.jpg";

function Hero() {
  return (
    <section className="hero">
      <img src={hero} alt="Hero" className="hero-bg" />

      <div className="hero-overlay">
        <div className="hero-content">

          <span className="hero-tag">
            SMART LOGISTICS SOLUTIONS
          </span>

          <h1>
            Fast & Reliable
            <br />
            Logistics Across India
          </h1>

          <p>
            Delivering shipments with speed, transparency and
            nationwide coverage for businesses of every size.
          </p>

          <div className="hero-buttons">
            <button className="primary-btn">
              Track Shipment
            </button>

            <button className="secondary-btn">
              Get Quote
            </button>
          </div>

          <div className="hero-stats">
            <div>
              <h3>2M+</h3>
              <span>Deliveries</span>
            </div>

            <div>
              <h3>260+</h3>
              <span>Hubs</span>
            </div>

            <div>
              <h3>19K+</h3>
              <span>Pin Codes</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default Hero;