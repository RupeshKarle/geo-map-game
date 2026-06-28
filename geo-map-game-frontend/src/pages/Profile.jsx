import { useEffect, useState, useRef } from "react";
import api from "../api/axios";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [statusMsg, setStatusMsg] = useState("");
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const res = await api.get("/users/profile");
    setUser(res.data.user);
  };

  const requestGroupAdmin = async () => {
    try {
      const res = await api.post("/users/request-group-admin");
      setStatusMsg(res.data.message);
      fetchProfile();
    } catch {
      setStatusMsg("Request failed.");
    }
  };

  if (!user) return <div className="p-6">Loading profile...</div>;

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      {/* Profile Header */}
      <div className="bg-white dark:bg-slate-800 shadow rounded-2xl p-6 flex items-center gap-6">
        <img
          src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
          alt="avatar"
          className="w-20 h-20 rounded-full border"
        />

        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
            {user.name}
          </h2>

          <p className="text-gray-500 dark:text-gray-400">{user.email}</p>

          <span className="inline-block mt-2 px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
            {user.role}
          </span>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Points</p>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">
            {user.points}
          </h3>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Games Played</p>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">
            {user.games_played || 0}
          </h3>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Leaderboard Rank</p>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">
            #{user.rank || "-"}
          </h3>
        </div>
      </div>

      {/* Request Group Admin Section */}
      {user.role === "user" && (
        <div className="bg-white dark:bg-slate-800 shadow rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Become a Group Admin
          </h3>

          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Group admins can create and manage location challenges for their
            group or region.
          </p>

          <button
            onClick={requestGroupAdmin}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Request Group Admin Access
          </button>

          {statusMsg && (
            <p className="mt-3 text-green-600 dark:text-green-400 text-sm">
              {statusMsg}
            </p>
          )}
        </div>
      )}

      {/* Pending Request */}
      {user.role === "group_admin_pending" && (
        <div className="bg-yellow-100 dark:bg-yellow-900/30 p-5 rounded-xl">
          <p className="text-yellow-800 dark:text-yellow-300">
            Your Group Admin request is pending approval.
          </p>
        </div>
      )}

      {/* Approved Group Admin */}
      {user.role === "group_admin" && (
        <div className="bg-green-100 dark:bg-green-900/30 p-5 rounded-xl">
          <p className="text-green-800 dark:text-green-300">
            You are a Group Admin. You can now add and manage locations.
          </p>
        </div>
      )}
    </div>
  );
}
