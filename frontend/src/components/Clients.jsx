import "./Clients.css";

function Clients() {
  const couriers = [
    "Delhivery",
    "Blue Dart",
    "DTDC",
    "XpressBees",
    "Ecom Express",
    "Ekart",
    "Shadowfax",
    "India Post",
  ];

  return (
    <section className="clients">
      <div className="clients-heading">
        <span>COURIER PARTNERS</span>
        <h2>Integrated Shipping Network</h2>

        <p>
          Ship with multiple courier partners from a single platform and
          choose the best shipping option based on cost, speed and delivery performance.
        </p>
      </div>

      <div className="clients-grid">
        {couriers.map((courier, index) => (
          <div className="client-card" key={index}>
            {courier}
          </div>
        ))}
      </div>
    </section>
  );
}

export default Clients;