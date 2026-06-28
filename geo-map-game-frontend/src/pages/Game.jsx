import { useRef, useState, useEffect, useCallback } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
  Tooltip,
} from "react-leaflet";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import "leaflet/dist/leaflet.css";
import confetti from "canvas-confetti";
import winSound from "../assets/win.wav";
import { getSocket } from "../services/socketService.js";
import L from "leaflet";

const myPulseIcon = new L.DivIcon({
  className: "",
  html: `
    <div class="relative flex items-center justify-center">
      <div class="absolute w-8 h-8 rounded-full bg-red-500 opacity-40 animate-ping"></div>
      <div class="w-4 h-4 rounded-full bg-red-600 border-2 border-white shadow-xl"></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const otherPulseIcon = new L.DivIcon({
  className: "",
  html: `
    <div class="relative flex items-center justify-center">
      <div class="absolute w-7 h-7 rounded-full bg-blue-500 opacity-40 animate-ping"></div>
      <div class="w-3 h-3 rounded-full bg-blue-600 border-2 border-white shadow-lg"></div>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

/* ✅ Proper way to store map instance */
function MapRefSetter({ mapRef }) {
  const map = useMap();

  useEffect(() => {
    mapRef.current = map;
  }, [map]);

  return null;
}

/* ✅ Click handler */
function ClickHandler({ onMapClick }) {
  useMapEvents({
    click: onMapClick,
  });
  return null;
}

export default function Game() {
  const socket = getSocket();
  const { locationId } = useParams();
  const navigate = useNavigate();

  const mapRef = useRef(null);
  const wrapperRef = useRef(null);
  const popupRef = useRef(null);
  const winSoundRef = useRef(null);
  const hasStartedRef = useRef(false);

  const [sessionId, setSessionId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [location, setLocation] = useState(null);
  const [popupData, setPopupData] = useState(null);
  const [playersGuesses, setPlayersGuesses] = useState({});
  const [guessPosition, setGuessPosition] = useState(null);
  /* ✅ Start Game Session */
  useEffect(() => {
    const startGame = async () => {
      try {
        const res = await api.post(`/game/start/${locationId}`);
        setSessionId(res.data.id);
        setLocation(res.data?.title);
        setUserId(res.data?.user_id);
      } catch (err) {
        alert(err?.response?.data?.message ?? "Please login");
        navigate("/");
      }
    };

    if (locationId && !hasStartedRef.current) {
      hasStartedRef.current = true;
      startGame();
    }
  }, [locationId, navigate]);

  useEffect(() => {
    if (!socket) return;
    const handleGuess = (data) => {
      if (data?.user_id == userId) return;
      setPlayersGuesses((prev) => {
        return {
          ...prev,
          [data.user_id]: { ...data, createdAt: Date.now() },
        };
      });
    };

    socket.on("guessed", handleGuess);

    return () => {
      socket.off("guessed", handleGuess);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket || !locationId) return;

    socket.emit("join_location", locationId);

    return () => {
      socket.emit("leave_location", locationId);
    };
  }, [socket, locationId]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlayersGuesses((prev) => {
        const now = Date.now();

        let changed = false;

        const updated = {};

        for (const [id, player] of Object.entries(prev)) {
          const isAlive = now - player.createdAt < 5000;

          if (isAlive) {
            updated[id] = player;
          } else {
            changed = true;
          }
        }

        // avoid unnecessary rerender
        if (!changed) {
          return prev;
        }
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (popupData?.isWinner) {
      // Confetti burst
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
      });

      if (winSoundRef.current) {
        winSoundRef.current.currentTime = 0;
        winSoundRef.current.volume = 0.6;
        winSoundRef.current.play().catch(() => {});
      }

      // Extra side burst for premium feel
      setTimeout(() => {
        confetti({
          particleCount: 80,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });

        confetti({
          particleCount: 80,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }, 150);
    }
  }, [popupData]);

  /* ✅ Handle Guess Click */
  const handleMapClick = useCallback(
    async (e) => {
      if (!sessionId || !mapRef.current) return;

      setGuessPosition(e.latlng);

      try {
        const res = await api.post("/game/guess", {
          sessionId,
          guessedLat: e.latlng.lat,
          guessedLng: e.latlng.lng,
        });

        const { distance, isWinner } = res.data;

        const map = mapRef.current;
        const point = map.latLngToContainerPoint(e.latlng);
        const size = map.getSize();

        const popupWidth = 260;
        const popupHeight = 160;
        const padding = 12;

        let left = point.x;
        let top = point.y - popupHeight;

        // RIGHT overflow
        if (left + popupWidth + padding > size.x) {
          left = size.x - popupWidth - padding;
        }

        // LEFT overflow
        if (left < padding) {
          left = padding;
        }

        // TOP overflow
        if (top < padding) {
          top = point.y + padding;
        }

        // BOTTOM overflow
        if (top + popupHeight + padding > size.y) {
          top = size.y - popupHeight - padding;
        }

        // ✅ THIS WAS MISSING
        setPopupData({
          left,
          top,
          distance,
          isWinner,
        });
      } catch (err) {
        alert(err?.response?.data?.message ?? "Too many guesses!");
        navigate("/");
      }
    },
    [sessionId],
  );

  return (
    <div
      ref={wrapperRef}
      style={{
        height: "100vh",
        width: "100%",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        className={`h-full w-full transition-all duration-300 ${
          popupData?.isWinner ? "blur-[3px] brightness-75 scale-[0.99]" : ""
        }`}
      >
        <MapContainer
          center={[20, 0]}
          zoom={3}
          minZoom={2}
          maxZoom={18}
          maxBounds={[
            [-90, -180],
            [90, 180],
          ]}
          maxBoundsViscosity={1.0}
          style={{ height: "100%", width: "100%" }}
        >
          {/* {guessPosition && (
          <Marker position={guessPosition} />
        )} */}
          {guessPosition && (
            <Marker position={guessPosition} icon={myPulseIcon} />
          )}

          {Object.entries(playersGuesses).map(([id, player]) => {
            if (!Object.keys(player).length) return null;
            // skip current user's own marker
            if (Number(id) === Number(userId)) return null;

            return (
              <Marker
                key={id}
                position={[player?.lat, player?.lng]}
                icon={otherPulseIcon}
              >
                <Tooltip
                  permanent
                  direction="top"
                  offset={[0, -10]}
                  opacity={1}
                >
                  <span className="font-semibold text-xs">{player?.name}</span>
                </Tooltip>
              </Marker>
            );
          })}
          <MapRefSetter mapRef={mapRef} />

          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            noWrap={true}
            attribution="© OpenStreetMap"
          />

          <ClickHandler onMapClick={handleMapClick} />
        </MapContainer>
      </div>

      {/* ✅ Custom Popup */}
      {popupData && (
        <div
          ref={popupRef}
          style={{
            position: "absolute",
            left: popupData.left,
            top: popupData.top,
            zIndex: 9999,
          }}
          className="relative w-[90vw] max-w-[260px]
                    rounded-2xl
                    backdrop-blur-lg
                    bg-white/80 dark:bg-slate-800/80
                    border border-white/30 dark:border-slate-600/40
                    shadow-2xl
                    p-5
                    text-gray-800 dark:text-gray-100
                    animate-popup
                    transition-all duration-300"
        >
          {/* ❌ Close Button */}
          <button
            onClick={() => setPopupData(null)}
            className="absolute top-3 right-3
                      p-1 rounded-full
                      text-gray-400 hover:text-gray-700
                      dark:hover:text-white
                      hover:bg-black/10 dark:hover:bg-white/10
                      transition-all duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Title */}
          <h3 className="font-semibold text-lg mb-3 tracking-tight">
            📍 {location ?? "Secret Location"}
          </h3>

          {/* Result */}
          {popupData.distance !== undefined ? (
            <div
              className={`text-base font-semibold ${
                popupData.isWinner
                  ? "text-green-600 dark:text-green-400 drop-shadow-[0_0_6px_rgba(34,197,94,0.6)]"
                  : "text-blue-600 dark:text-blue-400"
              }`}
            >
              {popupData.isWinner ? (
                <span className="flex items-center gap-2">
                  🎉 You found it!
                </span>
              ) : (
                <span>{popupData.distance} km away</span>
              )}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">Calculating...</p>
          )}
        </div>
      )}
      <audio ref={winSoundRef} src={winSound} preload="auto" />
    </div>
  );
}
