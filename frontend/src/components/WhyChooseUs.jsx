import "./WhyChooseUs.css";
import whychoose from "../assets/images/whychoose.jpg";

function WhyChooseUs() {
  return (
    <section className="why-section">
      <div className="why-container">

        <div className="why-image">
          <img src={whychoose} alt="Why Choose Us" />
        </div>

        <div className="why-content">

          <span className="section-tag">
            WHY CHOOSE US
          </span>

          <h2>
            Trusted Logistics Partner For
            Businesses Across India
          </h2>

          <p>
            We provide end-to-end logistics solutions with
            fast delivery, secure transportation and real-time
            shipment tracking for businesses of all sizes.
          </p>

          <div className="features">

            <div className="feature-card">
              <h3>Fast Delivery</h3>
              <p>
                Quick and reliable nationwide shipping.
              </p>
            </div>

            <div className="feature-card">
              <h3>Secure Transport</h3>
              <p>
                Safe handling for every shipment.
              </p>
            </div>

            <div className="feature-card">
              <h3>Live Tracking</h3>
              <p>
                Monitor your package in real time.
              </p>
            </div>

            <div className="feature-card">
              <h3>24/7 Support</h3>
              <p>
                Dedicated customer assistance.
              </p>
            </div>

          </div>

          <div className="why-stats">

            <div>
              <h3>2M+</h3>
              <p>Deliveries</p>
            </div>

            <div>
              <h3>500+</h3>
              <p>Vehicles</p>
            </div>

            <div>
              <h3>100+</h3>
              <p>Cities</p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

export default WhyChooseUs;