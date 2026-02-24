import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMapEvents, Marker } from 'react-leaflet';
import { useParams } from 'react-router-dom';
import api from '../api/axios';

export default function Game() {
  const { locationId } = useParams();
  const [sessionId, setSessionId] = useState(null);
  const [marker, setMarker] = useState(null);
  const [distance, setDistance] = useState(null);

  useEffect(() => {
    startGame();
  }, []);

  const startGame = async () => {
    const res = await api.post(`/game/start/${locationId}`);
    setSessionId(res.data.id);
  };

  function MapClickHandler() {
    useMapEvents({
      click: async (e) => {
        setMarker(e.latlng);

        const res = await api.post('/game/guess', {
          sessionId,
          guessedLat: e.latlng.lat,
          guessedLng: e.latlng.lng
        });

        setDistance(res.data.distance);

        if (res.data.isWinner) {
          alert('🎉 You found it!');
        }
      }
    });
    return null;
  }

  return (
    <div>
      <h2>Find the Hidden Location</h2>
      {distance && <h3>You are {distance} km away</h3>}

      <MapContainer center={[20, 0]} zoom={2} style={{ height: "500px" }}>
       <TileLayer
         url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
       />
        <MapClickHandler />
        {marker && <Marker position={marker} />}
      </MapContainer>
    </div>
  );
}