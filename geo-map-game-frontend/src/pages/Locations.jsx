import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function Locations() {
  const [locations, setLocations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const res = await api.get('/locations/available');
      setLocations(res.data);
    } catch (err) {
      alert('Please login');
      navigate('/login');
    }
  };

  return (
    <div>
      <h2>Available Locations</h2>
      {locations.map((loc) => (
        <div key={loc.id}>
          <button onClick={() => navigate(`/game/${loc.id}`)}>
            {loc.title}
          </button>
        </div>
      ))}
    </div>
  );
}