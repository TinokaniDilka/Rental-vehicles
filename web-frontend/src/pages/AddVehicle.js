import { useState } from "react";
import api from "../services/api";

export default function AddVehicle() {
  const [form, setForm] = useState({
    name: "",
    category: "",
    pricePerDay: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post("/vehicles", form);
    alert("Vehicle Added!");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Name"
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <input
        placeholder="Category"
        onChange={(e) => setForm({ ...form, category: e.target.value })}
      />
      <input
        placeholder="Price"
        onChange={(e) => setForm({ ...form, pricePerDay: e.target.value })}
      />

      <button type="submit">Add Vehicle</button>
    </form>
  );
}
