import { useState } from "react";
import "./TrackingPage.css";

function TrackingPage() {
  const [awb, setAwb] = useState("");

  const handleTrack = () => {
    if (!awb) {
      alert("Please enter AWB Number");
      return;
    }

    console.log("Track:", awb);

    // Backend API yaha connect hogi
  };

  return (
    <div className="tracking-page">
      <div className="tracking-container">

        <span className="tracking-tag">
          REAL TIME SHIPMENT TRACKING
        </span>

        <h1>Track Your Shipment</h1>

        <p>
          Enter your AWB number to get real-time shipment updates,
          courier details and delivery status.
        </p>

        <div className="tracking-search">
          <input
            type="text"
            placeholder="Enter AWB Number"
            value={awb}
            onChange={(e) => setAwb(e.target.value)}
          />

          <button onClick={handleTrack}>
            Track Shipment
          </button>
        </div>

        <div className="tracking-result">

          <h3>Shipment Details</h3>

          <div className="tracking-grid">

            <div>
              <span>AWB Number</span>
              <p>AWB123456789</p>
            </div>

            <div>
              <span>Courier</span>
              <p>Delhivery</p>
            </div>

            <div>
              <span>Status</span>
              <p className="status">In Transit</p>
            </div>

            <div>
              <span>Origin</span>
              <p>Noida</p>
            </div>

            <div>
              <span>Destination</span>
              <p>Mumbai</p>
            </div>

            <div>
              <span>Expected Delivery</span>
              <p>15 June 2026</p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default TrackingPage;