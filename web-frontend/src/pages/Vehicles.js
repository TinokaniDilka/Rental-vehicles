import { useEffect, useState } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    api.get("/vehicles")
      .then(res => setVehicles(res.data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div style={{ padding: "20px" }}>
        <h2>Vehicle List</h2>

        {vehicles.map(v => (
          <div key={v._id} style={{
            border: "1px solid #ccc",
            padding: "10px",
            marginBottom: "10px"
          }}>
            <h3>{v.name}</h3>
            <p>Category: {v.category}</p>
            <p>Price: {v.pricePerDay}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
