import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import socket from '../socket.js';
import notificationSound from '../assets/new.wav';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [dark, setDark] = useState(false);
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");

    if (storedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setDark(true);
    }
  }, []);

  useEffect(() => {
    socket.on("new-location", (data) => {
      setNotification(data);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.volume = 0.7;
        audioRef.current.play().catch(() => {});
      }
      /*
      const go = window.confirm(
        `📍 New location available: ${data.title}\n\nStart game now?`
      );

      if (go) {
        navigate(`/game/${data.id}`);
      } */
    });

    return () => {
      socket.off("new-location");
    };
  }, []);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const stopSound = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const handleStart = () => {
    stopSound();
    navigate(`/game/${notification.id}`);
    setNotification(null);
  };

  const handleDismiss = () => {
    stopSound();
    setNotification(null);
  };

  return (
    <div className="relative min-h-screen w-full">

      {/* NAVBAR */}
      <nav className="bg-white dark:bg-slate-800 shadow-md px-6 py-4 flex justify-between items-center">

        {/* LEFT */}
        <div className="flex items-center space-x-6">
          <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            Geo Game
          </span>

          <div className="hidden md:flex space-x-6 font-medium">
            <Link to="/" className="hover:text-blue-600">Locations</Link>
            <Link to="/leaderboard" className="hover:text-blue-600">Leaderboard</Link>
            {user?.role === "admin" && (
              <Link to="/admin" className="hover:text-blue-600">Admin</Link>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center space-x-4">

          {/* Dark Toggle */}
          <button
            onClick={() => setDark(!dark)}
            className="px-3 py-1 rounded-lg bg-gray-200 dark:bg-slate-700"
          >
            {dark ? "🌙" : "☀️"}
          </button>

          {user && (
            <div className="relative hidden md:block">
              <div
                onClick={() => setProfileOpen(!profileOpen)}
                className="w-9 h-9 flex items-center justify-center rounded-full 
                          bg-gradient-to-r from-blue-500 to-purple-600 
                          text-white font-bold cursor-pointer"
              >
                {user?.email?.charAt(0).toUpperCase()}
              </div>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-auto bg-white dark:bg-slate-800 
                                shadow-lg rounded-lg py-2 text-sm">
                  <p className="px-4 py-2 border-b dark:border-slate-700">
                    {user.email}
                  </p>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100 dark:hover:bg-slate-700"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}

          {/* MOBILE MENU BUTTON */}
          <button
            className="md:hidden text-2xl"
            onClick={() => setOpen(!open)}
          >
            ☰
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      {open && (
        <div className="md:hidden 
                        bg-white dark:bg-slate-800 
                        px-6 py-5 
                        space-y-2 
                        shadow-lg 
                        border-t border-gray-200 dark:border-slate-700
                        animate-fadeIn">

          <Link
            to="/"
            onClick={() => setOpen(false)}
            className="block w-full py-2 px-2 rounded-lg 
                      hover:bg-gray-100 dark:hover:bg-slate-700"
          >
            Locations
          </Link>

          <Link
            to="/leaderboard"
            onClick={() => setOpen(false)}
            className="block w-full py-2 px-2 rounded-lg 
                      hover:bg-gray-100 dark:hover:bg-slate-700"
          >
            Leaderboard
          </Link>

          {user?.role === "admin" && (
            <Link
              to="/admin"
              onClick={() => setOpen(false)}
              className="block w-full py-2 px-2 rounded-lg 
                        hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              Admin
            </Link>
          )}

          {user && (
            <button
              onClick={() => {
                setOpen(false);
                logout();
              }}
              className="block w-full text-left py-2 px-2 rounded-lg 
                        text-red-500 
                        hover:bg-red-50 dark:hover:bg-red-900/30"
            >
              Logout
            </button>
          )}
        </div>
      )}

      {/* PAGE CONTENT */}
      <div className="max-w-7xl mx-auto p-6 w-full">
        {children}
      </div>
    
    {/* 🔔 Notification Toast */}
      {notification && (
        <div
          className="
          fixed bottom-6 left-6
          w-[320px]
          rounded-2xl
          backdrop-blur-xl
          bg-white/90 dark:bg-slate-800/90
          border border-gray-200 dark:border-slate-600
          shadow-2xl
          p-4
          animate-slideIn
        "
        >
          <div className="flex items-start gap-3">

            <div className="text-2xl">📍</div>

            <div className="flex-1">

              <h3 className="font-semibold text-gray-800 dark:text-white">
                New Location Available
              </h3>

              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                "{notification.title}"
              </p>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleStart}
                  className="
                    px-3 py-1.5
                    rounded-lg
                    text-sm font-semibold
                    text-white
                    bg-gradient-to-r from-blue-500 to-purple-600
                    hover:opacity-90
                  "
                >
                  Start Game
                </button>

                <button
                  onClick={handleDismiss}
                  className="
                    px-3 py-1.5
                    rounded-lg
                    text-sm
                    bg-gray-200
                    dark:bg-slate-700
                    text-gray-800
                    dark:text-gray-200
                  "
                >
                  Dismiss
                </button>

              </div>

            </div>
          </div>
        </div>
      )}

      {/* 🔊 Audio */}
      <audio
        ref={audioRef}
        src={notificationSound}
        preload="auto"
      />
    </div>
  );
}