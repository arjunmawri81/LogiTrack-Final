import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        <div className="footer-col">
          <h2>LogiTrack</h2>
          <p>
            Delivering reliable logistics and transportation
            solutions across India with speed, security and trust.
          </p>
        </div>

        <div className="footer-col">
          <h3>Quick Links</h3>

          <a href="#">Home</a>
          <a href="#">About</a>
          <a href="#">Services</a>
          <a href="#">Contact</a>
        </div>

        <div className="footer-col">
          <h3>Services</h3>

          <a href="#">Road Freight</a>
          <a href="#">Air Freight</a>
          <a href="#">Warehousing</a>
          <a href="#">Last Mile Delivery</a>
        </div>

        <div className="footer-col">
          <h3>Contact</h3>

          <p>📞 +91 18001110928</p>
          <p>📧 info@logitrack.com</p>
          <p>📍 Noida, India</p>
        </div>

      </div>

      <div className="footer-bottom">
        <p>
          © 2026 LogiTrack Logistics. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;