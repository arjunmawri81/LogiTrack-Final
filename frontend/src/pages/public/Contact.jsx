import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import "./Contact.css";

const Contact = () => {
  return (
    <>
      <Navbar />

      <section className="contact-hero">
        <div className="contact-container">

          <span>CONTACT US</span>

          <h1>Let's Talk Logistics</h1>

          <p>
            Have questions about shipping, tracking or onboarding?
            Our team is here to help.
          </p>

        </div>
      </section>

      <section className="contact-section">
        <div className="contact-container">

          <div className="contact-grid">

            <div className="contact-form">

              <h2>Send Us A Message</h2>

              <input type="text" placeholder="Full Name" />
              <input type="email" placeholder="Email Address" />
              <input type="text" placeholder="Phone Number" />
              <input type="text" placeholder="Company Name" />

              <textarea
                rows="5"
                placeholder="Your Message"
              ></textarea>

              <button>
                Submit Inquiry
              </button>

            </div>

            <div className="contact-info">

              <h2>Contact Information</h2>

              <div>
                <strong>Phone</strong>
                <p>+91 1800-111-0928</p>
              </div>

              <div>
                <strong>Email</strong>
                <p>support@logitrack.com</p>
              </div>

              <div>
                <strong>Location</strong>
                <p>Noida, Uttar Pradesh, India</p>
              </div>

              <div>
                <strong>Working Hours</strong>
                <p>Mon - Sat | 9 AM - 7 PM</p>
              </div>

            </div>

          </div>

        </div>
      </section>

      <Footer />
    </>
  );
};

export default Contact;