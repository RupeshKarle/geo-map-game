import { useState } from "react";
import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/login", { email, password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/");
    } catch (err) {
      if (err.status != 200) setError(err?.response?.data?.message ?? "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center 
                    bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600
                    dark:from-slate-900 dark:via-slate-800 dark:to-slate-900
                    px-4">

      <div className="w-full max-w-md 
                      backdrop-blur-xl bg-white/80 dark:bg-slate-800/80
                      border border-white/30 dark:border-slate-700/40
                      rounded-2xl shadow-2xl p-8
                      animate-fadeIn">

        <h2 className="text-3xl font-bold text-center mb-6 
                       text-gray-800 dark:text-white">
          Welcome Back 👋
        </h2>

        <form onSubmit={handleLogin} className="space-y-5">

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1 
                              text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl
                         bg-white dark:bg-slate-700
                         border border-gray-300 dark:border-slate-600
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         transition-all duration-200"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1 
                              text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl
                         bg-white dark:bg-slate-700
                         border border-gray-300 dark:border-slate-600
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         transition-all duration-200"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500 text-center">
              {error}
            </p>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold
                        transition-all duration-300
                        ${
                          loading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700 active:scale-95"
                        }
                        text-white shadow-lg`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          
          {/* Register Link */}
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}