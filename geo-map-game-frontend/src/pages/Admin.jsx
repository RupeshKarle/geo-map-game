import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Admin() {
  const [title, setTitle] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    const res = await api.get("/locations/available");
    setLocations(res.data);
  };

  const addLocation = async () => {
    await api.post("/locations", {
      title,
      latitude: parseFloat(lat),
      longitude: parseFloat(lng)
    });
    setTitle("");
    setLat("");
    setLng("");
    fetchLocations();
  };

  const disableLocation = async (id) => {
    await api.patch(`/locations/${id}/disable`);
    fetchLocations();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>

      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="font-semibold mb-2">Add Location</h3>
        <div className="flex gap-2 mb-2">
          <input
            className="border p-2 flex-1"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            className="border p-2"
            placeholder="Latitude"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
          />
          <input
            className="border p-2"
            placeholder="Longitude"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
          />
          <button
            onClick={addLocation}
            className="bg-blue-600 text-white px-4 rounded"
          >
            Add
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-3">Active Locations</h3>
        {locations.map((loc) => (
          <div key={loc.id} className="flex justify-between border-b py-2">
            <span>{loc.title}</span>
            <button
              onClick={() => disableLocation(loc.id)}
              className="bg-red-500 text-white px-3 rounded"
            >
             Disable
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}