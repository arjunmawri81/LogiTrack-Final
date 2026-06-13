import "./CTA.css";

function CTA() {
  return (
    <section className="cta">
      <div className="cta-content">
        <span>START SHIPPING TODAY</span>

        <h2>
          Ready To Ship Smarter?
        </h2>

        <p>
          Manage orders, compare courier rates, generate AWBs,
          track shipments and handle returns from a single
          logistics platform.
        </p>

        <div className="cta-buttons">
          <button className="cta-primary">
            Start Shipping
          </button>

          <button className="cta-secondary">
            Track Shipment
          </button>
        </div>
      </div>
    </section>
  );
}

export default CTA;