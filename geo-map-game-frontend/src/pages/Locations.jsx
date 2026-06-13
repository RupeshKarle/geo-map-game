import { useEffect, useState, useRef } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function Locations() {
  const [locations, setLocations] = useState([]);
  const [statusMsg, setStatusMsg] = useState("");
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
      let loc = res.data;
      let locations = loc.toSorted((a,b) => (a.group_id || 0) - (b.group_id || 0))
        .map(g => {
          if(Array.isArray(g.locations)) {
            return {
              ...g,
              locations: g.locations.toSorted((a,b) => b.id - a.id)
            }
          }
          return g;
        });
      setLocations(locations);
    } catch (err) {
      setStatusMsg('No more locations.');
      navigate('login');
    }
  }

  return (
  <div>
    <h2 className="text-3xl font-bold mb-8 text-white">Available Locations</h2>

    <div>
      {locations.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400">
          No locations found.
        </p>
      )}
      {locations.map((loc, i) => (
        <div 
          className="bg-white dark:bg-slate-800 
                      p-6 rounded-2xl shadow-lg mb-8"
          key={i}
        >
          <h3 className="font-semibold text-lg mb-4 
                        text-gray-700 dark:text-gray-200">
            {loc.group_id ? loc.groupname : 'Global Locations'}
          </h3>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8'>
          {
            loc.locations.map((l) => (
              <div
                key={l.id}
                className="bg-slate-800 dark:bg-white rounded-2xl p-6 m-6 shadow-md 
                          hover:shadow-1xl hover:scale-105 transition-all duration-300"
              >
                <h3 className="text-gray-200 dark:text-gray-700 text-xl font-semibold mb-4">
                  {l.title}
                </h3>

                <button
                  onClick={() => navigate(`/game/${l.id}`)}
                  className="w-full py-2 rounded-xl font-semibold text-white 
                            bg-gradient-to-r from-blue-500 to-purple-600 
                            hover:opacity-90 transition"
                >
                  Start Game 🚀
                </button>
              </div>
            ))
          }
          </div>
        </div>
      ))}
      
      {statusMsg && (
        <p className="mt-3 text-green-600 dark:text-green-400 text-sm">
          {statusMsg}
        </p>
      )}
    </div>
  </div>
);
}