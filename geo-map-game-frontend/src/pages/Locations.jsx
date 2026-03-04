import { useEffect, useState, useRef } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function Locations() {
  const [locations, setLocations] = useState([]);
  const navigate = useNavigate();
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchLocations();
    }
  }, []);

  const fetchLocations = async () => {
    try {
      const res = await api.get('/locations/available');
      setLocations(res.data);
    } catch (err) {
      alert('Please login');
      navigate('/login');
    }
  }

  return (
  <div>
    <h2 className="text-3xl font-bold mb-8 text-white">Available Locations</h2>

    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
      {locations.map((loc) => (
        <div
          key={loc.id}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-md 
                     hover:shadow-2xl hover:scale-105 transition-all duration-300"
        >
          <h3 className="text-xl font-semibold mb-4">
            {loc.title}
          </h3>

          <button
            onClick={() => navigate(`/game/${loc.id}`)}
            className="w-full py-2 rounded-xl font-semibold text-white 
                       bg-gradient-to-r from-blue-500 to-purple-600 
                       hover:opacity-90 transition"
          >
            Start Game 🚀
          </button>
        </div>
      ))}
    </div>
  </div>
);
}