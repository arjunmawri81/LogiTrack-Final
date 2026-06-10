import "./Tracking.css";

function Tracking() {
  return (
    <section className="tracking-section">
      <div className="tracking-card">
        <h2>Track Your Shipment</h2>

        <p>
          Enter your tracking number to get real-time shipment updates.
        </p>

        <div className="tracking-form">
          <input
            type="text"
            placeholder="Enter Tracking Number"
          />

          <button>Track Now</button>
        </div>
      </div>
    </section>
  );
}

export default Tracking;