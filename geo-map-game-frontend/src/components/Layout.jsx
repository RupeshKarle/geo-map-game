import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Layout({ children }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [dark, setDark] = useState(false);
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");

    if (storedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setDark(true);
    }
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

  return (
    <div className="min-h-screen w-full">

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
    </div>
  );
}