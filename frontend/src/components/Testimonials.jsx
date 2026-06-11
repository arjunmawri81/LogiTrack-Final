import "./Testimonials.css";

function Testimonials() {
  const data = [
    { text: "Excellent logistics service with fast deliveries and professional support. Highly recommended.", name: "Rahul Sharma", role: "E-Commerce Owner" },
    { text: "Their tracking system and delivery network are outstanding. We trust them completely.", name: "Amit Verma", role: "Business Partner" },
    { text: "Timely deliveries and excellent customer service. Great logistics partner.", name: "Neha Gupta", role: "Retail Brand" }
  ];

  return (
    <section className="testimonials">
      <div className="testimonial-heading">
        <span>TESTIMONIALS</span>
        <h2>What Our Clients Say</h2>
      </div>

      <div className="testimonial-container">
        {data.map((item, index) => (
          <div className="testimonial-card" key={index}>
            <p>"{item.text}"</p>
            <h4>{item.name}</h4>
            <span>{item.role}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Testimonials;