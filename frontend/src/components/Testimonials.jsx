import "./Testimonials.css";

function Testimonials() {
  return (
    <section className="testimonials">
      <div className="testimonial-heading">
        <span>TESTIMONIALS</span>
        <h2>What Our Clients Say</h2>
      </div>

      <div className="testimonial-container">
        <div className="testimonial-card">
          <p>
            Excellent logistics service with fast deliveries and
            professional support. Highly recommended.
          </p>

          <h4>Rahul Sharma</h4>
          <span>E-Commerce Owner</span>
        </div>

        <div className="testimonial-card">
          <p>
            Their tracking system and delivery network are
            outstanding. We trust them completely.
          </p>

          <h4>Amit Verma</h4>
          <span>Business Partner</span>
        </div>

        <div className="testimonial-card">
          <p>
            Timely deliveries and excellent customer service.
            Great logistics partner.
          </p>

          <h4>Neha Gupta</h4>
          <span>Retail Brand</span>
        </div>
      </div>
    </section>
  );
}

export default Testimonials;