import { useEffect, useState, useRef } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function ManageGroup() {
  const [name, setName] = useState("");
  const [groups, setGroups] = useState([]);
  const navigate = useNavigate();
  const [statusMsg, setStatusMsg] = useState("");
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await api.get("/groups");
      setGroups(res.data);
    } catch (err) {
      setStatusMsg("Request failed.");
    }
  };

  const addGroup = async () => {
    try {
      const res = await api.post("/groups", { name });
      setGroups((prev) => [...prev, res.data]);
    } catch (err) {
      setStatusMsg("Request failed.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-3xl font-bold mb-8 text-white">Groups</h2>

      <div
        className="bg-white dark:bg-slate-800 
      p-6 rounded-2xl shadow-lg mb-8"
      >
        <h3
          className="font-semibold text-lg mb-4 
                      text-gray-700 dark:text-gray-200"
        >
          Add Group
        </h3>

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            className="border dark:border-slate-600 
            bg-gray-50 dark:bg-slate-700 
            text-gray-800 dark:text-white
            p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Title"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <button
            onClick={addGroup}
            className="bg-gradient-to-r from-blue-500 to-purple-600 
                       text-white px-4 py-2 rounded-lg 
                       hover:scale-105 transition-transform"
          >
            Add
          </button>
        </div>
      </div>

      {/* need to finalize */}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {groups.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400">No groups found.</p>
        )}
        {groups.map((group) => (
          <div
            key={group.id}
            className={`rounded-2xl p-6 shadow-md transition-all duration-300
            ${
              group.is_open
                ? "bg-white dark:bg-slate-800 hover:shadow-2xl hover:scale-105"
                : "bg-gray-200 dark:bg-slate-700 opacity-75"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">{group.name}</h3>

              {!group.is_open && (
                <span
                  className="px-2 py-1 rounded-full text-xs font-semibold
                          bg-red-100 text-red-700
                          dark:bg-red-900 dark:text-red-200"
                >
                  Blocked
                </span>
              )}
            </div>

            <button
              disabled={!group.is_open}
              onClick={
                group.is_open
                  ? () => navigate(`/group/${group.id}`)
                  : () => "javascript:void(0)"
              }
              className={`w-full py-2 rounded-xl font-semibold text-white transition
              ${
                group.is_open
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {group.is_open ? "Manage" : "Blocked"}
            </button>
          </div>
        ))}
      </div>
      {statusMsg && (
        <p className="mt-3 text-green-600 dark:text-green-400 text-sm">
          {statusMsg}
        </p>
      )}
    </div>
  );
}
