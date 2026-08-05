import "./Fleet.css";
import fleet from "../assets/images/fleet.jpg";

function Fleet() {
  return (
    <section className="fleet">
      <div className="fleet-content">
        <span className="section-tag">
          HOW IT WORKS
        </span>

        <h2>
          One Platform.
          <br />
          Complete Shipping Control.
        </h2>

        <p>
          Manage orders, create shipments, compare courier rates,
          generate AWBs, track deliveries, handle COD settlements,
          returns and warehouse operations from a single dashboard.
        </p>

        <p>
          Whether you're a growing eCommerce seller or an enterprise
          business, MyParcelPoint helps streamline logistics operations
          with real-time visibility, automated shipping workflows,
          and centralized logistics management.
        </p>
      </div>

      <div className="fleet-image">
        <img
          src={fleet}
          alt="MyParcelPoint Shipping Platform"
        />
      </div>
    </section>
  );
}

export default Fleet;