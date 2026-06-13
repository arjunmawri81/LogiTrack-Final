import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* Company */}
        <div className="footer-col">
          <h2>LogiTrack</h2>

          <p>
            Multi-Courier Shipping Aggregator Platform helping
            businesses manage orders, create shipments,
            generate AWBs, track deliveries, handle COD,
            NDR and warehouse operations from one dashboard.
          </p>
        </div>

        {/* Platform */}
        <div className="footer-col">
          <h3>Platform</h3>

          <Link to="/">Home</Link>
          <Link to="/tracking">Track Shipment</Link>
          <Link to="/services">Services</Link>
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact</Link>
        </div>

        {/* Features */}
        <div className="footer-col">
          <h3>Features</h3>

          <p>✓ Order Management</p>
          <p>✓ Shipment Creation</p>
          <p>✓ AWB Generation</p>
          <p>✓ Live Tracking</p>
          <p>✓ COD Management</p>
          <p>✓ Warehouse Management</p>
        </div>

        {/* Contact */}
        <div className="footer-col">
          <h3>Contact</h3>

          <p>📍 Noida, Uttar Pradesh, India</p>
          <p>📞 +91 1800-111-0928</p>
          <p>📧 support@logitrack.com</p>
          <p>🕒 Mon - Sat | 9 AM - 7 PM</p>
        </div>

      </div>

      <div className="footer-bottom">
        <p>
          © 2026 LogiTrack Shipping Aggregator Platform.
          All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;