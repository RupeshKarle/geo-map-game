import { Link, useNavigate } from "react-router-dom";

export default function Layout({ children }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-black text-white px-6 py-4 flex justify-between">
        <div className="space-x-4">
          <Link to="/" className="hover:text-gray-300">Locations</Link>
          <Link to="/leaderboard" className="hover:text-gray-300">Leaderboard</Link>
          {user?.role === "admin" && (
            <Link to="/admin" className="hover:text-gray-300">Admin</Link>
          )}
        </div>
        <div>
          {user ? (
            <button onClick={logout} className="bg-red-500 px-3 py-1 rounded">
              Logout
            </button>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </nav>

      <div className="p-6">{children}</div>
    </div>
  );
}