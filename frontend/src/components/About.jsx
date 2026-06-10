import "./About.css";

function About() {
  return (
    <section className="about">
      <div className="about-image">
        <img
          src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200&auto=format&fit=crop"
          alt="Warehouse"
        />
      </div>

      <div className="about-content">
        <span>ABOUT LOGITRACK</span>

        <h2>
          Delivering Excellence In
          Logistics & Transportation
        </h2>

        <p>
          We provide reliable transportation,
          warehousing and supply chain solutions
          that help businesses move goods safely
          and efficiently across the country.
        </p>

        <div className="about-stats">
          <div>
            <h3>15+</h3>
            <p>Years Experience</p>
          </div>

          <div>
            <h3>150+</h3>
            <p>Cities Covered</p>
          </div>

          <div>
            <h3>24/7</h3>
            <p>Customer Support</p>
          </div>
        </div>

        <button className="about-btn">
          Learn More
        </button>
      </div>
    </section>
  );
}

export default About;