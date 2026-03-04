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
    if (!title || !lat || !lng) return alert("All fields required");

    await api.post("/locations", {
      title,
      latitude: parseFloat(lat),
      longitude: parseFloat(lng),
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

  const enableLocation = async (id) => {
    await api.patch(`/locations/${id}/enable`);
    fetchLocations();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">

      {/* Title */}
      <h2 className="text-3xl font-bold mb-6 
                     text-gray-800 dark:text-white">
        Admin Dashboard
      </h2>

      {/* ADD LOCATION CARD */}
      <div className="bg-white dark:bg-slate-800 
                      p-6 rounded-2xl shadow-lg mb-8">
        <h3 className="font-semibold text-lg mb-4 
                       text-gray-700 dark:text-gray-200">
          Add Location
        </h3>

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

          <input
            className="border dark:border-slate-600 
                       bg-gray-50 dark:bg-slate-700 
                       text-gray-800 dark:text-white
                       p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            className="border dark:border-slate-600 
                       bg-gray-50 dark:bg-slate-700 
                       text-gray-800 dark:text-white
                       p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Latitude"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
          />

          <input
            className="border dark:border-slate-600 
                       bg-gray-50 dark:bg-slate-700 
                       text-gray-800 dark:text-white
                       p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Longitude"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
          />

          <button
            onClick={addLocation}
            className="bg-gradient-to-r from-blue-500 to-purple-600 
                       text-white px-4 py-2 rounded-lg 
                       hover:scale-105 transition-transform"
          >
            Add
          </button>

        </div>
      </div>

      {/* LOCATIONS LIST CARD */}
      <div className="bg-white dark:bg-slate-800 
                      p-6 rounded-2xl shadow-lg">
        <h3 className="font-semibold text-lg mb-4 
                       text-gray-700 dark:text-gray-200">
          Locations
        </h3>

        <div className="space-y-3">
          {locations.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400">
              No locations found.
            </p>
          )}

          {locations.map((loc) => (
            <div
              key={loc.id}
              className="flex flex-col md:flex-row md:items-center 
                         md:justify-between 
                         border-b dark:border-slate-700 
                         pb-3"
            >
              <div className="mb-2 md:mb-0">
                <p className="font-medium 
                              text-gray-800 dark:text-white">
                  {loc.title}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {loc.latitude}, {loc.longitude}
                </p>
              </div>

              <button
                onClick={() =>
                  loc?.is_active
                    ? disableLocation(loc.id)
                    : enableLocation(loc.id)
                }
                className={`px-4 py-1 rounded-lg text-white transition
                ${
                  loc.is_active
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                {loc.is_active ? "Disable" : "Enable"}
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}