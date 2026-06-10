import "./Clients.css";

function Clients() {
  const clients = [
    "Amazon",
    "Flipkart",
    "Myntra",
    "Nykaa",
    "Samsung",
    "Boat",
    "Lenskart",
    "Meesho",
  ];

  return (
    <section className="clients">
      <div className="clients-heading">
        <span>TRUSTED PARTNERS</span>
        <h2>Brands That Trust Us</h2>
      </div>

      <div className="clients-grid">
        {clients.map((client, index) => (
          <div className="client-card" key={index}>
            {client}
          </div>
        ))}
      </div>
    </section>
  );
}

export default Clients;