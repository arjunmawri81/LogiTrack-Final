import { useState } from "react";
import Sidebar from "../../components/Sidebar";

const RateCalculator = () => {
  const [pickup, setPickup] = useState("");
  const [delivery, setDelivery] = useState("");
  const [weight, setWeight] = useState("");
  const [rates, setRates] = useState(null);

  const calculateRates = () => {
    if (!pickup || !delivery || !weight) {
      alert("Please fill all fields");
      return;
    }

    setRates([
      {
        courier: "Delhivery",
        price: 120,
        days: 3,
      },
      {
        courier: "DTDC",
        price: 135,
        days: 4,
      },
      {
        courier: "XpressBees",
        price: 110,
        days: 5,
      },
    ]);
  };

  return (
    <div className="dashboard">
      <Sidebar />

      <div style={{ padding: "30px" }}>
        <h1>💰 Rate Calculator</h1>

        <div style={{ marginTop: "20px" }}>
          <input
            type="text"
            placeholder="Pickup Pincode"
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
            style={{ padding: "10px", marginRight: "10px" }}
          />

          <input
            type="text"
            placeholder="Delivery Pincode"
            value={delivery}
            onChange={(e) => setDelivery(e.target.value)}
            style={{ padding: "10px", marginRight: "10px" }}
          />

          <input
            type="number"
            placeholder="Weight (kg)"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            style={{ padding: "10px", marginRight: "10px" }}
          />

          <button
            onClick={calculateRates}
            style={{
              padding: "10px 20px",
              cursor: "pointer",
            }}
          >
            Calculate
          </button>
        </div>

        {rates && (
          <table
            style={{
              marginTop: "30px",
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr>
                <th>Courier</th>
                <th>Rate</th>
                <th>Delivery Days</th>
              </tr>
            </thead>

            <tbody>
              {rates.map((rate) => (
                <tr key={rate.courier}>
                  <td>{rate.courier}</td>
                  <td>₹{rate.price}</td>
                  <td>{rate.days} Days</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default RateCalculator;